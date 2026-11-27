# 11 — Data dictionary v0 (draft)

Quy ước chung: `id/owner_id` UUID scope; `created_at/updated_at` timestamptz UTC; `version` integer >0; `business_date` date theo Asia/Ho_Chi_Minh; `production_year_id` nullable khi chưa gán; `source_id` typed FK; verification unverified/confirmed/estimated. Nullable nghĩa chưa biết/không áp dụng theo field, không mặc định zero. SQL là danh sách field/type/null/check cụ thể, chưa được DB xác minh. Các field tiền `*_vnd` bigint, cân `*_gram` bigint; JSON wire string. `numeric` cho diện tích/tỷ lệ chính xác; JSON payload cần version/validation.

| Bảng | Ý nghĩa / field trọng yếu |
|---|---|
| owner_profile | id chủ sở hữu; chưa map auth |
| settings | setting_key/value, policy đề xuất |
| source_records | kind/external_key/original_payload, provenance gốc |
| attachments | source_id/object_key/sha256/byte_size/media_type, file private |
| production_years | label/starts_on/ends_on, kỳ sản xuất |
| land_parcels | label, danh tính đất ổn định |
| land_area_history | valid_from/to, tenure, original_area/unit, area_m2 nullable |
| leases | land_id, dates, rent_vnd nullable, allocation_policy_version |
| activities | production_year_id/kind rice/shrimp/crab/shared |
| activity_land_links | activity_id/land_id |
| weighing_groups | label, business/source metadata |
| weighing_sheets | group_id, status draft/finalized/void, rounding_policy_version nullable |
| weighing_batches | sheet_id/ordinal |
| weighing_entries | batch_id/ordinal/raw_input/gross_gram >0, source |
| deduction_rules | sheet_id/batch_id, kind/numerator/denominator/rule_version |
| calculation_snapshots | sheet_id/sheet_version/policy_version/snapshot |
| sales | sheet_id/activity_id/amount_vnd nullable, business/source |
| sale_lines | sale_id/ordinal/settlement_gram/unit price rational/amount_vnd |
| expenses | activity_id/category/amount_vnd nullable, business/source |
| allocations | sale XOR expense, land/activity nullable, amount_vnd |
| accounts | kind asset/liability/equity/income/expense, label |
| settlements | optional sale/expense, account, receipt/deposit/payment/refund/deposit_apply, amount |
| journal_events | event_kind/idempotency_key/source_revision, confirmed only; typed source links |
| journal_lines | event/account/ordinal/debit_vnd/credit_vnd |
| opening_balances | account/as_of/amount_vnd signed, source |
| reconciliations | account/as_of/observed_vnd nullable, source |
| receivable_payable_links | event, sale XOR expense |
| assets | label/acquired_on/source |
| asset_valuations | asset/as_of/value_vnd nullable |
| loans | label/principal_vnd nullable, business/source |
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
