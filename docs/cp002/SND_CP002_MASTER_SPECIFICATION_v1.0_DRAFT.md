# SỔ NÔNG DÂN — CP-002 MASTER SPECIFICATION v1.0

**Revision:** v1.0-draft.1 — integrated specification for independent review  
**Authority:** Master Control / Architecture & Coordination  
**Status:** DRAFT FOR INDEPENDENT REVIEW; NOT APPROVED FOR IMPLEMENTATION  
**Baseline:** `hnhuynh1003-blip/so-nong-dan`, `checkpoint/cp-001-r2`, `3ae5e2be06e401adaca044aad6f9376e9b15e5c5`  
**Accepted closure:** `5f44141824814877cbd5121b13b73f0cf493174d`  
**Verified CP-001 runtime:** `05724c20f51755bc94a948165afb36b892e35fb4`

## 0. Authority, source precedence and scope

CP-001 ACCEPTED (E14, 2026-11-27); CP-002 SPECIFICATION AUTHORIZED, IMPLEMENTATION NOT AUTHORIZED. D06 OWNER CONFIRMED in Chat; D08.1–4 and .6 confirmed in Chat, D08.5 UNKNOWN, D08 remains OPEN / PARTIALLY CONFIRMED. D09–D12 OPEN; D05/D07 PROPOSED. At baseline GitHub readback D06 is still PROPOSED and D08 OPEN; the owner decisions need a separate documentation record. Neither this draft nor research reports change the accepted repository.

Sources: baseline `docs/01_MASTER_SPECIFICATION.md`, `03_SYSTEM_ARCHITECTURE.md`, `04_DATA_MODEL.md`, `05_CALCULATION_CONTRACT.md`, `09_DECISION_LOG.md`, `11_DATA_DICTIONARY.md`, `12_R1_DOMAIN_CONTRACTS.md`, `13_INVARIANT_REGISTER.md`, ADR 0002/0003, `migrations/0001_schema_draft.sql`, CP-001-R2 acceptance and evidence. Additional sources are owner decisions and R&D-001, R&D-002, R&D-002-R1, R&D-003 and Master Control addenda MC-A01–05 in project chats; these are not yet verified as committed repository files. Preserve original reports and identifiers. Owner decisions prevail over proposed alternatives; baseline remains authoritative for unaffected requirements. Resolve conflicts explicitly; do not edit history silently.

Family only, one primary operator, Vietnamese mobile-first, no SaaS, no actual family data in repository, no Codex, no paid service/deploy/merge or CI without appropriate authorization. CP-002 defines arithmetic, rice calculation, policy registry, financial ledger, settlement and transactional invariants. CP-003+ own product UI, offline full integration, farm/land workflows, family finance, import/export, analytics, production security/scale and family UAT. UI design may proceed separately with synthetic data. No A01–A12 or CP-002 test has been executed under this specification.

Normative labels: CONFIRMED = owner decision only; REQUIRED = invariant inherited or proposed as a mandatory gate in this draft; CANDIDATE = requires review/approval or evidence; BLOCKED = cannot activate affected behavior until prerequisite is met. All new technical design choices remain draft until reviewed and authorized.

## 1. Work packages and delivery boundaries

| Package | Deliverable | Dependency/gate |
|---|---|---|
| 002A | Exact arithmetic, wire parser, bounds, independent oracle | Technical profile review; explicit implementation authorization |
| 002B | Rice gross/tare/net/price partition; sheet consumption | 002A; confirmed D08 scope |
| 002C | Versioned policy, approval, snapshots and replay | 002A/B; full applicable policy before finalization |
| 002D | Typed accounts, recognition, posting gate, correction | 002A; D06 confirmed; financial policy profile approval |
| 002E | Settlements, allocations, idempotency and concurrency | 002B–D interfaces; cross-row guards |
| 002F | Integration, disposable PostgreSQL and evidence closure | 002A–E; independent verification then owner acceptance |

Pure calculation is separate from persistence and posting. Preview cannot post. All authoritative writes use one controlled transactional path. Proposed implementation sequencing: build and verify A first, then B/C, then D/E together for the end-to-end write path, then F. No package is authorized by this document. An engine-only synthetic test may use an explicitly marked fixture policy; fixture approval is never a production approval.

## 2. Owner decision profile — D08

| ID | Confirmed rule or unresolved issue |
|---|---|
| D08.1 | Proportional tare exactly, including partial groups of bags; total sheet scope; ratio entered for applicable agreement, not fixed to 10 |
| D08.2 | Current rice workflow: only tare, no impurity deduction or additional discount |
| D08.3 | Round net weight to nearest 1 kg; positive half ties upward |
| D08.4 | One unit price per sheet; round entire sheet after tare. Group may contain several sheets with different prices. |
| D08.5 | Money rounding UNKNOWN. No rounding to hundreds/thousands or implicit fractional VND conversion. |
| D08.6 | Correction uses original sheet rule; rule change needs separate confirmation and history. Unknown historical rules must not be invented. |

Current profile (candidate designation `rice-sheet-single-price-v1`; not an approved registry UUID): use exact proportional tare and whole-sheet rounding. This is a restriction of the current rice workflow, not a deletion of future multi-price aquaculture or generic calculation capabilities. Other deduction/rounding combinations remain disabled unless supported and approved. A draft can contain unpriced data; finalization requires a known price and valid sale scope. No second rounding at group level.

Proposed decision D08.5-A (NOT APPROVED): for the confirmed single-price rice workflow, if exact calculated amount is already an integer VND, retain that exact integer without any monetary rounding; if not integral, block finalization until an approved money rule exists. This proposal does not claim actual merchant practice, does not allow silently treating settlement differences as discounts, and does not override the baseline requirement for explicit policy approval. Until owner confirms this restricted rule and the applicable policy registry record, only previews/fixtures are allowed. If owner declines or is unsure, D08.5 stays UNKNOWN and affected finalization remains blocked. Historical observed amounts are allowed in the observation layer with provenance, not fabricated postings.

## 3. CP-002A — Arithmetic and wire contract

- Integers: ASCII canonical decimal strings, full-match `0` or `-?[1-9][0-9]*`; reject -0, plus signs, leading zeros, whitespace/newlines, exponent, grouping, JSON numbers. Validate per-field sign and missing/null separately. Parse only after length/resource checks. Raw input string/unit/mode retained separately. Three-digit input mode maps `443` to `44300` gram. Never use displayed text or binary floating-point for authoritative weight/money.
- Rational: exactly `{numerator, denominator}` canonical strings, positive denominator, gcd(abs(n),d)=1; zero is 0/1. Wire rejects noncanonical fractions; explicit input adapter may normalize while preserving source. Unit-aware conversions exact (1 kg=1000 g). Unit price VND/kg may be rational in generic engine, not an implicit permission for fractional VND settlement.
- Stored gram/VND bigint signed range [-9223372036854775808,9223372036854775807], field constraints stricter (bag gross positive, normal sale amount nonnegative). `numeric(78,0)` components max 78 decimal digits; validate before binding/cast because scale can round. Persist integer only when denominator=1 and value fits. Intermediate rational trace serialized as canonical strings with schema and explicit resource limits. Report sums use wider integer accumulation, never truncate to row bound.
- Candidate resource profile from R&D-003: 256 digits per reduced component, 1024 digits temporary, 100000 normalized input records per revision calculation. These are NOT final limits. Bound raw bytes, parser depth, token lengths, operation count, intermediate growth and retry budgets before release; cross-cancel multiplication, gcd addition, deterministic ordering. Benchmark/profile approval required before declaring supported bounds. No arbitrary historical record/year cap. Reject cleanly with separate error categories and preserve draft. D07 scale targets remain unbenchmarked.
- Independent oracle: separate integer/rational reference implementation or hand vectors, no reuse of production arithmetic/rounding. Compare canonical exact intermediate values, errors, persisted representation and export/driver round trip. No tolerance-based comparison for authoritative quantities.

## 4. CP-002B/C — Calculation and policy

### 4.1 Current rice formula

Let N be number of valid bags, G=sum gross gram, R=positive exact bags/kg tare ratio. T=1000*N/R g; P=G-T; C=P (no impurity for current profile); S=1000*nearest(P/1000) g, ties toward positive for nonnegative values; A=(S/1000)*unit_price in VND exact. T,P,C,A can be rational internally; persist integer fields only by approved rules. Keep G, T, P, C, S, S-C, price and A separately. Missing bag does not count; zero/negative bag rejected. Explicit no-tare if a future approved rule permits it; missing tare is not zero. Reject deductions greater than gross at applicable scope. Zero resulting weight/value: preserve observation/draft; no zero journal lines; approval of zero-sale finalization remains open. Group total = sum sheet results, no group re-rounding. Group price average only weighted by compatible known settlement weights, positive denominator and sufficient coverage.

### 4.2 General deductions and source ownership

All inputs pinned to immutable sheet revision; stable unique bag IDs, exact same owner/sheet/batch. One effective tare rule per bag, separate impurity layer if approved. Validate batch belongs to sheet via composite relationship; no overlapping whole-sheet/batch deduction. Gross=sum entries, 25 bags/table, 3 tables/page; sums do not round. For alternate scope combinations, shared tare/impurity allocation must be explicit, exact and conserved before testing local net; disabled if no approved allocation rule. Generic multi-price support (for later requirements) must conserve exact commercial weight independently of rounded settlement weights; unpriced/unsold residual separate. Do not increase inventory or source capacity from rounding. Current rice sheets reject multiple prices; group-level different prices supported. Partial/multiple sale from a sheet remains a candidate workflow, not enabled by default; if enabled, consumption root stable across revisions, cumulative exact use <= available exact source, correction/hủy must reconcile prior consumption; no resurrection by revision change. No automatic residual distribution without approved rule.

### 4.3 Rounding definitions and registry

For x rational, q>0, k=floor(x/q), r=x/q-k in [0,1). Exact returns x, q/tie absent; floor=kq; ceil=(k+1)q if r>0 else kq. Nearest compare 2r to 1; tie enum explicitly positive, negative, toward zero, away from zero or even quantum index. BigInt division truncates toward zero, not floor for negatives. Signed arithmetic for adjustments/research; normal rice net nonnegative. Reversal uses actual posted integer VND, never recomputes negative exact inputs. Generic scope alternatives P-A–D from R&D-003 remain candidates; no default.

Registry: immutable policy ID/key/version, definition schema, ordered steps, units, scope, quantum, tie, residual behavior; immutable approval ID, owner provenance, policy ID/hash, applicable dates/scope; append-only effective/supersession records. Candidate canonicalization RFC 8785 envelope `{definitionSchemaVersion,definition}`; precise values strings; metadata numbers safe bounded; reject duplicate keys before parser merge, invalid Unicode, schema violations. Canonicalization version pinned and compatible with existing contract; UTF-8 SHA-256 lowercase over canonical bytes, never arbitrary JSONB textual output. No approval from fixture/AI. Verify hash, applicability and approval in same authoritative finalization transaction. Review exact activation time semantics and policy selection under concurrent changes before implementation.

Snapshot: raw IDs and immutable revision, complete canonical inputs and digest, exact intermediates, policy hash/approval and effectivity evidence, rounding trace/residual, settlement/result, engine build/source identity, dependency lock and reproducible test vectors. Historical known policy reads original snapshot; replay uses exact old build/policy/input, reports mismatch or unavailable engine, never overwrites. Historical UNKNOWN retains observed amounts/units, source and verification per fact, no guessed policy or payment. Correction keeps old rule under D08.6 (if known and applicable to that correction); explicit policy-change authorization separately recorded. Old snapshot always preserved; correction of financial result follows §6.

## 5. CP-002D — Financial recognition and posting

D06 confirms balanced ledger architecture, not all posting policies. Role-based accounts: cash/bank, receivable/payable, advances paid/received, overpayments paid/received, loan principal, interest payable, noncash assets/accumulated depreciation, equity/opening counterpart, farm revenue, production expense, household expense, interest expense and conditional asset gains/losses. Separate physical accounts from role; immutable semantic identity, same owner, validate role/effectivity, historical account still readable. D12 asset/capitalization/inventory/depreciation rules inactive. No assumed opening counterpart, opening date, overdraft rule, fee or transfer-in-transit policy.

Proposed posting matrix (all A positive confirmed integer VND; omit zero lines):

| Event | Debit | Credit | Conditions |
|---|---|---|---|
| Sale recognition | Receivable A | Farm revenue A | confirmed sale/revision, supported recognition date, no duplicate; not assumed for historical unknown payment |
| Collection | Cash A | Receivable M; received excess X | confirmed cash source, open item O, M=min(A,O), X=A-M only if excess policy approved |
| Expense recognition | Production/household expense A | Payable A | confirmed obligation, classification; inventory/assets deferred |
| Payment | Payable M; paid excess X | Cash A | confirmed cash, excess recoverability and policy |
| Customer deposit | Cash A | Customer advance A | confirmed cash/party, own deposit root |
| Supplier deposit | Supplier advance A | Cash A | confirmed cash/party |
| Apply customer deposit | Customer advance A | Receivable A | <= deposit available AND open item; no cash |
| Apply supplier deposit | Payable A | Supplier advance A | same condition |
| Refund customer advance/excess | Advance/excess liability A | Cash A | actual refund, original available item, <= available |
| Receive supplier refund | Cash A | Advance/excess asset A | actual cash, recoverable original item |
| Loan drawdown | Cash A | Principal liability A | actual disbursement, loan/part ID; contract/schedule not payment |
| Principal repayment | Principal liability A | Cash A | <= confirmed principal, stable split ID |
| Interest recognition | Interest expense A | Interest payable A | confirmed obligation, not schedule alone |
| Interest payment | Interest payable A | Cash A | <= open interest; immediate charge/payment may commit together |
| Internal transfer | Destination cash A | Source cash A | distinct accounts, same transfer, both confirmed; aggregate external cash unchanged |
| Direct paid expense (candidate) | Expense A | Cash A | both expense/cash confirmed, no payable/advance needed, both identities claimed |
| Opening (blocked pending policy) | Confirmed opening debit roles | Confirmed opening credit roles | balanced opening basis and items; no period flow/income |
| Acquisition/disposal/depreciation (D12 blocked) | per approved policy | per approved policy | preserve observation only until policy/values available |

If D12 is later approved: acquisition debit asset/credit payable with separate payment; disposal debit receivable P and accumulated depreciation D and loss max(G-D-P,0), credit asset G and gain max(P-(G-D),0), with valid carrying value G-D>=0; depreciation debit expense/credit accumulated depreciation. Fixture F05 only, not activation. Valuation observations and loan schedules do not post. Rent paid vs recognized expense follow approved period basis D09/D12. Household spending separate from farm cost. One payment certificate split into principal/interest/fee must reconcile exact total and stable component identities; unclear split stays pending. Direct vs payable expense pathways mutually exclusive (same recognition root and cash identity), not two ways to count the same expense. Default route and eligibility to be approved.

Posting gate: authenticated owner, eligible confirmed subject AND fact-specific evidence, typed role and account, source/revision, business date, semantic identity, at least two nonzero one-sided lines, exact total debit=credit, per-item conservation and business mapping; no cross-owner, no direct journal DML bypass by application writer. Do not create fictitious offset when information missing. Receipt/replay, reversal, journal and source references preserved. Cross-row enforcement via restricted DB writer/finalization with commit-time integrity or equivalent proven mechanism; DDL/schema design still required. Historical observations and estimated data separate from official journal; unknown != zero. Confirmed revenue observation does not establish debt or cash. Evidence of actual cash whose classification unresolved stored as observation/pending, not lost or fabricated journal.

## 6. Correction, settlement and economic identity

Stable keys: `(owner,mutation_id)` for retry; `(owner,recognition_family,stable_business_id)` for one current recognition across revision and path; stable cash movement ID with split IDs for one actual transfer; event IDs for immutable history. Current recognition position points to effective revision/event or cancelled state; direct expense uses base event plus immutable correction chain (active revision points to effective recognition projection, not duplicate cash event). New recognition only if unclaimed; correction compares expected active revision/event under lock. One effective reversal per original event. Do not treat payload similarity/date/amount as uniqueness; independent identical sales possible. Duplicate document identity when trustworthy; uncertain duplicates flagged.

Standard sale/expense correction: lock source/dependencies; reverse exact old recognition (not actual cash); post replacement recognition; reclassify settled portion via noncash entries. For reduced sale, debit receivable / credit received excess or customer advance depending on original source; reduced expense debit paid excess/supplier advance / credit payable. Increased value uses available authorized advance/excess only, otherwise open item. Preserve original cash event, source, date and amount. Multiple funding sources need approved ordering; refund/cross-applied amounts not recreated, unresolved dependent changes block correction. Cancelled recognition retains identity; reopening/date/closed period require policy. Direct expense candidate correction: preserve base cash event; noncash delta linked to new revision and original cash. Reduction only with confirmed recoverability: debit paid excess/credit expense; increase with sufficient evidence and approved mapping (e.g. payable if new obligation), otherwise block. Reclassification between expense categories with unchanged total is noncash; correcting erroneous recorded cash is distinct from an actual refund and requires approved evidence/correction policy. Repeated corrections calculate delta against current effective recognition, prevent duplicate delta, reconcile all prior adjustments/refunds, never mutate original cash. No fabricated refund. MC-A01.

Oracle F08 (VND): sale Dr AR1000/Cr revenue1000; receipt Dr cash1000/Cr AR1000; correction atomic Dr revenue1000/Cr AR1000 + Dr AR900/Cr revenue900 + Dr AR100/Cr received excess100. Final cash1000, AR0, revenue900, excess100. Real refund Dr excess100/Cr cash100 => cash900, excess0. F09 symmetric purchase: opening cash1000/equity1000; expense/payable1000 then payable/cash1000; correction payable/expense1000 + expense/payable900 + paid excess/payable100; cash0 expense900 excess100 payable0; actual refund cash/excess100 => cash100 expense900. F10 direct: opening cash1000/equity1000; expense/cash1000; correction paid excess/expense100; cash0 expense900 excess100; actual refund cash/excess100 => cash100 expense900. Second reduction to 850 before any refund adds only 50; after partial/complete refund recompute against dependencies or block if policy not available.

## 7. CP-002E — Transaction integrity and locking

Candidate design: PostgreSQL READ COMMITTED with deterministic row/guard locking and unique keys. All writers including imports, revision, sync, allocation and coverage follow same protocol. SERIALIZABLE alternative only with full transaction retry and adequate coverage of all invariants. Lock claim first, then rank A accounts, B period/coverage/opening guards, S stable subject/source/recognition guards (including weighing sheet and land root), L open items/cash/split/source consumption, J original journal. Sort canonical `(owner,type,id)` within rank; acquire full known set; read again after locks using fresh statements. If dependencies changed/new required lock outside known set, rollback and recompute complete set. For missing roots use unique stable guard creation/claim in same transaction, not absence-of-row assumption. Period/coverage guard must protect overlapping ranges, including new transaction affecting existing total; candidate coarse owner+metric+basis guard where overlap cannot use exact date key. Require review of lock granularity/index/FK interactions before implementation. Avoid unbounded retry; transient errors 40001/40P01 retry full transaction with same payload/ID, bounded backoff; business rejection returns explicit error.

Protocol: authenticate owner; validate/normalize canonical command and hash; atomically claim mutation (unique) with final receipt; same hash committed -> stable replay BEFORE baseVersion check; different hash -> reject; concurrent duplicate waits, loser reads committed result, rollback permits fresh claim. Acquire ordered guards; reread revisions, policy, balances and scope; check semantic recognition/cash uniqueness; atomically write revision/snapshot/consumption/journal/open items/allocations/audit/receipt; commit then publish read model/ACK. All failures rollback entire transaction; no partial receipt. Lost ACK replays old exact result. Different mutation same economic event cannot post twice; stale revision rejected, no silent overwrite. Offline draft/outbox local atomic; authoritative state only after commit; full device sync testing CP-008.

Operation-to-lock matrix (M mutation always first; B where affected period/scope):

| Operation | Ranks and stable roots |
|---|---|
| Finalize sale/purchase/expense | A,B,S business recognition + sheet root if rice,L open items + weight consumption/cash if paid |
| Edit sheet/bag/rule, sale consumption, cancel sheet | B if affected,S sheet stable ID and affected sale roots,L consumption/open items,J if reversal |
| Collection/payment/deposit/create/refund/apply | A,B,S target/party roots as applicable,L original deposit/excess/open item + actual movement/split IDs |
| Loan/interest/split payment | A,B,S loan + charge root,L principal/interest/cash split |
| Transfer | A both accounts sorted,B,S transfer root,L both movement identities |
| Opening/closing period | A,B stable account/basis/overlap guard,S opening identity,L opening items,J if correction |
| Asset/valuation | A if posting,B,S asset and period/root,L items if applicable,J correction; D12 blocked |
| Correction/cancellation | A,B,S effective recognition + all affected sources,L dependent items/movements/consumption,J original events |
| Allocation create/edit/delete/change mode | B if affected,S sale/expense parent and impacted line/land roots; reread all per-dimension sums |
| Coverage total/detail or source mutation | B common overlapping coverage guard,S total and affected source roots; same guard for insert/alter/void of transactions |
| Tenure history change | B if affected,S stable land root, check overlapping ranges; D09 pending |
| Account state/reconcile | A,B if opening/period affected,S reconciliation root if needed |
| Compound/import | union of all relevant locks once in global order; same posting gate; atomicity per authorized batch contract |

This matrix is a logical requirement, not proven physical DB lock schedule. Test concurrent claims, absent guards, same source across revision, scope changes, dependency discovery, rollback after any write, balanced-but-invalid journal, and immutable journal DML rejection. Failure to prove cross-row protection blocks implementation acceptance.

## 8. Allocations, coverage and reports

Per sale/expense, money, physical gram, settlement gram and animal count separate dimensions. Expense money only; sale quantity tied to correct line and owner. Known allocation totals <= known source; source unknown blocks confirmed residual. No header+line money mode mixing, mode switch atomic; no double count. Explicit unassigned and implicit residual separate; null per dimension != 0/not-applicable, coverage explicit. Source total counted once, allocations never post new revenue/expense. D09 tenure/area original units preserved; no automatic area conversion or owned/leased classification if missing; D12 shared cost allocation and rounding not approved. Reporting on sales quantity is not harvest yield. `full_total` includes linked compatible detail; `additional_only` only nonoverlapping evidence; structured scope metric/period/land/activity/basis. Confirmed_zero contradicted by compatible positive detail triggers conflict, not deletion or auto-correction. Unknown actual debt/receipt remains unknown even if posted subset sums zero. Profit completeness conditional on cost/revenue coverage; cash flow separate, loan principal and internal transfers not income/expense. Source drilldown and snapshot basis required. CP-004/006/007 implement full reporting/import/land workflows.

## 9. Schema impact register (design only)

G01 roles/account effectiveness; G02 stable economic identity and active recognition pointer/typed revision; G03 posting gate, line balance, immutability, one effective reversal, direct correction chain; G04 mutation claim/replay result/payload schema; G05 open item/root/refund and cash split identity; G06 loan/asset relationships; G07 opening boundary and typed transfer; G08 structured coverage/overlap and detail links; G09 allocation revision/mode/dimension/tenure guard. Additional G10 same-sheet composite batch reference, immutable snapshot and stable weight consumption; G11 canonical policy approval/effectivity/engine archive; G12 typed guard root/controlled write permissions. Need concrete schema delta and migration strategy in implementation design after authorization; do not alter accepted migration in this draft. CP-001 SQL smoke only row-level/registry/RLS default-deny, not posting balance or full auth. No production RLS or storage security claim.

## 10. Verification register — 62 IDs; all NOT RUN

Maintain original CAL/T/F/PG/AR reports and identifiers; amended F03/F06, PG01–04/09 supersede expectation only, originals historical. Distinct IDs not necessarily distinct executed test count. All data synthetic. Use independent reference, exact expected values, assert no side effects, capture reproducible evidence on exact candidate SHA. No new runtime claims.

### CAL-01–12 (baseline)

01: 443/463/454 -> 136 kg/3 bags. 02: 100.8 kg,6 bags,10 bags/kg -> tare .6/net100.2. 03: fixture floor100.2kg ×9000 ->900000. 04: exact ->901800. 05: 100.6 floor100 vs nearest101. 06:100.5 half-up101. 07:356 bags ->15 tables/5 pages/last6. 08:1kg/3 bags exact fraction. 09:sale1000000,deposit200000,receipt300000 -> outstanding500000. 10: receipt1100000 against sale1000000 ->excess100000. 11: null/zero/negative/bounds/invalid deductions -> distinct proper errors. 12: policy change preserves old revision. CAL-03–06 are fixture alternatives, not conflicting owner profile.

### T01–T12 (R&D-001)

01 wire/bigint boundaries including 9007199254740993. 02 gross50000g tare1000/3g impurity100g ->physical149000/3, commercial148700/3. 03 50.6kg×9000 and 50.6kg×10000 -> exact961400, floor per line950000, whole-sheet floor101kg residual assigned ->959000 or960000 (generic fixture; current single-price profile rejects multi-price). 04 wrong parent, two 70kg sales against100kg reject excess. 05 replay policy A after B, hash/approval failure, historical unknown. 06 deposit200000, sale1000000, apply, receipts300000+600000, refund100000 ->net cash1000000, AR/excess0. 07 concurrent 80000/70000 applies against100000 ->no exceed. 08 lost ACK, mismatch, semantic duplicate, injected rollback. 09 drawdown500000, principal100000, interest10000, transfer50000, asset60000 fixture ->principal400000, cash +330000. 10 full total1000000/detail700000/residual300000, receipt unknown, excess/conflicting zero detected. 11 cost101, owned40/leased30/unassigned10/residual21, concurrent15/20 not exceed. 12 rent1200000 across two periods fixture ->600000 each, cash out once, tenure unknown if missing. D09/D12 fixtures do not activate policies.

### F01–F10 (financial oracle)

F01 customer deposit200, sale1000, apply200, receipts300+600, refund100 ->cash1000/revenue1000/open items0. F02 opening1000, advance100, cost600, apply100, pay550, refund50 ->cash400/expense600/open items0. F03 borrow500, interest10, repay100+10, transfer50, household20 direct (or explicit payable variant, not both) ->bank340/cash30/principal400/interest expense10/household20/external net370. F04 sale1000 reverse/reissue900 ->revenue/AR900, cash0. F05 opening1000, asset300, depreciation60, disposal260 ->cash960, depreciation60/gain20, asset/AR/AP0, net -40; D12 fixture. F06 observed total1000/details700 incl owned400/leased200/unassigned100, unknown payment ->residual300, zero new journal, actual debt/cash unknown. F07 opening bank800/AR100/loan300/equity600, collection40 ->bank840/AR60/loan300, period cash +40, revenue0; opening fixture. F08/F09/F10 exact journal in §6; check every event, role, source and balance as well as final totals. 

### PG01–PG17 (disposable PostgreSQL)

Use independent sessions A/B plus observer C, deterministic synchronization barriers not sleep-based guesses, exact isolation/roles, pre/post data and exit evidence. PG01 same claim/hash, mismatch, rollback claimant, stale replay. PG02 different mutation/revision same business; competing correction -> one winner. PG03 deposit100 apply80 vs refund70, both orders, available20 or30, concurrent excess refunds. PG04 no allocation children, two70 against100, mode switch/source revision race. PG05 row lock read-after-wait; SERIALIZABLE alternative 40001 and deadlock40P01 recovery, controlled test. PG06 injected failure after first line/audit/receipt; lost ACK after commit. PG07 0/1 line, imbalance1, two-sided line, wrong account/source/owner, mutation/delete/second reversal blocked. PG08 opening duplicate, same-account transfer, overprincipal, invalid refunds, reconciliation and duplicate total. PG09 F08 correction with absent policy stops, injected after reversal/reclass rollback. PG10 two openings with absent guard and overlapping mốc. PG11 dependency added while discovering locks -> rollback/replan. PG12 balanced but wrong semantics (collection->revenue, principal->revenue, apply->cash, noncash transfer target, wrong refund root) all rejected. PG13 direct vs payable path race ->one recognition/cash. PG14 excess100 correction reuse80 vs refund70 ->one valid winner. PG15 two sales consume 70kg from stable 100kg across revisions; concurrent edit/cancel sheet must not resurrect consumed weight or orphan sale; current profile may block partial sale entirely, fixture capability explicit. PG16 concurrent coverage confirmed_zero vs compatible new positive source, full_total vs detail change, and overlapping tenure guards (D09 fixture) -> conflict/no false complete report. PG17 direct expense F10 concurrent corrections expected same revision, or refund racing with correction; one winner/stale or safe block, no duplicate cash/negative available; verify repeated delta against active position. All rejection cases inspect no partial journal/receipt/revision/consumption.

### AR01–AR11 (R&D-003)

01 canonical integers/rational reject -0/01/newline/exponent/JSON number/2/4/zero denominator. 02 signed 64-bit min/max, outside, 78/79-digit DB limits, candidate intermediate/resource limits, wide report sum. 03 fractional tare 1000/3, net148700/3, floor49566g fixture, exact to integral column rejected. 04 wrong parent, scope overdraw, overlapping deductions/shared unallocated tare. 05 multi-price fixture and stable source consumption across revisions; current profile reject multiple prices. 06 two .6VND lines -> per-line nearest2 vs total nearest1; residual -1/5; no unapproved monetary rounding. 07 signed tie/floor/ceil and exact reversal9 not10. 08 canonical JSON order/whitespace, duplicate keys, modified array/hash, approval and replay, UNKNOWN. 09 property: normalization idempotence, rounded idempotence, floor<=x<=ceil, nearest error<=q/2, exact conservation and deterministic trace. 10 actual driver bigint/rational/JSONB round trip, numeric(78,0) control1.5->2, production parse rejects before cast. 11 concurrent finalize/edit stale revision, snapshot/consumption/posting atomic. Candidate bounds tested only once profile chosen; no runtime claim.

Additional variants within CAL/AR/PG (not new IDs): confirmed D08 profile net 100.499kg->100,100.5->101,100.501->101; 11 bags at10/kg tare1.1; group different prices sum individually; D08.5 unknown blocks finalization, fixture policy explicit, integer/fractional money boundary; correction retains old rule and explicit approved change; concurrent approval activation cannot use invalid policy. Verify zero-value and missing-price rejection separately.

## 11. Remaining owner policies and review gates

| Gate | Status/action |
|---|---|
| D06 record | Owner confirmed, GitHub docs pending. Preserve E14 and historical baseline. |
| D08.5-A restricted exact integer amount | Proposed for owner review. UNKNOWN until explicit confirmation; no production policy activation. |
| Financial core profile | Approve recognition dates/evidence (sale/mua), account roles, deposits/excess/refund eligibility, correction/revision date and dependencies, immediate expense paths, receipt splits, opening basis, unknown cash, overdraft. Do not treat architecture approval as policy approval. |
| D09/10/11/12 | Remain OPEN; defer features dependent on tenure/rent, old app/history, providers/budget, asset/inventory/common allocation. |
| Technical design | Review numeric resource profile, storage/snapshot compatibility, registry hash version/activation, exact schema delta, controlled posting gate, lock guard topology, test oracle/traceability. |
| Implementation | Explicit new owner authorization for defined package; no automatic transition from spec review. |

## 12. Acceptance and evidence contract

Independent specification review must resolve P0 or explicitly block affected capability, validate cross-package invariants and test oracles, confirm no unauthorized default policy. Trace R01/R04/R05/R10 to A/B/C and R02/R03/R06/R07 to D/E, R08/R09 to E and later reporting; R11 history preserved. MC-01–06 and MC-A01–05 incorporated as proposed requirements; review direct expense chain, weight consumption and coverage locks specifically. For future implementation: exact baseline and candidate hashes, source/lockfiles, test commands/results/exit codes, runtime environment, real PostgreSQL concurrency and rollback evidence, independent oracle, artifact SHA-256 manifests, no real data/secrets. No declaring PASS from test plan or mocked execution alone. A01/A05 engine components only; A02–A12 whole-product gates not implicitly passed. No auto merge/deploy. Independent verifier gives verdict; only owner ACCEPTS. No CP-003 transition until its dependencies are explicitly satisfied.

## 13. Recommended handoff

1. Work 03 performs bounded independent specification audit of this integrated draft plus baseline and original R&D reports; return P0/P1, missing policies, contradictions, oracle corrections, traceability and readiness by package. No code, commit, CI, external data or approvals.
2. Master Control reconciles findings and asks owner for only decisions needed for first implementation slice. D08.5-A and financial profile remain proposals. If a policy cannot be decided, restrict scope explicitly instead of fabricating rule.
3. Engineering documentation-only record after owner authorization: D06 and five D08 subdecisions, D08.5 UNKNOWN, CP-002 specification and report references, decision log/status/ADR, updated manifest; preserve CP-001 acceptance and historical evidence. Suggested target separate specification branch descended from acceptance-record HEAD; do not move historical branch heads without owner instruction. Do not imply this draft approved or run CI.
4. Request explicit CP-002A implementation authorization only after review and prerequisites applicable to that slice. Other packages remain unauthorized. UI-001 continues independently; no code integration until corresponding engine and design accepted.
