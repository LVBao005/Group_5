# 🚀 HƯỚNG DẪN NHANH - POS SIMULATOR

## Cài đặt và chạy trong 3 bước

### Bước 1: Đảm bảo backend đang chạy

Mở backend project và chạy Tomcat:

```bash
cd d:\LAB\Group_5\src\core_app\backend
mvn tomcat7:run
# hoặc deploy lên Tomcat server
```

Kiểm tra backend đang chạy tại: `http://localhost:8080/backend`

### Bước 2: Build simulator

Mở terminal/cmd tại thư mục simulator:

```bash
cd d:\LAB\Group_5\src\simulator
mvn clean package
```

**Lưu ý:** Cần có Maven và Java JDK 17+ đã cài đặt.

### Bước 3: Chạy simulator

**Cách đơn giản nhất (Windows):**

```bash
run.bat
```

**Hoặc sử dụng Maven:**

```bash
mvn exec:java
```

**Hoặc chạy trực tiếp JAR:**

```bash
java -jar target\pos-simulator-1.0-SNAPSHOT.jar
```

## 📋 Checklist trước khi chạy

- [ ] Java JDK 17+ đã cài đặt
- [ ] Maven đã cài đặt và trong PATH
- [ ] Backend server đang chạy (Tomcat)
- [ ] Database có dữ liệu inventory
- [ ] Port 8080 không bị conflict

## 🎯 Điều chỉnh cấu hình

### Thay đổi Backend URL

Nếu backend chạy ở URL khác (ví dụ: `http://localhost:8080/PharmacyWeb`):

```bash
java -jar target\pos-simulator-1.0-SNAPSHOT.jar http://localhost:8080/PharmacyWeb 1 1
```

### Thay đổi Branch ID hoặc Pharmacist ID

```bash
java -jar target\pos-simulator-1.0-SNAPSHOT.jar http://localhost:8080/backend 2 3
```

Format: `<backend-url> <branch-id> <pharmacist-id>`

## 📊 Theo dõi kết quả

### 1. Console Log

Simulator sẽ hiển thị log real-time:

```
[2026-02-26 14:30:15] [INFO] ═══ Request #1 ═══
[2026-02-26 14:30:15] [✓] Fetched 45 inventory items
[2026-02-26 14:30:15] [INFO] Checkout: Paracetamol 500mg x3 @ 5000.00 = 15000.00 VNĐ
[2026-02-26 14:30:16] [✓] Invoice created successfully! ID: 1234
```

### 2. Tomcat Log

Mở console của Tomcat để thấy request đến server:

```
POST /backend/api/invoices - 201 Created
```

### 3. Database

Kiểm tra database:

```sql
-- Xem invoices vừa tạo
SELECT * FROM invoices WHERE is_simulated = 1 ORDER BY invoice_date DESC LIMIT 10;

-- Xem inventory bị trừ
SELECT medicine_name, quantity_std FROM inventory WHERE branch_id = 1;

-- Xem statistics
SELECT COUNT(*) as total_simulated_invoices FROM invoices WHERE is_simulated = 1;
```

### 4. Dashboard (nếu có)

Mở frontend dashboard để thấy số liệu cập nhật real-time.

## ⚠️ Xử lý lỗi thường gặp

### Connection refused

```
[✗] Network error while fetching inventory: Connection refused
```

**Giải pháp:**
1. Kiểm tra backend có chạy không: `http://localhost:8080/backend/api/inventory?branchId=1`
2. Kiểm tra firewall
3. Thử URL khác nếu cần

### No inventory available

```
[⚠] No inventory available. Waiting 5 seconds...
```

**Giải pháp:**
1. Import dữ liệu mẫu vào database:
   ```bash
   cd d:\LAB\Group_5\src\core_app\CodeGenData
   # Chạy SQL file để import data
   ```

### Build failed

```
[ERROR] Failed to execute goal...
```

**Giải pháp:**
1. Kiểm tra Java version: `java -version` (cần >= 17)
2. Kiểm tra Maven version: `mvn -version` (cần >= 3.6)
3. Xóa folder `.m2\repository` và build lại

## 🛑 Dừng Simulator

Nhấn **Ctrl+C** trong console để dừng.

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:

1. **Log của simulator** (console output)
2. **Log của Tomcat** (catalina.out hoặc console)
3. **Database connection** (có connect được không)
4. **Network** (ping localhost, kiểm tra port)

---

**Happy Testing! 🎉**
