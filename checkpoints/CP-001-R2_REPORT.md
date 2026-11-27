# CP-001-R2 — CI Verification & Technical Foundation Closure

Status: PARTIAL / NOT ACCEPTED. 2026-11-27. Execution: ChatGPT Chat. Independent Verifier and owner retain decision authority. CP-002 NOT STARTED.

## References and authorization

Private repository hnhuynh1003-blip/so-nong-dan. Historical refs read back: baseline/cp-001 = 5de563967343e878835921b5dd6c3af581ac2505; checkpoint/cp-001-r1 = eb21b0089a7ecd55d69c9b0dbf6d8ad9aba677e7. R2 starts from exact R1. Previous R2 HEAD 17195cfe5c0673f4a60d554436325d901942b4a8 has Git tree 35caa5534a99ae43b633c1dd1b59af29a21a5721, identical to local staged tree. Review base is R1; do not merge.

Owner authorization received: draft PR, Actions technical verification in existing free quota, public dependency downloads, disposable tests. No paid purchases, production, deploy, merge, Codex or CP-002. Connector fetch of `/users/hnhuynh1003-blip/settings/billing/usage` and repo `/actions/permissions` rejected with HTTP 400 INVALID_ARGUMENT (endpoint allowlist). Repository `/actions/runs?per_page=10` returned total_count 0. No billing changes or CI trigger issued. Cannot infer account-wide remaining quota from an empty repo run list. Activation gate remains pending evidence of included minutes/storage and no charge; owner can check billing and apply the relevant label directly on draft PR. This is not a request to approve scope again.

## Technical changes

- Explicit exact root and React TypeScript 5.8.3, Node 22.16.0 / npm 10.9.2, public npm resolution only; React direct dependency pins inherited. Root zero-dependency lock removed, replacement root/React locks pending. Historical PATH compiler entry point disabled. Legacy CP-001 run_checks.sh disabled in R2 to prevent overwriting immutable evidence. Both historical commits remain unchanged.
- Read-only, owner-label-gated CI on same-repository R2 PR; official Actions immutable full SHA pins checked for release identity, not full code audit; no checkout credential persistence, cache, secrets, deploy or services. Two independent stages: bootstrap generates genuine lock candidates and logs (does not push), review and commit both, then verify on new exact HEAD. See docs/15_CI_R2.md. GitHub-hosted Ubuntu 24.04 image packages can vary. Workflow timeout 30 minutes per run; artifact retention seven days. No automatic run on opening PR/push.
- PostgreSQL tests extend R1 with duplicate ordinal UNIQUE, registry UPDATE/DELETE/TRUNCATE probes, 46-table RLS catalog checks. SQL migration still unexecuted; CASCADE TRUNCATE may be blocked by a related registry trigger, not isolated proof of each trigger. RLS runtime probe is limited to sales with non-bypass role and temporary grants, not full application authentication. No production database.
- Master spec and handoff unchanged; CP-001 and R1 evidence preserved. D08-D12 OPEN. No financial engine or real financial data.

## Actual sandbox execution

Previous R2 source tree 35caa5534a99ae43b633c1dd1b59af29a21a5721 was exported using git archive and compared to GitHub tree SHA. Node 22.16.0, npm 10.9.2, Python 3.13.5, Git 2.47.3, Linux x86_64. Existing sandbox TypeScript 5.8.3 package was copied to node_modules; this is not a clean npm ci or verified npm package provenance. Fresh fallback typecheck, contract typecheck, clean fallback build, Node smoke 9/9, static schema 8/8 and Python syntax all exit 0; after build all 144/144 tracked files match Git tree bytes. Raw command log: evidence/CP-001-R2/sandbox-recheck-17195cf.log. Historical R1 source manifest 141/141 checked against exact local R1 tree. Additional continuation edits update documentation, explicitly pin React compiler and disable legacy runners; no application domain changes. Fallback and schema tests repeated after these edits. Exit codes are in EXIT_CODES.tsv. Source manifest covers tracked candidate files excluding the manifest itself, not the future lock-bearing candidate.

## Pending runtime gates

Fallback and React npm lock resolution: exit 1 EAI_AGAIN; fallback npm ci: exit 1 EUSAGE (missing lock); React audit: exit 1 ENOLOCK; PostgreSQL runner: exit 1 missing initdb despite pg_config present. Raw earlier sandbox logs combined in sandbox-blockers.log. React production typecheck/build, Playwright Chromium (mobile/desktop screenshots), PostgreSQL migration and FK/CHECK/UNIQUE/trigger/RLS runtime, complete dependency license inventory and security audit: NOT RUN / not verified. No GitHub run IDs, URLs, CI artifacts or screenshot evidence exist at report preparation. Static SQL test PASS is not PostgreSQL execution. No A01-A12 acceptance evidence.

## Required next action

After confirming no-charge usage, apply cp001-r2-resolve-locks to the R2 review PR as owner. Retrieve actual bootstrap artifact and verify lock provenance, review and commit both locks. Only then authorize cp001-r2-verify for updated HEAD. Collect actual run IDs, logs, statuses, screenshots and artifact SHA-256; review failures without weakening safeguards. Do not accept or merge R2 before independent verification and owner decision.

## Bootstrap continuation — 2026-11-27

The preceding sections are the historical pre-bootstrap report, not the current gate status. Owner changed the repository to Public and ran the authorized bootstrap on candidate `c11b7391c1b215ca6e0022665a6e5ed90efb0c87`. Run [46021693007](https://github.com/hnhuynh1003-blip/so-nong-dan/actions/runs/46021693007) completed success, artifact 15208432139. Actual downloaded archive, receipt, original log/manifest contents and hashes are preserved under `evidence/CP-001-R2/`; see `BOOTSTRAP_46021693007.md`. Execution assistant independently matched archive SHA-256, 16/16 evidence files, and complete 149/149 original candidate source paths/hashes against its matching Git tree. Both npm lock-resolution processes exit 0. Both original locks are copied byte-for-byte to their intended paths; no dependencies were installed. Prior DNS/ENOLOCK results remain historical sandbox observations, superseded only for lock resolution by bootstrap.

New candidate source manifest `evidence/CP-001-R2/SHA256SUMS.txt` covers every tracked file except itself. The pre-bootstrap manifest is retained unchanged in the parent commit and the archive records its hash. The new candidate contains no implementation changes beyond lockfiles, evidence and documentation. No new verify run is authorized or triggered by this continuation. Fallback and React clean npm ci, React production checks, Chromium, PostgreSQL runtime, audit and license inventory remain NOT RUN on lock-bearing candidate. CP-001-R2 PARTIAL, D08–D12 OPEN, no ACCEPTED, no CP-002. Independent Verifier reviews the new HEAD before owner applies the verify label.
