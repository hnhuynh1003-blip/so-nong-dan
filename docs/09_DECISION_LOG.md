# 09 — Decision log

Giữ D01–D12 đúng baseline, không tự đóng OPEN.

| ID | Trạng thái | Nội dung |
|---|---|---|
| D01 | CONFIRMED | Một gia đình, một người quản lý, không thương mại hóa |
| D02 | CONFIRMED | Lúa/tôm/cua chung đất; đất nhà/thuê; một vụ lúa cuối năm |
| D03 | CONFIRMED | Chat + Work; không Codex. CP-001 này thực thi bằng Chat theo yêu cầu mới; cuộc trò chuyện khác điều phối/kiểm tra. |
| D04 | CONFIRMED | Ưu tiên dữ liệu nhiều năm hơn multi-user |
| D05 | PROPOSED | React/TS/Vite, PWA, IndexedDB/Dexie, PostgreSQL candidate; fallback TS không đổi stack đích |
| D06 | PROPOSED | Balanced ledger, domain tách UI |
| D07 | PROPOSED | 50 năm; 1M + 1M + 10k; benchmark/chi phí chưa đo |
| D08 | OPEN | Rounding, tie, thứ tự, scope |
| D09 | OPEN | Công đất, diện tích, thuê, kỳ sản xuất |
| D10 | OPEN | Thứ tự/màu ô app cũ, thanh toán/coverage 2025 |
| D11 | OPEN | Repo, hosting, provider, ngân sách/quota, quyền và thiết bị |
| D12 | OPEN | Định giá/khấu hao/tồn kho/phân bổ chung |

Quyết định thực thi tạm thời (không thay nghiệp vụ): E01 fallback TS thuần khi npm blocked, React draft riêng; E02 hash routes cho static preview; E03 SQL schema `snd`, owner-scoped composite keys và fail-closed draft; E04 Node test runner + Python Playwright có sẵn; E05 không tạo Git repo từ xa hoặc local commit, bàn giao ZIP. Tất cả cần review; không xác nhận stack/versions/license/chi phí. Không thêm giá trị tài chính/đơn vị/rounding giả định.

## CP-001-R1 execution decisions (PROPOSED)
E06: local Git import/tag v0.1.0, no remote; supersedes E05 for local only. E07: revise never-executed migration draft in place, no live upgrade; owner-scoped rounding policy UUID, separate immutable approvals, sale-line quantities and explicit finance targets. E08: exact reproducibility toolchain pins; Vite candidate 6.4.6 replaces 6.3.5 due to advisory; no production version/security approval. D08–D12 unchanged OPEN.

## CP-001-R2 execution decisions (PROPOSED)
E09: Owner created the private GitHub repository and imported both original commits/tags. GitHub is the shared technical source; historical branches stay fixed. D11 remains OPEN for hosting/provider/budget/quota and related decisions. E10: local TypeScript dependency 5.8.3, exact Node/npm reproduction pins, separate committed npm locks required. Old zero-dependency root lock removed rather than misrepresenting the new manifest. E11: owner-labeled same-repository PR CI only, read-only token, immutable official Actions pins; bootstrap artifacts require review and commit before clean verification. No owner acceptance, no D08–D12 closure.

E12 (2026-11-27, owner authorization recorded): Owner authorizes draft PR and technical Actions only within existing included free usage, public dependency downloads and disposable tests. No paid purchases, deploy, merge or CP-002. Billing/usage and Actions permissions endpoints rejected by connector allowlist; quota cannot be confirmed. Do not label/dispatch until owner confirms available included minutes/storage and no overage charge. D08–D12 remain OPEN; E12 is not owner acceptance.

E13 (2026-11-27, execution record): Owner changed repository visibility to Public and authorized bootstrap; run 46021693007 succeeded. Preserve exact artifact and commit both original locks before independent review. No additional visibility change, paid purchase, verify label, merge or acceptance by execution assistant. Public repository must contain only synthetic data; future family records/secrets must not be committed. D08–D12 remain OPEN.
