# CP-002A — A-P1 isolated arithmetic — accepted runtime and closure

**Status: VERIFIED by Independent Verifier; ACCEPTED by Project Owner (isolated A-P1 only).** Business date 2026-11-28. Execution assistant: ChatGPT Chat. Return control to Chat 01 — Master Control. Parent `3ae5e2be06e401adaca044aad6f9376e9b15e5c5`, branch `checkpoint/cp-002a`. Accepted runtime HEAD `80fb95175e902e6bea3caac518a8a6b25b9c1815`, tree `1bcb9ca31eebed744b3448c4c6387d9c50935405`. Original Engineering sections below are historical execution records; current disposition and independently verified limits are in the final closure section.

## Preflight and authority

Accepted HEAD and exact tree `882797db5f3d1c0f1a1ccfc81776657c49f03b68` verified via GitHub, parent `5f44141824814877cbd5121b13b73f0cf493174d`; runtime `05724c20f51755bc94a948165afb36b892e35fb4` is ancestor (ahead 2, behind 0). R1 ancestor compare ahead 7/behind 0. CP-001-R2 PR #1 draft/unmerged. Created candidate branch at accepted HEAD only. Both attached specifications read in full; SHA-256 match 2/2. Preserve both exact source documents under `docs/cp002/`. R1 precedence and explicit current owner authorization recorded in `CP-002A_AUTHORIZATION.md`; Decision Log historical table preserved, current decision override recorded. D06 and D08.1–D08.6 CONFIRMED, D09–D12 OPEN, D05/D07 PROPOSED. CP-001 ACCEPTED; A authorized, B–F NOT AUTHORIZED.

Toolchain verified Node 22.16.0, npm 10.9.2, TypeScript 5.8.3, Python 3.13.5, Git 2.47.3, Linux 6.18.57 x86_64/glibc 2.41. Local reconstruction from original R1 archive plus accepted root manifest and both locks (bootstrap ZIP), 28 locally exercised/checked baseline paths matched exact accepted Git blobs. No full local Git checkout (terminal DNS unavailable; GitHub connector access verified); local compiler version was copied from existing sandbox installation into `node_modules`, called by exact package-local path. No clean npm ci or independent tarball integrity claim. Existing accepted lockfile SHA-256 unchanged. Full remote tree comparison and manifest update at delivery ensure all other accepted paths preserved. See preflight.log for actual commands and the corrected ad hoc hash/wrapper attempts.

## Deliverable and traceability

Pure `src/modules/shared/exact-arithmetic/index.ts` exports strict integer/rational wire parse, canonical serialization, separately named normalization, BigInt-only arithmetic, exact comparison, explicit g/kg conversion, signed floor/ceil, nearest five tie modes, explicit positive rational quantum, signed64 and numeric78 integer/component pre-cast validators. Explicit stable error codes and validation precedence; 256-token/reduced and 1024-temp limits. No defaults, no policy enum translation, no raw JSON API. See `docs/cp002/CP-002A_A-P1_CONTRACT.md` for exact interface, boundary, precedence, traceability and reproduction. No new dependencies, no modification of accepted runtime sources, SQL, tests, workflows, locks, UI, policy registry or generated dist.

## Actual local verification

| Step | Actual exit | Status |
|---|---:|---|
| Exact Node/npm/TS version checks | 0 each | PASS |
| Full local baseline+A source typecheck | 0 | PASS |
| Contract typecheck (accepted compile-time contracts) | 0 | PASS |
| Isolated TypeScript compile | 0 | PASS |
| Python Fraction oracle generation and repeat | 0 each | PASS; byte digest identical |
| Node A-P1 hand anchors + oracle/property groups | 0 | PASS 7/7 groups |
| Baseline fallback build and Node smoke | 0 | PASS 9/9 (disposable local reconstruction) |
| Synthetic benchmark (100000 ops) | 0 | PASS |
| Benchmark 100001 guard | 1 expected | PASS (harness rejects count) |
| Clean lock-resolved npm ci / React/browser / PostgreSQL round-trip / SQL runtime / integration / financial posting / product acceptance / remote CI | — | NOT RUN for CP-002A |

Independent oracle: Python stdlib `Fraction`, `math.floor/ceil` and independent distance selection, no candidate import. Seed 1515078706 (`0x5A4E4432`); generated 10,779 vectors, exact string/object comparison 10,289 PASS and 490 expected error-code matches. 5,783 rounding property checks (including idempotence/ordering/nearest distance), 959 add/sub conservation checks, 240 paired floor/ceil monotonicity checks; each successful rational normalized/idempotent/canonical and repeated result serialized deterministically. Separate hand-calculated anchors include all R1 §8 listed cases, explicit signed ties, max64+1, high-digit cancellation, wide intermediate quantum index, numeric78 fraction/outside rejects. Seven Node test groups, not 7 registered IDs or 10,779 new IDs. Register retains all 64 IDs: 13 PASS for authorized A-P1 portions, 51 NOT RUN entirely; other portions of CAL/T/AR still NOT RUN where applicable, AR10 pure pre-cast only. See `docs/cp002/CP-002_TEST_REGISTER.md`.

Oracle JSONL SHA-256 `6501578c96186b5ab2e20e7cbddb5d6dfcb70305ec9f75419c8a6ffe5b3e09eb` (two generations identical). Compiled arithmetic JS SHA-256 `0ae72562d05abffd1dddf326e015f88f9e1822ddbe0ce1de818e271cef3f7338`. Exact source/compiler/lock hashes and commands recorded in environment.json and results.json within archive. Generated oracle JSONL is not committed; regenerate byte-identically using the supplied Python source and environment. Run `python3 scripts/verify_cp002a.py --evidence-dir /tmp/snd-cp002a-independent --operations 100000` from clean candidate with exact existing package-local compiler. Evidence dir must not exist; no CI/DB/network.

## Synthetic benchmark

Single sequential process, repeated fixed rational inputs, mixture multiply (cross cancel), divide, add (cancel), compare, nearest even and subtract; includes wire validation and digest serialization. Candidate profile only, not report throughput, production limits or historical-data restrictions.

| Input component digits | Operations | Elapsed ms | Ops/s |
|---:|---:|---:|---:|
| 20 | 33333 | 138.911 | 239960 |
| 128 | 33333 | 158.377 | 210466 |
| 256 | 33334 | 220.995 | 150836 |

Process-level peak RSS reported by Node on Linux: 102024 KiB (not per-operation allocation or incremental peak); RSS before/after and deterministic result hashes in benchmark.log. Single run in shared sandbox, no warmup/percentiles/production target, no performance SLA or D07 scale verification. Worst-case arbitrary workloads not measured.

## Evidence and integrity

`evidence/CP-002A/LOCAL_VERIFICATION.zip`: 16 members, internal SHA-256 manifest 15/15 exact, ZIP CRC PASS. Archive SHA-256 `8361aca880d7d1998a5e6a66951cf11f6d8856386273addbef3d9c3b003ac2cc`, 7715 bytes. Includes raw stdout/stderr per command, preflight, environment, actual exit codes, bench and internal manifest. Candidate aggregate `evidence/CP-002A/SHA256SUMS.txt` covers every tracked file except itself. It inherits prior verified accepted manifest entries for Git blobs that remain unchanged, adds the old manifest's own hash, and hashes new/updated paths. Prior manifest remains untouched and is meaningful on its exact CP-001 accepted commit, not the expanded A tree. No regenerated dist committed. Full diff and candidate SHA returned after connector readback.

## Known defects / remaining gates

No unresolved arithmetic failures in executed local tests. Not independently VERIFIED or ACCEPTED. Typed wire boundary deliberately excludes untrusted raw JSON parsing, duplicate-key detection and arbitrary hostile/proxy objects; upstream bounded validation is required before exposing public input. 1024-digit temp guard exists; valid current operands cannot reach that limit (max theoretical temporary magnitude <1024 digits); no artificial injection to claim runtime reachability. Generic signed/zero arithmetic isn't business eligibility. No policy registry/effectivity/replay, rice-sheet orchestration, schema/persistence, driver cast/round-trip, posting/settlement/concurrency, report, UI, production security/scale or family UAT. All B–F not authorized, A01–A12 NOT RUN. D09–D12 remain OPEN. Direct paid expense correction and fractional posting remain gated by R1. Original referenced R&D reports not independently archived here; exact supplied draft/addendum preserved and provenance distinguished. Local clean npm ci/tarball provenance and independent full-checkout replay pending. No remote CI dispatched, no merge, no deployment, no Codex, no paid service, no real data. Stop at candidate and hand off to Master Control.

## Owner acceptance and independent evidence closure — 2026-11-28

CP-002A was independently VERIFIED and explicitly ACCEPTED by Project Owner for isolated A-P1 only. Accepted runtime HEAD `80fb95175e902e6bea3caac518a8a6b25b9c1815`, tree `1bcb9ca31eebed744b3448c4c6387d9c50935405`, parent `3ae5e2be06e401adaca044aad6f9376e9b15e5c5`. Independent Verifier: 10,779 original vectors (10,289 exact results + 490 expected errors) and 1,356 additional vectors (1,288 exact + 68 expected errors), total 12,135/12,135 MATCH; arithmetic groups 7/7 PASS; synthetic benchmark 100,000 operations PASS and 3/3 result digests MATCH, guard 100001 rejects as expected. Candidate manifest coverage 174/174, continuity not full-tree rehash; Engineering archive internal checksums 15/15 MATCH. No arithmetic discrepancy or unauthorized implementation found within reviewed A-P1 scope.

Original independent ZIP archived byte-for-byte at `evidence/CP-002A/SND_CP002A_INDEPENDENT_VERIFICATION_80fb9517.zip` (21943 bytes, SHA-256 `8e3995ee06483b110d9bd29709873a611df6278d73c5a28504d7b7c20b977221`); closure assistant verified outer digest, all 19 ZIP member CRCs and 18/18 exact internal manifest hashes. See [verification receipt](../evidence/CP-002A/INDEPENDENT_VERIFICATION_80fb9517.md) and [owner acceptance record](CP-002A_OWNER_ACCEPTANCE.md). The initial Library access blocker was resolved by direct attachment. No test rerun; original Engineering ZIP and all raw evidence unchanged. Prior candidate aggregate manifest remains in runtime commit; closure manifest reuses unchanged Git blob hashes and hashes the new/updated records and original ZIP. No new runtime claim for closure HEAD.

Clean npm ci NOT RUN; independent full-checkout replay BLOCKED by DNS. Full baseline smoke, full project typecheck and contract typecheck were Engineering-reported, not independently rerun. PostgreSQL round-trip NOT RUN (AR10 pure pre-cast only). Raw JSON parsing, duplicate-key/depth/envelope checks and hostile objects are outside A-P1. Integration and A01–A12 product acceptance NOT RUN. Temporary 1024-digit guard unreachable with valid current operands; no runtime coverage of that branch. Synthetic benchmark is not production capacity/SLA or a historical-data limit. No policy activation, financial posting, production security claim or B–F implementation.

CP-001 ACCEPTED; CP-002A ACCEPTED; CP-002B–F NOT AUTHORIZED; D06 and D08.1–D08.6 CONFIRMED; D09–D12 OPEN; D05/D07 PROPOSED unchanged. All historical decisions, source, SQL, locks, workflow, specifications and test IDs preserved. No CI, merge, deployment, Codex, policy activation or charges. Return to Master Control for final closure readback.
