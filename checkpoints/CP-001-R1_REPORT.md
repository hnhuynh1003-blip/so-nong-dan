# SỔ NÔNG DÂN — CP-001-R1 TECHNICAL FOUNDATION COMPLETION

- Date: 2026-11-27 (Asia/Ho_Chi_Minh); execution ChatGPT Chat, dedicated Linux sandbox.
- Source: v0.1.1 from exact v0.1.0 ZIP. **PARTIAL — NOT VERIFIED / NOT ACCEPTED**. CP-002 NOT STARTED.
- Independent Review Result supplied by owner: previous CP-001 PARTIAL, 71/71 SHA-256, 17/17 duplicate evidence bytes, CP-000 baseline, clean TS build, typecheck and 9/9 smoke PASS; 42 tables/51 explicit indexes and deterministic SQL; React/Chromium/PostgreSQL blocked. R1 independently repeated baseline comparisons and fallback/static tests below; does not claim acceptance.

## 1. Scope and deliverables

| # | Requirement | R1 result |
|---|---|---|
| 1 | Preserve baseline/evidence | Imported v0.1.0 into local Git, original handoff SHA-256 3/3, Git tree vs original ZIP 72/72, old manifest 71/71, both old ZIP evidence and R1 copy 17/17, CP-000 docs 2/2 byte-identical. Logs `baseline-integrity.log`. |
| 2 | Shrimp/crab transactions | `sales` day/period and kind; `sale_lines` nullable species/grade/size/animals/kg rational/count/physical and settlement weight/price basis rational/amount; wire types. Quick sale does not require artificial line. Draft only. |
| 3 | Multi-land production/revenue allocation | Sale/expense target, same-sale composite line FK, land/activity nullable, independent amount/weight/count dimensions, header-vs-line revenue mode and remainder/unknown contract. Sale quantity != entire harvest. Cross-row sums/mode atomicity deferred CP-002/004. |
| 4 | Immutable rounding registry | 2 new tables: version definitions and explicit owner approval, typed references, append-only update/delete/truncate triggers draft; method/quantum/tie/order/scope and hash contract; no default/seed/approved business policy. CP-002 validation/replay. |
| 5 | Assets/loans/settlements/journal | 2 new tables: asset_transactions, loan_transactions. Typed links, cash direction, noncash deposit application, journal subject/reversal, receivable/payable links; mapping contract (no double principal/interest/asset recognition). No ledger engine. |
| 6 | Invariant register | 24 explicit invariants and checkpoint gates, SQL draft vs contract separated; CP-002 CAL/A01/A05 and later CPs not executed. |
| 7 | Dependency/toolchain | Exact reproduction pins, fallback root lockfile v3 actually generated offline, React candidate pins and registry attempt; React lock BLOCKED, audit ENOLOCK, installed transitive license/security/compatibility not proven. Local npm/TS license metadata + hashes and public advisory review. |
| 8 | Distinguish builds | `dist/` clean TS fallback only, `react-shell/dist/` production React absent. Separate npm scripts and logs; new Playwright suite targets only React Vite preview. |
| 9 | Windows commands | `scripts/local_r1.py` cross-platform Python runner and `docs/14_TOOLCHAIN_R1.md`; fallback actually executed Linux, missing-tool gates tested; React/PG/browser paths on Windows NOT RUN. PG script creates disposable cluster, validates data_directory, never accepts DSN; SQL tests prepared not executed. |
| 10 | Git local baseline | Git init/commit/tag only in this workspace. Baseline `5de563967343e878835921b5dd6c3af581ac2505` tag `cp001-v0.1.0`; R1 tagged `cp001-r1-v0.1.1`; bundle and diff separate. No configured remote. |

Primary source/docs: `src/modules/farm-sales/contracts.ts`, `src/modules/shared/rounding-policy.ts`, `src/modules/finance/contracts.ts`; `docs/12_R1_DOMAIN_CONTRACTS.md`, `13_INVARIANT_REGISTER.md`, `14_TOOLCHAIN_R1.md`; ERD/dictionary/ADR revised; `scripts/draft_schema.py` and `migrations/0001_schema_draft.sql`. Migration draft supersedes previous never-executed draft, **not** a live schema upgrade. Final SQL text contains 46 CREATE TABLE and 92 explicit CREATE INDEX statements (not counts of actual DB objects), 4 registry triggers; deterministic regeneration tested; no SQL parser/DB execution. PostgreSQL smoke prepares synthetic positive/negative rows, rollback, disposable role/RLS probe; no full application auth proof. No SQL fixture auto-execution.

## 2. Execution evidence

Environment actual: Node 22.16.0, npm 10.9.2, TS 5.8.3, Python 3.13.5, Git 2.47.3, Chromium 144.0.7559.96, Python Playwright 1.57.0. No psql/postgres/initdb/pg_ctl/docker/pwsh executable found. Root fallback lock is zero dependency; compiler external on PATH. Evidence base `evidence/CP-001-R1/`. Raw commands/exit codes in `runs/*/results.json`, `runs/*/exit-codes.tsv`, top-level `.exit` files and logs; no fabricated screenshot.

| Actual command/check | Exit | Result / evidence |
|---|---:|---|
| Original handoff hashes, Git/ZIP, baseline/evidence comparison | 0 | PASS `baseline-integrity.log` |
| `npm install --package-lock-only --offline --ignore-scripts --no-audit --no-fund` root | 0 | PASS `fallback-lock.log` |
| `python3 scripts/local_r1.py fallback` | 0 | PASS wrapper `fallback-runner.log` |
| `npm ci --offline --ignore-scripts --no-audit --no-fund` root | 0 | PASS `runs/fallback/fallback-ci.log` |
| `npm run typecheck:fallback` | 0 | PASS `runs/fallback/fallback-typecheck.log` |
| `tsc -p tsconfig.contract-tests.json` | 0 | PASS 10 `@ts-expect-error` directives consumed (compile-time, not 10 runtime tests), `runs/fallback/contract-typecheck.log` |
| `npm run build:fallback` (clean dist, tsc + copy) | 0 | PASS `runs/fallback/fallback-build.log` |
| `npm run test:fallback` (includes clean rebuild) | 0 | PASS 9/9, fail 0, skipped 0; `runs/fallback/fallback-tests.log` |
| `python3 scripts/check_schema_r1.py` | 0 | PASS 8/8 static checks, deterministic regeneration; `runs/fallback/schema-static.log` |
| `python3 -m py_compile ...` runner/schema scripts | 0 | PASS Python syntax only `python-syntax.log` |
| `node --check scripts/dependency_inventory.mjs` | 0 | PASS JS syntax only `node-syntax.log` |
| Toolchain license metadata/hashes read | 0 | PASS evidence collection `toolchain-licenses.log`; not license approval |
| React `npm install --package-lock-only --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=1000 --registry=https://registry.npmjs.org` | 1 | BLOCKED EAI_AGAIN `react-lock.log`; no lockfile |
| React `npm audit --offline --json --registry=https://registry.npmjs.org` | 1 | BLOCKED ENOLOCK `react-audit-offline.log`; no real audit result |
| `python3 scripts/local_r1.py react` | 1 | BLOCKED missing lock; dependent commands NOT RUN `runs/react/` |
| `python3 scripts/local_r1.py postgres` | 1 | BLOCKED missing explicit local binaries path; dependent commands NOT RUN `runs/postgres/`; preflight found no binaries |

React npm ci, typecheck, production build, installed dependency tree/license inventory, 4 Playwright scenarios and online audit: **NOT RUN**. Browser not reattempted in R1 (React build unavailable, prior Chromium administrator restriction remains historical, not a new failure). No screenshot. PostgreSQL migration and SQL tests **NOT RUN**. Windows runner **NOT RUN on Windows**, no PowerShell present; local fallback and prerequisite branches executed on Linux. Lint NOT CONFIGURED. All A01–A12 product acceptance tests NOT RUN. No performance, sync, auth, backup or UI functionality claims.

## 3. Decisions and risk

D08–D12 OPEN, baseline unchanged. Technical choices PROPOSED: 4 tables added, same-owner typed FKs, separated policy approvals and immutable definition trigger, price basis explicit, line-level quantity allocation, explicit cash direction, asset/loan typed events; revised never-executed draft. Candidate Vite changed 6.3.5 -> 6.4.6 based on public critical advisory GHSA-p4f5-76q4-ffq7 (2026-11-10; patched 6.4.6). This is not audit or stack approval. React 19.1.0/TS5.8.3/Playwright1.57.0 candidate pins not tested. Node/npm exact older versions are reproduction only, not production; current patched toolchain and transitive risk/license review still needed. Security sources and commands in docs/14. No secret or financial data, synthetic fixtures only. No remote repo, Codex, deploy, purchase, cloud service or real DB. No attempt to circumvent environment restrictions.

Known gaps: PG CHECK/trigger and FK syntax/runtime unverified; row checks cannot enforce cross-row sum, balanced journal, correct target/account kind, deposit consumption/reversal and business date rules; numeric scale coercion, hash canonicalization, source/revision immutability, owner approval identity and transaction semantics require CP-002/008. RLS default deny draft has no allow policies; cannot claim security proof. Allocation quantity captures sold/observed output, not complete harvest; no invented totals. Windows scripts reviewed/syntax-checked but need actual local evidence. No default rounding, lease/land conversion, accounting valuation or allocation policy selected. CP-001 historical scripts preserved, do not run against R1 evidence.

## 4. Independent Verifier handoff / next action within R1 only

1. Verify artifact hashes, unpack R1 source, validate source manifest and compare old evidence to v0.1.0. Review Git bundle/tag/diff (all files), verify baseline bytes and no CP-002 scope drift.
2. Review 12/13/14 contracts, SQL generator/constraints, exact pins and advisory; repeat fallback tests using local runner if available. Do not interpret static checks as database/financial proof.
3. With owner permission for local public package downloads only, use Windows procedure in docs/14 for genuine React lock, ci/build/browser and dependency audit/license inventory. Return actual lock/logs/results/hash and report any vulnerability/version change. Run PG disposable cluster smoke with explicitly installed binaries, no DSN; return logs. If tools blocked keep PARTIAL. No CP-002 until separately authorized after review.

Final status: **PARTIAL**, independent verification PENDING, owner acceptance PENDING, CP-002 NOT STARTED.
