# CP-002A authorization and owner decision provenance

Business date: 2026-11-28 (current implementation order; decisions referenced in the supplied specifications originate in 27/11/2026 project Chat). This document records the explicit owner instruction; it is not a signed record or a substitute for owner acceptance.

Repository: `hnhuynh1003-blip/so-nong-dan`. Accepted CP-001 Owner Acceptance baseline: `3ae5e2be06e401adaca044aad6f9376e9b15e5c5`; closure `5f44141824814877cbd5121b13b73f0cf493174d`; runtime `05724c20f51755bc94a948165afb36b892e35fb4` (CI 46025176479). Candidate branch `checkpoint/cp-002a` starts at the exact acceptance-record commit. CP-001 stays ACCEPTED; no change to its branch/history.

## Authority record

Source: Project Owner's current chat instruction headed **SND — CP-002A IMPLEMENTATION ORDER**. Owner states: “Project Owner explicitly authorizes CP-002A implementation under technical profile A-P1 in the Master Control R1 Addendum.” Explicit statuses: “CP-001 ACCEPTED. D06 CONFIRMED. D08.1–D08.6 CONFIRMED. D09–D12 OPEN. CP-002A IMPLEMENTATION AUTHORIZED. CP-002B–F NOT AUTHORIZED.” This supersedes E14's historical restriction on CP-002A implementation only. Owner authorizes a separate candidate branch, pure TypeScript arithmetic, tests/oracle and local evidence; no remote CI dispatch without separate authorization; no SQL/DB, policy activation, posting, UI, runtime dependencies, lockfile changes, real family data, Codex, merge, deploy or charges. Stop at candidate, not ACCEPTED.

## Exact attached sources

| Preserved path | SHA-256 |
|---|---|
| `SND_CP002_MASTER_SPECIFICATION_v1.0_DRAFT.md` | `d9d48d2d42ac7e84e200acb43b4800eb3b990ff969495b150f1b6ed02d1b0856` |
| `SND_CP002_v1.0_R1_MASTER_ADDENDUM.md` | `00d9f26656f37af68dafeceac684ae97a13ffb89e91f945d3131e94911dee2ec` |

Both are byte-preserved from the user attachments, not edited to retroactively imply approval. R1 supersedes only conflicting draft provisions. R1 §8 is A-P1. R&D-001/002/002-R1/003/004 and referenced Chat decisions are cited by the supplied master documents; the original R&D chat reports were not attached to this order or independently archived/retrieved here. No reconstructed originals or claimed earlier Git provenance. The current instruction confirms the decisions, and the supplied documents give their content and provenance.

## Current owner decisions (new record, not a rewrite of CP-001 evidence)

| ID | Status | Rule and source |
|---|---|---|
| D06 | CONFIRMED | Balanced ledger architecture, domain separate from UI; Master draft §5/6; R1 §7 owner D06 direct approval 27/11 Chat. Does not approve detailed posting/financial policy. |
| D08.1 | CONFIRMED | Exact proportional tare including partial groups, whole sheet; ratio entered per applicable agreement, not fixed at 10; draft §2/4.1; R1 §7 11/10=1.1. |
| D08.2 | CONFIRMED | Current rice workflow only tare; no impurity/additional discount; draft §2/4.1, R1 §7. Generic test fixtures do not activate impurities. |
| D08.3 | CONFIRMED | Round net to nearest 1 kg, positive half ties upward; draft §2/4.1/4.3, R1 §7. |
| D08.4 | CONFIRMED | One price per sheet, round the whole sheet after tare; group may have multiple sheets/different prices, no group re-rounding; draft §2/4.1/4.2, R1 §7. |
| D08.5 | CONFIRMED | Exact calculated amount retained, settlement independently recorded later; no money rounding or small-change block. R1 §1 explicitly supersedes draft UNKNOWN and proposed D08.5-A. Current restricted integral price/whole kg yields integral VND; generic fractional amount retained exactly, no coercion into integer posting. No automatic waiver, discount, threshold, write-off or inference of actual debt. Future fractional posting representation gated. |
| D08.6 | CONFIRMED | Corrections use original rule/hash, approval and engine build; explicit rule change needs separate owner approval/history; unavailable/out-of-scope old rule blocks authoritative recomputation; draft §2/4.3 and R1 §5. |
| D09–D12 | OPEN | Unchanged. No new tenure, old app, hosting/provider, assets, inventory or common-cost policy. |
| D05/D07 | PROPOSED | Unchanged. No production stack or performance approval. |

D08 is confirmed as business decisions; A-P1 is a technical slice only. No registry activation, no rice workflow, no financial posting, no implementation of B–F. Future decision/approval/effectivity, persistence and integration remain gated. CP-002A is CANDIDATE FOR INDEPENDENT VERIFICATION after implementation evidence, never ACCEPTED by this record.
