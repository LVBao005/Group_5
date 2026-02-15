# TÀI LIỆU THUYẾT MINH DỰ ÁN: PHARMAPOS
=======================================

## 1. TỔNG QUAN DỰ ÁN
**PharmaPOS** là hệ thống quản lý bán thuốc và kho dược phẩm hiện đại, được thiết kế với giao diện cao cấp (Premium Dark Mode) và tập trung vào trải nghiệm người dùng (UX). Hệ thống hỗ trợ đắc lực cho dược sĩ trong việc quản lý tồn kho, bán hàng và theo dõi hiệu quả kinh doanh.

---

## 2. KIẾN TRÚC CÔNG NGHỆ (TECH STACK)

### 2.1. Frontend (Single Page Application - SPA)
*   **Framework:** React 18 (Vite)
*   **Styling:** Tailwind CSS (Modern aesthetics, glassmorphism)
*   **Icons:** Lucide React
*   **Biểu đồ:** Recharts (Dùng cho Dashboard)
*   **Kết nối API:** Axios
*   **Điều hướng:** React Router DOM v6
*   **Utility:** clsx, tailwind-merge (Quản lý class CSS linh hoạt)

### 2.2. Backend (RESTful API Service)
*   **Ngôn ngữ:** Java 17
*   **Server:** Jakarta Servlet API 6.0 (Chạy trên Tomcat 10.1+)
*   **Xử lý JSON:** Google Gson
*   **Cơ sở dữ liệu:** MySQL 8.x
*   **Kết nối DB:** JDBC với hệ thống quản lý Connection chuyên biệt
*   **Tiện ích:** Project Lombok (Giúp code gọn hơn)

---

## 3. CÁC TÍNH NĂNG CỐT LÕI

### 3.1. Quản lý Quyền Truy Cập (RBAC)
*   **Phân quyền (ADMIN & STAFF):** 
    *   **ADMIN:** Toàn quyền truy cập Dashboard, Kho thuốc (Inventory), Bán hàng (POS) và Hóa đơn.
    *   **STAFF:** Chỉ được phép truy cập POS và Hóa đơn.
*   **Bảo mật 2 lớp:**
    *   **Frontend:** `ProtectedRoute` kiểm tra role trong `localStorage` và điều hướng người dùng. Sidebar tự động ẩn các mục không thuộc quyền hạn.
    *   **Backend:** Kiểm tra `HttpSession` và `Role` ngay tại Servlet (Trả về 401/403 nếu không hợp lệ).

### 3.2. Hệ thống Bán hàng (POS)
*   **Giỏ hàng thông minh:** Hỗ trợ chọn đơn vị tính (Hộp/Viên) với tỷ lệ quy đổi tự động.
*   **Tính toán tồn kho FIFO:** Tự động trừ tồn kho từ các lô thuốc (Batch) có hạn sử dụng gần nhất trước.
*   **Giao diện tối ưu:** Thanh toán nổi bật, hiển thị tổng tiền rõ ràng, trạng thái giỏ hàng sinh động.

### 3.3. Quản lý Kho & Lô Thuốc (Inventory)
*   **Quản lý theo lô:** Theo dõi hạn sử dụng, số lô, giá nhập và số lượng tồn kho theo đơn vị chuẩn.
*   **Cảnh báo thông minh:** Hiển thị nổi bật các sản phẩm sắp hết hàng hoặc sắp hết hạn.
*   **Giao dịch an toàn:** Sử dụng `setAutoCommit(false)` để đảm bảo tính toàn vẹn dữ liệu khi bán hàng hoặc nhập kho.

### 3.4. Báo cáo & Thống kê (Dashboard)
*   **Timeline Doanh thu:** Theo dõi doanh biểu đồ ngày, tuần, tháng qua charts trực quan.
*   **Thống kê nhanh:** Tổng doanh thu, đơn hàng, khách hàng và danh sách nhắc nhở hạn dùng thuốc.

---

## 4. CẤU TRÚC THƯ MỤC CHÍNH

### Frontend (`/frontend`)
*   `src/pages/`: Chứa các trang chính (POS, Inventory, Dashboard, Invoices).
*   `src/components/`: Chứa các thành phần dùng chung (Sidebar, ProtectedRoute).
*   `src/services/`: Quản lý các hàm gọi API (Axios instance).

### Backend (`/backend`)
*   `src/main/java/controller/`: Chứa các Servlets (API Endpoints).
*   `src/main/java/dao/`: Chứa các lớp truy xuất dữ liệu (Data Access Objects).
*   `src/main/java/model/`: Định nghĩa các thực thể (Entity classes).
*   `src/main/java/utils/`: Chứa cấu hình DBContext.

---

## 5. ĐIỂM NỔI BẬT VỀ KỸ THUẬT
1.  **Giao diện Premium:** Sử dụng bảng màu Anthracite/Neon Green mang lại cảm giác chuyên nghiệp.
2.  **Xử lý Logic phức tạp tại Backend:** Tính toán lô hàng FIFO đảm bảo dược phẩm không bị hết hạn phí.
3.  **Tối ưu Trải nghiệm:** Phản hồi UI tức thì (Optimistic updates) và cơ chế phân trang mượt mà.
