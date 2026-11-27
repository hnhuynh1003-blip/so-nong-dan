# SỔ NÔNG DÂN — CP-001

**PARTIAL — chưa nghiệm thu; chỉ dùng dữ liệu giả lập.** Workspace local riêng, không kết nối backend. Hai source UI: shell TypeScript không dependency đã build/test bằng Node; React/Vite draft chưa cài được dependency. Không phải app offline/PWA hoàn chỉnh.

## Chạy shell đã build
Yêu cầu Node 22, npm 10, TypeScript 5.8.3 có sẵn trên PATH, Python 3. Trên máy có các công cụ đó:

```sh
npm ci --offline --ignore-scripts --no-audit --no-fund
npm run typecheck
npm run build
npm test
npm run preview
```
Mở http://127.0.0.1:4173/ trên máy của bạn. Chỉ bind loopback; sandbox này chặn Chromium truy cập URL (xem log). Không nhập dữ liệu thật. `dist/` tạo từ build, được kèm ZIP để xem lại; không commit vào Git nếu tạo repo sau này.

Kiểm tra browser: cần Python Playwright, Chromium `/usr/bin/chromium` (đổi đường dẫn trong test nếu khác máy). `python tests/browser_smoke.py`. `sh scripts/run_checks.sh` chạy các kiểm tra và ghi exit codes. `tests/browser_mocked.py` là lần thử fixture interception, cũng bị chặn; không phải kiểm thử HTTP thực tế.

## React draft
`cd react-shell`, `npm install`, `npm run typecheck`, `npm run build`, `npm run dev` chỉ khi có mạng và sau khi rà soát dependency/version/license. Các phiên bản trong package.json là candidate, chưa được kiểm chứng; không có React lockfile vì install thất bại. Lockfile ở root chỉ dành cho shell không dependency; compiler global là prerequisite ngoài lockfile.

## Tài liệu
- `docs/01_MASTER_SPECIFICATION.md` baseline nguyên văn; `docs/WORK_CP001_HANDOFF.md` handoff nguyên văn (vai trò thực thi đổi theo yêu cầu hiện tại).
- `docs/03_SYSTEM_ARCHITECTURE.md`, `04_DATA_MODEL.md`, `05_CALCULATION_CONTRACT.md`, `09_DECISION_LOG.md`, `10_PROJECT_STATUS.md`, `11_DATA_DICTIONARY.md`, `docs/adr/`.
- `migrations/0001_schema_draft.sql` chưa chạy; không áp dụng trên DB thật. `scripts/draft_schema.py` sinh lại SQL; `docs/schema-tables.txt` là inventory.
- `checkpoints/CP-001_REPORT.md` và `evidence/CP-001/`: báo cáo và log thực tế.
