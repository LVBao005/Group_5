# Pharmacy POS Simulator

🏥 **Mô phỏng máy POS của nhà thuốc** - Giả lập việc tạo đơn hàng liên tục để test hệ thống trừ kho real-time.

## 📋 Mô tả

Project này là một Java Console Application sử dụng Maven, mô phỏng một máy POS (Point of Sale) của nhà thuốc. Ứng dụng sẽ liên tục gửi các yêu cầu checkout đến backend của bạn, giúp demo việc:

- ✅ Dữ liệu đổ về server liên tục
- ✅ Trừ kho trong database theo thời gian thực
- ✅ Test hiệu năng và xử lý đồng thời
- ✅ Monitor logs trên Tomcat

## 🚀 Tính năng

- **Tự động lấy danh sách thuốc** từ inventory API
- **Chọn ngẫu nhiên thuốc và số lượng** (1-5 đơn vị)
- **Gửi request đến API checkout** với dữ liệu JSON
- **Nghỉ 2-3 giây** giữa mỗi request để dễ theo dõi
- **Thống kê real-time**: Success/Error count
- **Logging chi tiết** với timestamp
- **Interactive mode** hoặc command-line arguments

## 🛠️ Công nghệ sử dụng

- **Java 17**
- **Maven** - Quản lý dependencies
- **Apache HttpClient 5** - Gửi HTTP requests
- **Gson** - Xử lý JSON

## 📦 Cấu trúc Project

```
simulator/
├── pom.xml
├── README.md
├── run.bat (Windows)
└── src/
    └── main/
        └── java/
            └── com/
                └── pharmacy/
                    └── simulator/
                        ├── PosSimulator.java (Main class)
                        └── model/
                            ├── InventoryItem.java
                            ├── InventoryResponse.java
                            ├── CheckoutRequest.java
                            ├── CheckoutResponse.java
                            └── InvoiceDetailRequest.java
```

## 📥 Cài đặt

### Yêu cầu hệ thống

- Java JDK 17 hoặc cao hơn
- Maven 3.6+
- Backend server đang chạy (Tomcat)

### Bước 1: Compile project

```bash
cd simulator
mvn clean package
```

Lệnh này sẽ:
- Download tất cả dependencies
- Compile source code
- Tạo file JAR executable ở `target/pos-simulator-1.0-SNAPSHOT.jar`

## 🎮 Cách sử dụng

### Cách 1: Run trực tiếp với Maven (Khuyến nghị cho development)

```bash
mvn exec:java
```

### Cách 2: Run file JAR

```bash
java -jar target/pos-simulator-1.0-SNAPSHOT.jar
```

### Cách 3: Sử dụng batch file (Windows)

```bash
run.bat
```

### Cách 4: Run với custom parameters

```bash
java -jar target/pos-simulator-1.0-SNAPSHOT.jar <backend-url> <branch-id> <pharmacist-id>
```

**Ví dụ:**
```bash
java -jar target/pos-simulator-1.0-SNAPSHOT.jar http://localhost:8080/backend 1 1
```

## ⚙️ Cấu hình

### Mặc định

- **Backend URL**: `http://localhost:8080/backend`
- **Branch ID**: `1`
- **Pharmacist ID**: `1`
- **Quantity Range**: `1-5` (ngẫu nhiên)
- **Sleep Time**: `2000-3000ms` giữa mỗi request

### Thay đổi cấu hình

#### Trong code (PosSimulator.java)

```java
private static final String DEFAULT_BASE_URL = "http://localhost:8080/backend";
private static final int DEFAULT_BRANCH_ID = 1;
private static final int DEFAULT_PHARMACIST_ID = 1;
private static final int MIN_QUANTITY = 1;
private static final int MAX_QUANTITY = 5;
private static final int MIN_SLEEP_MS = 2000;
private static final int MAX_SLEEP_MS = 3000;
```

#### Qua command line

```bash
java -jar target/pos-simulator-1.0-SNAPSHOT.jar http://192.168.1.100:8080/PharmacyWeb 2 3
```

#### Interactive mode

Nếu không truyền arguments, chương trình sẽ hỏi bạn nhập:

```
═══════════════════════════════════════════════════════════════
   PHARMACY POS SIMULATOR - CONFIGURATION
═══════════════════════════════════════════════════════════════
Enter Backend URL [http://localhost:8080/backend]: 
Enter Branch ID [1]: 
Enter Pharmacist ID [1]: 
```

## 📊 Output mẫu

```
═══════════════════════════════════════════════════════════════
   PHARMACY POS SIMULATOR - STARTING
═══════════════════════════════════════════════════════════════
Backend URL:    http://localhost:8080/backend
Branch ID:      1
Pharmacist ID:  1
═══════════════════════════════════════════════════════════════
Simulator will continuously send checkout requests...
Press Ctrl+C to stop

[2026-02-26 14:30:15] [INFO] ═══ Request #1 ═══
[2026-02-26 14:30:15] [✓] Fetched 45 inventory items
[2026-02-26 14:30:15] [INFO] Checkout: Paracetamol 500mg x3 @ 5000.00 = 15000.00 VNĐ
[2026-02-26 14:30:16] [✓] Invoice created successfully! ID: 1234
[2026-02-26 14:30:16] [INFO] Statistics: Success=1, Error=0, Total=1

[2026-02-26 14:30:18] [INFO] ═══ Request #2 ═══
[2026-02-26 14:30:18] [✓] Fetched 45 inventory items
[2026-02-26 14:30:18] [INFO] Checkout: Vitamin C 1000mg x2 @ 8000.00 = 16000.00 VNĐ
[2026-02-26 14:30:19] [✓] Invoice created successfully! ID: 1235
[2026-02-26 14:30:19] [INFO] Statistics: Success=2, Error=0, Total=2
```

## 🔧 Troubleshooting

### Lỗi kết nối

```
[✗] Network error while fetching inventory: Connection refused
```

**Giải pháp:**
- Kiểm tra backend server đã chạy chưa
- Kiểm tra URL có đúng không
- Kiểm tra firewall

### Lỗi không có inventory

```
[⚠] No inventory available. Waiting 5 seconds...
```

**Giải pháp:**
- Kiểm tra database có dữ liệu không
- Kiểm tra branch_id có tồn tại không
- Import dữ liệu mẫu nếu chưa có

### Lỗi không đủ số lượng

```
[✗] Checkout failed: Không đủ số lượng tồn kho
```

**Giải pháp:**
- Điều chỉnh MAX_QUANTITY trong code nhỏ hơn
- Import thêm hàng vào kho

## 📝 API Endpoints sử dụng

### GET /api/inventory

**Request:**
```
GET /api/inventory?branchId=1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "inventory_id": 1,
      "branch_id": 1,
      "batch_id": 123,
      "medicine_name": "Paracetamol 500mg",
      "quantity_std": 100,
      "sub_unit": "viên",
      "sub_sell_price": 5000.0
    }
  ]
}
```

### POST /api/invoices

**Request:**
```json
{
  "branch_id": 1,
  "pharmacist_id": 1,
  "is_simulated": true,
  "total_amount": 15000.0,
  "details": [
    {
      "batch_id": 123,
      "unit_sold": "viên",
      "quantity_sold": 3,
      "unit_price": 5000.0,
      "total_std_quantity": 3
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "invoiceId": 1234
}
```

## 🎯 Use Cases

### 1. Demo cho khách hàng
Chạy simulator trong khi show dashboard để khách thấy số liệu real-time.

### 2. Load testing
Chạy nhiều instance cùng lúc để test performance:

```bash
# Terminal 1
java -jar target/pos-simulator-1.0-SNAPSHOT.jar http://localhost:8080/backend 1 1

# Terminal 2
java -jar target/pos-simulator-1.0-SNAPSHOT.jar http://localhost:8080/backend 1 2

# Terminal 3
java -jar target/pos-simulator-1.0-SNAPSHOT.jar http://localhost:8080/backend 1 3
```

### 3. Development testing
Tự động tạo dữ liệu test cho việc phát triển tính năng mới.

## 🛑 Dừng Simulator

Nhấn **Ctrl+C** để dừng simulator. Chương trình sẽ hiển thị thống kê cuối cùng:

```
═══════════════════════════════════════════════════════════════
   PHARMACY POS SIMULATOR - STOPPED
═══════════════════════════════════════════════════════════════
Final Statistics:
  Total Requests:  50
  Successful:      48
  Errors:          2
═══════════════════════════════════════════════════════════════
```

## 🔄 Rebuild Project

Nếu bạn thay đổi code, rebuild lại:

```bash
mvn clean package
```

## 📄 License

MIT License - Tự do sử dụng cho mục đích học tập và thương mại.

## 👨‍💻 Author

Lab Group 5 - Java Web Project

---

**Note:** Simulator này được đánh dấu `is_simulated: true` trong database để phân biệt với đơn hàng thật.
