# Thông Tin Database

## ⚠️ QUAN TRỌNG - DATABASE ĐANG SỬ DỤNG

**File database chính thức:** `Pharmacy_V15_Data_Final.sql`

- Đường dẫn: `Pharmacy_V15_Data_Final.sql`
- Đây là phiên bản database mới nhất (V15) với các ràng buộc dữ liệu chặt chẽ (Strict Constraints)
- **KHÔNG SỬ DỤNG** các file SQL khác trong thư mục CodeGenData


## Hướng dẫn truy xuất MySQL
Hướng dẫn truy xuất MySQL từ Terminal (CMD)Khi bạn đã cấu hình xong biến môi trường (Environment Variables), bạn có thể đứng tại bất kỳ thư mục nào (như D:\GitHub\Group_5\...) để truy xuất dữ liệu.1. Đăng nhập vào MySQL ServerMở CMD và nhập lệnh sau:Bashmysql -u root -p
Sau đó nhập mật khẩu 123456 khi được yêu cầu.2. Truy vấn dữ liệu với tiền tố pmdb.Để đảm bảo truy xuất đúng dữ liệu của dự án mà không cần chuyển đổi database, hãy luôn thêm pmdb. trước tên bảng trong các câu lệnh SQL:A. Xem toàn bộ danh sách dược sĩSQLSELECT * FROM pmdb.pharmacists;
B. Tìm kiếm dược sĩ theo vai trò (Role)Nếu bạn muốn lọc ra các tài khoản có quyền quản trị:SQLSELECT * FROM pmdb.pharmacists WHERE role = 'ADMIN';
C. Kiểm tra cấu trúc của bảngĐể biết bảng pharmacists trong pmdb có những cột nào và kiểu dữ liệu gì:SQLDESCRIBE pmdb.pharmacists;
D. Đếm tổng số nhân viên trong hệ thốngSQLSELECT COUNT(*) AS tong_nhan_vien FROM pmdb.pharmacists;
3. Các lệnh quản lý Database (Luôn dùng pmdb)Mục tiêuCâu lệnh SQLXem danh sách bảngSHOW TABLES FROM pmdb;Tìm dược sĩ theo IDSELECT * FROM pmdb.pharmacists WHERE pharmacist_id = 1;Lọc theo tênSELECT * FROM pmdb.pharmacists WHERE full_name LIKE '%Nguyễn%';💡 Lưu ý về lỗi Character Set (Tiếng Việt)Như bạn thấy lúc nãy, MySQL có báo lỗi Unknown OS character set 'cp1258'. Để hiển thị tên tiếng Việt (như Nguyễn Quốc Yến) đẹp hơn trong CMD, sau khi đăng nhập thành công, bạn nên gõ thêm lệnh này trước khi SELECT:SQLSET NAMES utf8mb4;
SELECT * FROM pmdb.pharmacists;
Mẹo nhỏ: Việc luôn viết pmdb.tablename giúp bạn tránh được lỗi "No database selected" (chưa chọn database) – một lỗi cực kỳ phổ biến khi mới làm quen với MySQL trên Terminal.
