"""Static checks only: no PostgreSQL parser, runtime or business validation."""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess,sys,re,unittest
ROOT=Path(__file__).resolve().parents[1]
SQL=(ROOT/'migrations/0001_schema_draft.sql').read_text(encoding='utf-8')
TABLES=dict(re.findall(r'CREATE TABLE snd\.(\w+) \(\n(.*?)\n\);',SQL,re.S))
class Static(unittest.TestCase):
 def test_determinism(self):
  with TemporaryDirectory() as t:
   q=Path(t);(q/'migrations').mkdir();(q/'docs').mkdir()
   subprocess.run([sys.executable,str(ROOT/'scripts/draft_schema.py')],cwd=q,check=True)
   for f in ['migrations/0001_schema_draft.sql','docs/schema-tables.txt']:
    self.assertEqual((q/f).read_bytes(),(ROOT/f).read_bytes())
 def test_inventory(self):
  self.assertEqual(len(TABLES),46);self.assertEqual(len(re.findall(r'^CREATE INDEX ',SQL,re.M)),92)
  self.assertEqual(list(TABLES),(ROOT/'docs/schema-tables.txt').read_text(encoding='utf-8').splitlines())
 def test_owner_keys_and_reference_order(self):
  seen=set()
  for name,definition in TABLES.items():
   seen.add(name)
   if name!='owner_profile':self.assertIn('PRIMARY KEY (owner_id, id)',definition)
   for target in re.findall(r'REFERENCES snd\.(\w+)\(',definition):self.assertIn(target,seen)
 def test_fail_closed_declarations(self):
  for name in TABLES:
   self.assertIn(f'ALTER TABLE snd.{name} ENABLE ROW LEVEL SECURITY;',SQL)
   self.assertIn(f'ALTER TABLE snd.{name} FORCE ROW LEVEL SECURITY;',SQL)
  self.assertNotRegex(SQL,r'(?im)^CREATE POLICY|^GRANT ')
 def test_sale_line_and_allocation_fields(self):
  for field in ('product_kind','grade_label','size_label','size_animals_per_kg_numerator','size_animals_per_kg_denominator','animal_count','physical_gram','settlement_gram','unit_price_basis','unit_price_numerator','unit_price_denominator'):
   self.assertRegex(TABLES['sale_lines'],rf'\b{field}\b')
  self.assertIn('FOREIGN KEY (owner_id, sale_id, sale_line_id) REFERENCES snd.sale_lines(owner_id, sale_id, id)',TABLES['allocations'])
 def test_policy_registry(self):
  for table in ('rounding_policy_versions','rounding_policy_approvals'):
   self.assertIn(f'BEFORE UPDATE OR DELETE ON snd.{table}',SQL)
   self.assertIn(f'BEFORE TRUNCATE ON snd.{table}',SQL)
  for table in ('weighing_sheets','calculation_snapshots','sales'):
   self.assertIn('REFERENCES snd.rounding_policy_versions(owner_id, id)',TABLES[table]);self.assertNotIn('rounding_policy_id uuid NOT NULL',TABLES[table])
  self.assertNotRegex(SQL,r'(?im)^INSERT INTO')
 def test_finance_links(self):
  for target in ('asset_transactions','loan_transactions'):
   self.assertIn(f'REFERENCES snd.{target}(owner_id, id)',TABLES['settlements'])
   self.assertIn(f'REFERENCES snd.{target}(owner_id, id)',TABLES['journal_events'])
   self.assertIn(f'REFERENCES snd.{target}(owner_id, id)',TABLES['receivable_payable_links'])
  self.assertIn("kind = 'deposit_apply' AND deposit_settlement_id IS NOT NULL AND account_id IS NULL",TABLES['settlements'])
 def test_decisions_open(self):
  for n in range(8,13):self.assertIn(f'| D{n:02d} | OPEN |',(ROOT/'docs/09_DECISION_LOG.md').read_text(encoding='utf-8'))
if __name__=='__main__':unittest.main(verbosity=2)
