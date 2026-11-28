# SỔ NÔNG DÂN — CP-002B candidate (CP-001 and CP-002A accepted)

**CP-001: ACCEPTED — Owner Acceptance ngày 27/11/2026; chỉ dữ liệu giả lập.** Tiếp tục trực tiếp CP-001 v0.1.0, giữ baseline/evidence cũ, không khởi tạo dự án mới. GitHub (Public theo quyết định chủ dự án) là nguồn kỹ thuật chung; không backend, không phải app offline/PWA hoàn chỉnh. CP-002A: ACCEPTED by Project Owner (isolated A-P1 only). CP-002B: IMPLEMENTATION AUTHORIZED — CANDIDATE FOR INDEPENDENT VERIFICATION. CP-002C–F NOT AUTHORIZED.

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

Không secret/dữ liệu tài chính thật, không deploy; D06 và D08.1–D08.6 CONFIRMED, D09–D12 OPEN (E15). Chủ dự án mới có quyền ACCEPTED; Independent Verifier kiểm tra bằng chứng.

Biên bản chính thức: [`CP-001-R2_OWNER_ACCEPTANCE.md`](checkpoints/CP-001-R2_OWNER_ACCEPTANCE.md). CP-001 ACCEPTED. E14 above is the historical CP-001 acceptance record; see E15 for current A-only authorization. A01–A12 product acceptance vẫn NOT RUN.

## CP-002A / A-P1 — ACCEPTED

Parent `3ae5e2be06e401adaca044aad6f9376e9b15e5c5`; separate candidate branch `checkpoint/cp-002a`. Owner authorizes A only; D06, D08.1–D08.6 CONFIRMED, D09–D12 OPEN. Original draft and R1 addendum preserved in `docs/cp002/`; R1 §8 controls A-P1. Pure BigInt arithmetic under `src/modules/shared/exact-arithmetic/`, no integration. Reproduce local verification with exact package-local compiler: `python3 scripts/verify_cp002a.py --evidence-dir /tmp/snd-cp002a-independent --operations 100000`. See `checkpoints/CP-002A_REPORT.md`, `docs/cp002/CP-002A_A-P1_CONTRACT.md`, `docs/cp002/CP-002_TEST_REGISTER.md` (all 64 IDs), and `evidence/CP-002A/`. CP-001 CI/runbook above is historical; no CP-002A remote CI authorized or dispatched. No merge, deploy, B–F implementation, policy activation or real data. The accepted CP-001-R2 manifest is historical; new aggregate manifest is `evidence/CP-002A/SHA256SUMS.txt`.

Owner Acceptance (2026-11-28): accepted runtime HEAD `80fb95175e902e6bea3caac518a8a6b25b9c1815`, tree `1bcb9ca31eebed744b3448c4c6387d9c50935405`. Independent Verifier: 12,135/12,135 vector matches, 7/7 arithmetic groups PASS, 100,000 benchmark operations PASS, 3/3 benchmark digests MATCH. Original independent ZIP and its 18/18 internal checksums verified by closure assistant; no tests rerun. See [Owner Acceptance](checkpoints/CP-002A_OWNER_ACCEPTANCE.md) and [Independent Verification](evidence/CP-002A/INDEPENDENT_VERIFICATION_80fb9517.md).

Clean npm ci NOT RUN; independent full-checkout replay BLOCKED by DNS. Full baseline smoke, full project typecheck and contract typecheck were Engineering-reported, not independently rerun. PostgreSQL round-trip NOT RUN (AR10 pure pre-cast only). Raw JSON parsing, duplicate-key/depth/envelope checks and hostile objects are outside A-P1. Integration and A01–A12 product acceptance NOT RUN. Temporary 1024-digit guard unreachable with valid current operands; no runtime coverage of that branch. Synthetic benchmark is not production capacity/SLA or a historical-data limit. No policy activation, financial posting, production security claim or B–F implementation.

CP-001 ACCEPTED; CP-002A ACCEPTED (A-P1 only); CP-002B–F NOT AUTHORIZED. E15 remains the source for D06/D08.1–6 CONFIRMED and D09–D12 OPEN; E16 records acceptance only. No new CI, code or policy activation.

## CP-002B / B-P1 v1.0 — CANDIDATE FOR INDEPENDENT VERIFICATION

Parent `a5d0521ada0309f2cd69356ee1f6c5948f5607eb`; separate branch `checkpoint/cp-002b`. E17 supersedes E16 only for B-P1 authorization; earlier acceptance records remain historical. CP-001 and CP-002A ACCEPTED AND CLOSED; CP-002C–F NOT AUTHORIZED. D06/D08.1–6 CONFIRMED; D09–D12 OPEN. Design SHA `1d186c2dad025a96bfdc629d351e377173cd4006` read-only reference, no merge. `src/modules/rice/calculation/index.ts` imports accepted A-P1, pure rice/group PREVIEW only. See [B-P1 contract](docs/cp002/CP-002B_B-P1_CONTRACT.md), [authorization](docs/cp002/CP-002B_AUTHORIZATION.md), [report](checkpoints/CP-002B_REPORT.md) and [64-ID register](docs/cp002/CP-002_TEST_REGISTER.md). Reproduce: `python3 scripts/verify_cp002b.py --evidence-dir /tmp/snd-cp002b-independent` with exact existing local compiler. Local 10/10 groups, 600/600 independent-reference vectors (480 full-field +120 expected errors), 9/9 baseline smoke, typechecks/compile and 1k/10k/100k bag benchmarks PASS. Full checkout blocked DNS; compiler copied at exact pin; clean npm ci NOT RUN. No DB/UI/product/integration verification. Aggregate manifest `evidence/CP-002B/SHA256SUMS.txt`; original evidence ZIP in same folder. Prior A evidence and manifest unchanged. No new CI, merge, deployment, Codex, policy activation, C–F, real data or charges. Stop for independent verification.
