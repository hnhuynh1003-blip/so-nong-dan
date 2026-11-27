# SỔ NÔNG DÂN — CP-001-R1 v0.1.1

**PARTIAL — chưa nghiệm thu; chỉ dữ liệu giả lập.** Tiếp tục trực tiếp CP-001 v0.1.0, giữ baseline/evidence cũ, không khởi tạo dự án mới. Workspace local, không backend, không phải app offline/PWA hoàn chỉnh. Không CP-002.

## Chạy kiểm thử local

Yêu cầu Node 22.16.0 / npm 10.9.2 (reproduction pins, không duyệt production), Python 3.13.x, TypeScript 5.8.3 trên PATH cho fallback. Xem `docs/14_TOOLCHAIN_R1.md` trước khi cài công cụ/dependency; đặc biệt không dùng bản Vite 6.3.5 cũ. Windows PowerShell, từ thư mục này:

```powershell
py -3.13 scripts/local_r1.py fallback
# Chỉ khi cho phép truy cập public npm registry / browser CDN:
py -3.13 scripts/local_r1.py react --resolve-react-lock --install-browser
# Chỉ dùng PostgreSQL binaries local, không truyền database thật:
py -3.13 scripts/local_r1.py postgres --pg-bin "C:\Program Files\PostgreSQL\17\bin"
```

Linux: dùng `python3` thay `py -3.13`; `--pg-bin` là thư mục local binaries. Runner tự tạo evidence mới `evidence/local-r1-*`, không ghi đè CP-001/R1. React lockfile hiện thiếu do EAI_AGAIN; lần chạy local thành công cần gửi cả lockfile, logs, exit codes, screenshots thực tế, diff. PostgreSQL script tạo cluster tạm có mật khẩu ngẫu nhiên, loopback, kiểm tra data_directory trước migration, xóa cluster do chính nó tạo khi dừng thành công. Không dùng DSN, không migration DB thật.

Fallback `npm run build:fallback` tạo `dist/`, `npm run test:fallback` chạy 9 Node smoke tests, `npm run typecheck:fallback` typecheck. `npm run preview` chỉ phục vụ fallback dist loopback, không bằng chứng React. React build nằm riêng trong `react-shell/dist`, kiểm tra browser production bằng Playwright qua preview loopback. Không mở port ra mạng. **Không chạy scripts/run_checks.sh hoặc old Python browser tests** vì chúng thuộc CP-001 và ghi vào evidence cũ; chúng được giữ để tái hiện lịch sử trong bản sao baseline riêng, không phải R1 runner.

## Tài liệu và bằng chứng

- `docs/01_MASTER_SPECIFICATION.md`, `docs/WORK_CP001_HANDOFF.md`: baseline nguyên văn.
- `docs/03_SYSTEM_ARCHITECTURE.md`, `04_DATA_MODEL.md`, `05_CALCULATION_CONTRACT.md`, `09_DECISION_LOG.md`, `10_PROJECT_STATUS.md`, `11_DATA_DICTIONARY.md`, `docs/adr/`.
- `docs/12_R1_DOMAIN_CONTRACTS.md`, `13_INVARIANT_REGISTER.md`, `14_TOOLCHAIN_R1.md`: đặc tả bổ sung R1, gates và hướng dẫn Windows.
- `migrations/0001_schema_draft.sql`: revised unexecuted draft (không phải live upgrade), generator `scripts/draft_schema.py`, static test `scripts/check_schema_r1.py`, disposable SQL smoke `tests/postgres_disposable.sql`. Không seed policy hoặc phê duyệt nghiệp vụ.
- `checkpoints/CP-001_REPORT.md`, `evidence/CP-001/`: immutable historical snapshot; manifest cũ kiểm tra trên baseline v0.1.0, không phải R1 tree.
- `checkpoints/CP-001-R1_REPORT.md`, `evidence/CP-001-R1/`: báo cáo, log mới, manifest source và tree. Git bundle riêng lưu commit baseline và R1; không remote.

Không secret/dữ liệu tài chính thật, không deploy, D08–D12 OPEN. Chủ dự án mới có quyền ACCEPTED; Independent Verifier kiểm tra bằng chứng.
