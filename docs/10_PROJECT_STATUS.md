# 10 — Project status

CP-000: SPECIFIED theo baseline; không tự đổi trạng thái. CP-001: PARTIAL, chưa nghiệm thu. TypeScript fallback typecheck/build PASS, Node smoke 9/9 PASS; Chromium loopback 4 errors, fixture interception 4 errors do administrator block; không có ảnh render. React installation BLOCKED; React typecheck/build NOT RUN. PostgreSQL migration NOT RUN, thiếu PostgreSQL. Lint NOT CONFIGURED. Không benchmark, không auth/PWA/IndexedDB/backend, không dữ liệu thật.

CP-002–009 chưa bắt đầu. A01–A12 acceptance matrix sản phẩm đều NOT RUN; smoke skeleton không thay thế acceptance. Gate tiếp theo: điều phối xác minh package/evidence, owner duyệt các quyết định cần thiết; môi trường có dependency, PostgreSQL local và browser preview; kiểm chứng React build, migration smoke và RLS draft review; xử lý D08 cho CP-002. Không tự mở CP-002.

## CP-001-R1 — v0.1.1

PARTIAL, not ACCEPTED. Imported original Git baseline, retained CP-000 files and all 17 old evidence files byte-identical. R1 data contracts + revised deterministic draft 46 tables/92 explicit indexes, 24 invariants/gates; no engine. Fallback npm ci/typecheck/clean build PASS, 9/9 Node smoke, 8/8 static schema checks, 10 expected-error type assertions checked by separate tsc command. React lock resolution BLOCKED EAI_AGAIN, offline audit command ENOLOCK; React install/typecheck/production build/browser/license inventory NOT RUN. PostgreSQL disposable migration/constraints NOT RUN (no binaries). Windows runner prepared, exercised fallback and prerequisite gates on Linux only; Windows runtime untested. No A01–A12, no CP-002. D08–D12 OPEN. Pending verifier and owner.

## CP-001-R2 — technical CI candidate
PARTIAL. GitHub handoff completed; R2 is based on original R1 SHA. CI definition and test runner prepared, owner authorization required via PR label; no execution assumed. Root and React genuine locks pending registry access and review. No production deploy, no full auth, no CP-002. See checkpoints/CP-001-R2_REPORT.md and docs/15_CI_R2.md for actual results/gates.

R2 continuation: owner authorization received (free quota only). Exact previous R2 Git tree rechecked in clean sandbox archive: fallback typecheck/build, contracts typecheck, Node 9/9, schema 8/8 PASS with copied local TS 5.8.3, not npm ci. No source drift. Genuine locks blocked; React/Chromium/PostgreSQL runtime/audit not verified. Draft PR is for review only. CI activation pending confirmed no-charge usage; no GitHub run claimed. Historical runner disabled to preserve evidence; D08–D12 OPEN.
