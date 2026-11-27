-- REVIEW DRAFT ONLY. NOT RUN. No application grants or RLS allow policies.
BEGIN;
CREATE SCHEMA snd;
REVOKE ALL ON SCHEMA snd FROM PUBLIC;
CREATE TABLE snd.owner_profile (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0)
);
CREATE TABLE snd.settings (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  setting_key text NOT NULL,
  value jsonb NOT NULL,
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, setting_key)
);
CREATE TABLE snd.source_records (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  kind text NOT NULL CHECK (kind IN ('manual','notebook','photo','import')),
  external_key text,
  original_payload jsonb,
  observed_at timestamptz,
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, kind, external_key)
);
CREATE INDEX source_records_kind_idx ON snd.source_records(owner_id, kind, id);
CREATE TABLE snd.rounding_policy_versions (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  policy_key text NOT NULL CHECK (length(trim(policy_key)) > 0),
  policy_version integer NOT NULL CHECK (policy_version > 0),
  definition_schema_version integer NOT NULL CHECK (definition_schema_version > 0),
  definition jsonb NOT NULL CHECK (jsonb_typeof(definition) = 'object' AND definition ? 'steps' AND jsonb_typeof(definition->'steps') = 'array'),
  definition_sha256 text NOT NULL CHECK (definition_sha256 ~ '^[0-9a-f]{64}$'),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, policy_key, policy_version)
);
CREATE INDEX rounding_policy_versions_source_id_idx ON snd.rounding_policy_versions(owner_id, source_id, id);
CREATE TABLE snd.rounding_policy_approvals (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  policy_id uuid NOT NULL, FOREIGN KEY (owner_id, policy_id) REFERENCES snd.rounding_policy_versions(owner_id, id),
  approved_at timestamptz NOT NULL,
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, policy_id)
);
CREATE INDEX rounding_policy_approvals_policy_id_idx ON snd.rounding_policy_approvals(owner_id, policy_id, id);
CREATE INDEX rounding_policy_approvals_source_id_idx ON snd.rounding_policy_approvals(owner_id, source_id, id);
CREATE TABLE snd.attachments (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  object_key text NOT NULL,
  sha256 text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  byte_size bigint NOT NULL CHECK (byte_size >= 0),
  media_type text NOT NULL,
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, object_key)
);
CREATE INDEX attachments_source_id_idx ON snd.attachments(owner_id, source_id, id);
CREATE TABLE snd.production_years (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  label text NOT NULL,
  starts_on date,
  ends_on date,
  PRIMARY KEY (owner_id, id),
  CHECK (ends_on >= starts_on)
);
CREATE INDEX production_years_starts_on_idx ON snd.production_years(owner_id, starts_on, id);
CREATE TABLE snd.land_parcels (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  label text NOT NULL,
  PRIMARY KEY (owner_id, id)
);
CREATE TABLE snd.land_area_history (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  land_id uuid NOT NULL, FOREIGN KEY (owner_id, land_id) REFERENCES snd.land_parcels(owner_id, id),
  valid_from date NOT NULL,
  valid_to date,
  tenure text NOT NULL CHECK (tenure IN ('owned','leased','unknown')),
  original_area numeric NOT NULL CHECK (original_area > 0),
  original_unit text NOT NULL,
  area_m2 numeric CHECK (area_m2 > 0),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id),
  CHECK (valid_to >= valid_from)
);
CREATE INDEX land_area_history_land_id_idx ON snd.land_area_history(owner_id, land_id, id);
CREATE INDEX land_area_history_source_id_idx ON snd.land_area_history(owner_id, source_id, id);
CREATE TABLE snd.leases (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  land_id uuid NOT NULL, FOREIGN KEY (owner_id, land_id) REFERENCES snd.land_parcels(owner_id, id),
  starts_on date NOT NULL,
  ends_on date,
  rent_vnd bigint CHECK (rent_vnd >= 0),
  allocation_policy_version text,
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id),
  CHECK (ends_on >= starts_on)
);
CREATE INDEX leases_land_id_idx ON snd.leases(owner_id, land_id, id);
CREATE INDEX leases_starts_on_idx ON snd.leases(owner_id, starts_on, id);
CREATE INDEX leases_source_id_idx ON snd.leases(owner_id, source_id, id);
CREATE TABLE snd.activities (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  production_year_id uuid NOT NULL, FOREIGN KEY (owner_id, production_year_id) REFERENCES snd.production_years(owner_id, id),
  kind text NOT NULL CHECK (kind IN ('rice','shrimp','crab','shared')),
  PRIMARY KEY (owner_id, id)
);
CREATE INDEX activities_production_year_id_idx ON snd.activities(owner_id, production_year_id, id);
CREATE INDEX activities_kind_idx ON snd.activities(owner_id, kind, id);
CREATE TABLE snd.activity_land_links (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  activity_id uuid NOT NULL, FOREIGN KEY (owner_id, activity_id) REFERENCES snd.activities(owner_id, id),
  land_id uuid NOT NULL, FOREIGN KEY (owner_id, land_id) REFERENCES snd.land_parcels(owner_id, id),
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, activity_id, land_id)
);
CREATE INDEX activity_land_links_activity_id_idx ON snd.activity_land_links(owner_id, activity_id, id);
CREATE INDEX activity_land_links_land_id_idx ON snd.activity_land_links(owner_id, land_id, id);
CREATE TABLE snd.weighing_groups (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  label text NOT NULL,
  business_date date,
  production_year_id uuid, FOREIGN KEY (owner_id, production_year_id) REFERENCES snd.production_years(owner_id, id),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id)
);
CREATE INDEX weighing_groups_business_date_idx ON snd.weighing_groups(owner_id, business_date, id);
CREATE INDEX weighing_groups_production_year_id_idx ON snd.weighing_groups(owner_id, production_year_id, id);
CREATE INDEX weighing_groups_source_id_idx ON snd.weighing_groups(owner_id, source_id, id);
CREATE TABLE snd.weighing_sheets (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  group_id uuid, FOREIGN KEY (owner_id, group_id) REFERENCES snd.weighing_groups(owner_id, id),
  label text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft','finalized','void')),
  rounding_policy_id uuid, FOREIGN KEY (owner_id, rounding_policy_id) REFERENCES snd.rounding_policy_versions(owner_id, id),
  business_date date,
  production_year_id uuid, FOREIGN KEY (owner_id, production_year_id) REFERENCES snd.production_years(owner_id, id),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id)
);
CREATE INDEX weighing_sheets_rounding_policy_id_idx ON snd.weighing_sheets(owner_id, rounding_policy_id, id);
CREATE INDEX weighing_sheets_business_date_idx ON snd.weighing_sheets(owner_id, business_date, id);
CREATE INDEX weighing_sheets_production_year_id_idx ON snd.weighing_sheets(owner_id, production_year_id, id);
CREATE INDEX weighing_sheets_source_id_idx ON snd.weighing_sheets(owner_id, source_id, id);
CREATE TABLE snd.weighing_batches (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  sheet_id uuid NOT NULL, FOREIGN KEY (owner_id, sheet_id) REFERENCES snd.weighing_sheets(owner_id, id),
  ordinal integer NOT NULL CHECK (ordinal > 0),
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, sheet_id, ordinal)
);
CREATE TABLE snd.weighing_entries (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  batch_id uuid NOT NULL, FOREIGN KEY (owner_id, batch_id) REFERENCES snd.weighing_batches(owner_id, id),
  ordinal integer NOT NULL CHECK (ordinal > 0),
  raw_input text NOT NULL,
  gross_gram bigint NOT NULL CHECK (gross_gram > 0),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, batch_id, ordinal)
);
CREATE INDEX weighing_entries_source_id_idx ON snd.weighing_entries(owner_id, source_id, id);
CREATE TABLE snd.deduction_rules (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  sheet_id uuid NOT NULL, FOREIGN KEY (owner_id, sheet_id) REFERENCES snd.weighing_sheets(owner_id, id),
  batch_id uuid, FOREIGN KEY (owner_id, batch_id) REFERENCES snd.weighing_batches(owner_id, id),
  kind text NOT NULL CHECK (kind IN ('none','fixed','bags_per_kg','kg_per_bag','impurity')),
  numerator numeric(78,0) NOT NULL CHECK (numerator >= 0),
  denominator numeric(78,0) NOT NULL CHECK (denominator > 0),
  rule_version text NOT NULL,
  PRIMARY KEY (owner_id, id)
);
CREATE INDEX deduction_rules_kind_idx ON snd.deduction_rules(owner_id, kind, id);
CREATE TABLE snd.calculation_snapshots (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  sheet_id uuid NOT NULL, FOREIGN KEY (owner_id, sheet_id) REFERENCES snd.weighing_sheets(owner_id, id),
  sheet_version integer NOT NULL CHECK (sheet_version > 0),
  rounding_policy_id uuid, FOREIGN KEY (owner_id, rounding_policy_id) REFERENCES snd.rounding_policy_versions(owner_id, id),
  snapshot jsonb NOT NULL,
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, sheet_id, sheet_version)
);
CREATE INDEX calculation_snapshots_rounding_policy_id_idx ON snd.calculation_snapshots(owner_id, rounding_policy_id, id);
CREATE TABLE snd.sales (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  sheet_id uuid, FOREIGN KEY (owner_id, sheet_id) REFERENCES snd.weighing_sheets(owner_id, id),
  activity_id uuid, FOREIGN KEY (owner_id, activity_id) REFERENCES snd.activities(owner_id, id),
  kind text NOT NULL CHECK (kind IN ('rice','aquaculture','unknown')),
  period_start date,
  period_end date,
  amount_vnd bigint CHECK (amount_vnd >= 0),
  rounding_policy_id uuid, FOREIGN KEY (owner_id, rounding_policy_id) REFERENCES snd.rounding_policy_versions(owner_id, id),
  business_date date,
  production_year_id uuid, FOREIGN KEY (owner_id, production_year_id) REFERENCES snd.production_years(owner_id, id),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id),
  CHECK ((period_start IS NULL) = (period_end IS NULL)),
  CHECK (period_end >= period_start),
  CHECK (business_date IS NULL OR period_start IS NULL),
  CHECK (business_date IS NOT NULL OR period_start IS NOT NULL OR verification <> 'confirmed')
);
CREATE INDEX sales_activity_id_idx ON snd.sales(owner_id, activity_id, id);
CREATE INDEX sales_kind_idx ON snd.sales(owner_id, kind, id);
CREATE INDEX sales_rounding_policy_id_idx ON snd.sales(owner_id, rounding_policy_id, id);
CREATE INDEX sales_business_date_idx ON snd.sales(owner_id, business_date, id);
CREATE INDEX sales_production_year_id_idx ON snd.sales(owner_id, production_year_id, id);
CREATE INDEX sales_source_id_idx ON snd.sales(owner_id, source_id, id);
CREATE TABLE snd.sale_lines (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  sale_id uuid NOT NULL, FOREIGN KEY (owner_id, sale_id) REFERENCES snd.sales(owner_id, id),
  ordinal integer NOT NULL CHECK (ordinal > 0),
  product_kind text CHECK (product_kind IN ('rice','shrimp','crab')),
  grade_label text,
  size_label text,
  size_animals_per_kg_numerator numeric(78,0) CHECK (size_animals_per_kg_numerator > 0),
  size_animals_per_kg_denominator numeric(78,0) CHECK (size_animals_per_kg_denominator > 0),
  animal_count bigint CHECK (animal_count > 0),
  physical_gram bigint CHECK (physical_gram > 0),
  settlement_gram bigint CHECK (settlement_gram >= 0),
  unit_price_basis text CHECK (unit_price_basis IN ('kg','animal','lot')),
  unit_price_numerator numeric(78,0) CHECK (unit_price_numerator >= 0),
  unit_price_denominator numeric(78,0) CHECK (unit_price_denominator > 0),
  amount_vnd bigint CHECK (amount_vnd >= 0),
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, sale_id, ordinal),
  UNIQUE (owner_id, sale_id, id),
  CHECK ((unit_price_numerator IS NULL) = (unit_price_denominator IS NULL)),
  CHECK ((unit_price_numerator IS NULL) = (unit_price_basis IS NULL)),
  CHECK ((size_animals_per_kg_numerator IS NULL) = (size_animals_per_kg_denominator IS NULL))
);
CREATE INDEX sale_lines_sale_id_idx ON snd.sale_lines(owner_id, sale_id, id);
CREATE TABLE snd.expenses (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  activity_id uuid, FOREIGN KEY (owner_id, activity_id) REFERENCES snd.activities(owner_id, id),
  category text NOT NULL,
  amount_vnd bigint CHECK (amount_vnd >= 0),
  business_date date,
  production_year_id uuid, FOREIGN KEY (owner_id, production_year_id) REFERENCES snd.production_years(owner_id, id),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id)
);
CREATE INDEX expenses_activity_id_idx ON snd.expenses(owner_id, activity_id, id);
CREATE INDEX expenses_category_idx ON snd.expenses(owner_id, category, id);
CREATE INDEX expenses_business_date_idx ON snd.expenses(owner_id, business_date, id);
CREATE INDEX expenses_production_year_id_idx ON snd.expenses(owner_id, production_year_id, id);
CREATE INDEX expenses_source_id_idx ON snd.expenses(owner_id, source_id, id);
CREATE TABLE snd.allocations (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  sale_id uuid, FOREIGN KEY (owner_id, sale_id) REFERENCES snd.sales(owner_id, id),
  expense_id uuid, FOREIGN KEY (owner_id, expense_id) REFERENCES snd.expenses(owner_id, id),
  sale_line_id uuid,
  land_id uuid, FOREIGN KEY (owner_id, land_id) REFERENCES snd.land_parcels(owner_id, id),
  activity_id uuid, FOREIGN KEY (owner_id, activity_id) REFERENCES snd.activities(owner_id, id),
  amount_vnd bigint CHECK (amount_vnd >= 0),
  physical_gram bigint CHECK (physical_gram >= 0),
  settlement_gram bigint CHECK (settlement_gram >= 0),
  animal_count bigint CHECK (animal_count >= 0),
  PRIMARY KEY (owner_id, id),
  CHECK (num_nonnulls(sale_id, expense_id) = 1),
  CHECK (sale_line_id IS NULL OR sale_id IS NOT NULL),
  FOREIGN KEY (owner_id, sale_id, sale_line_id) REFERENCES snd.sale_lines(owner_id, sale_id, id),
  CHECK (num_nonnulls(amount_vnd, physical_gram, settlement_gram, animal_count) > 0),
  CHECK (expense_id IS NULL OR (amount_vnd IS NOT NULL AND num_nonnulls(physical_gram, settlement_gram, animal_count) = 0)),
  CHECK (num_nonnulls(physical_gram, settlement_gram, animal_count) = 0 OR sale_line_id IS NOT NULL)
);
CREATE INDEX allocations_sale_id_idx ON snd.allocations(owner_id, sale_id, id);
CREATE INDEX allocations_expense_id_idx ON snd.allocations(owner_id, expense_id, id);
CREATE INDEX allocations_sale_line_id_idx ON snd.allocations(owner_id, sale_line_id, id);
CREATE INDEX allocations_land_id_idx ON snd.allocations(owner_id, land_id, id);
CREATE INDEX allocations_activity_id_idx ON snd.allocations(owner_id, activity_id, id);
CREATE TABLE snd.accounts (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  kind text NOT NULL CHECK (kind IN ('asset','liability','equity','income','expense')),
  label text NOT NULL,
  PRIMARY KEY (owner_id, id)
);
CREATE INDEX accounts_kind_idx ON snd.accounts(owner_id, kind, id);
CREATE TABLE snd.assets (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  label text NOT NULL,
  acquired_on date,
  account_id uuid, FOREIGN KEY (owner_id, account_id) REFERENCES snd.accounts(owner_id, id),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id)
);
CREATE INDEX assets_source_id_idx ON snd.assets(owner_id, source_id, id);
CREATE TABLE snd.asset_valuations (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  asset_id uuid NOT NULL, FOREIGN KEY (owner_id, asset_id) REFERENCES snd.assets(owner_id, id),
  as_of date NOT NULL,
  value_vnd bigint CHECK (value_vnd >= 0),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id)
);
CREATE INDEX asset_valuations_asset_id_idx ON snd.asset_valuations(owner_id, asset_id, id);
CREATE INDEX asset_valuations_source_id_idx ON snd.asset_valuations(owner_id, source_id, id);
CREATE TABLE snd.loans (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  label text NOT NULL,
  principal_vnd bigint CHECK (principal_vnd >= 0),
  liability_account_id uuid, FOREIGN KEY (owner_id, liability_account_id) REFERENCES snd.accounts(owner_id, id),
  business_date date,
  production_year_id uuid, FOREIGN KEY (owner_id, production_year_id) REFERENCES snd.production_years(owner_id, id),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id)
);
CREATE INDEX loans_business_date_idx ON snd.loans(owner_id, business_date, id);
CREATE INDEX loans_production_year_id_idx ON snd.loans(owner_id, production_year_id, id);
CREATE INDEX loans_source_id_idx ON snd.loans(owner_id, source_id, id);
CREATE TABLE snd.repayment_schedules (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  loan_id uuid NOT NULL, FOREIGN KEY (owner_id, loan_id) REFERENCES snd.loans(owner_id, id),
  due_on date NOT NULL,
  principal_vnd bigint CHECK (principal_vnd >= 0),
  interest_vnd bigint CHECK (interest_vnd >= 0),
  PRIMARY KEY (owner_id, id)
);
CREATE INDEX repayment_schedules_loan_id_idx ON snd.repayment_schedules(owner_id, loan_id, id);
CREATE TABLE snd.asset_transactions (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  asset_id uuid NOT NULL, FOREIGN KEY (owner_id, asset_id) REFERENCES snd.assets(owner_id, id),
  kind text NOT NULL CHECK (kind IN ('acquire','dispose')),
  amount_vnd bigint CHECK (amount_vnd >= 0),
  business_date date,
  production_year_id uuid, FOREIGN KEY (owner_id, production_year_id) REFERENCES snd.production_years(owner_id, id),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id)
);
CREATE INDEX asset_transactions_asset_id_idx ON snd.asset_transactions(owner_id, asset_id, id);
CREATE INDEX asset_transactions_kind_idx ON snd.asset_transactions(owner_id, kind, id);
CREATE INDEX asset_transactions_business_date_idx ON snd.asset_transactions(owner_id, business_date, id);
CREATE INDEX asset_transactions_production_year_id_idx ON snd.asset_transactions(owner_id, production_year_id, id);
CREATE INDEX asset_transactions_source_id_idx ON snd.asset_transactions(owner_id, source_id, id);
CREATE TABLE snd.loan_transactions (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  loan_id uuid NOT NULL, FOREIGN KEY (owner_id, loan_id) REFERENCES snd.loans(owner_id, id),
  kind text NOT NULL CHECK (kind IN ('drawdown','principal_repayment','interest_charge')),
  amount_vnd bigint CHECK (amount_vnd >= 0),
  business_date date,
  production_year_id uuid, FOREIGN KEY (owner_id, production_year_id) REFERENCES snd.production_years(owner_id, id),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id)
);
CREATE INDEX loan_transactions_loan_id_idx ON snd.loan_transactions(owner_id, loan_id, id);
CREATE INDEX loan_transactions_kind_idx ON snd.loan_transactions(owner_id, kind, id);
CREATE INDEX loan_transactions_business_date_idx ON snd.loan_transactions(owner_id, business_date, id);
CREATE INDEX loan_transactions_production_year_id_idx ON snd.loan_transactions(owner_id, production_year_id, id);
CREATE INDEX loan_transactions_source_id_idx ON snd.loan_transactions(owner_id, source_id, id);
CREATE TABLE snd.settlements (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  sale_id uuid, FOREIGN KEY (owner_id, sale_id) REFERENCES snd.sales(owner_id, id),
  expense_id uuid, FOREIGN KEY (owner_id, expense_id) REFERENCES snd.expenses(owner_id, id),
  asset_transaction_id uuid, FOREIGN KEY (owner_id, asset_transaction_id) REFERENCES snd.asset_transactions(owner_id, id),
  loan_transaction_id uuid, FOREIGN KEY (owner_id, loan_transaction_id) REFERENCES snd.loan_transactions(owner_id, id),
  account_id uuid, FOREIGN KEY (owner_id, account_id) REFERENCES snd.accounts(owner_id, id),
  deposit_settlement_id uuid, FOREIGN KEY (owner_id, deposit_settlement_id) REFERENCES snd.settlements(owner_id, id),
  kind text NOT NULL CHECK (kind IN ('receipt','deposit','payment','refund','deposit_apply')),
  cash_direction text CHECK (cash_direction IN ('in','out')),
  amount_vnd bigint NOT NULL CHECK (amount_vnd > 0),
  business_date date,
  production_year_id uuid, FOREIGN KEY (owner_id, production_year_id) REFERENCES snd.production_years(owner_id, id),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id),
  CHECK (num_nonnulls(sale_id, expense_id, asset_transaction_id, loan_transaction_id) <= 1),
  CHECK (kind = 'deposit' OR num_nonnulls(sale_id, expense_id, asset_transaction_id, loan_transaction_id) = 1),
  CHECK ((kind = 'deposit_apply' AND deposit_settlement_id IS NOT NULL AND account_id IS NULL AND num_nonnulls(sale_id,expense_id) = 1) OR (kind <> 'deposit_apply' AND deposit_settlement_id IS NULL AND account_id IS NOT NULL)),
  CHECK (deposit_settlement_id IS NULL OR deposit_settlement_id <> id),
  CHECK ((kind = 'deposit_apply' AND cash_direction IS NULL) OR (kind <> 'deposit_apply' AND cash_direction IS NOT NULL)),
  CHECK (kind <> 'receipt' OR cash_direction = 'in'),
  CHECK (kind <> 'payment' OR cash_direction = 'out')
);
CREATE INDEX settlements_sale_id_idx ON snd.settlements(owner_id, sale_id, id);
CREATE INDEX settlements_expense_id_idx ON snd.settlements(owner_id, expense_id, id);
CREATE INDEX settlements_asset_transaction_id_idx ON snd.settlements(owner_id, asset_transaction_id, id);
CREATE INDEX settlements_loan_transaction_id_idx ON snd.settlements(owner_id, loan_transaction_id, id);
CREATE INDEX settlements_deposit_settlement_id_idx ON snd.settlements(owner_id, deposit_settlement_id, id);
CREATE INDEX settlements_kind_idx ON snd.settlements(owner_id, kind, id);
CREATE INDEX settlements_business_date_idx ON snd.settlements(owner_id, business_date, id);
CREATE INDEX settlements_production_year_id_idx ON snd.settlements(owner_id, production_year_id, id);
CREATE INDEX settlements_source_id_idx ON snd.settlements(owner_id, source_id, id);
CREATE TABLE snd.journal_events (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  event_kind text NOT NULL,
  idempotency_key uuid NOT NULL,
  sale_id uuid, FOREIGN KEY (owner_id, sale_id) REFERENCES snd.sales(owner_id, id),
  expense_id uuid, FOREIGN KEY (owner_id, expense_id) REFERENCES snd.expenses(owner_id, id),
  settlement_id uuid, FOREIGN KEY (owner_id, settlement_id) REFERENCES snd.settlements(owner_id, id),
  asset_transaction_id uuid, FOREIGN KEY (owner_id, asset_transaction_id) REFERENCES snd.asset_transactions(owner_id, id),
  loan_transaction_id uuid, FOREIGN KEY (owner_id, loan_transaction_id) REFERENCES snd.loan_transactions(owner_id, id),
  reverses_event_id uuid, FOREIGN KEY (owner_id, reverses_event_id) REFERENCES snd.journal_events(owner_id, id),
  source_revision integer NOT NULL CHECK (source_revision > 0),
  business_date date,
  production_year_id uuid, FOREIGN KEY (owner_id, production_year_id) REFERENCES snd.production_years(owner_id, id),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, idempotency_key),
  CHECK (verification = 'confirmed'),
  CHECK (num_nonnulls(sale_id,expense_id,settlement_id,asset_transaction_id,loan_transaction_id) <= 1),
  CHECK (reverses_event_id IS NULL OR reverses_event_id <> id)
);
CREATE INDEX journal_events_sale_id_idx ON snd.journal_events(owner_id, sale_id, id);
CREATE INDEX journal_events_expense_id_idx ON snd.journal_events(owner_id, expense_id, id);
CREATE INDEX journal_events_settlement_id_idx ON snd.journal_events(owner_id, settlement_id, id);
CREATE INDEX journal_events_asset_transaction_id_idx ON snd.journal_events(owner_id, asset_transaction_id, id);
CREATE INDEX journal_events_loan_transaction_id_idx ON snd.journal_events(owner_id, loan_transaction_id, id);
CREATE INDEX journal_events_business_date_idx ON snd.journal_events(owner_id, business_date, id);
CREATE INDEX journal_events_production_year_id_idx ON snd.journal_events(owner_id, production_year_id, id);
CREATE INDEX journal_events_source_id_idx ON snd.journal_events(owner_id, source_id, id);
CREATE TABLE snd.journal_lines (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  event_id uuid NOT NULL, FOREIGN KEY (owner_id, event_id) REFERENCES snd.journal_events(owner_id, id),
  account_id uuid NOT NULL, FOREIGN KEY (owner_id, account_id) REFERENCES snd.accounts(owner_id, id),
  ordinal integer NOT NULL CHECK (ordinal > 0),
  debit_vnd bigint NOT NULL CHECK (debit_vnd >= 0),
  credit_vnd bigint NOT NULL CHECK (credit_vnd >= 0),
  PRIMARY KEY (owner_id, id),
  CHECK ((debit_vnd > 0 AND credit_vnd = 0) OR (credit_vnd > 0 AND debit_vnd = 0)),
  UNIQUE (owner_id, event_id, ordinal)
);
CREATE INDEX journal_lines_event_id_idx ON snd.journal_lines(owner_id, event_id, id);
CREATE TABLE snd.opening_balances (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  account_id uuid NOT NULL, FOREIGN KEY (owner_id, account_id) REFERENCES snd.accounts(owner_id, id),
  as_of date NOT NULL,
  amount_vnd bigint NOT NULL,
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, account_id, as_of)
);
CREATE INDEX opening_balances_source_id_idx ON snd.opening_balances(owner_id, source_id, id);
CREATE TABLE snd.reconciliations (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  account_id uuid NOT NULL, FOREIGN KEY (owner_id, account_id) REFERENCES snd.accounts(owner_id, id),
  as_of date NOT NULL,
  observed_vnd bigint,
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id)
);
CREATE INDEX reconciliations_source_id_idx ON snd.reconciliations(owner_id, source_id, id);
CREATE TABLE snd.receivable_payable_links (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  event_id uuid NOT NULL, FOREIGN KEY (owner_id, event_id) REFERENCES snd.journal_events(owner_id, id),
  sale_id uuid, FOREIGN KEY (owner_id, sale_id) REFERENCES snd.sales(owner_id, id),
  expense_id uuid, FOREIGN KEY (owner_id, expense_id) REFERENCES snd.expenses(owner_id, id),
  asset_transaction_id uuid, FOREIGN KEY (owner_id, asset_transaction_id) REFERENCES snd.asset_transactions(owner_id, id),
  loan_transaction_id uuid, FOREIGN KEY (owner_id, loan_transaction_id) REFERENCES snd.loan_transactions(owner_id, id),
  PRIMARY KEY (owner_id, id),
  CHECK (num_nonnulls(sale_id, expense_id, asset_transaction_id, loan_transaction_id) = 1)
);
CREATE INDEX receivable_payable_links_event_id_idx ON snd.receivable_payable_links(owner_id, event_id, id);
CREATE INDEX receivable_payable_links_sale_id_idx ON snd.receivable_payable_links(owner_id, sale_id, id);
CREATE INDEX receivable_payable_links_expense_id_idx ON snd.receivable_payable_links(owner_id, expense_id, id);
CREATE INDEX receivable_payable_links_asset_transaction_id_idx ON snd.receivable_payable_links(owner_id, asset_transaction_id, id);
CREATE INDEX receivable_payable_links_loan_transaction_id_idx ON snd.receivable_payable_links(owner_id, loan_transaction_id, id);
CREATE TABLE snd.import_batches (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  file_sha256 text NOT NULL CHECK (file_sha256 ~ '^[0-9a-f]{64}$'),
  mapping_version text NOT NULL,
  status text NOT NULL CHECK (status IN ('preview','committed','rolled_back','failed')),
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, file_sha256, mapping_version)
);
CREATE INDEX import_batches_source_id_idx ON snd.import_batches(owner_id, source_id, id);
CREATE TABLE snd.import_rows (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  batch_id uuid NOT NULL, FOREIGN KEY (owner_id, batch_id) REFERENCES snd.import_batches(owner_id, id),
  row_no integer NOT NULL CHECK (row_no > 0),
  raw_payload jsonb NOT NULL,
  row_sha256 text NOT NULL CHECK (row_sha256 ~ '^[0-9a-f]{64}$'),
  error_code text,
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, batch_id, row_no)
);
CREATE TABLE snd.coverage_periods (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  scope_key text NOT NULL,
  coverage text NOT NULL CHECK (coverage IN ('unknown','partial','complete','confirmed_zero')),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id),
  CHECK (ends_on >= starts_on),
  CHECK (coverage <> 'confirmed_zero' OR verification = 'confirmed')
);
CREATE INDEX coverage_periods_starts_on_idx ON snd.coverage_periods(owner_id, starts_on, id);
CREATE INDEX coverage_periods_source_id_idx ON snd.coverage_periods(owner_id, source_id, id);
CREATE TABLE snd.aggregate_observations (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  coverage_id uuid NOT NULL, FOREIGN KEY (owner_id, coverage_id) REFERENCES snd.coverage_periods(owner_id, id),
  kind text NOT NULL CHECK (kind IN ('full_total','additional_only')),
  amount_vnd bigint CHECK (amount_vnd >= 0),
  source_id uuid NOT NULL, FOREIGN KEY (owner_id, source_id) REFERENCES snd.source_records(owner_id, id),
  verification text NOT NULL CHECK (verification IN ('unverified','confirmed','estimated')),
  PRIMARY KEY (owner_id, id)
);
CREATE INDEX aggregate_observations_kind_idx ON snd.aggregate_observations(owner_id, kind, id);
CREATE INDEX aggregate_observations_source_id_idx ON snd.aggregate_observations(owner_id, source_id, id);
CREATE TABLE snd.aggregate_detail_links (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  aggregate_id uuid NOT NULL, FOREIGN KEY (owner_id, aggregate_id) REFERENCES snd.aggregate_observations(owner_id, id),
  sale_id uuid, FOREIGN KEY (owner_id, sale_id) REFERENCES snd.sales(owner_id, id),
  expense_id uuid, FOREIGN KEY (owner_id, expense_id) REFERENCES snd.expenses(owner_id, id),
  PRIMARY KEY (owner_id, id),
  CHECK (num_nonnulls(sale_id, expense_id) = 1)
);
CREATE INDEX aggregate_detail_links_sale_id_idx ON snd.aggregate_detail_links(owner_id, sale_id, id);
CREATE INDEX aggregate_detail_links_expense_id_idx ON snd.aggregate_detail_links(owner_id, expense_id, id);
CREATE TABLE snd.revisions (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  entity_version integer NOT NULL CHECK (entity_version > 0),
  reason text NOT NULL CHECK (length(trim(reason)) > 0),
  snapshot jsonb NOT NULL,
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, entity_type, entity_id, entity_version)
);
CREATE TABLE snd.audit_events (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  event_at timestamptz NOT NULL,
  PRIMARY KEY (owner_id, id)
);
CREATE TABLE snd.sync_outbox (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  mutation_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  base_version integer NOT NULL CHECK (base_version >= 0),
  payload jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('pending','acked','conflict')),
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, mutation_id)
);
CREATE TABLE snd.sync_receipts (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  mutation_id uuid NOT NULL,
  request_sha256 text NOT NULL CHECK (request_sha256 ~ '^[0-9a-f]{64}$'),
  result_version integer NOT NULL CHECK (result_version > 0),
  PRIMARY KEY (owner_id, id),
  UNIQUE (owner_id, mutation_id)
);
CREATE TABLE snd.conflict_records (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  mutation_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  local_payload jsonb NOT NULL,
  remote_payload jsonb NOT NULL,
  resolved_at timestamptz,
  PRIMARY KEY (owner_id, id)
);
CREATE TABLE snd.report_snapshots (
  id uuid NOT NULL,
  owner_id uuid NOT NULL REFERENCES snd.owner_profile(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  basis text NOT NULL,
  as_of timestamptz NOT NULL,
  rule_version text,
  manifest jsonb NOT NULL,
  PRIMARY KEY (owner_id, id)
);
ALTER TABLE snd.owner_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.owner_profile FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.settings FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.source_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.source_records FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.rounding_policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.rounding_policy_versions FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.rounding_policy_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.rounding_policy_approvals FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.attachments FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.production_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.production_years FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.land_parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.land_parcels FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.land_area_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.land_area_history FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.leases FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.activities FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.activity_land_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.activity_land_links FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.weighing_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.weighing_groups FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.weighing_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.weighing_sheets FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.weighing_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.weighing_batches FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.weighing_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.weighing_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.deduction_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.deduction_rules FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.calculation_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.calculation_snapshots FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.sales FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.sale_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.sale_lines FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.expenses FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.allocations FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.accounts FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.assets FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.asset_valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.asset_valuations FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.loans FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.repayment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.repayment_schedules FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.asset_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.asset_transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.loan_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.loan_transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.settlements FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.journal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.journal_events FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.journal_lines FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.opening_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.opening_balances FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.reconciliations FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.receivable_payable_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.receivable_payable_links FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.import_batches FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.import_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.import_rows FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.coverage_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.coverage_periods FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.aggregate_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.aggregate_observations FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.aggregate_detail_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.aggregate_detail_links FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.revisions FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.audit_events FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.sync_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.sync_outbox FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.sync_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.sync_receipts FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.conflict_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.conflict_records FORCE ROW LEVEL SECURITY;
ALTER TABLE snd.report_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE snd.report_snapshots FORCE ROW LEVEL SECURITY;
CREATE FUNCTION snd.reject_policy_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$ BEGIN
  RAISE EXCEPTION 'rounding policy registry is append-only' USING ERRCODE = '55000';
END; $$;
CREATE TRIGGER rounding_policy_versions_immutable BEFORE UPDATE OR DELETE ON snd.rounding_policy_versions FOR EACH ROW EXECUTE FUNCTION snd.reject_policy_mutation();
CREATE TRIGGER rounding_policy_versions_no_truncate BEFORE TRUNCATE ON snd.rounding_policy_versions FOR EACH STATEMENT EXECUTE FUNCTION snd.reject_policy_mutation();
CREATE TRIGGER rounding_policy_approvals_immutable BEFORE UPDATE OR DELETE ON snd.rounding_policy_approvals FOR EACH ROW EXECUTE FUNCTION snd.reject_policy_mutation();
CREATE TRIGGER rounding_policy_approvals_no_truncate BEFORE TRUNCATE ON snd.rounding_policy_approvals FOR EACH STATEMENT EXECUTE FUNCTION snd.reject_policy_mutation();
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA snd FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA snd FROM PUBLIC;
COMMIT;
-- No posting/revision/sync transaction routines yet. Cross-row invariants are NOT enforced by this draft.
