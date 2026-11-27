# SỔ NÔNG DÂN — CP-002A candidate (CP-001 accepted baseline)

**CP-001: ACCEPTED — Owner Acceptance ngày 27/11/2026; chỉ dữ liệu giả lập.** Tiếp tục trực tiếp CP-001 v0.1.0, giữ baseline/evidence cũ, không khởi tạo dự án mới. GitHub (Public theo quyết định chủ dự án) là nguồn kỹ thuật chung; không backend, không phải app offline/PWA hoàn chỉnh. CP-002A: IMPLEMENTATION AUTHORIZED, CANDIDATE FOR INDEPENDENT VERIFICATION. CP-002B–F NOT AUTHORIZED.

## CI và kiểm thử local

CP-001-R2: VERIFIED bởi Independent Verifier và ACCEPTED bởi Project Owner ngày 27/11/2026. Bootstrap 46021693007 SUCCESS; verify 46022965503 FAIL (evidence lịch sử giữ nguyên); verify 46025176479 SUCCESS trên runtime HEAD `05724c20f51755bc94a948165afb36b892e35fb4`. Hai lockfile thật không đổi. Clean builds/typechecks, Node 9/9, schema 8/8, runner 3/3, Chromium 4/4, PostgreSQL disposable migration/constraint/RLS smoke/cleanup PASS, hai npm audit báo 0 lỗ hổng tại thời điểm chạy. Accepted closure HEAD `5f44141824814877cbd5121b13b73f0cf493174d` chỉ bổ sung tài liệu và evidence. Owner Acceptance được ghi nhận trong commit tài liệu tiếp theo, không phải một lần chạy CI mới. Không merge. Xem `docs/15_CI_R2.md` và `checkpoints/CP-001-R2_REPORT.md`.

Dùng Node 22.16.0 / npm 10.9.2, Python 3.13.x; TypeScript 5.8.3 được pin trong từng package, không cài compiler global. Từ bản clone sạch, sau khi được phép tải dependency công khai:

```powershell
py -3.13 scripts/ci_r2.py bootstrap
# Review và commit cả hai lockfile thật trước khi verify.
py -3.13 scripts/ci_r2.py verify
```

Linux: `python3` thay `py -3.13`. PostgreSQL cần `pg_config` trên PATH trỏ đến binaries local. Runner chỉ tạo cluster tạm loopback, không nhận DSN/database thật. Fallback và React production có build/test riêng; `npm run preview` chỉ là fallback. Browser production dùng `react-shell/dist`. CI mặc định không chạy khi push hoặc mở PR; chỉ owner gắn label theo runbook. Không chạy lệnh cũ có thể ghi đè evidence lịch sử; dùng đúng runner R2.

## Tài liệu và bằng chứng

- `docs/01_MASTER_SPECIFICATION.md`, `docs/WORK_CP001_HANDOFF.md`: baseline nguyên văn.
- `docs/03_SYSTEM_ARCHITECTURE.md`, `04_DATA_MODEL.md`, `05_CALCULATION_CONTRACT.md`, `09_DECISION_LOG.md`, `10_PROJECT_STATUS.md`, `11_DATA_DICTIONARY.md`, `docs/adr/`.
- `docs/12_R1_DOMAIN_CONTRACTS.md`, `13_INVARIANT_REGISTER.md`, `14_TOOLCHAIN_R1.md`: đặc tả bổ sung R1, gates và hướng dẫn Windows.
- `migrations/0001_schema_draft.sql`: revised draft đã kiểm thử trên PostgreSQL disposable (không phải live upgrade), generator `scripts/draft_schema.py`, static test `scripts/check_schema_r1.py`, disposable SQL smoke `tests/postgres_disposable.sql`. Không seed policy hoặc phê duyệt nghiệp vụ.
- `checkpoints/CP-001_REPORT.md`, `evidence/CP-001/`: immutable historical snapshot; manifest cũ kiểm tra trên baseline v0.1.0, không phải R1 tree.
- `checkpoints/CP-001-R1_REPORT.md`, `evidence/CP-001-R1/`: báo cáo, log mới, manifest source và tree. Git bundle lịch sử lưu commit baseline và R1. Hai branch và tag đã có trên GitHub, không merge.
- `evidence/CP-001-R2/`: báo cáo kiểm tra sandbox, exit codes và manifest riêng; bootstrap, failed verify và successful verify artifacts nguyên bản, log console, receipt và local remediation regression logs.

Không secret/dữ liệu tài chính thật, không deploy, D08–D12 OPEN. Chủ dự án mới có quyền ACCEPTED; Independent Verifier kiểm tra bằng chứng.

Biên bản chính thức: [`CP-001-R2_OWNER_ACCEPTANCE.md`](checkpoints/CP-001-R2_OWNER_ACCEPTANCE.md). CP-001 ACCEPTED. E14 above is the historical CP-001 acceptance record; see E15 for current A-only authorization. A01–A12 product acceptance vẫn NOT RUN.

## CP-002A / A-P1 — CANDIDATE FOR INDEPENDENT VERIFICATION

Parent `3ae5e2be06e401adaca044aad6f9376e9b15e5c5`; separate candidate branch `checkpoint/cp-002a`. Owner authorizes A only; D06, D08.1–D08.6 CONFIRMED, D09–D12 OPEN. Original draft and R1 addendum preserved in `docs/cp002/`; R1 §8 controls A-P1. Pure BigInt arithmetic under `src/modules/shared/exact-arithmetic/`, no integration. Reproduce local verification with exact package-local compiler: `python3 scripts/verify_cp002a.py --evidence-dir /tmp/snd-cp002a-independent --operations 100000`. See `checkpoints/CP-002A_REPORT.md`, `docs/cp002/CP-002A_A-P1_CONTRACT.md`, `docs/cp002/CP-002_TEST_REGISTER.md` (all 64 IDs), and `evidence/CP-002A/`. CP-001 CI/runbook above is historical; no CP-002A remote CI authorized or dispatched. No merge, deploy, B–F implementation, policy activation, real data or owner acceptance. The accepted CP-001-R2 manifest is historical; new aggregate manifest is `evidence/CP-002A/SHA256SUMS.txt`.
