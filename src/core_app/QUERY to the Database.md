## Xem cấu trúc rồi mới hướng dẫn truy xuất database bằng cmd: CẤU TRÚC DATABASE CHI TIẾT (PHIÊN BẢN V15.0)

Hệ thống sử dụng cơ sở dữ liệu `pmdb`

Hệ thống bao gồm 10 bảng có mối quan hệ ràng buộc chặt chẽ để đảm bảo tính toàn vẹn dữ liệu:

1. Bảng categories (Danh mục thuốc)
category_id (PK): Mã danh mục.

category_name: Tên nhóm thuốc (Hạ sốt, Giảm đau, Kháng sinh...).

2. Bảng branches (Danh sách chi nhánh)
branch_id (PK): Mã chi nhánh.

branch_name: Tên chi nhánh.

address: Địa chỉ chi nhánh.

is_active: Trạng thái hoạt động (Dùng để đóng/mở chi nhánh mà không mất dữ liệu lịch sử).

3. Bảng medicines (Thông tin thuốc cơ bản)
medicine_id (PK): Mã thuốc.

category_id (FK): Thuộc danh mục nào.

name: Tên thuốc.

brand: Hãng sản xuất.

base_unit: Đơn vị lớn (Hộp).

sub_unit: Đơn vị nhỏ (Viên).

conversion_rate: Tỷ lệ quy đổi (1 Hộp = x Viên).

base_sell_price: Giá bán theo đơn vị lớn.

sub_sell_price: Giá bán theo đơn vị nhỏ.

min_stock_level: Ngưỡng cảnh báo tồn kho tối thiểu (Dùng cho Dashboard).

is_active: Trạng thái kinh doanh (Cho phép ngừng bán một loại thuốc).

4. Bảng batches (Quản lý lô hàng nhập)
batch_id (PK): Mã lô hàng duy nhất.

medicine_id (FK): Thuộc loại thuốc nào.

batch_number: Số lô định danh (In trên bao bì).

manufacturing_date: Ngày sản xuất.

expiry_date: Ngày hết hạn (Dùng để Dashboard cảnh báo thuốc sắp hết hạn).

import_price_package: Giá nhập vào theo đơn vị lớn.

current_total_quantity: Tổng số lượng còn lại của lô này trên toàn hệ thống (đơn vị nhỏ nhất).

5. Bảng inventory (Tồn kho thực tế từng chi nhánh)
inventory_id (PK): Mã quản lý tồn kho.

branch_id (FK): Tại chi nhánh nào.

batch_id (FK): Thuộc lô hàng nào.

quantity_std: Số lượng tồn thực tế tại chi nhánh đó (tính theo đơn vị nhỏ nhất).

last_updated: Thời gian cập nhật sau cùng.

6. Bảng pharmacists (Dược sĩ/Nhân viên)
pharmacist_id (PK): Mã nhân viên.

branch_id (FK): Làm việc tại chi nhánh nào.

username: Tài khoản đăng nhập.

password: Mật khẩu (mã hóa).

full_name: Tên nhân viên.

is_active: Trạng thái làm việc (Tránh xóa nhân viên đã từng bán hàng).

7. Bảng customers (Khách hàng Membership)
customer_id (PK): Mã khách hàng.

phone_number (Unique): Số điện thoại (Dùng làm ID tra cứu chính tại quầy).

customer_name: Tên khách hàng.

points: Điểm tích lũy hiện tại (Ví tiền ảo của khách).

8. Bảng invoices (Hóa đơn tổng quát)
invoice_id (PK): Mã hóa đơn.

invoice_date: Thời gian xuất hóa đơn.

branch_id (FK): Nơi bán.

pharmacist_id (FK): Người bán.

customer_id (FK/Null): Khách hàng (Nếu có).

sub_total: Tổng tiền hàng (Giá gốc khi chưa dùng điểm).

discount_amount: Số tiền giảm (Giá trị quy đổi từ điểm đã dùng).

total_amount: Số tiền thực thu (= sub_total - discount_amount).

points_redeemed: Số điểm khách đã tiêu cho đơn này.

points_earned: Số điểm khách nhận được thêm từ đơn này.

is_simulated: Đánh dấu đơn hàng từ Simulator.

9. Bảng invoice_details (Chi tiết mặt hàng trong hóa đơn)
detail_id (PK): Mã chi tiết.

invoice_id (FK): Thuộc hóa đơn nào.

batch_id (FK): Lấy từ lô hàng nào (Đảm bảo đúng logic FIFO).

quantity_sold: Số lượng bán ra (theo đơn vị nhỏ nhất).

unit_price: Giá bán thực tế tại thời điểm đó.

10. Bảng stock_movements (Nhật ký biến động kho)
movement_id (PK): Mã nhật ký.

inventory_id (FK): Tác động vào dòng kho nào.

type: Loại biến động (BÁN HÀNG, NHẬP HÀNG, ĐIỀU CHỈNH).

quantity_change: Số lượng thay đổi (Âm nếu bán, Dương nếu nhập).

created_at: Thời gian xảy ra.

## Hướng dẫn truy xuất MySQL
Hướng dẫn truy xuất MySQL từ Terminal (CMD)Khi bạn đã cấu hình xong biến môi trường (Environment Variables), bạn có thể đứng tại bất kỳ thư mục nào (như D:\GitHub\Group_5\...) để truy xuất dữ liệu.1. Đăng nhập vào MySQL ServerMở CMD và nhập lệnh sau:Bashmysql -u root -p
Sau đó nhập mật khẩu 123456 khi được yêu cầu.2. Truy vấn dữ liệu với tiền tố pmdb.Để đảm bảo truy xuất đúng dữ liệu của dự án mà không cần chuyển đổi database, hãy luôn thêm pmdb. trước tên bảng trong các câu lệnh SQL:A. Xem toàn bộ danh sách dược sĩSQLSELECT * FROM pmdb.pharmacists;
B. Tìm kiếm dược sĩ theo vai trò (Role)Nếu bạn muốn lọc ra các tài khoản có quyền quản trị:SQLSELECT * FROM pmdb.pharmacists WHERE role = 'ADMIN';
C. Kiểm tra cấu trúc của bảngĐể biết bảng pharmacists trong pmdb có những cột nào và kiểu dữ liệu gì:SQLDESCRIBE pmdb.pharmacists;
D. Đếm tổng số nhân viên trong hệ thốngSQLSELECT COUNT(*) AS tong_nhan_vien FROM pmdb.pharmacists;
3. Các lệnh quản lý Database (Luôn dùng pmdb)Mục tiêuCâu lệnh SQLXem danh sách bảngSHOW TABLES FROM pmdb;Tìm dược sĩ theo IDSELECT * FROM pmdb.pharmacists WHERE pharmacist_id = 1;Lọc theo tênSELECT * FROM pmdb.pharmacists WHERE full_name LIKE '%Nguyễn%';💡 Lưu ý về lỗi Character Set (Tiếng Việt)Như bạn thấy lúc nãy, MySQL có báo lỗi Unknown OS character set 'cp1258'. Để hiển thị tên tiếng Việt (như Nguyễn Quốc Yến) đẹp hơn trong CMD, sau khi đăng nhập thành công, bạn nên gõ thêm lệnh này trước khi SELECT:SQLSET NAMES utf8mb4;
SELECT * FROM pmdb.pharmacists;
Mẹo nhỏ: Việc luôn viết pmdb.tablename giúp bạn tránh được lỗi "No database selected" (chưa chọn database) – một lỗi cực kỳ phổ biến khi mới làm quen với MySQL trên Terminal.