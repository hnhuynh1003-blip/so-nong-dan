-- Run ONLY in a fresh throwaway cluster created by scripts/local_r1.py.
-- Synthetic IDs; no production data or real business policy. Roll back fixtures and role grants.
BEGIN;
DO $$ BEGIN
 IF current_user <> 'snd_test_admin' OR current_database() <> 'postgres' OR position('snd-r1-disposable-' in current_setting('data_directory')) = 0 THEN
  RAISE EXCEPTION 'disposable test cluster guard failed';
 END IF;
END $$;
INSERT INTO snd.owner_profile(id) VALUES ('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');
DO $$
DECLARE
 o uuid := '00000000-0000-4000-8000-000000000001';
 o2 uuid := '00000000-0000-4000-8000-000000000002';
 s uuid := '00000000-0000-4000-8000-000000000010';
 p uuid := '00000000-0000-4000-8000-000000000011';
 a uuid := '00000000-0000-4000-8000-000000000012';
 sale1 uuid := '00000000-0000-4000-8000-000000000013';
 sale2 uuid := '00000000-0000-4000-8000-000000000014';
 line1 uuid := '00000000-0000-4000-8000-000000000015';
 land1 uuid := '00000000-0000-4000-8000-000000000016';
 expense1 uuid := '00000000-0000-4000-8000-000000000017';
 asset1 uuid := '00000000-0000-4000-8000-000000000018';
 asset_tx uuid := '00000000-0000-4000-8000-000000000019';
 loan1 uuid := '00000000-0000-4000-8000-000000000020';
 loan_tx uuid := '00000000-0000-4000-8000-000000000021';
 dep uuid := '00000000-0000-4000-8000-000000000022';
 event1 uuid := '00000000-0000-4000-8000-000000000023';
 x uuid := '00000000-0000-4000-8000-000000000099';
 bad uuid := '00000000-0000-4000-8000-000000000098';
BEGIN
 INSERT INTO snd.source_records(id,owner_id,kind) VALUES(s,o,'manual'),(s,o2,'manual');
 -- Synthetic, deliberately incomplete policy shape to exercise registry immutability only.
 -- Empty steps + synthetic hash are NOT a valid CP-002 policy, and no business approval is implied.
 INSERT INTO snd.rounding_policy_versions(id,owner_id,policy_key,policy_version,definition_schema_version,definition,definition_sha256,source_id,verification)
 VALUES(p,o,'synthetic-test-only',1,1,'{"steps":[]}',repeat('0',64),s,'unverified');
 INSERT INTO snd.rounding_policy_approvals(id,owner_id,policy_id,approved_at,source_id) VALUES(x,o,p,now(),s);
 BEGIN UPDATE snd.rounding_policy_versions SET definition='{"steps":[]}' WHERE owner_id=o AND id=p; RAISE EXCEPTION 'policy update unexpectedly accepted'; EXCEPTION WHEN SQLSTATE '55000' THEN NULL; END;
 BEGIN DELETE FROM snd.rounding_policy_approvals WHERE owner_id=o AND id=x; RAISE EXCEPTION 'approval deletion unexpectedly accepted'; EXCEPTION WHEN SQLSTATE '55000' THEN NULL; END;
 BEGIN TRUNCATE snd.rounding_policy_approvals; RAISE EXCEPTION 'registry truncate unexpectedly accepted'; EXCEPTION WHEN SQLSTATE '55000' THEN NULL; END;
 BEGIN INSERT INTO snd.rounding_policy_approvals(id,owner_id,policy_id,approved_at,source_id) VALUES(bad,o2,p,now(),s); RAISE EXCEPTION 'cross-owner policy unexpectedly accepted'; EXCEPTION WHEN foreign_key_violation THEN NULL; END;
 RAISE NOTICE 'registry append-only and cross-owner checks passed';
 INSERT INTO snd.sales(id,owner_id,kind,business_date,amount_vnd,source_id,verification) VALUES(sale1,o,'aquaculture','2026-01-01',100,s,'unverified'),(sale2,o,'aquaculture','2026-01-01',100,s,'unverified');
 INSERT INTO snd.sale_lines(id,owner_id,sale_id,ordinal,product_kind,grade_label,size_label,animal_count,physical_gram,unit_price_basis,unit_price_numerator,unit_price_denominator,amount_vnd) VALUES(line1,o,sale1,1,'shrimp','synthetic','synthetic',2,100,'kg',1000,1,100);
 INSERT INTO snd.land_parcels(id,owner_id,label) VALUES(land1,o,'synthetic'),(land1,o2,'synthetic');
 INSERT INTO snd.expenses(id,owner_id,category,source_id,verification) VALUES(expense1,o,'synthetic',s,'unverified');
 INSERT INTO snd.allocations(id,owner_id,sale_id,sale_line_id,land_id,physical_gram,amount_vnd) VALUES(x,o,sale1,line1,land1,50,50);
 BEGIN INSERT INTO snd.allocations(id,owner_id,sale_id,sale_line_id,physical_gram) VALUES(bad,o,sale2,line1,50); RAISE EXCEPTION 'wrong parent unexpectedly accepted'; EXCEPTION WHEN foreign_key_violation THEN NULL; END;
 BEGIN INSERT INTO snd.allocations(id,owner_id,sale_id,physical_gram) VALUES(bad,o,sale1,10); RAISE EXCEPTION 'quantity without line unexpectedly accepted'; EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN INSERT INTO snd.allocations(id,owner_id,expense_id,amount_vnd,physical_gram) VALUES(bad,o,expense1,1,1); RAISE EXCEPTION 'expense quantity unexpectedly accepted'; EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN INSERT INTO snd.sale_lines(id,owner_id,sale_id,ordinal,unit_price_basis,unit_price_numerator,unit_price_denominator) VALUES(bad,o,sale1,2,'kg',1,0); RAISE EXCEPTION 'zero denominator unexpectedly accepted'; EXCEPTION WHEN check_violation THEN NULL; END;
 RAISE NOTICE 'sale-line allocation row checks passed';
 INSERT INTO snd.accounts(id,owner_id,kind,label) VALUES(a,o,'asset','synthetic');
 INSERT INTO snd.assets(id,owner_id,label,account_id,source_id,verification) VALUES(asset1,o,'synthetic',a,s,'unverified');
 INSERT INTO snd.asset_transactions(id,owner_id,asset_id,kind,source_id,verification) VALUES(asset_tx,o,asset1,'acquire',s,'unverified');
 INSERT INTO snd.loans(id,owner_id,label,source_id,verification) VALUES(loan1,o,'synthetic',s,'unverified');
 INSERT INTO snd.loan_transactions(id,owner_id,loan_id,kind,source_id,verification) VALUES(loan_tx,o,loan1,'drawdown',s,'unverified');
 INSERT INTO snd.settlements(id,owner_id,kind,account_id,cash_direction,amount_vnd,source_id,verification) VALUES(dep,o,'deposit',a,'in',10,s,'unverified');
 INSERT INTO snd.settlements(id,owner_id,kind,sale_id,deposit_settlement_id,amount_vnd,source_id,verification) VALUES(x,o,'deposit_apply',sale1,dep,1,s,'unverified');
 BEGIN INSERT INTO snd.settlements(id,owner_id,kind,sale_id,deposit_settlement_id,account_id,cash_direction,amount_vnd,source_id,verification) VALUES(bad,o,'deposit_apply',sale1,dep,a,'in',1,s,'unverified'); RAISE EXCEPTION 'cash account on deposit apply unexpectedly accepted'; EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN INSERT INTO snd.settlements(id,owner_id,kind,asset_transaction_id,loan_transaction_id,account_id,cash_direction,amount_vnd,source_id,verification) VALUES(bad,o,'payment',asset_tx,loan_tx,a,'out',1,s,'unverified'); RAISE EXCEPTION 'multiple finance targets unexpectedly accepted'; EXCEPTION WHEN check_violation THEN NULL; END;
 INSERT INTO snd.journal_events(id,owner_id,event_kind,idempotency_key,asset_transaction_id,source_revision,source_id,verification) VALUES(event1,o,'synthetic',event1,asset_tx,1,s,'confirmed');
 BEGIN INSERT INTO snd.journal_events(id,owner_id,event_kind,idempotency_key,asset_transaction_id,loan_transaction_id,source_revision,source_id,verification) VALUES(bad,o,'synthetic',x,asset_tx,loan_tx,1,s,'confirmed'); RAISE EXCEPTION 'journal multiple subjects unexpectedly accepted'; EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN INSERT INTO snd.settlements(id,owner_id,kind,sale_id,account_id,cash_direction,amount_vnd,source_id,verification) VALUES(bad,o,'receipt',sale1,a,'out',1,s,'unverified'); RAISE EXCEPTION 'wrong receipt direction unexpectedly accepted'; EXCEPTION WHEN check_violation THEN NULL; END;
 RAISE NOTICE 'finance target row checks passed (not balanced posting)';
END $$;
-- R2: explicit UNIQUE, remaining mutation operations, and catalog-wide RLS.
DO $$
DECLARE
 o uuid := '00000000-0000-4000-8000-000000000001';
 sale1 uuid := '00000000-0000-4000-8000-000000000013';
 bad uuid := '00000000-0000-4000-8000-000000000097';
BEGIN
 BEGIN INSERT INTO snd.sale_lines(id,owner_id,sale_id,ordinal) VALUES(bad,o,sale1,1);
  RAISE EXCEPTION 'duplicate sale-line ordinal unexpectedly accepted';
 EXCEPTION WHEN unique_violation THEN NULL; END;
 BEGIN DELETE FROM snd.rounding_policy_versions WHERE owner_id=o;
  RAISE EXCEPTION 'policy deletion unexpectedly accepted';
 EXCEPTION WHEN SQLSTATE '55000' THEN NULL; END;
 BEGIN UPDATE snd.rounding_policy_approvals SET approved_at=now() WHERE owner_id=o;
  RAISE EXCEPTION 'approval update unexpectedly accepted';
 EXCEPTION WHEN SQLSTATE '55000' THEN NULL; END;
 -- Catalog check for both enabled BEFORE TRUNCATE triggers; the approval
 -- trigger is exercised above. Version TRUNCATE is exercised with CASCADE
 -- only inside this guarded, disposable transaction (FKs otherwise reject first).
 BEGIN TRUNCATE snd.rounding_policy_versions CASCADE;
  RAISE EXCEPTION 'registry version truncate unexpectedly accepted';
 EXCEPTION WHEN SQLSTATE '55000' THEN NULL; END;
 IF (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
     WHERE n.nspname='snd' AND c.relkind='r') <> 46 THEN
  RAISE EXCEPTION 'unexpected table count'; END IF;
 IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
     WHERE n.nspname='snd' AND c.relkind='r' AND NOT (c.relrowsecurity AND c.relforcerowsecurity)) THEN
  RAISE EXCEPTION 'missing RLS enable/force'; END IF;
 IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='snd') THEN
  RAISE EXCEPTION 'unexpected allow policy in default-deny draft'; END IF;
 IF (SELECT count(*) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
     JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='snd'
     AND c.relname IN ('rounding_policy_versions','rounding_policy_approvals')
     AND NOT t.tgisinternal AND t.tgenabled='O') <> 4 THEN
  RAISE EXCEPTION 'unexpected registry trigger inventory'; END IF;
 RAISE NOTICE 'R2 UNIQUE, registry mutation and catalog-wide RLS checks passed';
END $$;
-- Test default deny even with temporary SELECT/INSERT grants, no application auth claim.
CREATE ROLE snd_probe NOLOGIN;
GRANT USAGE ON SCHEMA snd TO snd_probe;
GRANT SELECT, INSERT ON snd.sales TO snd_probe;
SET LOCAL ROLE snd_probe;
DO $$ BEGIN
 IF (SELECT count(*) FROM snd.sales) <> 0 THEN RAISE EXCEPTION 'default deny SELECT failed'; END IF;
 BEGIN INSERT INTO snd.sales(id,owner_id,kind,source_id,verification) VALUES('00000000-0000-4000-8000-000000000090','00000000-0000-4000-8000-000000000001','unknown','00000000-0000-4000-8000-000000000010','unverified'); RAISE EXCEPTION 'RLS INSERT unexpectedly accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 RAISE NOTICE 'default deny probe passed';
END $$;
RESET ROLE;
ROLLBACK;
