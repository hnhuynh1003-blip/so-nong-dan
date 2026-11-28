# CP-002A — Owner Acceptance

Business date: 2026-11-28. Authority: Project Owner, explicit instruction “SND — CP-002A OWNER ACCEPTANCE & EVIDENCE CLOSURE”, followed by the directly attached original verifier ZIP and continuation instruction. This document records the owner's decision, not a digital signature or an acceptance by the execution assistant.

## Decision

Project Owner officially accepts CP-002A within the independently verified A-P1 isolated arithmetic scope, including all disclosed limitations.

- Repository: hnhuynh1003-blip/so-nong-dan; branch: checkpoint/cp-002a.
- Accepted runtime HEAD: `80fb95175e902e6bea3caac518a8a6b25b9c1815`.
- Runtime tree: `1bcb9ca31eebed744b3448c4c6387d9c50935405`.
- Runtime parent / CP-001 Owner Acceptance baseline: `3ae5e2be06e401adaca044aad6f9376e9b15e5c5`.
- Independent verification evidence: [original ZIP](../evidence/CP-002A/SND_CP002A_INDEPENDENT_VERIFICATION_80fb9517.zip), SHA-256 `8e3995ee06483b110d9bd29709873a611df6278d73c5a28504d7b7c20b977221`.
- Verification receipt: [INDEPENDENT_VERIFICATION_80fb9517.md](../evidence/CP-002A/INDEPENDENT_VERIFICATION_80fb9517.md).

Independent Verifier: 10,779 original vectors (10,289 exact results + 490 expected errors) and 1,356 additional vectors (1,288 exact + 68 expected errors), total 12,135/12,135 MATCH; arithmetic groups 7/7 PASS; synthetic benchmark 100,000 operations PASS and 3/3 result digests MATCH, guard 100001 rejects as expected. Candidate manifest coverage 174/174, continuity not full-tree rehash; Engineering archive internal checksums 15/15 MATCH. No arithmetic discrepancy or unauthorized implementation found within reviewed A-P1 scope.

| Scope | Status |
|---|---|
| CP-001 | ACCEPTED |
| CP-002A | ACCEPTED (isolated A-P1 only) |
| CP-002B–F | NOT AUTHORIZED |
| D06 | CONFIRMED |
| D08.1–D08.6 | CONFIRMED |
| D09–D12 | OPEN |
| D05/D07 | PROPOSED, unchanged |
| A01–A12 product acceptance | NOT RUN |

## Accepted limitations

Clean npm ci NOT RUN; independent full-checkout replay BLOCKED by DNS. Full baseline smoke, full project typecheck and contract typecheck were Engineering-reported, not independently rerun. PostgreSQL round-trip NOT RUN (AR10 pure pre-cast only). Raw JSON parsing, duplicate-key/depth/envelope checks and hostile objects are outside A-P1. Integration and A01–A12 product acceptance NOT RUN. Temporary 1024-digit guard unreachable with valid current operands; no runtime coverage of that branch. Synthetic benchmark is not production capacity/SLA or a historical-data limit. No policy activation, financial posting, production security claim or B–F implementation.

Original Engineering evidence, specification and test register retained; no new acceptance of deferred portions. No source/SQL/lockfile/workflow changes, CI, merge, deployment, Codex, policy activation or charges. This is documentary closure only. The accepted runtime HEAD stays the verified technical baseline; the closure HEAD is a subsequent evidence/documentation-only descendant, not a newly tested runtime. Return to Master Control for final closure readback.
