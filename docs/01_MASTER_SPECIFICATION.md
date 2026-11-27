# SỔ NÔNG DÂN — MASTER SPECIFICATION v1.0

- Checkpoint: CP-000 / Project Foundation
- Ngày: 2026-11-27 (Asia/Ho_Chi_Minh)
- Trạng thái: SPECIFIED — chờ chủ dự án nghiệm thu; chưa triển khai
- Điều phối: ChatGPT Chat; thực thi: ChatGPT Work; không sử dụng Codex.
- Phạm vi: một gia đình, một người quản lý chính; không thương mại hóa.
- Tài liệu này là baseline yêu cầu. Các mục PROPOSED là đề xuất kỹ thuật, không phải kết quả thử nghiệm hay phê duyệt của chủ dự án.

## 1. Mục tiêu và giới hạn

Giải thích bằng dữ liệu: gia đình thu bao nhiêu, chi phí bao nhiêu, lợi nhuận sản xuất là bao nhiêu, tiền thực nhận đi đâu, tài sản và nợ biến động thế nào. Hỗ trợ nhìn nhiều năm, truy ngược từ báo cáo đến giao dịch và chứng từ. Cân lúa là một module nhập liệu quan trọng, không phải toàn bộ sản phẩm.

**Đã xác nhận từ chủ dự án:** mô hình lúa–tôm–cua trên cùng diện tích; một vụ lúa cuối năm; bán tôm cua rải rác và thiếu dữ liệu lịch sử; đôi khi mua thức ăn tôm; có đất nhà và đất thuê; mẹ ghi vở, người dùng số hóa/quản lý; cân từng bao, trừ bì theo thỏa thuận; có ảnh dữ liệu Cân Lúa v5 năm 2025, chưa có Excel từ app cũ. Chưa xác định diện tích và quy đổi công đất, giá thuê, quy tắc làm tròn, mức độ đầy đủ tài chính và tình trạng thanh toán thực tế.

**Ngoài phạm vi:** SaaS nhiều hộ, quảng cáo, thanh toán gói dịch vụ, marketplace, quản lý thương lái chuyên nghiệp, đăng ký công khai, điều khiển ngân hàng hoặc tự thực hiện thanh toán. Không yêu cầu mẹ đổi thói quen. Không cần AI để chạy nghiệp vụ cốt lõi.

## 2. Hiến chương

- P01 Family-only, mobile-first, giao diện tiếng Việt; VND; ngày địa phương Asia/Ho_Chi_Minh; thời điểm kỹ thuật lưu UTC và giữ ngày nghiệp vụ riêng.
- P02 Data-first: không giới hạn nhân tạo số năm, số phiếu; giới hạn hạ tầng phải được công bố; bảo đảm xuất dữ liệu độc lập.
- P03 Accuracy-first: công thức xác định, phiên bản, kiểm thử; AI không quyết định giá trị giao dịch.
- P04 Offline-first: ghi cân, thu chi và xem bản ghi đã tải khi mất mạng; lưu cục bộ bền vững trong khả năng nền tảng, hiển thị trạng thái đồng bộ; không quảng cáo local cache là backup.
- P05 Privacy-first: xác thực chủ sở hữu, không đăng ký công khai, dữ liệu tài chính/chứng từ riêng tư; không ghi dữ liệu thật, bí mật hoặc token vào repo/log/fixture.
- P06 Unknown không phải zero; ước tính không phải xác nhận; dữ liệu có chứng từ không đồng nghĩa toàn bộ kỳ đã đủ.
- P07 Số liệu gốc bất biến; sửa phiếu đã chốt bằng revision có lý do; có thể tái lập báo cáo lịch sử theo revision/rule version.
- P08 Một sự kiện kinh tế chỉ ghi nhận một lần; chống trùng ở nhập liệu, thanh toán và đồng bộ.
- P09 Chủ dự án mới có quyền ACCEPTED; Chat kiểm chứng bằng chứng, Work báo kết quả thực thi; không tự nghiệm thu.

## 3. Chức năng và tiêu chí nghiệp vụ

| ID | Yêu cầu | Mức |
|---|---|---|
| RICE-01 | Nhóm sổ, phiếu cân có ngày, tên, người bán/mua tùy chọn, trạng thái nháp/chốt/hủy; nhóm có thể chứa nhiều giá | MVP |
| RICE-02 | Nhập 3 chữ số tương ứng 0,1 kg (443 = 44,3 kg); bảng 5x5, 25 bao; 3 bảng/trang; thứ tự cột từ trên xuống đề xuất theo ảnh; tự lưu từng bao; undo/sửa/xóa có kiểm soát | MVP |
| RICE-03 | Tổng số bao và trọng lượng theo cột, bảng, trang, phiếu, nhóm; bảng cuối không đầy vẫn đúng | MVP |
| RICE-04 | Trừ bì theo kg cố định, số bao/kg, kg/bao hoặc không trừ; theo lượt hoặc phiếu, không chồng phạm vi; tạp chất riêng | MVP |
| RICE-05 | Giá bán, khối lượng thực và tính tiền riêng, quy tắc làm tròn có cấu hình rõ; chưa xác nhận quy tắc không được chốt giao dịch mới | MVP |
| RICE-06 | Phiếu chia sẻ/xuất; lưu từng bao, sửa phiếu chốt bằng revision; lịch sử trả tiền riêng | MVP |
| FARM-01 | Ghi bán tôm/cua chỉ cần ngày (hoặc kỳ) và số tiền; loại, kg, số con, đơn giá, phân loại, khu đất tùy chọn; nhiều dòng giá | MVP |
| FARM-02 | Nhập chi phí lúa/tôm/cua/chung; thức ăn, giống, vật tư, thuê đất, điện/dầu, nhân công, danh mục mở | MVP |
| LAND-01 | Khu đất ổn định, lịch sử diện tích, quyền sở hữu/thuê, hợp đồng thuê và kỳ phân bổ tiền thuê; đơn vị công đất chưa biết thì giữ nguyên số và đơn vị nguồn | MVP |
| LAND-02 | Năm sản xuất và hoạt động lúa/tôm/cua; giao dịch có thể phân bổ nhiều đất; chi phí chung không bắt buộc chia; cho phép chưa gán | MVP |
| FIN-01 | Ghi bán, tiền đã thu, đặt cọc, công nợ; chi phí phát sinh và tiền đã chi; hỗ trợ trả nhiều lần | MVP |
| FIN-02 | Tiền mặt/ngân hàng, chuyển nội bộ, vay, trả gốc, lãi, chi sinh hoạt, mua/bán tài sản, số dư đầu/cuối kỳ | MVP mở rộng |
| DATA-01 | Ghi nhanh, chi tiết, tổng hợp kỳ ngày/tuần/tháng/năm; bằng chứng, nguồn, mức xác nhận, phạm vi đầy đủ | MVP |
| DATA-02 | Nhập CSV/XLSX/JSON theo lô có preview, mapping, kiểm tra, dedup, lỗi từng dòng, rollback batch; xuất dữ liệu | Sau nền tảng |
| DATA-03 | Lưu ảnh sổ/phiếu gốc, liên kết nguồn, kiểm tra checksum; nhập ảnh bằng tay trước, OCR/AI chỉ là gợi ý có duyệt | Sau nền tảng |
| ANA-01 | Báo cáo năm, kỳ, khu đất, hoạt động, nhóm/phiếu; drill-down nguồn; bộ lọc xác nhận/ước tính/thiếu | MVP |
| ANA-02 | Quyết toán lợi nhuận và đối chiếu tiền, tài sản/nợ, so sánh đất thuê/đất nhà, xu hướng nhiều năm | MVP mở rộng |
| OPS-01 | Sao lưu, khôi phục độc lập, export toàn bộ schema/dữ liệu/ảnh/manifest, kiểm thử phục hồi | Bắt buộc trước dùng thật |
| AI-01 | Hỏi đáp dữ liệu chỉ đọc có nguồn, đề xuất phân tích; không tự ghi/chốt, không chuyển dữ liệu ra dịch vụ ngoài nếu chưa cấp phép | Giai đoạn sau |

MVP là phạm vi sản phẩm đầu, không đồng nghĩa tất cả phải làm trong CP-001. Phân hệ AI, Bluetooth, dự báo, OCR, lạm phát, khấu hao nâng cao chỉ mở rộng sau khi lõi ổn định.

## 4. Calculation engine — hợp đồng số học

- Trọng lượng nhập gốc lưu chuỗi nguồn + giá trị nguyên gram; mặc định cân 0,1 kg cho chế độ ba chữ số. Giá tiền và giao dịch VND lưu số nguyên; tỷ lệ, phần trăm, đơn giá hoặc trung gian dùng decimal/hữu tỷ chính xác. Không dùng JS Number dấu phẩy động cho phép tính chính thức. Truyền BigInt/decimal qua API dưới dạng chuỗi nếu cần; kiểm tra giới hạn kiểu số và round-trip.
- Tổng gross = tổng gram các bao hợp lệ. Bao chưa nhập là null, không tính vào count. Trừ bì theo tỷ lệ = số bao × gram bì quy ước / số bao quy ước. Nếu phân số chưa thể biểu diễn nguyên gram, giữ tử/mẫu chính xác đến bước lượng tử hóa đã quy định. Cấm mẫu số 0, trọng lượng không dương, bì âm, tạp chất âm, tổng giảm trừ vượt gross; ngoại lệ nghiệp vụ cần quy trình điều chỉnh riêng.
- Net physical = gross − tare; net commercial exact = net physical − impurity/giảm trừ khối lượng đã xác nhận. Settlement weight = áp dụng rounding policy lên net commercial. Phân biệt khối lượng vật lý, khối lượng sau tạp chất và khối lượng tính tiền. Revenue = tổng từng dòng settlement weight × unit price; làm tròn VND theo policy rõ phạm vi dòng/phiếu. Giảm tiền không phải giảm kg; lưu riêng.
- Policy version gồm phương pháp (giữ nguyên, làm tròn xuống, gần nhất, lên), quantum (gram/kg), tie rule, thứ tự và phạm vi làm tròn (lượt/dòng/phiếu). Chọn rõ trước khi chốt. Không suy diễn mặc định app cũ. Đổi policy không đổi phiếu cũ; lịch sử import có thể giữ settlement weight đã quan sát và policy UNKNOWN.
- Cột/bảng/trang cộng gross, không làm tròn ngầm. Bản ghi hiển thị số và dấu thập phân theo locale nhưng không dùng chuỗi hiển thị để tính.
- Một phiếu nhiều giá: phân bổ khối lượng vào các dòng bán không chồng lặp; phần dư và số tiền phải đối chiếu tổng; không lấy trung bình cộng đơn giá. Giá bình quân = tổng giá trị bán / tổng kg tính tiền nếu cùng đơn vị và mẫu số >0.
- Thanh toán gắn với sale/expense và account, không tạo thêm doanh thu/chi phí. Đặt cọc trước giao hàng là khoản nhận trước, sau đó phân bổ vào phải thu; không ghi thêm thu tiền khi phân bổ. Quá thanh toán thể hiện số nhận vượt/hoàn lại, không ép về 0.

### Ví dụ kiểm thử tổng hợp (số giả lập, được phép commit)

| ID | Đầu vào | Kỳ vọng |
|---|---|---|
| CAL-01 | 443, 463, 454 theo mode 3 số | 136,0 kg; 3 bao |
| CAL-02 | gross 100,8 kg, 6 bao, 10 bao/kg, tạp chất 0 | bì 0,6 kg; net 100,2 kg |
| CAL-03 | net 100,2 kg, giá 9.000; floor 1kg | 100 kg; 900.000 đ |
| CAL-04 | cùng dữ liệu CAL-03, giữ nguyên | 901.800 đ |
| CAL-05 | net 100,6 kg; floor vs nearest | 100 kg vs 101 kg |
| CAL-06 | net 100,5 kg; nearest, tie half-up | 101 kg |
| CAL-07 | 356 bao, 25 bao/bảng, 3 bảng/trang | 15 bảng, 5 trang, bảng cuối 6 bao |
| CAL-08 | bì 1kg/3 bao, 1 bao | trung gian 1/3 kg chính xác, lượng tử hóa đúng policy |
| CAL-09 | giá trị bán 1.000.000, cọc 200.000, thu sau 300.000 | doanh thu 1.000.000; thu 500.000; còn 500.000 |
| CAL-10 | tổng tiền 1.000.000, thu 1.100.000 | nhận vượt 100.000; không thêm doanh thu |
| CAL-11 | null, 0, âm, quá giới hạn, bì vượt gross, tỷ lệ 0 | từ chối/hiển thị lỗi đúng; null không thành 0 |
| CAL-12 | đổi policy sau chốt | phiếu/revision cũ giữ nguyên |

Dữ liệu ảnh thật năm 2025 chỉ dùng trong vùng kiểm thử riêng. Đã quan sát một phiếu bì 10 bao/1 kg và số kg dùng tính tiền nguyên kg dù net có 0,2 kg lẻ; chưa phân biệt được floor và nearest. Bảng 5x5 và trang 3 bảng phù hợp ảnh; ý nghĩa màu ô, thứ tự bàn phím đang hoạt động chưa xác nhận. Không sao chép ảnh hoặc số tài chính thật vào repo, kể cả private repo theo baseline hiện tại.

## 5. Sổ tài chính thống nhất

PROPOSED: sổ bút toán có kiểm soát cân đối, ẩn sau UI ghi nhanh. Mỗi sự kiện có event_id, source_id, idempotency key, ngày nghiệp vụ, kỳ sản xuất, revision; các dòng ghi nhận phải cân đối theo VND. Các dòng bán hàng, chi phí, thu/chi, tài sản, nợ liên kết tới một nguồn duy nhất. Chỉ hạch toán số đã xác nhận; ước tính ở lớp báo cáo riêng; import lịch sử có thanh toán không rõ giữ unknown, không dựng bút toán tiền mặt giả. Không bắt buộc định khoản đầy đủ dữ liệu cũ: bản ghi lịch sử thiếu thông tin nằm ở vùng staging/reporting riêng có nhãn, không tự sinh tài khoản đối ứng không có chứng cứ.

| Sự kiện | Tác động |
|---|---|
| Bán chưa thu | Doanh thu tăng; phải thu tăng; tiền không đổi |
| Thu tiền bán/cọc | Tiền tăng; giảm phải thu hoặc tăng nhận trước; không tăng doanh thu lần nữa |
| Chi phí mua chịu | Chi phí hoặc tài sản tăng tùy bản chất; phải trả tăng; tiền không đổi |
| Thanh toán khoản phải trả | Tiền giảm; nợ giảm; không ghi chi phí lần hai |
| Vay mới / trả gốc | Tiền và nợ thay đổi; không phải doanh thu/chi phí |
| Trả lãi | Chi phí lãi và dòng tiền ra (hoặc giảm lãi phải trả nếu đã ghi nhận) |
| Chuyển tiền giữa tài khoản nhà | Không đổi tổng tiền của phạm vi gia đình |
| Mua tài sản | Tiền giảm hoặc nợ tăng; tài sản tăng; không ghi toàn bộ giá mua là chi phí sản xuất ngay nếu vốn hóa |
| Sinh hoạt | Dòng tiền/chi tiêu gia đình; không trộn chi phí sản xuất |

Chỉ số:
- Lợi nhuận sản xuất = doanh thu đã ghi nhận − chi phí sản xuất ghi nhận cùng kỳ (bao gồm chi phí chung, tiền thuê phân bổ, khấu hao nếu đã có policy). Báo cáo biên tiền mặt/thu chi tiền riêng. Lãi vay hiển thị riêng hoặc trong lợi nhuận sau tài chính có nhãn.
- Lợi nhuận từng hoạt động trước phân bổ = doanh thu hoạt động − chi phí trực tiếp. Chi phí chung chưa phân bổ giữ riêng; toàn mô hình chỉ trừ một lần. Không gọi lợi nhuận riêng là lợi nhuận đầy đủ khi còn chi phí chung.
- Số dư cuối kỳ theo sổ = số dư đầu + thu tiền − chi tiền (loại chuyển nội bộ khi tổng hợp). Chênh lệch = số dư thực tế cuối − số dư theo sổ. Hiển thị dấu và độ thiếu dữ liệu, không quy kết thất thoát.
- Tài sản ròng = tổng giá trị tài sản − nợ phải trả cùng ngày định giá. Biến động tài sản ròng không đồng nghĩa toàn bộ lợi nhuận vì có đánh giá lại, vốn góp, thừa kế, chi tiêu và khoản khác. Không coi giá trị đất thuê là đất sở hữu.
- Thuê đất trả trước nhiều năm: dòng tiền theo ngày trả, chi phí theo kỳ hưởng lợi theo policy được duyệt; không cộng cả hai vào chi phí cùng kỳ. Đất nhà có thể tính chi phí cơ hội riêng, không giả lập tiền thuê thực tế.
- Giá vốn/kg, năng suất/ha, lợi nhuận/ha chỉ khi mẫu số và phạm vi đủ; không lấy kg bán thay cho toàn bộ thu hoạch nếu còn giữ lại/thiếu dữ liệu.

## 6. Mô hình dữ liệu logic (PROPOSED)

| Nhóm | Bảng/aggregate đề xuất |
|---|---|
| Chủ sở hữu | owner_profile, settings |
| Đất & năm | land_parcels, land_area_history, leases, production_years, activities, activity_land_links |
| Cân lúa | weighing_groups, weighing_sheets, weighing_batches, weighing_entries, deduction_rules, calculation_snapshots |
| Giao dịch | sales, sale_lines, expenses, allocations, settlements |
| Sổ tài chính | accounts, journal_events, journal_lines, opening_balances, reconciliations, receivable_payable_links |
| Tài sản/nợ | assets, asset_valuations, loans, repayment_schedules |
| Dữ liệu lịch sử | source_records, attachments, import_batches, import_rows, coverage_periods, aggregate_observations |
| Kiểm soát | revisions, audit_events, sync_outbox, sync_receipts, conflict_records, report_snapshots |

Mọi bản ghi cần ID ổn định, owner scope, created_at/updated_at, version; ngày nghiệp vụ và kỳ sản xuất tùy loại; nguồn và trạng thái xác nhận cho dữ liệu tài chính; ràng buộc FK, unique, check và transaction tương ứng. Trọng lượng và tiền dùng BIGINT/NUMERIC theo bounds đã kiểm tra. Index tối thiểu theo owner + ngày/kỳ, loại, khu đất, source ID, idempotency key; phân trang keyset cho danh sách lớn. Không tự đưa dữ liệu gia đình vào seed.

Phân bổ có thể null/unassigned; tổng phân bổ không vượt tổng giao dịch; phần còn lại hiện rõ. Diện tích lưu lịch sử, quy đổi sang m² khi có tỷ lệ đã xác nhận, giữ nguyên đơn vị gốc. Năm sản xuất không nhất thiết trùng ngày thanh toán hoặc năm dương lịch; báo cáo nêu rõ basis.

### Chất lượng và độ phủ

Tách ba trục: (1) provenance: nguồn ảnh/vở/nhập tay; (2) verification: unverified/confirmed/estimated; (3) coverage của kỳ và phạm vi: unknown/partial/complete/confirmed_zero. Kỳ không có giao dịch không đồng nghĩa zero; confirmed_zero chỉ do xác nhận. Ghi tổng hợp kỳ với scope, khoảng thời gian, số tiền, loại full_total hoặc additional_only có chứng cứ. Full_total và chi tiết cùng phạm vi không được cộng trực tiếp: link chi tiết với tổng, báo phần chưa phân rã; nếu chi tiết vượt tổng hoặc kỳ chồng lấn chưa phân định, chặn kết luận tổng hợp, đưa vào danh sách cần xử lý. Không suy đoán tự động khoản dư là doanh thu bổ sung. Báo cáo tách confirmed, estimated, incomplete; khi dữ liệu quan trọng thiếu thì không hiển thị kết luận lợi nhuận toàn năm như con số hoàn chỉnh.

## 7. UX và báo cáo

Trang chủ: Cân lúa, Ghi bán tôm/cua, Ghi chi phí, Nhập sổ cũ, Quyết toán năm. Tab dữ liệu và thiết lập tách khỏi luồng ghi nhanh. Mobile: bàn phím số lớn, contrast cao, tự nhảy ô sau khi lưu, hiển thị bao vừa nhập, undo, cảnh báo mất mạng/đồng bộ/chưa sao lưu. Khi đầy bảng, mở bảng kế tiếp; không overwrite ô đầu. Desktop: lọc/sort/export, nhập theo lô, phân tích nhiều năm.

Dashboard: doanh thu đã ghi, chi phí đã ghi, lợi nhuận có điều kiện, thu/chi tiền, chênh lệch đối chiếu, tài sản ròng nếu đủ dữ liệu; lọc năm, đất, hoạt động và chất lượng. Biểu đồ không nối khoảng thiếu như thể có dữ liệu. Truy ngược điểm biểu đồ đến danh sách giao dịch, phiên bản và chứng từ. Bảng heatmap độ phủ chỉ dùng coverage đã xác nhận, không đoán mức đầy đủ dựa số giao dịch.

## 8. Kiến trúc kỹ thuật (PROPOSED; Work phải preflight)

React + TypeScript + Vite, PWA/service worker; IndexedDB/Dexie lưu bản ghi, outbox; PostgreSQL/Supabase là ứng viên backend, auth và private object storage; Recharts hoặc thư viện tương đương; Vitest và Playwright. Modular monolith; không microservices. Không phụ thuộc backend cụ thể trong calculation engine. Chốt phiên bản dependency sau kiểm tra tương thích, chi phí, giới hạn, license và khả năng chạy môi trường Work. Không cần dịch vụ AI hoặc subscription mới cho CP-001.

Offline: app shell cache, local transaction ghi bản ghi+outbox trước khi báo thành công; ID tạo client, server idempotency unique; retry backoff, ack, version check, conflict UI, tombstone/revision, không silent last-write-wins với số tiền và số cân. Hai thiết bị của cùng chủ vẫn có thể xung đột; phiên offline chưa đồng bộ không được coi là đã sao lưu; hiển thị thời điểm sync và backup. Test thoát app, reload, network fail, reconnect, retry. Không hứa hoạt động offline lần đầu chưa cài/tải, hay browser storage tồn tại khi người dùng xóa dữ liệu.

Security: owner-only access; kiểm tra server/RLS trên mọi bảng và storage, default deny, cấm anon đọc/ghi; không ship service role key; secrets qua env, .env.example không chứa bí mật; TLS; file private và kiểm tra loại/kích cỡ; log không chứa PII/số tài chính; không public dashboard hoặc link file dài hạn. Không tích hợp AI bên ngoài mặc định.

Backup: export portable JSON/CSV + manifest schema_version + ảnh gốc checksum SHA-256 + metadata; XLSX phục vụ người đọc nhưng không thay backup lossless. Tạo backup định kỳ/nhắc backup và trước migration; lưu ít nhất một bản độc lập nhà cung cấp. Đề xuất RPO cloud 24h, RTO 4h cho tập dữ liệu hộ gia đình, phải thử restore và ghi điều kiện. Dữ liệu offline chưa sync có rủi ro riêng, cần export local. Bảo vệ backup chứa thông tin tài chính. Migration versioned và có chiến lược rollback/restore đã thử.

## 9. Mục tiêu quy mô và hiệu năng (PROPOSED; chưa benchmark)

- Mục tiêu 50 năm lịch sử; dataset tổng hợp giả lập tối thiểu 1.000.000 dòng cân + 1.000.000 giao dịch + 10.000 metadata chứng từ; không coi đây là hạn mức cứng. Ảnh lưu object storage, không nhét blob vào bảng nghiệp vụ; dung lượng phụ thuộc kích cỡ, quota và ngân sách.
- Test tải nhiều cấp: 1k, 100k, 1M; không tải toàn bộ lịch sử vào browser. Server aggregate, index, keyset pagination, chunked imports, virtualization nếu cần. Không đồng bộ toàn bộ ảnh lên mọi thiết bị.
- Target local ghi cân p95 <=150ms (sau commit local); danh sách/report phổ biến p95 <=2s trên dataset đại diện, tổng hợp dài hạn p95 <=5s với môi trường benchmark ghi rõ. Target là đề xuất, chưa đo; báo median/p95, thiết bị, số bản ghi, cấu hình, trạng thái cache, lỗi. Không giả lập PASS.

## 10. Acceptance matrix

| ID | Test bắt buộc | Điều kiện PASS |
|---|---|---|
| A01 | CAL-01..12 và boundary/property tests | Kết quả xác định, không sai số tiền, không tràn số |
| A02 | 1.000 bao nhập liên tục; trang cuối không đầy | Không thiếu/trùng, tổng đúng, không overwrite |
| A03 | Mất mạng, tắt/reload, sync lặp, xung đột | Khôi phục local, không trùng, conflict hiển thị |
| A04 | Sửa/void phiếu đã chốt, đổi policy | Revision và audit đầy đủ, số lịch sử đúng |
| A05 | Bán, cọc, thu nhiều lần; mua chịu/trả; vay/trả gốc; chuyển nội bộ | Không nhân đôi doanh thu/chi phí, cân đối sổ |
| A06 | Tổng kỳ và chi tiết trùng; thiếu vs zero; ước tính | Không cộng đôi, nhãn/coverage đúng, không kết luận sai |
| A07 | Đất nhà/thuê, chi chung, phân bổ thiếu | Tổng mô hình đúng, phần chưa gán hiện rõ |
| A08 | Import hỏng, retry, batch rollback, export/import | Bảo toàn nguồn, kết quả tái lập và không trùng |
| A09 | Auth, RLS, storage và quyền anon | Không đọc/ghi được ngoài phạm vi, không lộ secret |
| A10 | Backup/restore sạch và kiểm tra checksum | Đủ dòng, quan hệ, revision, ảnh, tổng tiền; ghi RPO/RTO thực tế |
| A11 | Benchmark quy mô mục tiêu | Có số đo thật và giới hạn, không tự tuyên bố đạt |
| A12 | Điện thoại thật và một lần cân/đối chiếu sổ thật | Chủ dự án kiểm tra và xác nhận; không upload chứng từ nếu chưa cấp phép |

Chưa có test nào thực thi tại CP-000. Chỉ báo TESTED khi có lệnh/log/kết quả; VERIFIED khi Chat kiểm chứng bằng chứng; ACCEPTED chỉ sau chủ dự án xác nhận. Nếu công cụ/permission thiếu, ghi BLOCKED cho phần tương ứng.

## 11. Checkpoint roadmap — baseline Chat + Work

| CP | Phạm vi | Deliverable/gate |
|---|---|---|
| 000 | Project Foundation | Master spec, decision log, handoff; chờ owner |
| 001 | Technical Foundation | Preflight, ADR, schema v0, skeleton, toolchain, synthetic tests; không production |
| 002 | Calculation & Financial Engine | Policy, engine độc lập, CAL/A01/A05 test, data invariants |
| 003 | Rice Weighing | Nhập nhanh, bảng, nhóm, offline, sửa/chốt, phiếu; A02-A04 |
| 004 | Farm Records | Tôm/cua, chi phí, đất, thuê, coverage; A06-A07 |
| 005 | Family Finance | Tài khoản, thu/chi, nợ, tài sản, đối chiếu; A05 |
| 006 | Data Vault | Import/export, chứng từ, nguồn, dữ liệu thiếu; A08 |
| 007 | Analytics & Intelligence | Dashboard, quyết toán, drill-down; AI tùy chọn sau lõi |
| 008 | Production Readiness | Security, sync, backup/restore, tải lớn; A09-A11 |
| 009 | Family Acceptance | UAT dữ liệu thực đã cấp quyền, A12, owner acceptance |

Không bỏ qua gate trước khi production. Có thể chạy song song các task trong một CP khi không có phụ thuộc, nhưng không tự thay đổi scope đã duyệt. Chat điều phối và nghiệm thu bằng chứng; Work thực thi trong phiên và quyền thực tế. Không giả định Chat/Work tự chia sẻ file hay context; mỗi handoff kèm tài liệu. GitHub private là đề xuất, chưa xác nhận repo; local workspace cũng được cho prototype. Không dùng Codex.

## 12. Decision log và unresolved items

| ID | Trạng thái | Nội dung |
|---|---|---|
| D01 | CONFIRMED | Một gia đình, một người quản lý; không thương mại hóa |
| D02 | CONFIRMED | Lúa/tôm/cua chung đất, một vụ lúa cuối năm, có đất thuê/nhà |
| D03 | CONFIRMED | Chat + Work; không Codex |
| D04 | CONFIRMED | Dữ liệu lớn/dài hạn ưu tiên hơn nhiều người dùng |
| D05 | PROPOSED | PWA, modular monolith, Postgres, offline-first; cần ADR preflight |
| D06 | PROPOSED | Sổ bút toán cân đối, financial ledger độc lập từ UI |
| D07 | PROPOSED | Mục tiêu 1M + 1M bản ghi, 10k chứng từ, 50 năm; cần benchmark và chi phí |
| D08 | OPEN | Rounding policy, tie, thứ tự làm tròn; xác nhận trước giao dịch mới |
| D09 | OPEN | Quy đổi công đất, diện tích, thời hạn/giá thuê, kỳ sản xuất |
| D10 | OPEN | Thứ tự nhập thực tế/màu ô Cân Lúa v5; trạng thái thanh toán và độ phủ năm 2025 |
| D11 | OPEN | Repo/hosting/provider, ngân sách/quota, quyền Work, thiết bị kiểm thử |
| D12 | OPEN | Chính sách định giá/khấu hao, tồn kho, cách phân bổ chi chung; không cản skeleton |

CP-000 kết quả: SPECIFIED, chưa ACCEPTED. Chưa tạo repo, mã nguồn, DB, deploy hay sử dụng dữ liệu thật trên dịch vụ ngoài. Handoff CP-001 chỉ cho phép preflight và nền tảng local/sandbox; mọi hành động bên ngoài cần quyền và phê duyệt tương ứng.
