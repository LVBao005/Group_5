# Backend - Group 5

Dự án Java Web (JSP/Servlet) cho Group 5.

## Cấu trúc thư mục

- `src/main/java/controller`: Xử lý HTTP requests.
- `src/main/java/dao`: Data Access Object (Truy xuất DB).
- `src/main/java/model`: Các thực thể (Entities/POJOs).
- `src/main/java/service`: Xử lý logic nghiệp vụ.
- `src/main/java/filter`: Bộ lọc (Authentication, Logging).
- `src/main/java/utils`: Các class tiện ích.
- `src/main/webapp`: Chứa `WEB-INF/web.xml` và các file tĩnh (nếu có).

## Cấu hình hệ thống

- **Hỗ trợ Tiếng Việt**: Sử dụng `CharacterEncodingFilter` để ép kiểu UTF-8 cho toàn bộ request/response.
- **CORS**: `CorsFilter` cho phép Frontend (React) từ `http://localhost:5173` gọi API.
- **Database**: `DBContext` cung cấp kết nối JDBC tới MySQL (Tên DB mặc định: `pharmacy_db`).
- **Namespace**: Đã chuyển sang `jakarta.servlet` (Tiêu chuẩn Jakarta EE 10 cho Tomcat 10).

## Công nghệ sử dụng
- Java 17
- Jakarta Servlet API 6.0
- Maven
- MySQL Connector/J 8.2.0
- Lombok
- Gson 2.10.1 (JSON handling)
