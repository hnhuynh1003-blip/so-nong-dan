# Deterministic generator for the review-only PostgreSQL migration.
from pathlib import Path
from collections import OrderedDict
T=OrderedDict()
def add(n,cols,checks=()): T[n]=(cols,checks)
def fk(col,table,required=False): return f'{col} uuid'+(' NOT NULL' if required else '')+f', FOREIGN KEY (owner_id, {col}) REFERENCES snd.{table}(owner_id, id)'
def ref(c,t,r=False): return fk(c,t,r)
def src(): return [ref('source_id','source_records',True),"verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated'))"]
def business(): return ['business_date date',ref('production_year_id','production_years'),*src()]
add('settings',['setting_key text NOT NULL','value jsonb NOT NULL'],['UNIQUE (owner_id, setting_key)'])
add('source_records',["kind text NOT NULL CHECK (kind IN ('manual','notebook','photo','import'))",'external_key text','original_payload jsonb','observed_at timestamptz'],['UNIQUE (owner_id, kind, external_key)'])
# Policy versions are immutable; approval is a separate explicit owner decision.
add('rounding_policy_versions',['policy_key text NOT NULL CHECK (length(trim(policy_key)) > 0)','policy_version integer NOT NULL CHECK (policy_version > 0)','definition_schema_version integer NOT NULL CHECK (definition_schema_version > 0)',"definition jsonb NOT NULL CHECK (jsonb_typeof(definition) = 'object' AND definition ? 'steps' AND jsonb_typeof(definition->'steps') = 'array')", "definition_sha256 text NOT NULL CHECK (definition_sha256 ~ '^[0-9a-f]{64}$')",*src()],['UNIQUE (owner_id, policy_key, policy_version)'])
add('rounding_policy_approvals',[ref('policy_id','rounding_policy_versions',True),'approved_at timestamptz NOT NULL',ref('source_id','source_records',True)],['UNIQUE (owner_id, policy_id)'])
add('attachments',[ref('source_id','source_records',True),'object_key text NOT NULL','sha256 text NOT NULL CHECK (sha256 ~ \'^[0-9a-f]{64}$\')','byte_size bigint NOT NULL CHECK (byte_size >= 0)','media_type text NOT NULL'],['UNIQUE (owner_id, object_key)'])
add('production_years',['label text NOT NULL','starts_on date','ends_on date'],['CHECK (ends_on >= starts_on)'])
add('land_parcels',['label text NOT NULL'])
add('land_area_history',[ref('land_id','land_parcels',True),'valid_from date NOT NULL','valid_to date',"tenure text NOT NULL CHECK (tenure IN ('owned','leased','unknown'))",'original_area numeric NOT NULL CHECK (original_area > 0)','original_unit text NOT NULL','area_m2 numeric CHECK (area_m2 > 0)',*src()],['CHECK (valid_to >= valid_from)'])
add('leases',[ref('land_id','land_parcels',True),'starts_on date NOT NULL','ends_on date','rent_vnd bigint CHECK (rent_vnd >= 0)','allocation_policy_version text',*src()],['CHECK (ends_on >= starts_on)'])
add('activities',[ref('production_year_id','production_years',True),"kind text NOT NULL CHECK (kind IN ('rice','shrimp','crab','shared'))"])
add('activity_land_links',[ref('activity_id','activities',True),ref('land_id','land_parcels',True)],['UNIQUE (owner_id, activity_id, land_id)'])
add('weighing_groups',['label text NOT NULL',*business()])
add('weighing_sheets',[ref('group_id','weighing_groups'), 'label text NOT NULL',"status text NOT NULL CHECK (status IN ('draft','finalized','void'))",ref('rounding_policy_id','rounding_policy_versions'),*business()])
add('weighing_batches',[ref('sheet_id','weighing_sheets',True),'ordinal integer NOT NULL CHECK (ordinal > 0)'],['UNIQUE (owner_id, sheet_id, ordinal)'])
add('weighing_entries',[ref('batch_id','weighing_batches',True),'ordinal integer NOT NULL CHECK (ordinal > 0)','raw_input text NOT NULL','gross_gram bigint NOT NULL CHECK (gross_gram > 0)',*src()],['UNIQUE (owner_id, batch_id, ordinal)'])
add('deduction_rules',[ref('sheet_id','weighing_sheets',True),ref('batch_id','weighing_batches'),"kind text NOT NULL CHECK (kind IN ('none','fixed','bags_per_kg','kg_per_bag','impurity'))",'numerator numeric(78,0) NOT NULL CHECK (numerator >= 0)','denominator numeric(78,0) NOT NULL CHECK (denominator > 0)','rule_version text NOT NULL'])
add('calculation_snapshots',[ref('sheet_id','weighing_sheets',True),'sheet_version integer NOT NULL CHECK (sheet_version > 0)',ref('rounding_policy_id','rounding_policy_versions'),'snapshot jsonb NOT NULL'],['UNIQUE (owner_id, sheet_id, sheet_version)'])
add('sales',[ref('sheet_id','weighing_sheets'),ref('activity_id','activities'),"kind text NOT NULL CHECK (kind IN ('rice','aquaculture','unknown'))",'period_start date','period_end date','amount_vnd bigint CHECK (amount_vnd >= 0)',ref('rounding_policy_id','rounding_policy_versions'),*business()],['CHECK ((period_start IS NULL) = (period_end IS NULL))','CHECK (period_end >= period_start)','CHECK (business_date IS NULL OR period_start IS NULL)','CHECK (business_date IS NOT NULL OR period_start IS NOT NULL OR verification <> \'confirmed\')'])
add('sale_lines',[ref('sale_id','sales',True),'ordinal integer NOT NULL CHECK (ordinal > 0)',"product_kind text CHECK (product_kind IN ('rice','shrimp','crab'))",'grade_label text','size_label text','size_animals_per_kg_numerator numeric(78,0) CHECK (size_animals_per_kg_numerator > 0)','size_animals_per_kg_denominator numeric(78,0) CHECK (size_animals_per_kg_denominator > 0)','animal_count bigint CHECK (animal_count > 0)','physical_gram bigint CHECK (physical_gram > 0)','settlement_gram bigint CHECK (settlement_gram >= 0)',"unit_price_basis text CHECK (unit_price_basis IN ('kg','animal','lot'))",'unit_price_numerator numeric(78,0) CHECK (unit_price_numerator >= 0)','unit_price_denominator numeric(78,0) CHECK (unit_price_denominator > 0)','amount_vnd bigint CHECK (amount_vnd >= 0)'],['UNIQUE (owner_id, sale_id, ordinal)','UNIQUE (owner_id, sale_id, id)','CHECK ((unit_price_numerator IS NULL) = (unit_price_denominator IS NULL))','CHECK ((unit_price_numerator IS NULL) = (unit_price_basis IS NULL))','CHECK ((size_animals_per_kg_numerator IS NULL) = (size_animals_per_kg_denominator IS NULL))'])
add('expenses',[ref('activity_id','activities'),'category text NOT NULL','amount_vnd bigint CHECK (amount_vnd >= 0)',*business()])
# Source sale_line is optional, but when supplied must belong to the same sale.
add('allocations',[ref('sale_id','sales'),ref('expense_id','expenses'),'sale_line_id uuid',ref('land_id','land_parcels'),ref('activity_id','activities'),'amount_vnd bigint CHECK (amount_vnd >= 0)','physical_gram bigint CHECK (physical_gram >= 0)','settlement_gram bigint CHECK (settlement_gram >= 0)','animal_count bigint CHECK (animal_count >= 0)'],['CHECK (num_nonnulls(sale_id, expense_id) = 1)','CHECK (sale_line_id IS NULL OR sale_id IS NOT NULL)','FOREIGN KEY (owner_id, sale_id, sale_line_id) REFERENCES snd.sale_lines(owner_id, sale_id, id)','CHECK (num_nonnulls(amount_vnd, physical_gram, settlement_gram, animal_count) > 0)','CHECK (expense_id IS NULL OR (amount_vnd IS NOT NULL AND num_nonnulls(physical_gram, settlement_gram, animal_count) = 0))','CHECK (num_nonnulls(physical_gram, settlement_gram, animal_count) = 0 OR sale_line_id IS NOT NULL)'])
add('accounts',["kind text NOT NULL CHECK (kind IN ('asset','liability','equity','income','expense'))",'label text NOT NULL'])
add('assets',['label text NOT NULL','acquired_on date',ref('account_id','accounts'),*src()])
add('asset_valuations',[ref('asset_id','assets',True),'as_of date NOT NULL','value_vnd bigint CHECK (value_vnd >= 0)',*src()])
add('loans',['label text NOT NULL','principal_vnd bigint CHECK (principal_vnd >= 0)',ref('liability_account_id','accounts'),*business()])
add('repayment_schedules',[ref('loan_id','loans',True),'due_on date NOT NULL','principal_vnd bigint CHECK (principal_vnd >= 0)','interest_vnd bigint CHECK (interest_vnd >= 0)'])
add('asset_transactions',[ref('asset_id','assets',True),"kind text NOT NULL CHECK (kind IN ('acquire','dispose'))",'amount_vnd bigint CHECK (amount_vnd >= 0)',*business()])
add('loan_transactions',[ref('loan_id','loans',True),"kind text NOT NULL CHECK (kind IN ('drawdown','principal_repayment','interest_charge'))",'amount_vnd bigint CHECK (amount_vnd >= 0)',*business()])
add('settlements',[ref('sale_id','sales'),ref('expense_id','expenses'),ref('asset_transaction_id','asset_transactions'),ref('loan_transaction_id','loan_transactions'),ref('account_id','accounts'),ref('deposit_settlement_id','settlements'),"kind text NOT NULL CHECK (kind IN ('receipt','deposit','payment','refund','deposit_apply'))","cash_direction text CHECK (cash_direction IN ('in','out'))",'amount_vnd bigint NOT NULL CHECK (amount_vnd > 0)',*business()],['CHECK (num_nonnulls(sale_id, expense_id, asset_transaction_id, loan_transaction_id) <= 1)',"CHECK (kind = 'deposit' OR num_nonnulls(sale_id, expense_id, asset_transaction_id, loan_transaction_id) = 1)","CHECK ((kind = 'deposit_apply' AND deposit_settlement_id IS NOT NULL AND account_id IS NULL AND num_nonnulls(sale_id,expense_id) = 1) OR (kind <> 'deposit_apply' AND deposit_settlement_id IS NULL AND account_id IS NOT NULL))",'CHECK (deposit_settlement_id IS NULL OR deposit_settlement_id <> id)',"CHECK ((kind = 'deposit_apply' AND cash_direction IS NULL) OR (kind <> 'deposit_apply' AND cash_direction IS NOT NULL))","CHECK (kind <> 'receipt' OR cash_direction = 'in')","CHECK (kind <> 'payment' OR cash_direction = 'out')"])
add('journal_events',['event_kind text NOT NULL','idempotency_key uuid NOT NULL',ref('sale_id','sales'),ref('expense_id','expenses'),ref('settlement_id','settlements'),ref('asset_transaction_id','asset_transactions'),ref('loan_transaction_id','loan_transactions'),ref('reverses_event_id','journal_events'),'source_revision integer NOT NULL CHECK (source_revision > 0)',*business()],['UNIQUE (owner_id, idempotency_key)',"CHECK (verification = 'confirmed')",'CHECK (num_nonnulls(sale_id,expense_id,settlement_id,asset_transaction_id,loan_transaction_id) <= 1)','CHECK (reverses_event_id IS NULL OR reverses_event_id <> id)'])
add('journal_lines',[ref('event_id','journal_events',True),ref('account_id','accounts',True),'ordinal integer NOT NULL CHECK (ordinal > 0)','debit_vnd bigint NOT NULL CHECK (debit_vnd >= 0)','credit_vnd bigint NOT NULL CHECK (credit_vnd >= 0)'],['CHECK ((debit_vnd > 0 AND credit_vnd = 0) OR (credit_vnd > 0 AND debit_vnd = 0))','UNIQUE (owner_id, event_id, ordinal)'])
add('opening_balances',[ref('account_id','accounts',True),'as_of date NOT NULL','amount_vnd bigint NOT NULL',*src()],['UNIQUE (owner_id, account_id, as_of)'])
add('reconciliations',[ref('account_id','accounts',True),'as_of date NOT NULL','observed_vnd bigint',*src()])
add('receivable_payable_links',[ref('event_id','journal_events',True),ref('sale_id','sales'),ref('expense_id','expenses'),ref('asset_transaction_id','asset_transactions'),ref('loan_transaction_id','loan_transactions')],['CHECK (num_nonnulls(sale_id, expense_id, asset_transaction_id, loan_transaction_id) = 1)'])
add('import_batches',[ref('source_id','source_records',True),'file_sha256 text NOT NULL CHECK (file_sha256 ~ \'^[0-9a-f]{64}$\')','mapping_version text NOT NULL',"status text NOT NULL CHECK (status IN ('preview','committed','rolled_back','failed'))"],['UNIQUE (owner_id, file_sha256, mapping_version)'])
add('import_rows',[ref('batch_id','import_batches',True),'row_no integer NOT NULL CHECK (row_no > 0)','raw_payload jsonb NOT NULL','row_sha256 text NOT NULL CHECK (row_sha256 ~ \'^[0-9a-f]{64}$\')','error_code text'],['UNIQUE (owner_id, batch_id, row_no)'])
add('coverage_periods',['starts_on date NOT NULL','ends_on date NOT NULL','scope_key text NOT NULL',"coverage text NOT NULL CHECK (coverage IN ('unknown','partial','complete','confirmed_zero'))",*src()],['CHECK (ends_on >= starts_on)','CHECK (coverage <> \'confirmed_zero\' OR verification = \'confirmed\')'])
add('aggregate_observations',[ref('coverage_id','coverage_periods',True),"kind text NOT NULL CHECK (kind IN ('full_total','additional_only'))",'amount_vnd bigint CHECK (amount_vnd >= 0)',*src()])
add('aggregate_detail_links',[ref('aggregate_id','aggregate_observations',True),ref('sale_id','sales'),ref('expense_id','expenses')],['CHECK (num_nonnulls(sale_id, expense_id) = 1)'])
add('revisions',['entity_type text NOT NULL','entity_id uuid NOT NULL','entity_version integer NOT NULL CHECK (entity_version > 0)','reason text NOT NULL CHECK (length(trim(reason)) > 0)','snapshot jsonb NOT NULL'],['UNIQUE (owner_id, entity_type, entity_id, entity_version)'])
add('audit_events',['entity_type text NOT NULL','entity_id uuid NOT NULL','action text NOT NULL','event_at timestamptz NOT NULL'])
add('sync_outbox',['mutation_id uuid NOT NULL','entity_type text NOT NULL','entity_id uuid NOT NULL','base_version integer NOT NULL CHECK (base_version >= 0)','payload jsonb NOT NULL',"status text NOT NULL CHECK (status IN ('pending','acked','conflict'))"],['UNIQUE (owner_id, mutation_id)'])
add('sync_receipts',['mutation_id uuid NOT NULL','request_sha256 text NOT NULL CHECK (request_sha256 ~ \'^[0-9a-f]{64}$\')','result_version integer NOT NULL CHECK (result_version > 0)'],['UNIQUE (owner_id, mutation_id)'])
add('conflict_records',['mutation_id uuid NOT NULL','entity_type text NOT NULL','entity_id uuid NOT NULL','local_payload jsonb NOT NULL','remote_payload jsonb NOT NULL','resolved_at timestamptz'])
add('report_snapshots',['basis text NOT NULL','as_of timestamptz NOT NULL','rule_version text','manifest jsonb NOT NULL'])
lines=['-- REVIEW DRAFT ONLY. NOT RUN. No application grants or RLS allow policies.','BEGIN;','CREATE SCHEMA snd;','REVOKE ALL ON SCHEMA snd FROM PUBLIC;', '''CREATE TABLE snd.owner_profile (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0)
);''']
for n,(cols,checks) in T.items():
 fields=['id uuid NOT NULL','owner_id uuid NOT NULL REFERENCES snd.owner_profile(id)','created_at timestamptz NOT NULL DEFAULT now()','updated_at timestamptz NOT NULL DEFAULT now()','version integer NOT NULL DEFAULT 1 CHECK (version > 0)',*cols,'PRIMARY KEY (owner_id, id)',*checks]
 lines.append(f'CREATE TABLE snd.{n} (\n  '+',\n  '.join(fields)+'\n);')
 for c in cols:
  key=c.split()[0]
  if key in ('business_date','production_year_id','land_id','source_id','activity_id','kind','category','starts_on','sale_id','sale_line_id','expense_id','asset_id','loan_id','asset_transaction_id','loan_transaction_id','settlement_id','rounding_policy_id','event_id','deposit_settlement_id','policy_id'):
   lines.append(f'CREATE INDEX {n}_{key}_idx ON snd.{n}(owner_id, {key}, id);')
for n in ['owner_profile',*T]:
 lines += [f'ALTER TABLE snd.{n} ENABLE ROW LEVEL SECURITY;',f'ALTER TABLE snd.{n} FORCE ROW LEVEL SECURITY;']
lines += ["""CREATE FUNCTION snd.reject_policy_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$ BEGIN
  RAISE EXCEPTION 'rounding policy registry is append-only' USING ERRCODE = '55000';
END; $$;"""]
for n in ['rounding_policy_versions','rounding_policy_approvals']:
 lines += [f'CREATE TRIGGER {n}_immutable BEFORE UPDATE OR DELETE ON snd.{n} FOR EACH ROW EXECUTE FUNCTION snd.reject_policy_mutation();', f'CREATE TRIGGER {n}_no_truncate BEFORE TRUNCATE ON snd.{n} FOR EACH STATEMENT EXECUTE FUNCTION snd.reject_policy_mutation();']
lines += ['REVOKE ALL ON ALL FUNCTIONS IN SCHEMA snd FROM PUBLIC;', 'REVOKE ALL ON ALL TABLES IN SCHEMA snd FROM PUBLIC;','COMMIT;','-- No posting/revision/sync transaction routines yet. Cross-row invariants are NOT enforced by this draft.']
Path('migrations/0001_schema_draft.sql').write_text('\n'.join(lines)+'\n',encoding='utf-8',newline='\n')
Path('docs/schema-tables.txt').write_text('\n'.join(['owner_profile',*T])+'\n',encoding='utf-8',newline='\n')
