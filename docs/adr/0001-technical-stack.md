# ADR 0001 — Technical stack
Status: PROPOSED / owner review; 2026-11-27.

Context: one family, mobile-first, offline-first, 50-year target, maintainability and portable data. No service authorization. Actual Node 22.16.0, npm 10.9.2, TS 5.8.3, Git 2.47.3, Python 3.13.5 and Chromium 144. npm ping EAI_AGAIN, offline install ENOTCACHED; no PostgreSQL executable found. Browser navigation blocked by administrator. See evidence.

| Option | Decision / tradeoff |
|---|---|
| React + TS + Vite | Candidate: component UI, typed module boundaries and independent engine, static delivery. Draft React 19.1.0/Vite 6.3.5; versions NOT approved/security audited. Vite 6 docs support Node 22; no real dependency compatibility/build test. |
| Plain TS/DOM | Temporary buildable fallback, no external runtime deps, shared modules/routes; avoids blocking all evidence; maintainability cost if kept permanently. Not replacement of proposed React stack. |
| PWA/service worker + IndexedDB/Dexie | Browser portable, local transactions/outbox; storage eviction, platform restrictions, service-worker update and quota risks. Native IndexedDB possible; Dexie reduces transaction boilerplate but adds dependency; defer selection after install/compatibility. |
| PostgreSQL | Preferred portable relational target with transactions and indexes; local/self-host possible, independent dumps, operational maintenance cost. No DB installed or started. |
| Supabase | Candidate hosted PostgreSQL/auth/private storage; faster ops but provider quota, pricing, auth/storage coupling; adapter + independent export. No account/project created. |
| SQLite-only/local-only | Suitable offline single-device, but multi-device sync/backup/account access would require additional engineering; not sole authoritative backend proposal. |
| Tests | Node built-in runner available and used; Vitest proposed for TS engine, Playwright for browser; Python Playwright actually attempted. Lint not configured. |
| Charts | Recharts/equivalent only when reporting phase; no dependency now. |

Public references checked 2026-11-27 (not project access): Vite 6 Node support https://vite.dev/blog/announcing-vite6 ; React MIT https://github.com/react/react/blob/main/LICENSE ; Vite MIT core and bundled licenses https://github.com/vitejs/vite/blob/main/packages/vite/LICENSE.md ; PostgreSQL permissive license https://www.postgresql.org/about/licence/ . Exact installed/transitive licenses and vulnerability audit not available; check lockfile/SBOM before approval. TS/Dexie/Vitest/Playwright specific versions and licenses not audited here.

Cost/quota snapshot from https://supabase.com/pricing and https://supabase.com/docs/guides/platform/billing-on-supabase : Free $0/mo, 500 MB DB, 1 GB object storage, 5 GB egress, inactivity pause after 1 week, no automatic backups; Pro starts $25/mo, 8 GB disk/project, 100 GB storage, 250 GB egress, daily backups retained 7 days; additional compute/usage may cost extra. Prices in USD, not a budget approval. Free cannot be assumed sufficient for 2M rows plus indexes and evidence images. Measure representative bytes/row, indexes, revisions, backup and object sizes first; test restore independent of provider. Self-host software license does not eliminate hardware/maintenance/backup cost. No new subscription needed for CP-001.

Exit gate: approved version set, dependency lockfile, audit/license review, React typecheck/build/browser, PostgreSQL local migration and budget/provider approval before external use. No D11 decision closed.

R1 supplement: previous version table is historical CP-001 evidence. Vite candidate 6.4.6 supersedes 6.3.5 due to published security advisory; exact current pins, registry lock status, security/license evidence and Windows procedure in `../14_TOOLCHAIN_R1.md`. Node/npm reproduction pins not approved production. No D11 closure.
