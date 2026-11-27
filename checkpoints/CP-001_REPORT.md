# SỔ NÔNG DÂN — CP-001 Technical Foundation

Date: 2026-11-27 (Asia/Ho_Chi_Minh). Executor: ChatGPT Chat per owner's explicit override. Architect/evidence verifier: separate project conversation. Owner approval: PENDING. **Status: PARTIAL.** Not VERIFIED / not ACCEPTED. No CP-002 execution.

## 1. Scope and results
Read both CP-000 source files completely; preserved byte-identical in docs (see baseline-integrity.log). No contradiction requiring a business decision: role override is explicit; all D08–D12 remain OPEN. CP-000 remains SPECIFIED. Local workspace `so-nong-dan`, source code and built TS shell, six Vietnamese navigation routes (Cân lúa, Bán tôm/cua, Chi phí, Đất, Quyết toán, Nhập dữ liệu) and unknown-route handling; all functions labelled placeholder. React/TS/Vite source written but unbuilt. Shared typed boundaries, synthetic fixture, root npm lockfile, tests. Technical docs and ADRs PROPOSED. SQL schema v0 draft, 42 tables with owner-scoped composite FKs, candidate indexes, fail-closed RLS statements; not DB tested. Exact arithmetic/offline/security/backup/import/performance contracts only, not implementations.

## 2. Preflight and decisions
Actual Node 22.16.0 / npm 10.9.2 / TS 5.8.3 / Git 2.47.3 / Python 3.13.5 / Chromium 144.0.7559.96 / Python Playwright 1.57.0. Sandbox can write files and run commands, no external installation (npm DNS/cache failure), no PostgreSQL executable, Chromium navigation admin blocked. No external service/account/repo accessed; only public stack license/pricing docs consulted. Stack proposal React+TS+Vite, PWA/IndexedDB/Dexie, PostgreSQL/Supabase candidate, Vitest/Playwright, modular monolith. See ADR 0001 for cost/quota and autonomy. Actual fallback TypeScript/DOM and Node runner are temporary decisions to unblock local compile/test; no React replacement decision. Other temporary choices: hash routes, SQL schema name snd, UUID/composite owner scope, Python Playwright, no git commits. All subject to review. No rounding, tie, land conversion, lease price or payment status assumptions.

## 3. Deliverables and tree
```
so-nong-dan/
  README.md, .env.example, .gitignore
  package.json, package-lock.json, tsconfig.json
  src/modules/{shared,rice,farm-sales,expenses,land,finance,import}/
  src/shell/{main.ts,routes.ts}
  public/{index.html,style.css}
  react-shell/{main.tsx,index.html,package.json,tsconfig.json,vite.config.mjs}
  dist/                         # fallback actual build
  docs/01_MASTER_SPECIFICATION.md
  docs/WORK_CP001_HANDOFF.md
  docs/{03_SYSTEM_ARCHITECTURE,04_DATA_MODEL,05_CALCULATION_CONTRACT,
        09_DECISION_LOG,10_PROJECT_STATUS,11_DATA_DICTIONARY}.md
  docs/adr/{0001-technical-stack,0002-offline-and-data-integrity,
            0003-financial-ledger}.md
  docs/schema-tables.txt
  fixtures/synthetic.json
  migrations/0001_schema_draft.sql
  scripts/                      # build, preview, schema generator, checks
  tests/                        # node and two browser attempts
  checkpoints/CP-001_REPORT.md
  evidence/CP-001/               # actual logs, summary, file tree, hashes
```
Archive handoff includes all files above; standalone report and evidence ZIP supplied for independent verifier. Root lockfile covers no dependencies; global tsc prerequisite. React dependency lockfile NOT generated (not faked).

## 4. Executed checks
See `evidence/CP-001/TEST_SUMMARY.md` for exact commands, exit codes and logs. Typecheck 0, build 0, Node test 0 (9 pass, 0 fail, 0 skipped). Browser loopback exit 1 (4 errors), mocked fixture browser exit 1 (4 errors); all due to admin navigation block, no browser assertion reached, no image generated. React install exit 1, npm ping exit 1; React build/typecheck NOT RUN. Root lockfile and npm ci exit 0. Baseline byte identity and deterministic static SQL inventory checks passed; SQL syntax, migration, DB/RLS tests NOT RUN. Lint NOT CONFIGURED. All 12 product acceptance groups A01–A12 NOT RUN; CAL-01..12 not executed. No metrics fabricated. No screenshot, no deployment.

## 5. Security/privacy
No real financial rows, images, credentials, secret, PII seeds or production data. Source spec retained as authorized baseline, not uploaded to third-party services. No Codex, no changes to any other projects, no GitHub repo creation/push, no cloud DB or production deploy, no charges incurred by creating services. Local preview binds loopback only. SQL draft denies public access by design but no real security test; do not use with live data. Browser fixture attempt was purely synthetic, no real external destination; stopped when admin block persisted.

## 6. Blockers, limitations and next gate
- BLOCKED: install React/Vite and dependency audit/licensing; build and browser verification of React; browser UI smoke even for fallback; no screenshots. Need environment with npm access and permitted local browser preview.
- NOT RUN: PostgreSQL local migration, constraints, RLS; need disposable local PostgreSQL. SQL draft still lacks cross-row allocation/deduction/ledger/coverage invariants, immutable revisions and real owner auth policies. See 04. Do not run on real DB.
- Not implemented in CP-001: calculation, ledger posting, actual form/persistence, sync, PWA, import, backup/restore, full-scale benchmark, reports, actual mobile UAT. No production readiness.
- Owner/architect review required for E01–E05 and ADRs, dependency versions, cost/provider, bounds and D08 policy. Complete blocked CP-001 checks before claiming checkpoint fully tested; submit evidence for independent verification and owner approval. Proposed CP-002 scope once gate cleared: exact calculation/ledger independent engine, CAL-01..12, property/boundary tests, data invariants, A01/A05; no work started in CP-002.
