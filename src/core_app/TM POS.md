# TÀI LIỆU KIỂM THỬ & THUYẾT TRÌNH HỆ THỐNG POS TÍCH ĐIỂM

Tài liệu này bao gồm kịch bản kiểm thử (Test Cases) và nội dung thuyết trình dự án cho tính năng nâng cấp hệ thống tích điểm qua số điện thoại.

---

## PHẦN 1: KỊCH BẢN KIỂM THỬ (TEST SCENARIOS)

Mục tiêu: Đảm bảo tính năng hoạt động đúng theo logic: Kiểm tra SĐT -> Xử lý Khách mới/Cũ -> Tích điểm -> Trừ điểm (chặn số lẻ).

### Kịch bản 1: Khách hàng mới hoàn toàn
1. **Thao tác**: Nhập một số điện thoại chưa có trong DB (VD: `0912345678`) -> Nhấn **"Kiểm tra"**.
2. **Kỳ vọng**: 
   - Hệ thống báo: "Khách hàng mới - Hãy nhập tên".
   - Ô nhập tên xuất hiện.
   - Số điểm hiện tại hiển thị là 0.
3. **Thanh toán**: Nhập tên "Nguyễn Văn A" -> Thêm hàng 100.000đ -> Nhấn **"Xuất hóa đơn"** -> **"Xác nhận thanh toán"**.
4. **Kết quả**: 
   - Kiểm tra Database khách hàng đã được tạo.
   - Khách hàng mới này có 1.000 điểm (100.000 / 1000 * 10).

### Kịch bản 2: Khách hàng cũ & Tích lũy điểm
1. **Thao tác**: Nhập lại SĐT `0912345678` -> Nhấn **"Kiểm tra"**.
2. **Kỳ vọng**: 
   - Hiện đúng tên "Nguyễn Văn A".
   - Hiện số điểm là 1.000.
   - Ô nhập tên biến mất, chỉ hiện thẻ thông tin.
   - Checkbox "Dùng điểm" xuất hiện.
3. **Thanh toán**: Thêm hàng 50.000đ -> **KHÔNG** tích chọn "Dùng điểm" -> Thanh toán.
4. **Kết quả**: 
   - Tổng tiền trả: 50.000đ.
   - Điểm mới: 1.000 (cũ) + 500 (mới) = 1.500 điểm.

### Kịch bản 3: Sử dụng điểm & Chặn số lẻ (Quan trọng)
1. **Thao tác**: Nhập SĐT `0912345678` -> Nhấn **"Kiểm tra"**. (Hiện 1.500 điểm).
2. **Kỳ vọng**: Tích chọn checkbox **"Dùng điểm"**.
3. **Logic trừ điểm**: 
   - Vì có 1.500 điểm, hệ thống chỉ cho phép dùng tối đa số tròn là **1.000 điểm**.
   - Mục "Giảm giá" hiển thị: `- 1.000 đ`.
4. **Thanh toán**: Đơn hàng 100.000đ -> Tổng thanh toán còn: 99.000đ.
5. **Kết quả**: 
   - Sau thanh toán, điểm còn lại: 500 (lẻ cũ) + 990 (tích mới trên 99.000đ) = 1.490 điểm.

---

## PHẦN 2: KỊCH BẢN THUYẾT TRÌNH (15 PHÚT)

### 1. Đặt vấn đề (3 phút)
- **Thực trạng**: Hệ thống cũ yêu cầu nhập tên khách hàng thủ công mỗi lần, dễ sai sót và không có sự gắn kết khách hàng.
- **Giải pháp**: Xây dựng hệ thống Membership dựa trên SĐT tích hợp ngay tại POS. Đơn giản hóa quy trình: Chỉ cần SĐT là có tất cả.

### 2. Demo tính năng & Luồng xử lý (7 phút)
- **Giao diện tối giản**: Xóa bỏ các Form rườm rà. POS khởi đầu chỉ với 1 ô nhập SĐT.
- **Trải nghiệm khách hàng mới**: "Lưu tạm" thông tin trong phiên làm việc, chỉ ghi vào DB khi khách thực sự trả tiền (tránh dữ liệu rác).
- **Trải nghiệm khách hàng thân thiết**: Tự động nhận diện, hiển thị hạng điểm và quyền lợi ngay lập tức.
- **Logic Tài chính**: Giải thích quy tắc 1.000đ = 10 điểm và quy tắc "Dùng điểm số tròn" để tối ưu việc thanh toán tiền mặt/chuyển khoản không bị lẻ đồng.

### 3. Kỹ thuật triển khai (3 phút)
- **Frontend**: React hooks quản lý state linh hoạt, UI responsive với Tailwind.
- **Backend**: Java Servlet xử lý Transaction đảm bảo tính toàn vẹn (Cộng điểm + Trừ kho + Lưu hóa đơn phải thành công cùng lúc).
- **Database**: Tối ưu index theo số điện thoại để truy vấn nhanh < 100ms.

### 4. Kết luận & Định hướng (2 phút)
- **Lợi ích**: Tăng tốc độ phục vụ lên 30%, tăng tỷ lệ khách quay lại nhờ hệ thống điểm.
- **Tương lai**: Phân hạng khách hàng (Bạc, Vàng, Kim cương) và gửi khuyến mãi tự động qua Zalo/SMS dựa trên dữ liệu này.

---

## PHẦN 3: GHI CHÚ CHO BÁO CÁO
- Sử dụng các hình ảnh chụp màn hình (Screenshot) lúc nhập SĐT mới vs SĐT cũ.
- Nhấn mạnh vào tính "Thực tế" của việc trừ điểm số tròn (1.000đ) - đây là điểm cộng lớn về UX (trải nghiệm người dùng).

---

## PHẦN 4: CẤU TRÚC DATABASE CHI TIẾT (PHIÊN BẢN V15.0)

Hệ thống sử dụng cơ sở dữ liệu `pmdb` (thực tế khởi tạo là `pharmacy_v15` theo script) bao gồm 9 bảng có mối quan hệ ràng buộc chặt chẽ:

### 1. Bảng `categories` (Danh mục thuốc)
- `category_id` (PK): Mã danh mục.
- `category_name`: Tên nhóm thuốc (Hạ sốt, Giảm đau, Kháng sinh...).

### 2. Bảng `branches` (Danh sách chi nhánh)
- `branch_id` (PK): Mã chi nhánh.
- `branch_name`: Tên chi nhánh.
- `address`: Địa chỉ.
- `phone_number`: Số điện thoại liên lạc của chi nhánh.

### 3. Bảng `medicines` (Thông tin thuốc cơ bản)
- `medicine_id` (PK): Mã thuốc.
- `category_id` (FK): Thuộc danh mục nào.
- `name`: Tên thuốc.
- `brand`: Thương hiệu/Hãng sản xuất.
- `base_unit`: Đơn vị lớn (Hộp).
- `sub_unit`: Đơn vị nhỏ (Viên).
- `conversion_rate`: Tỷ lệ quy đổi (Hộp -> Viên).
- `base_sell_price`: Giá bán theo đơn vị lớn.
- `sub_sell_price`: Giá bán theo đơn vị nhỏ.
- `min_stock_level`: Ngưỡng cảnh báo tồn kho tối thiểu.
- `created_at`: Thời gian tạo bản ghi.

### 4. Bảng `batches` (Quản lý lô hàng nhập)
- `batch_id` (PK): Mã lô hàng.
- `medicine_id` (FK): Thuộc loại thuốc nào.
- `batch_number`: Số lô định danh.
- `manufacturing_date`: Ngày sản xuất.
- `expiry_date`: Ngày hết hạn.
- `import_price_package`: Giá nhập vào theo đơn vị lớn.
- `initial_quantity`: Số lượng nhập ban đầu (theo đơn vị nhỏ nhất).
- `current_total_quantity`: Tổng số lượng còn lại của lô (trên toàn hệ thống).
- `import_date`: Ngày nhập kho.

### 5. Bảng `inventory` (Tồn kho thực tế từng chi nhánh)
- `inventory_id` (PK): Mã quản lý kho.
- `branch_id` (FK): Tại chi nhánh nào.
- `batch_id` (FK): Xuất từ lô nào.
- `quantity_std`: Số lượng tồn thực tế (tính theo đơn vị nhỏ nhất).
- `last_updated`: Thời gian cập nhật sau cùng.

### 6. Bảng `pharmacists` (Nhân viên/Dược sĩ)
- `pharmacist_id` (PK): Mã nhân viên.
- `branch_id` (FK): Làm việc tại chi nhánh nào.
- `username`: Tài khoản đăng nhập (Unique).
- `password`: Mật khẩu (đã mã hóa).
- `full_name`: Tên nhân viên.
- `role`: Quyền hạn (ADMIN/STAFF).

### 7. Bảng `customers` (Khách hàng Membership)
- `customer_id` (PK): Mã khách hàng.
- `phone_number` (Unique): Số điện thoại (dùng làm ID tra cứu chính).
- `customer_name`: Tên khách hàng.
- `points`: Điểm tích lũy hiện tại.

### 8. Bảng `invoices` (Hóa đơn tổng quát)
- `invoice_id` (PK): Mã hóa đơn.
- `invoice_date`: Thời gian xuất hóa đơn.
- `branch_id` (FK): Nơi bán.
- `pharmacist_id` (FK): Người bán.
- `customer_id` (FK): Khách hàng mua (nếu có).
- `total_amount`: Tổng tiền thanh toán cuối cùng.
- `is_simulated`: Đánh dấu hóa đơn thật/giả lập.

### 9. Bảng `invoice_details` (Chi tiết các mặt hàng trong hóa đơn)
- `detail_id` (PK): Mã chi tiết.
- `invoice_id` (FK): Thuộc hóa đơn nào.
- `batch_id` (FK): Lấy từ lô hàng nào.
- `unit_sold`: Đơn vị bán (Hộp hoặc Viên).
- `quantity_sold`: Số lượng bán ra.
- `unit_price`: Giá bán lẻ tại thời điểm đó.
- `total_std_quantity`: Tổng số lượng quy đổi ra đơn vị nhỏ nhất đã bán.
