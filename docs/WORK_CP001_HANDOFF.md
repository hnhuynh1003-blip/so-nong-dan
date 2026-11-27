# SỔ NÔNG DÂN — CP-001 / Technical Foundation

Bạn là ChatGPT Work, phụ trách triển khai kỹ thuật cho SỔ NÔNG DÂN. Chủ dự án phê duyệt; ChatGPT Chat điều phối và kiểm tra bằng chứng. Không sử dụng Codex.

## Đầu vào và phạm vi

Đọc toàn bộ `MASTER_SPECIFICATION_v1.0.md` đính kèm. Nếu chưa truy cập được tài liệu, báo BLOCKED, không suy đoán đặc tả. Đây là app riêng cho một gia đình, ưu tiên độ chính xác, offline, dữ liệu nhiều năm và quyền sở hữu dữ liệu. Chỉ làm CP-001 trong phiên hiện tại. Việc người dùng giao prompt này cho Work là cho phép thực hiện công việc local/sandbox trong phạm vi dưới đây; không mặc định cho phép tạo repo từ xa, đăng ký dịch vụ, mua gói, deploy, truy cập dữ liệu thật hoặc thay đổi dự án khác.

### A. Preflight

1. Xác định môi trường thực thi thực tế, khả năng tạo file, chạy lệnh, build/test, Git, Node/package manager; xác minh phiên bản qua lệnh hoặc tài liệu thực sự đọc được. Ghi rõ giới hạn và quyền truy cập. Không tự truy cập repo khác của chủ dự án.
2. Đánh giá các lựa chọn React/TS/Vite, PWA, IndexedDB, PostgreSQL/Supabase, công cụ test, chi phí/quota và khả năng tự chủ; ghi nguồn/giới hạn khi cần. Chọn stack tương thích trong ADR, giữ trạng thái PROPOSED khi cần owner duyệt. Nếu không thể cài dependency hoặc mạng không khả dụng, báo phần BLOCKED và vẫn giao những artifact có thể làm được.
3. Kiểm tra tài liệu có mâu thuẫn; giữ mọi quyết định OPEN, không tự chọn rounding mặc định, đơn vị công đất, giá thuê, dữ liệu tài chính.

### B. Technical skeleton (local/sandbox only)

- Tạo workspace riêng `so-nong-dan` với README, docs, src/modules, tests, fixtures, migrations, checkpoints, evidence; không tạo repo GitHub từ xa. Nếu đã có workspace tên trùng, kiểm tra và không overwrite dữ liệu.
- Khởi tạo React/TypeScript shell khi toolchain khả dụng. Tạo trang home/navigation tiếng Việt tối giản với các route: cân lúa, bán tôm/cua, chi phí, đất, quyết toán, nhập dữ liệu. Chức năng chưa triển khai ghi rõ placeholder. Không tạo số liệu tài chính thật hay báo cáo giả mạo.
- Tạo boundary module và sơ đồ kiến trúc, ERD logic, schema/migration draft (chưa chạy trên DB thật) cho owner scope, nguồn, thời gian, cân, sales/expenses, allocations, ledger, coverage, revisions và sync. Chỉ local migration nếu có PostgreSQL local và không dùng dữ liệu thật; nếu không chạy được, báo NOT RUN.
- Đề xuất hợp đồng số học với gram/VND integer, decimal/rational, JSON serialization, versioned rounding, null/unknown và idempotency. Chưa implement toàn bộ engine CP-002.
- Thiết kế hợp đồng offline, data isolation, backup, import/coverage và performance; tránh microservices. Tạo `.env.example` không chứa secret, `.gitignore` phù hợp, không seed PII, không đưa ảnh/dữ liệu gia đình vào repository.
- Tạo fixtures giả lập và smoke tests tối thiểu cho skeleton/module boundaries; chạy typecheck, test, build và lint nếu cấu hình có. Nếu tool không chạy được, không ghi PASS.

### C. Artifacts bắt buộc

- `README.md` (hướng dẫn chạy thực tế và giới hạn).
- `docs/01_MASTER_SPECIFICATION.md` (bản baseline không tự sửa).
- `docs/03_SYSTEM_ARCHITECTURE.md`, `docs/04_DATA_MODEL.md`, `docs/05_CALCULATION_CONTRACT.md`, `docs/09_DECISION_LOG.md`, `docs/10_PROJECT_STATUS.md`, `docs/11_DATA_DICTIONARY.md`.
- `docs/adr/0001-technical-stack.md`, `docs/adr/0002-offline-and-data-integrity.md`, `docs/adr/0003-financial-ledger.md`.
- `checkpoints/CP-001_REPORT.md`, `evidence/CP-001/` (log đã chạy, test summary, ảnh UI nếu thực sự render được, không chứa thông tin riêng tư).
- Source và lockfile nếu đã khởi tạo thành công; migration draft và fixtures giả lập. Bàn giao dưới dạng workspace hoặc ZIP nếu có khả năng tạo file. Không chỉ gửi hình mô phỏng rồi báo đã triển khai.

### D. Acceptance report

Báo theo cấu trúc:
1. Trạng thái CP-001: TESTED / PARTIAL / BLOCKED (không VERIFIED hay ACCEPTED).
2. Phạm vi thực tế hoàn thành và những việc không làm.
3. Stack + các quyết định/giả định cần phê duyệt.
4. File tree và artifact links thực sự tồn tại.
5. Lệnh thực thi, phiên bản, exit codes, số test pass/fail/not run, log dẫn chiếu; phân biệt kết quả thật với mục tiêu đề xuất.
6. Security/privacy: xác nhận không đưa dữ liệu thật/secret vào repo, không deploy, không thay đổi dự án khác.
7. Blockers/rủi ro; đề xuất bước CP-002 nhưng không thực hiện CP-002.

Không tự đánh dấu chủ dự án nghiệm thu. Nếu thiếu công cụ thực thi, giao đặc tả/ADR/draft hữu ích và ghi BLOCKED cho build/test. Không hứa làm nền hoặc kết quả về sau.
