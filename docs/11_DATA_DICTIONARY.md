# 11 — Data dictionary v0.1.1 R1 (draft)

Quy ước chung: `id/owner_id` UUID scope; `created_at/updated_at` timestamptz UTC; `version` integer >0; `business_date` date theo Asia/Ho_Chi_Minh; `production_year_id` nullable khi chưa gán; `source_id` typed FK; verification unverified/confirmed/estimated. Nullable nghĩa chưa biết/không áp dụng theo field, không mặc định zero. SQL là danh sách field/type/null/check cụ thể, chưa được DB xác minh. Các field tiền `*_vnd` bigint, cân `*_gram` bigint; JSON wire string. `numeric` cho diện tích/tỷ lệ chính xác; JSON payload cần version/validation.

| Bảng | Ý nghĩa / field trọng yếu |
|---|---|
| owner_profile | id chủ sở hữu; chưa map auth |
| settings | setting_key/value; no default rounding policy |
| source_records | kind/external_key/original_payload, provenance gốc |
| rounding_policy_versions | policy_key/version, definition_schema_version, ordered JSON definition/hash, source; append-only draft |
| rounding_policy_approvals | policy_id, explicit approved_at/source; append-only draft |
| attachments | source_id/object_key/sha256/byte_size/media_type, file private |
| production_years | label/starts_on/ends_on, kỳ sản xuất |
| land_parcels | label, danh tính đất ổn định |
| land_area_history | valid_from/to, tenure, original_area/unit, area_m2 nullable |
| leases | land_id, dates, rent_vnd nullable, allocation_policy_version |
| activities | production_year_id/kind rice/shrimp/crab/shared |
| activity_land_links | activity_id/land_id |
| weighing_groups | label, business/source metadata |
| weighing_sheets | group_id, status draft/finalized/void, rounding_policy_id nullable |
| weighing_batches | sheet_id/ordinal |
| weighing_entries | batch_id/ordinal/raw_input/gross_gram >0, source |
| deduction_rules | sheet_id/batch_id, kind/numerator/denominator/rule_version |
| calculation_snapshots | sheet_id/sheet_version/rounding_policy_id/snapshot |
| sales | sheet_id/activity_id/kind/day or period/amount_vnd nullable/rounding_policy_id, business/source |
| sale_lines | sale_id/ordinal/product_kind/grade_label/size_label/size_animals_per_kg rational/animal_count/physical_gram/settlement_gram/unit price rational + basis/amount_vnd |
| expenses | activity_id/category/amount_vnd nullable, business/source |
| allocations | sale XOR expense, optional sale_line_id same sale, land/activity nullable, amount_vnd/physical_gram/settlement_gram/animal_count nullable |
| accounts | kind asset/liability/equity/income/expense, label |
| settlements | optional sale/expense/asset_transaction/loan_transaction XOR; account nullable only for deposit_apply, deposit_settlement_id, cash_direction, kind, amount |
| journal_events | event_kind/idempotency_key/source_revision, confirmed only; typed subject links (at most one), reverses_event_id |
| journal_lines | event/account/ordinal/debit_vnd/credit_vnd |
| opening_balances | account/as_of/amount_vnd signed, source |
| reconciliations | account/as_of/observed_vnd nullable, source |
| receivable_payable_links | event, sale/expense/asset_transaction/loan_transaction XOR |
| assets | label/acquired_on/account_id/source |
| asset_valuations | asset/as_of/value_vnd nullable |
| loans | label/principal_vnd nullable/liability_account_id, business/source |
| asset_transactions | asset_id, acquire/dispose, amount_vnd nullable, business/source |
| loan_transactions | loan_id, drawdown/principal_repayment/interest_charge, amount_vnd nullable, business/source |
| repayment_schedules | loan/due_on/principal_vnd/interest_vnd nullable |
| import_batches | source/file_sha256/mapping_version/status |
| import_rows | batch/row_no/raw_payload/row_sha256/error_code |
| coverage_periods | starts/ends/scope_key/coverage, confirmation source |
| aggregate_observations | coverage_id/kind full_total or additional_only/amount_vnd |
| aggregate_detail_links | aggregate_id/sale XOR expense |
| revisions | entity_type/id/version/reason/snapshot |
| audit_events | entity_type/id/action/event_at; log metadata only |
| sync_outbox | mutation/entity/base_version/payload/status |
| sync_receipts | mutation/request_sha256/result_version |
| conflict_records | mutation/entity/local_payload/remote_payload/resolved_at |
| report_snapshots | basis/as_of/rule_version/manifest |

Source/revision immutability, row-level policies, posting and all cross-row invariants remain future transaction work. No sample financial data or PII.

See 12_R1_DOMAIN_CONTRACTS for semantics and constraints not enforced, 13_INVARIANT_REGISTER for gates. All 46 tables remain review draft, not applied.
