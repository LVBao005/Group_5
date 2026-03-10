Dưới đây là bản Memory (Bối cảnh dự án) được thiết kế để bạn cung cấp cho AI Agent, kèm theo Kế hoạch chia nhỏ lộ trình để bạn dễ dàng kiểm soát chất lượng và "vấn đáp" với giảng viên sau này.

## PHẦN 1: MEMORY CHO AGENT (Dán vào Prompt đầu tiên)
CONTEXT: LAB211 PROJECT - ENTERPRISE SIMULATION SYSTEM

Topic: Pharmacy Chain Management (Quản lý chuỗi nhà thuốc).

Tech Stack: Java Web (Servlet/JSP), Server Apache Tomcat, Database Local (MySQL/PostgreSQL), HTML/CSS/JS.

Architecture:

Project A (Server): Java Web App xử lý Logic nghiệp vụ, CRUD, Dashboard và API Endpoints.

Project B (Simulator): Java Console/Desktop App giả lập hàng nghìn giao dịch POS gửi tới Project A qua HTTP Request.

Key Constraints:

Quản lý kho theo FIFO (Nhập trước xuất trước) và theo Batch (Lô hàng/Hạn sử dụng).

Phải xử lý ETL: Migrate >10.000 dòng từ CSV vào Database sạch.

Concurrency: Xử lý đồng bộ (Synchronization) khi Simulator bắn request liên tục để tránh sai lệch tồn kho.

Role of AI: Trợ lý viết code (Co-pilot). Mọi đoạn code phức tạp cần giải thích logic để sinh viên lưu vào AI Log.

Goal: Hoàn thành trong 10 tuần, đảm bảo hệ thống chịu tải tốt và Dashboard báo cáo chính xác.

## PHẦN 2: LỘ TRÌNH CHIA NHỎ (BACKLOG)
Tôi đã chia dự án thành 5 Giai đoạn chính để bạn giao việc cho Agent và kiểm tra dần:

### Giai đoạn 1: Database & ETL (Tuần 1-4)
Task 1.1: Thiết kế ERD (Bảng Thuốc, Lô hàng, Nhân viên, Khách hàng, Hóa đơn). Lưu ý: Bảng Lô hàng cần có ngày nhập, ngày hết hạn để làm FIFO.

Task 1.2: Tạo dữ liệu mẫu CSV (>10.000 dòng) về thuốc và lịch sử nhập kho.

Task 1.3: Viết module Java Core để đọc CSV, chuẩn hóa dữ liệu (xử lý lỗi định dạng, ngày tháng) và Import vào DB.

Check: Database đã có dữ liệu sạch chưa? Query thử 10.000 dòng mất bao lâu?

### Giai đoạn 2: Web Core & CRUD (Tuần 5)
Task 2.1: Setup cấu trúc Project A (MVC: Controller - Servlet, Model - DAO, View - JSP).

Task 2.2: Làm chức năng Đăng nhập và Quản lý danh mục Thuốc/Nhân viên.

Task 2.3: Kết nối Connection Pool (HikariCP hoặc BasicDataSource) để tối ưu kết nối DB.

### Giai đoạn 3: Business Logic & Simulator (Tuần 6-7)
Task 3.1 (Nghiệp vụ khó): Viết logic Bán hàng. Khi bán 1 loại thuốc, hệ thống tự động trừ tồn kho ở Lô có hạn sử dụng gần nhất trước (FIFO).

Task 3.2 (Project B): Viết ứng dụng Java Console sử dụng HttpClient. Tạo vòng lặp gửi hàng loạt POST request chứa thông tin đơn hàng đến Servlet của Project A.

Task 3.3: Xử lý synchronized hoặc Database Transaction để đảm bảo khi 2 máy POS cùng bán 1 hộp thuốc cuối cùng thì không bị âm kho.

### Giai đoạn 4: Stress Test & Optimization (Tuần 8)
Task 4.1: Chạy Simulator với cường độ tăng dần (10, 50, 100 requests/giây).

Task 4.2: Kiểm tra Tomcat Log. Nếu bị treo hoặc lỗi DB, tối ưu lại Index SQL hoặc dùng Thread Pool.

### Giai đoạn 5: Dashboard & Finalizing (Tuần 9-10)
Task 5.1: Dùng Chart.js để vẽ biểu đồ: Top thuốc bán chạy, Doanh thu theo ngày, Cảnh báo thuốc sắp hết hạn.

Task 5.2: Tổng hợp AI Log từ các đoạn hội thoại trước đó.

Task 5.3: Đóng gói file .war và chuẩn bị kịch bản Demo.