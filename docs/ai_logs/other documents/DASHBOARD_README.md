# 📊 Dashboard - Hệ Thống Phân Tích & Giám Sát

## ✨ Tính Năng

### 1. 📈 Biểu Đồ Doanh Thu (Line Chart)
- Hiển thị doanh thu theo thời gian (giờ/ngày)
- 3 chế độ xem: Hôm nay, 7 ngày, 30 ngày
- **Real-time updates**: Tự động cập nhật mỗi 30 giây
- Animation mượt mà khi có dữ liệu mới

### 2. 🥧 Biểu Đồ Cơ Cấu (Pie Chart)
- Phân tích doanh thu theo nhóm thuốc/sản phẩm
- Màu sắc phân biệt rõ ràng
- Tooltip chi tiết cho từng phần

### 3. ⚠️ Hệ Thống Cảnh Báo
#### Top Thuốc Sắp Hết Hạn
- Hiển thị top 10 thuốc sắp hết hạn (trong vòng 30 ngày)
- Mã màu theo mức độ: 
  - 🔴 Đỏ: ≤ 7 ngày
  - 🟡 Vàng: 8-15 ngày
  - 🟠 Cam: 16-30 ngày

#### Top Thuốc Sắp Hết Hàng
- Hiển thị top 10 thuốc có tồn kho < 50
- Mã màu theo số lượng:
  - 🔴 Đỏ: ≤ 10
  - 🟡 Vàng: 11-30
  - 🟠 Cam: 31-49

### 4. 📊 Stat Cards (Số Liệu Tổng Hợp)
- **Doanh Thu Hôm Nay**: Tổng doanh thu trong ngày
- **Đơn Hàng**: Số lượng đơn hàng hôm nay
- **Sản Phẩm**: Tổng số thuốc đang quản lý
- **Khách Hàng**: Tổng số khách hàng

## 🏗️ Cấu Trúc Files

### Backend (Java Servlet)
```
backend/src/main/java/controller/
└── DashboardServlet.java
```

**API Endpoints:**
- `GET /api/dashboard/stats` - Lấy số liệu tổng hợp
- `GET /api/dashboard/revenue-timeline?period=today|week|month` - Dữ liệu biểu đồ doanh thu
- `GET /api/dashboard/revenue-by-category` - Cơ cấu doanh thu theo nhóm
- `GET /api/dashboard/alerts` - Danh sách cảnh báo
- `GET /api/dashboard/realtime` - Dữ liệu real-time

### Frontend (React)
```
frontend/src/
├── pages/
│   └── Dashboard.jsx                    # Trang chính
├── components/dashboard/
│   ├── StatCard.jsx                     # Card hiển thị số liệu
│   ├── RevenueChart.jsx                 # Biểu đồ đường doanh thu
│   ├── CategoryPieChart.jsx             # Biểu đồ tròn phân loại
│   └── AlertsList.jsx                   # Danh sách cảnh báo
└── services/
    └── dashboardService.js              # Service gọi API
```

## 🚀 Cách Sử Dụng

### 1. Backend Setup
```bash
cd src/core_app/backend
mvn clean install
# Deploy to Tomcat
```

### 2. Frontend Setup
```bash
cd src/core_app/frontend
npm install
npm run dev
```

### 3. Truy Cập Dashboard
Mở trình duyệt: `http://localhost:5173/dashboard`

## 🎨 Features Chi Tiết

### Auto-Refresh (Real-time)
Dashboard tự động cập nhật dữ liệu mỗi 30 giây mà không cần reload trang. Phù hợp cho việc giám sát liên tục.

### Period Selector
Người dùng có thể chọn khoảng thời gian xem báo cáo:
- **Hôm nay**: Dữ liệu theo giờ (24 giờ)
- **7 ngày**: Dữ liệu theo ngày (7 ngày gần nhất)
- **30 ngày**: Dữ liệu theo ngày (30 ngày gần nhất)

### Responsive Design
- Tự động điều chỉnh layout cho mobile, tablet, desktop
- Touch-friendly cho thiết bị di động

## 🔧 Cấu Hình Database

Dashboard sử dụng các bảng sau:
- `Invoices` - Hóa đơn
- `InvoiceDetails` - Chi tiết hóa đơn
- `Medicines` - Thuốc
- `Batches` - Lô hàng
- `Inventory` - Tồn kho
- `Categories` - Nhóm thuốc
- `Customers` - Khách hàng

## 📊 Demo Data

Để test Dashboard với dữ liệu mẫu, bạn có thể chạy:
```sql
-- Thêm dữ liệu mẫu vào database
-- Xem file: pharmacy_database.sql
```

## 🎯 Performance

- **Loading Time**: < 2s (với dữ liệu 1000+ records)
- **Auto-refresh**: Mỗi 30s
- **Charts Animation**: 1s smooth transition
- **API Response**: < 500ms average

## 🛠️ Troubleshooting

### Dashboard không hiển thị dữ liệu
1. Kiểm tra backend đã chạy chưa
2. Kiểm tra database connection
3. Mở DevTools > Console để xem lỗi
4. Verify API endpoints: `http://localhost:8080/api/dashboard/stats`

### Biểu đồ không cập nhật real-time
1. Kiểm tra interval refresh (30s)
2. Thêm dữ liệu mới vào database
3. Click nút "Làm mới" để force refresh

### CORS Error
1. Kiểm tra `CorsFilter.java` đã được cấu hình
2. Verify origin trong filter: `http://localhost:5173`

## 📝 Notes

- Dashboard được thiết kế cho **Duy** - nhóm Group_5
- Sử dụng thư viện Recharts cho visualization
- Dark theme với accent color emerald (#10b981)
- Font: Sans-serif, bold & black weights

## 🎨 Design System

### Colors
- Background: `#0d0f0e`
- Card: `#161a19`
- Border: `rgba(255,255,255,0.05)`
- Primary: `#10b981` (Emerald)
- Secondary: `#3b82f6` (Blue)
- Warning: `#f59e0b` (Amber)
- Danger: `#ef4444` (Rose)

### Typography
- Heading: Font-black, Uppercase, Wide tracking
- Body: Font-bold, Regular tracking
- Accent: Font-bold, Uppercase, Wide tracking

---

**Developed by:** DUY - Group 5  
**Version:** 1.0.0  
**Last Updated:** February 2026
