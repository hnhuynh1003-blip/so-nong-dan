# CP-002B / B-P1 v1.0 — authorization and provenance

Business date 2026-11-28. Authority: Project Owner's direct instruction titled **SND — CP-002B IMPLEMENTATION ORDER**, supplied in the project conversation. This records the explicit authorization, not a signature or an independent acceptance. E14 (CP-001 acceptance), E15 (D06/D08 and A authorization) and E16 (A acceptance) remain historical records. E17 authorizes B only; it does not reopen or modify A.

| Scope | Current status |
|---|---|
| CP-001 | ACCEPTED AND CLOSED |
| CP-002A | ACCEPTED AND CLOSED, isolated A-P1 only |
| CP-002B | IMPLEMENTATION AUTHORIZED under B-P1 v1.0; candidate for independent verification, not accepted |
| CP-002C–F | NOT AUTHORIZED |
| D06 | CONFIRMED (architecture, not all posting rules) |
| D08.1–D08.6 | CONFIRMED (E15 and R1 precedence) |
| D09–D12 | OPEN |
| D05/D07 | PROPOSED, unchanged |

Repository `hnhuynh1003-blip/so-nong-dan`; required parent `a5d0521ada0309f2cd69356ee1f6c5948f5607eb`, tree `440ac1bf447326acf9f5364cfadfd1c8cceaaf30`; exact sole parent/accepted runtime `80fb95175e902e6bea3caac518a8a6b25b9c1815`, runtime tree `1bcb9ca31eebed744b3448c4c6387d9c50935405`. CP-001 acceptance branch remains `3ae5e2be06e401adaca044aad6f9376e9b15e5c5`. Separate `checkpoint/cp-002b` from required parent. No design merge or historical branch movement.

## Read sources

All repository document refs below at exact CP-002A closure parent, unless design SHA specified. Both master documents retain original authoritative hashes and draft status; later direct owner instructions authorize the limited packages. R1 supersedes conflicting draft provisions. Current E15/E16/E17 override historical authorization text, not the underlying archived records.

| Path | Exact Git blob |
|---|---|
| docs/cp002/SND_CP002_MASTER_SPECIFICATION_v1.0_DRAFT.md | 86edd6f05bf9d32db8f5532f271062c3fc623e2d |
| docs/cp002/SND_CP002_v1.0_R1_MASTER_ADDENDUM.md | be1c1a804c1286f6dfe8f996beb0c06fad6f7ce6 |
| docs/cp002/CP-002A_A-P1_CONTRACT.md | 1f8233f6c984212d7d52d8eaedb71b304a4810a5 |
| checkpoints/CP-002A_OWNER_ACCEPTANCE.md | f9db91f0b8ff4200b852cf72b197b27a31b155ef |
| docs/cp002/CP-002_TEST_REGISTER.md | 018079c1256d33e6d5b16935131d1e5d27732e |
| docs/09_DECISION_LOG.md | 40536ae352f32a29087b615419c7c7f43bf8d796 |
| docs/10_PROJECT_STATUS.md | 3223dea3fec7153fb8577bfe859816c0c97c1c8e |
| src/modules/shared/exact-arithmetic/index.ts | c5d4c206d39e2190f44b58c9c4c67f7596e232b0 |

Master SHA-256 `d9d48d2d42ac7e84e200acb43b4800eb3b990ff969495b150f1b6ed02d1b0856`; R1 SHA-256 `00d9f26656f37af68dafeceac684ae97a13ffb89e91f945d3131e94911dee2ec`; accepted A source SHA-256 `e3031c59ed667082a3bd17f94a2afa45612d0282dbf615aea9d7e287b43e68bf`. Local exact original documents and A source from accepted independent archive hash matched. No modification of them.

Design reference `1d186c2dad025a96bfdc629d351e377173cd4006`, path `design/field-ledger/v1.0-rc1/`. Freeze blob `c4c920808d53b9fec4f7468c92b007a18ae14f20`; prototype blob `0979af8e6be426864bb1c5f26d78f03747df739b`; rice QA blob `03220c5292f18a5584a544fe7b1c9f3adb257a7b`; rice test blob `8e772220fb2431893c2c005170651fbbab82fc48`. Consulted exact freeze and rice QA/test text, fetched prototype text and inspected rice input/layout/preview/group sections. Design is historical design-only evidence, not new product verification. Missing referenced screenshots and older ZIPs explicitly nonblocking. Synthetic fixture uses prototype `nums` array and board counts/shifts (25,0), (25,8), (13,17), column-first ordinal. No reuse of prototype arithmetic implementation or UI code.

## Authorized deliverables and exclusions

Pure B-P1 preview library importing unmodified A-P1; explicit three-digit mode, exact gram adapter, stable sparse positions, column/board/page/sheet/group sums, parent validation, whole-sheet proportional tare, one positive integer price per sheet, nearest whole kg positive half tie, no monetary or group second rounding, missing/zero/invalid distinction, canonical exact trace and bounded resource behavior. Contract established before implementation. All 64 original test IDs retained; B-01..10 variants, independent Python Fraction oracle, synthetic benchmarks 1000/10000/100000 bags and local evidence only.

Candidate limits and wire shape in B-P1 contract are technical decisions for review, not additional owner business decisions: 100000 slot records per sheet/group, 100000 batch records per sheet/group, 1000 sheets/group, max position 1000000 per sheet, explicit 1-based position, 128-character bounded ASCII opaque IDs, explicit empty slot null/empty-string sentinel, duplicate declared positions rejected (including empties), group-wide bag/batch uniqueness. No storage/annual limit or UI constraint claimed. Raw JSON parser outside pure typed boundary. No C–F, edits to accepted A, SQL, source consumption, official finalization, policy registry activation, posting, settlement, UI/persistence/offline workflow, new dependency/lock change, real family data, remote CI, merge, Codex, deployment or charges. Return to Chat 01 — Master Control; do not self-accept.
