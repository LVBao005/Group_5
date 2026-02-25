# 🎯 HƯỚNG DẪN NHANH - DASHBOARD

## ⚡ Quick Start (5 phút)

### Bước 1: Chuẩn Bị
```bash
# Clone project (đã làm)
cd Group_5/src/core_app
```

### Bước 2: Chạy Backend
```bash
cd backend

# Build project
mvn clean package

# Deploy file backend.war vào Tomcat
# Hoặc dùng IDE (IntelliJ/Eclipse) để run
```

**Backend sẽ chạy tại:** `http://localhost:8080`

### Bước 3: Chạy Frontend
```bash
cd ../frontend

# Cài dependencies (chỉ lần đầu)
npm install

# Chạy dev server
npm run dev
```

**Frontend sẽ chạy tại:** `http://localhost:5173`

### Bước 4: Truy Cập Dashboard
Mở trình duyệt: **http://localhost:5173/dashboard**

---

## 🎨 Tính Năng Chính

### 1️⃣ Stat Cards (Thẻ Thống Kê)
4 thẻ hiển thị:
- 💰 Doanh thu hôm nay
- 📋 Số đơn hàng
- 💊 Số sản phẩm
- 👥 Số khách hàng

### 2️⃣ Biểu Đồ Doanh Thu
- Chọn khoảng thời gian: Hôm nay / 7 ngày / 30 ngày
- Tự động cập nhật mỗi 30 giây
- Animation khi có dữ liệu mới

### 3️⃣ Biểu Đồ Tròn
Hiển thị cơ cấu doanh thu theo nhóm:
- Kháng sinh
- Thực phẩm chức năng
- Mỹ phẩm
- Thuốc kê đơn
- v.v.

### 4️⃣ Cảnh Báo
**Sắp Hết Hạn:**
- 🔴 ≤ 7 ngày: Khẩn cấp
- 🟡 8-15 ngày: Cảnh báo
- 🟠 16-30 ngày: Lưu ý

**Sắp Hết Hàng:**
- 🔴 ≤ 10: Cần nhập gấp
- 🟡 11-30: Cần theo dõi
- 🟠 31-49: Sắp hết

---

## 🔄 Real-time Updates

Dashboard tự động làm mới dữ liệu mỗi **30 giây**.

Hoặc click nút **"Làm mới"** ở góc trên bên phải để cập nhật ngay.

---

## 📱 Responsive

Dashboard hoạt động tốt trên:
- 💻 Desktop (≥1024px) - Full layout
- 📱 Tablet (768-1023px) - 2 cột
- 📱 Mobile (<768px) - 1 cột

---

## 🛠️ API Endpoints

Tất cả API có prefix: `/api/dashboard/`

| Endpoint | Mô tả |
|----------|-------|
| `/stats` | Thống kê tổng hợp |
| `/revenue-timeline` | Doanh thu theo thời gian |
| `/revenue-by-category` | Doanh thu theo nhóm |
| `/alerts` | Cảnh báo hết hạn/hết hàng |
| `/realtime` | Dữ liệu real-time |

**Test API:**
```bash
curl http://localhost:8080/api/dashboard/stats
```

---

## 🐛 Xử Lý Lỗi Thường Gặp

### 1. "Cannot connect to backend"
✅ **Giải pháp:**
- Kiểm tra Tomcat đã chạy chưa
- Verify port 8080 không bị chiếm
- Check file `DBContext.java` - cấu hình database

### 2. "No data showing"
✅ **Giải pháp:**
- Thêm dữ liệu mẫu vào database
- Chạy file `pharmacy_database.sql`
- Tạo invoice mẫu từ trang POS

### 3. "Charts not updating"
✅ **Giải pháp:**
- Click nút "Làm mới"
- Kiểm tra Console (F12) xem có lỗi API
- Verify auto-refresh interval (30s)

### 4. "CORS error"
✅ **Giải pháp:**
- Kiểm tra `CorsFilter.java`
- Origin phải là: `http://localhost:5173`
- Restart Tomcat sau khi sửa

---

## 📊 Database Required

Các bảng cần thiết:
```
✓ Invoices
✓ InvoiceDetails
✓ Medicines
✓ Batches
✓ Inventory
✓ Categories
✓ Customers
```

Import từ: `pharmacy_database.sql`

---

## 🎯 Testing Checklist

- [ ] Backend chạy OK (port 8080)
- [ ] Frontend chạy OK (port 5173)
- [ ] Database connected
- [ ] Stat cards hiển thị số liệu
- [ ] Biểu đồ line chart có dữ liệu
- [ ] Biểu đồ pie chart có dữ liệu
- [ ] Alerts hiển thị cảnh báo
- [ ] Auto-refresh hoạt động (30s)
- [ ] Button "Làm mới" hoạt động
- [ ] Chuyển period (today/week/month) OK

---

## 💡 Tips & Tricks

### 1. Xem Dashboard Simulator Real-time
- Mở trang POS: `http://localhost:5173/pos`
- Tạo nhiều đơn hàng liên tục
- Quay lại Dashboard → thấy số liệu tăng

### 2. Test Alerts
```sql
-- Tạo thuốc sắp hết hạn
UPDATE Batches 
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL 5 DAY)
WHERE id = 'BATCH001';

-- Tạo thuốc sắp hết hàng
UPDATE Inventory 
SET quantity = 5
WHERE batch_id = 'BATCH002';
```

### 3. Performance Tuning
- Thêm index cho bảng Invoices: `created_at`
- Thêm index cho bảng Batches: `expiry_date`
- Cache query results nếu data lớn

---

## 🎨 Customization

### Đổi màu chủ đạo
File: `frontend/src/index.css`
```css
--primary: 150 100% 50%; /* Emerald */
/* Đổi thành: */
--primary: 217 91% 60%; /* Blue */
```

### Đổi interval auto-refresh
File: `frontend/src/pages/Dashboard.jsx`
```js
const interval = setInterval(() => {
    loadDashboardData();
}, 30000); // 30 giây
// Đổi thành: 60000 (1 phút)
```

### Thêm stat card mới
File: `frontend/src/pages/Dashboard.jsx`
```jsx
<StatCard
    title="Tên Metric"
    value={giaTri}
    icon={IconComponent}
    format="currency" // hoặc "number"
    color="emerald" // hoặc blue, violet, amber, rose
/>
```

---

## 📞 Support

Gặp vấn đề? Check:
1. Console log (F12)
2. Network tab (xem API response)
3. Backend log (Tomcat console)
4. Database connection

---

**Made with ❤️ by DUY - Group 5**
