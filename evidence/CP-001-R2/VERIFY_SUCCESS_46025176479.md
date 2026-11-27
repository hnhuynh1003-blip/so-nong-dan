# CP-001-R2 — Successful verify run 46025176479

## Authority and provenance

Status: **VERIFIED by Independent Verifier; pending Owner Acceptance.** The owner relayed the independent verification result for the exact runtime HEAD below in the FINAL EVIDENCE CLOSURE instruction. This receipt records that determination; execution assistant is not the independent verifier or owner and does not approve/merge/accept. No CP-002.

- Repository: `hnhuynh1003-blip/so-nong-dan`; PR #1 remains draft, targeting `checkpoint/cp-001-r1`.
- Verified runtime HEAD: `05724c20f51755bc94a948165afb36b892e35fb4`; runtime tree: `cc73f92e26c12010d3f8040ea524c0e0aff3ba38`. Run [#46025176479](https://github.com/hnhuynh1003-blip/so-nong-dan/actions/runs/46025176479), attempt 1; job 140594613366; completed SUCCESS on 2026-11-27 (15:28:52 UTC per GitHub API). Exact checkout head and run ID also recorded in original platform.json and integrity.log.
- Artifact ID: 15211641914; original name: `cp001-r2-verify-05724c20f51755bc94a948165afb36b892e35fb4-46025176479-1`; original ZIP size 276311 bytes, SHA-256 `8169c26eee40ba539fbcef392aa5ab66ded755501781206a0491b91b2951eabf`. Retrieved via GitHub Actions artifact download; GitHub metadata digest and owner-supplied digest both match downloaded bytes. ZIP preserved unchanged as `CP001_R2_VERIFY_46025176479_SUCCESS.zip` (59 file members; no repacking).
- Decoded job console log: `VERIFY_46025176479_JOB_140594613366.log`; SHA-256 `43b2e0a2cb894c1287574bbbc5d2dc62c1364c5897ce53addf32ee15d99dd6a6`, 22247 UTF-8 bytes, Git blob `0ed114f80671f1d8406aa41b92be1d8492bb18f6`. Retrieved via job logs API, preserved exact connector-decoded text, read back equal; this is not a claim of original compressed HTTP log bytes. GitHub token/authorization values were masked in logs; limited credential-pattern scan found no matches in ZIP text or console log; not a comprehensive secret audit. No real financial data added.

## Evidence checks performed during closure

| Check | Result |
|---|---|
| Original ZIP digest and ZIP integrity | MATCH / PASS |
| Outer evidence manifest (exact membership, excluding own manifest) | 58/58 PASS |
| React nested evidence manifest | 17/17 PASS |
| PostgreSQL nested evidence manifest | 13/13 PASS |
| CI source manifest at verified HEAD | 158/158 MATCH |
| Committed manifest at verified HEAD | 157/157 MATCH (excludes itself) |
| Historical R1 manifest (reported by CI integrity gate) | 141/141 PASS |
| Historical CP-001 evidence / CP-000 baseline (reported by CI) | 17/17 and 2/2 PASS |
| Working tree before/after CI | clean; no source drift |

Source continuity rechecked using the exact parent Git tree: 157 local file byte/blob/hash checks plus the original decoded failed-job log obtained via GitHub blob readback and hashed separately. Source path/hash membership matches both original manifests. Closure modifies only documentation and evidence, including source manifest regeneration; no runtime re-test of the closure commit is asserted.

## Runtime results on the verified HEAD (not on the later closure commit)

- Runner: GitHub-hosted ubuntu24 image 20261122.23.1, Linux x86_64, Python 3.12.3, Git 2.56.1, Node 22.16.0, npm 10.9.2, TypeScript 5.8.3.
- Clean fallback and React npm ci, fallback/contract/React typechecks and fallback/React production builds: exit 0. Node smoke 9/9, static schema 8/8, runner regression 3/3 and actual React production Chromium tests 4/4 passed. Chromium 143.0.7499.4 (Playwright build v1200).
- PostgreSQL 16.16: initdb, TCP loopback start, exact disposable cluster identity, migration, constraint/default-deny RLS probes and stop all passed. Migration log contains 46 CREATE TABLE and 92 explicit CREATE INDEX command completions, four CREATE TRIGGER completions and COMMIT. Constraint log reports registry append-only/cross-owner, allocation/finance row checks, UNIQUE/mutation/catalog-wide RLS and default-deny probe passed, ending ROLLBACK. Disposable cleanup PASS. RLS runtime probe remains limited to sales with the test role; not full authentication/authorization. CASCADE TRUNCATE probe is not isolated proof of every trigger; no full journal/financial invariant validation.
- Both npm audits exited 0 and each reported zero known vulnerabilities in its dependency graph at run time. License inventories exited 0: 1 and 75 package records, respectively, with no metadata issues; this is not legal clearance, a full supply-chain audit, or a production security guarantee.
- Desktop and mobile screenshots are preserved inside the original ZIP, not recreated. PNG signatures and dimensions checked:
  - `react-detail/react-test-results/production-smoke-desktop-home/desktop.png`: 1280×900; SHA-256 `a63f270ff47aec63c53c94881b8eccfa2eaebcfcc1e7e4fce9e5dbd1c262108b`.
  - `react-detail/react-test-results/production-smoke-mobile-home/mobile.png`: 390×1421; SHA-256 `881749d0ca6fafeea7fa2047848b344b126fd2bb7511f22e68f622a68bb1b321`.

### Actual status and exit-code readback

Dash denotes no child-process exit code (internal check or NOT RUN); do not substitute exit 0. Exact commands, stdout/stderr, results and platform are retained in original ZIP.

| Scope | Step | Status | Exit code |
|---|---|---|---:|
| outer | `git-version` | PASS | 0 |
| outer | `git-status-before` | PASS | 0 |
| outer | `integrity` | PASS | — |
| outer | `schema-static` | PASS | 0 |
| outer | `runner-regression` | PASS | 0 |
| outer | `node-version` | PASS | 0 |
| outer | `npm-version` | PASS | 0 |
| outer | `toolchain-pin` | PASS | — |
| outer | `fallback-lock` | PASS | — |
| outer | `fallback-ci` | PASS | 0 |
| outer | `fallback-ts-version` | PASS | 0 |
| outer | `fallback-typecheck` | PASS | 0 |
| outer | `contract-typecheck` | PASS | 0 |
| outer | `fallback-build` | PASS | 0 |
| outer | `fallback-tests` | PASS | 0 |
| outer | `fallback-dependency-tree` | PASS | 0 |
| outer | `fallback-license-inventory` | PASS | 0 |
| outer | `fallback-audit` | PASS | 0 |
| outer | `react-lock` | PASS | — |
| outer | `react-runner` | PASS | 0 |
| outer | `postgres-bindir` | PASS | 0 |
| outer | `postgres-runner` | PASS | 0 |
| outer | `source-drift` | PASS | — |
| outer | `git-status-after` | PASS | 0 |
| React | `node-version` | PASS | 0 |
| React | `npm-version` | PASS | 0 |
| React | `toolchain-pin` | PASS | — |
| React | `react-lock` | NOT RUN | — |
| React | `react-lock-source-check` | PASS | — |
| React | `react-ci` | PASS | 0 |
| React | `react-dependency-tree` | PASS | 0 |
| React | `react-license-inventory` | PASS | 0 |
| React | `react-audit` | PASS | 0 |
| React | `react-typecheck` | PASS | 0 |
| React | `react-production-build` | PASS | 0 |
| React | `react-browser-install` | PASS | 0 |
| React | `react-browser-smoke` | PASS | 0 |
| PostgreSQL | `initdb-version` | PASS | 0 |
| PostgreSQL | `pg_ctl-version` | PASS | 0 |
| PostgreSQL | `psql-version` | PASS | 0 |
| PostgreSQL | `postgres-version` | PASS | 0 |
| PostgreSQL | `postgres-initdb` | PASS | 0 |
| PostgreSQL | `postgres-start` | PASS | 0 |
| PostgreSQL | `postgres-cluster-identity` | PASS | 0 |
| PostgreSQL | `postgres-identity-gate` | PASS | — |
| PostgreSQL | `postgres-migration` | PASS | 0 |
| PostgreSQL | `postgres-constraints` | PASS | 0 |
| PostgreSQL | `postgres-stop` | PASS | 0 |
| PostgreSQL | `postgres-cleanup` | PASS | — |

`react-lock` was NOT RUN because the reviewed committed lock already existed; no dependency lock regeneration. The overall GitHub workflow and job concluded success. The technical verification gate process exited successfully. No new run is triggered for this evidence-only closure.

## Limits and remaining authority

D08–D12 remain OPEN; CP-002 NOT STARTED; A01–A12 product acceptance NOT RUN. No production database, deployment, paid purchases, real family financial data, merge, approval or ACCEPTED status. The later closure commit preserves the exact implementation, SQL, locks, workflow and prior evidence bytes, except the regenerated aggregate R2 manifest (old manifest remains in the verified parent and its digest in the CI source manifest). Independent readback of closure HEAD is requested; runtime evidence stays attributed to the verified parent.
