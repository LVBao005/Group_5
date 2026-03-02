## Xem cấu trúc rồi mới hướng dẫn truy xuất database bằng cmd: CẤU TRÚC DATABASE CHI TIẾT (PHIÊN BẢN V15.0)

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

## Hướng dẫn truy xuất MySQL
Hướng dẫn truy xuất MySQL từ Terminal (CMD)Khi bạn đã cấu hình xong biến môi trường (Environment Variables), bạn có thể đứng tại bất kỳ thư mục nào (như D:\GitHub\Group_5\...) để truy xuất dữ liệu.1. Đăng nhập vào MySQL ServerMở CMD và nhập lệnh sau:Bashmysql -u root -p
Sau đó nhập mật khẩu 123456 khi được yêu cầu.2. Truy vấn dữ liệu với tiền tố pmdb.Để đảm bảo truy xuất đúng dữ liệu của dự án mà không cần chuyển đổi database, hãy luôn thêm pmdb. trước tên bảng trong các câu lệnh SQL:A. Xem toàn bộ danh sách dược sĩSQLSELECT * FROM pmdb.pharmacists;
B. Tìm kiếm dược sĩ theo vai trò (Role)Nếu bạn muốn lọc ra các tài khoản có quyền quản trị:SQLSELECT * FROM pmdb.pharmacists WHERE role = 'ADMIN';
C. Kiểm tra cấu trúc của bảngĐể biết bảng pharmacists trong pmdb có những cột nào và kiểu dữ liệu gì:SQLDESCRIBE pmdb.pharmacists;
D. Đếm tổng số nhân viên trong hệ thốngSQLSELECT COUNT(*) AS tong_nhan_vien FROM pmdb.pharmacists;
3. Các lệnh quản lý Database (Luôn dùng pmdb)Mục tiêuCâu lệnh SQLXem danh sách bảngSHOW TABLES FROM pmdb;Tìm dược sĩ theo IDSELECT * FROM pmdb.pharmacists WHERE pharmacist_id = 1;Lọc theo tênSELECT * FROM pmdb.pharmacists WHERE full_name LIKE '%Nguyễn%';💡 Lưu ý về lỗi Character Set (Tiếng Việt)Như bạn thấy lúc nãy, MySQL có báo lỗi Unknown OS character set 'cp1258'. Để hiển thị tên tiếng Việt (như Nguyễn Quốc Yến) đẹp hơn trong CMD, sau khi đăng nhập thành công, bạn nên gõ thêm lệnh này trước khi SELECT:SQLSET NAMES utf8mb4;
SELECT * FROM pmdb.pharmacists;
Mẹo nhỏ: Việc luôn viết pmdb.tablename giúp bạn tránh được lỗi "No database selected" (chưa chọn database) – một lỗi cực kỳ phổ biến khi mới làm quen với MySQL trên Terminal.