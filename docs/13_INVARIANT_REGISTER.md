# Invariant register — CP-001-R1

Trạng thái `DRAFT-SQL` = có khai báo tĩnh, chưa thực thi PostgreSQL; `CONTRACT` = đặc tả, chưa enforce; `SMOKE` = chỉ kiểm tra skeleton. Mỗi gate sau phải có negative/boundary/property hoặc integration evidence. Không có invariant nghiệp vụ nào được tuyên bố đã nghiệm thu; A01–A12 NOT RUN.

| ID | Invariant / failure case | R1 | Gate / cách kiểm chứng |
|---|---|---|---|
| INV-01 | Owner scope composite FK, không cross-owner, id ổn định | DRAFT-SQL | CP-001-R1 disposable FK negatives; CP-008 A09 auth/RLS |
| INV-02 | Canonical integer/rational string, no Number, bounds/overflow, denominator >0, null != zero | CONTRACT + SQL checks | CP-002 A01 roundtrip/property; numeric(78,0) có thể coerce fraction trước CHECK, API reject trước persist |
| INV-03 | Gross valid >0; bì/tạp chất không âm, không vượt gross, không overlap; batch rule thuộc sheet | CONTRACT | CP-002 A01 CAL-01/02/08/11; transaction tests |
| INV-04 | Exact rational đến step lượng tử hóa; không rounding cột/bảng; multi-price partition <= settlement, residual visible | CONTRACT | CP-002 A01 CAL-03..08/11; property tests |
| INV-05 | Version policy immutable, approval owner explicit, không finalize thiếu policy; history UNKNOWN giữ observed | DRAFT-SQL append-only + CONTRACT | CP-001-R1 mutation negatives; CP-002 CAL-12, D08 approval/hash/replay; CP-003 A04 |
| INV-06 | Line grade/size/species/price basis independent, nullable; species/header/activity compatibility, sale date or period | DRAFT-SQL fields/check + CONTRACT | CP-004 FARM-01 input/revision; CP-002 exact unit price |
| INV-07 | Allocation đúng sale/expense & line parent, owner, nonnegative, >=1 known dimension; expense money only | DRAFT-SQL | CP-001-R1 FK/check negatives; CP-002 data invariants |
| INV-08 | Per-dimension sum <= known source; no header+line revenue mode mixing; unknown/residual explicit; no double counting | CONTRACT | CP-002 A01 sum/property/concurrency; CP-004 A07 report/land |
| INV-09 | Land area/tenure history nonoverlap, preserve original unit; lease cash vs cost period, common cost once | CONTRACT | CP-004 A07; D09/D12 policy before calculation |
| INV-10 | Settlement target XOR, positive amount, cash direction explicit; deposit_apply links deposit and no cash account/direction | DRAFT-SQL | CP-001-R1 negatives; CP-002 A05 |
| INV-11 | Deposit/reversal/refund/partial settlements/overpayment correct; deposit consumption atomic; no duplicate cash/revenue | CONTRACT | CP-002 CAL-09/10 A05, retry/concurrency |
| INV-12 | Journal lines debit XOR credit; event >=2 balanced; confirmed subject/source, correct revision; atomic posting | DRAFT-SQL row checks + CONTRACT | CP-002 A05 sum/debit credit/transaction/negative |
| INV-13 | Economic event semantic uniqueness, idempotency same key/same payload replay, mismatch reject; revision/source immutable | DRAFT-SQL keys + CONTRACT | CP-002 A04/A05 posting; CP-003 revision; CP-008 A03 replay/conflict |
| INV-14 | Loan principal not income/expense, interest once, schedule not actual, asset acquisition/valuation separate; cash clearing | CONTRACT | CP-002 A05 synthetic posting; CP-005 asset/debt reconciliation D12 |
| INV-15 | Transfer internal total cash unchanged; opening balances and reconciliation separate, missing unknown | CONTRACT | CP-002 A05; CP-005 UI reconciliation |
| INV-16 | 25 bags/table, 3 tables/page, append/undo no overwrite, 1k bags | CONTRACT | CP-003 A02; CAL-07 CP-002 |
| INV-17 | finalized revision preserves raw/rule/audit; optimistic version; atomic record+outbox; no silent last-write-wins | CONTRACT | CP-003 A03/A04 local; CP-008 sync integration |
| INV-18 | Verification vs coverage vs provenance; confirmed_zero explicit; aggregate overlap/full_total no sum double count | DRAFT-SQL row check + CONTRACT | CP-004 A06, CP-006 import overlap |
| INV-19 | Import mapping/version dedup, preview errors, rollback atomic, lossless export | DRAFT-SQL keys + CONTRACT | CP-006 A08 |
| INV-20 | All tables RLS enable+force, no PUBLIC grants; no allow policies yet | DRAFT-SQL | CP-001-R1 disposable default-deny check; CP-008 A09 full auth/storage integration |
| INV-21 | Backup restore checksum, relation/version/image count; offline unsynced not backup | CONTRACT | CP-006 export; CP-008 A10 |
| INV-22 | No artificial history limit; bounded query, pagination, p95 benchmarks genuine | CONTRACT | CP-007 query; CP-008 A11 |
| INV-23 | Complete report conditional, correct period and denominator, drilldown no inferred gaps | CONTRACT | CP-004 A06/A07, CP-007 report, CP-009 A12 |
| INV-24 | No real data/secret in repo or logs; no external services; safe local evidence | process + SMOKE | every CP; CP-008 security audit; CP-009 owner-approved data only |

CP-001-R1 tests prepared for row-level constraints and registry triggers, not runtime posting/rounding; no executable CP-002 engine. CP-002 prerequisites: verified technical toolchain, owner decisions required by spec (especially D08), invariant transaction design, real CAL tests. Do not start automatically.
