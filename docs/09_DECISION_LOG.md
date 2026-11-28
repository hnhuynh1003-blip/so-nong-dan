# 09 — Decision log

Bảng D01–D12 bên dưới là snapshot lịch sử CP-001, giữ nguyên để kiểm chứng baseline. Trạng thái hiện hành xem E15 (quyết định nghiệp vụ) và E16 (nghiệm thu): D06 CONFIRMED; D08.1–D08.6 CONFIRMED; D09–D12 OPEN; D05/D07 PROPOSED.

| ID | Trạng thái | Nội dung |
|---|---|---|
| D01 | CONFIRMED | Một gia đình, một người quản lý, không thương mại hóa |
| D02 | CONFIRMED | Lúa/tôm/cua chung đất; đất nhà/thuê; một vụ lúa cuối năm |
| D03 | CONFIRMED | Chat + Work; không Codex. CP-001 này thực thi bằng Chat theo yêu cầu mới; cuộc trò chuyện khác điều phối/kiểm tra. |
| D04 | CONFIRMED | Ưu tiên dữ liệu nhiều năm hơn multi-user |
| D05 | PROPOSED | React/TS/Vite, PWA, IndexedDB/Dexie, PostgreSQL candidate; fallback TS không đổi stack đích |
| D06 | PROPOSED | Balanced ledger, domain tách UI |
| D07 | PROPOSED | 50 năm; 1M + 1M + 10k; benchmark/chi phí chưa đo |
| D08 | OPEN | Rounding, tie, thứ tự, scope |
| D09 | OPEN | Công đất, diện tích, thuê, kỳ sản xuất |
| D10 | OPEN | Thứ tự/màu ô app cũ, thanh toán/coverage 2025 |
| D11 | OPEN | Repo, hosting, provider, ngân sách/quota, quyền và thiết bị |
| D12 | OPEN | Định giá/khấu hao/tồn kho/phân bổ chung |

Quyết định thực thi tạm thời (không thay nghiệp vụ): E01 fallback TS thuần khi npm blocked, React draft riêng; E02 hash routes cho static preview; E03 SQL schema `snd`, owner-scoped composite keys và fail-closed draft; E04 Node test runner + Python Playwright có sẵn; E05 không tạo Git repo từ xa hoặc local commit, bàn giao ZIP. Tất cả cần review; không xác nhận stack/versions/license/chi phí. Không thêm giá trị tài chính/đơn vị/rounding giả định.

## CP-001-R1 execution decisions (PROPOSED)
E06: local Git import/tag v0.1.0, no remote; supersedes E05 for local only. E07: revise never-executed migration draft in place, no live upgrade; owner-scoped rounding policy UUID, separate immutable approvals, sale-line quantities and explicit finance targets. E08: exact reproducibility toolchain pins; Vite candidate 6.4.6 replaces 6.3.5 due to advisory; no production version/security approval. D08–D12 unchanged OPEN.

## CP-001-R2 execution decisions (PROPOSED)
E09: Owner created the private GitHub repository and imported both original commits/tags. GitHub is the shared technical source; historical branches stay fixed. D11 remains OPEN for hosting/provider/budget/quota and related decisions. E10: local TypeScript dependency 5.8.3, exact Node/npm reproduction pins, separate committed npm locks required. Old zero-dependency root lock removed rather than misrepresenting the new manifest. E11: owner-labeled same-repository PR CI only, read-only token, immutable official Actions pins; bootstrap artifacts require review and commit before clean verification. No owner acceptance, no D08–D12 closure.

E12 (2026-11-27, owner authorization recorded): Owner authorizes draft PR and technical Actions only within existing included free usage, public dependency downloads and disposable tests. No paid purchases, deploy, merge or CP-002. Billing/usage and Actions permissions endpoints rejected by connector allowlist; quota cannot be confirmed. Do not label/dispatch until owner confirms available included minutes/storage and no overage charge. D08–D12 remain OPEN; E12 is not owner acceptance.

E13 (2026-11-27, execution record): Owner changed repository visibility to Public and authorized bootstrap; run 46021693007 succeeded. Preserve exact artifact and commit both original locks before independent review. No additional visibility change, paid purchase, verify label, merge or acceptance by execution assistant. Public repository must contain only synthetic data; future family records/secrets must not be committed. D08–D12 remain OPEN.

## Owner acceptance decision (2026-11-27)

E14 — OWNER CONFIRMED (checkpoint acceptance and next-stage scope only): Project Owner officially accepts CP-001-R2, hence CP-001 ACCEPTED, on 2026-11-27. Accepted closure HEAD `5f44141824814877cbd5121b13b73f0cf493174d`; verified runtime HEAD `05724c20f51755bc94a948165afb36b892e35fb4`. CP-002: SPECIFICATION AUTHORIZED, IMPLEMENTATION NOT AUTHORIZED. This authorization is not a decision on any open business rule, proposed stack, production deployment or full product acceptance. D08–D12 remain OPEN, D01–D07 unchanged. No merge, unnecessary CI, Codex or CP-002 implementation. Decision recorded in `checkpoints/CP-001-R2_OWNER_ACCEPTANCE.md`. Earlier execution decisions and historical records remain unchanged.

## E15 — Owner authorization and current decision override (2026-11-28)

OWNER CONFIRMED: current instruction **SND — CP-002A IMPLEMENTATION ORDER** authorizes implementation of A-P1 only on separate branch descended from `3ae5e2be06e401adaca044aad6f9376e9b15e5c5`. CP-001 remains ACCEPTED. This overrides E14 only for A implementation; no B–F authorization. Preserve historical rows above and original source specifications; see `docs/cp002/CP-002A_AUTHORIZATION.md` for precise source hashes, R1 precedence and provenance.

| Current decision | Status | Scope |
|---|---|---|
| D06 | CONFIRMED | Balanced ledger architecture; no specific posting policy approval. |
| D08.1 | CONFIRMED | Exact proportional tare, partial bag groups, whole sheet, applicable entered ratio. |
| D08.2 | CONFIRMED | Only tare in current rice workflow. |
| D08.3 | CONFIRMED | Nearest whole kg, positive half upward. |
| D08.4 | CONFIRMED | One price per sheet; whole-sheet rounding; group sums without re-rounding. |
| D08.5 | CONFIRMED | Retain exact calculated amount; settlement later and separate. R1 §1 supersedes UNKNOWN/D08.5-A; no implicit rounding, waiver, discount, write-off or integer coercion. Fractional posting representation remains gated. |
| D08.6 | CONFIRMED | Historical rule/approval/build for corrections; explicit separate approved rule change; no invented unknown rules. |
| D09–D12 | OPEN | Unchanged. |
| D05/D07 | PROPOSED | Unchanged. |

The A-P1 library is pure technical arithmetic; confirmation of business decisions is not registry activation, financial policy approval or implementation of B–F. CP-002A CANDIDATE FOR INDEPENDENT VERIFICATION, not ACCEPTED; A01–A12 NOT RUN. No CI dispatch, merge, Codex, deployment or charges. Original R&D references are preserved in supplied specs; no claim of independently archived original Chat reports.

## E16 — OWNER CONFIRMED: CP-002A acceptance (2026-11-28)

Project Owner explicitly accepts CP-002A within independently verified isolated A-P1 arithmetic and all disclosed limitations. Accepted runtime HEAD `80fb95175e902e6bea3caac518a8a6b25b9c1815`; tree `1bcb9ca31eebed744b3448c4c6387d9c50935405`. Source: “SND — CP-002A OWNER ACCEPTANCE & EVIDENCE CLOSURE” instruction and subsequent original ZIP attachment; see `checkpoints/CP-002A_OWNER_ACCEPTANCE.md` and `evidence/CP-002A/INDEPENDENT_VERIFICATION_80fb9517.md`. CP-001 ACCEPTED; CP-002A ACCEPTED; CP-002B–F NOT AUTHORIZED. E15 business decision overrides unchanged (D06 and D08.1–D08.6 CONFIRMED; D09–D12 OPEN; D05/D07 PROPOSED). Earlier candidate status is historical. Clean npm ci NOT RUN; independent full-checkout replay BLOCKED by DNS. Full baseline smoke, full project typecheck and contract typecheck were Engineering-reported, not independently rerun. PostgreSQL round-trip NOT RUN (AR10 pure pre-cast only). Raw JSON parsing, duplicate-key/depth/envelope checks and hostile objects are outside A-P1. Integration and A01–A12 product acceptance NOT RUN. Temporary 1024-digit guard unreachable with valid current operands; no runtime coverage of that branch. Synthetic benchmark is not production capacity/SLA or a historical-data limit. No policy activation, financial posting, production security claim or B–F implementation. No further implementation, new tests, CI, merge, deployment, Codex or charges. Return to Master Control.

## E17 — OWNER CONFIRMED: CP-002B authorization (2026-11-28)

Direct instruction **SND — CP-002B IMPLEMENTATION ORDER** authorizes isolated B-P1 v1.0 rice preview only from exact CP-002A acceptance closure `a5d0521ada0309f2cd69356ee1f6c5948f5607eb`, accepted runtime `80fb95175e902e6bea3caac518a8a6b25b9c1815`, separate branch `checkpoint/cp-002b`. CP-001 and CP-002A ACCEPTED AND CLOSED. E16's B–F NOT AUTHORIZED is superseded only for B; CP-002C–F NOT AUTHORIZED. E15 decisions unchanged: D06 and D08.1–D08.6 CONFIRMED; D09–D12 OPEN; D05/D07 PROPOSED. Historical rows and acceptance unchanged. Exact source/provenance in `docs/cp002/CP-002B_AUTHORIZATION.md`. Design reference `1d186c2dad025a96bfdc629d351e377173cd4006` read-only, no merge. Candidate technical choices: explicit 1-based sparse slot, 100000 slot and batch records per sheet/group, 1000000 slot span/sheet, 1000 sheets/group, bounded opaque IDs, explicit gram adapter and empty sentinel, duplicate declared positions and group-wide identities rejected. No implicit tare/price or monetary rounding, no source consumption, official finalization, registry activation, financial posting, SQL, UI, persistence, offline, new dependencies, CI, merge, deployment, Codex or charges. CP-002B CANDIDATE FOR INDEPENDENT VERIFICATION, NOT ACCEPTED. Return to Master Control.

## E18 — OWNER CONFIRMED: CP-002B-R1 B-IV-01 only (2026-11-28)

Source: direct instruction **SND — CP-002B-R1 REMEDIATION ORDER**. Same branch `checkpoint/cp-002b`, required parent `04a839f94da58ab6842445b00626077704775b6d` and tree `5d28cfd4219aa9c95442fa987446a890853ab5a0`. CP-001/A ACCEPTED AND CLOSED. E17 B authority narrowed to B-IV-01 remediation only. Explicit sheet revision metadata is required by master draft §4; independent verifier reported 847/847 oracle MATCH and a missing revision identity (INVALID_SHAPE when present), no arithmetic defect. Preserve caller-supplied canonical bounded revisionId in sheet/group result, keep stable sheetId separate, reject two revisions of same stable sheet in one group. No generated identities, persistence/history/replay/correction/source consumption/concurrency, no formula or accepted A changes, no new business decisions. E15 D06/D08.1–D08.6 CONFIRMED, D09–D12 OPEN, D05/D07 PROPOSED unchanged. CP-002C–F NOT AUTHORIZED. Original E17 and earlier entries retained. Contract and authority: `docs/cp002/CP-002B_B-P1_CONTRACT.md`, `docs/cp002/CP-002B_AUTHORIZATION.md`. Local remediation evidence and limits in `checkpoints/CP-002B-R1_REPORT.md`. CP-002B-R1 CANDIDATE FOR INDEPENDENT VERIFICATION, NOT ACCEPTED. No SQL/UI/lock/workflow changes, CI, merge, deploy, Codex or charges.
