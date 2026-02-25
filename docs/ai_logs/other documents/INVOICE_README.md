# Invoice Management Feature - Trang Quản lý Hóa đơn

## 📋 Tổng quan
Trang Invoices được thiết kế để quản lý và tra cứu lịch sử hóa đơn bán hàng trong hệ thống nhà thuốc. Đây là nơi giảng viên và quản lý có thể kiểm tra kết quả từ Simulator và theo dõi các giao dịch thực tế.

## ✨ Tính năng chính

### 1. Bộ lọc tìm kiếm (Filter)
- **Tìm kiếm nhanh**: Tìm theo Mã hóa đơn hoặc Tên dược sĩ
- **Lọc theo thời gian**: Từ ngày - Đến ngày
- **Lọc theo dược sĩ**: Tìm theo tên dược sĩ cụ thể
- **Lọc theo trạng thái**:
  - **Real**: Hóa đơn từ người bán thực tế
  - **Simulated**: Hóa đơn từ robot/simulator

### 2. Bảng danh sách hóa đơn
Hiển thị tóm tắt thông tin:
- **Mã hóa đơn** (Invoice ID)
- **Thời gian** (Timestamp)
- **Nhân viên bán** (Pharmacist name)
- **Tổng tiền** (Total amount)
- **Trạng thái** (Real/Simulated badge)
- **Nút xem chi tiết**

### 3. Xem chi tiết hóa đơn (Modal/Drawer)
Khi click vào một hóa đơn, modal hiển thị:
- **Thông tin chung**:
  - Mã hóa đơn
  - Thời gian tạo
  - Nhân viên bán hàng
  - Khách hàng
  - Chi nhánh
  - Trạng thái (Real/Simulated)

- **Danh sách thuốc đã bán**:
  - Tên thuốc
  - **Lô hàng (Batch)**: Hiển thị thuốc được trừ từ lô nào
  - Đơn vị bán
  - Số lượng
  - Đơn giá
  - Thành tiền

- **Tổng cộng**: Tổng giá trị hóa đơn

### 4. Thống kê tổng quan
Hiển thị 4 cards thống kê:
- **Tổng hóa đơn**: Số lượng hóa đơn trong khoảng lọc
- **Tổng doanh thu**: Tổng tiền của tất cả hóa đơn
- **Real**: Số lượng hóa đơn từ người bán thực
- **Simulated**: Số lượng hóa đơn từ simulator

## 🗂️ Cấu trúc Files

### Frontend
```
src/
├── pages/
│   └── Invoices.jsx                    # Main invoice management page
├── services/
│   └── invoiceService.js               # API service for invoices
└── utils/
    └── format.js                        # Formatting utilities
```

### Backend
```
src/main/java/
├── controller/
│   └── InvoiceServlet.java             # REST API endpoints
├── dao/
│   └── InvoiceDAO.java                 # Database operations
└── model/
    ├── Invoice.java                    # Invoice model
    └── InvoiceDetail.java              # Invoice detail model
```

### Database
```
docs/
└── invoice_schema_update.sql           # SQL script to add is_simulated column
```

## 🚀 Hướng dẫn cài đặt

### 1. Cập nhật Database Schema
Chạy script SQL để thêm cột `is_simulated`:
```sql
-- Chạy file: docs/invoice_schema_update.sql
```

### 2. Backend Setup
Servlet đã được cấu hình tại endpoint: `/api/invoices`

**Available Endpoints:**
- `GET /api/invoices` - Lấy danh sách hóa đơn (có thể filter)
- `GET /api/invoices/{id}` - Lấy chi tiết 1 hóa đơn
- `GET /api/invoices/stats` - Lấy thống kê
- `GET /api/invoices/search?q=...` - Tìm kiếm
- `POST /api/invoices` - Tạo hóa đơn mới

### 3. Frontend Setup
Trang Invoices đã được tích hợp vào navigation menu.

## 📊 Database Schema

### Table: Invoices
```sql
CREATE TABLE Invoices (
    invoice_id INT PRIMARY KEY IDENTITY(1,1),
    invoice_date DATETIME DEFAULT GETDATE(),
    branch_id INT FOREIGN KEY REFERENCES Branches(branch_id),
    pharmacist_id INT FOREIGN KEY REFERENCES Pharmacists(pharmacist_id),
    customer_id INT FOREIGN KEY REFERENCES Customers(customer_id),
    total_amount DECIMAL(15,2),
    is_simulated BIT NOT NULL DEFAULT 0  -- NEW COLUMN
);
```

### Table: Invoice_Details
```sql
CREATE TABLE Invoice_Details (
    detail_id INT PRIMARY KEY IDENTITY(1,1),
    invoice_id INT FOREIGN KEY REFERENCES Invoices(invoice_id),
    batch_id INT FOREIGN KEY REFERENCES Batches(batch_id),
    unit_sold VARCHAR(20),
    quantity_sold INT,
    unit_price DECIMAL(15,2),
    total_std_quantity INT
);
```

## 🔌 API Examples

### Lấy danh sách hóa đơn với filter
```javascript
// Tất cả hóa đơn
const invoices = await invoiceService.getInvoices();

// Lọc theo ngày
const filtered = await invoiceService.getInvoices({
    dateFrom: '2026-01-01',
    dateTo: '2026-01-31'
});

// Chỉ lấy hóa đơn simulated
const simulated = await invoiceService.getInvoices({
    isSimulated: true
});
```

### Lấy chi tiết hóa đơn
```javascript
const invoice = await invoiceService.getInvoiceById(1001);
// invoice.details sẽ chứa thông tin batch
```

### Tạo hóa đơn mới
```javascript
const newInvoice = await invoiceService.createInvoice({
    branch_id: 1,
    pharmacist_id: 5,
    customer_id: 123,
    total_amount: 350000,
    is_simulated: false,  // false = Real sale, true = Simulator
    details: [
        {
            batch_id: 101,
            unit_sold: 'HỘP',
            quantity_sold: 2,
            unit_price: 25000,
            total_std_quantity: 200
        }
    ]
});
```

## 🎨 UI/UX Features

### Design System
- **Dark theme**: Màu nền tối chủ đạo (#0d0f0e, #161a19)
- **Accent color**: Xanh lá neon (#00ff80)
- **Typography**: Font sans-serif, font weights đa dạng
- **Border radius**: Rounded corners (1.5rem - 3rem)
- **Animations**: Fade-in, slide-in effects

### Interactive Elements
- **Hover effects**: Cards và buttons có hiệu ứng hover
- **Status badges**: Real (purple), Simulated (orange)
- **Modal animations**: Zoom-in effect khi mở
- **Loading states**: Spinner animation khi đang tải

### Responsive Design
- Grid layout tự động điều chỉnh (1-4 columns)
- Table responsive với scrolling
- Modal adaptive với screen size

## 🔍 Các trường hợp sử dụng

### 1. Kiểm tra kết quả Simulator
```
1. Truy cập trang Invoices
2. Click nút "Bộ lọc"
3. Chọn "Trạng thái" = "Simulated"
4. Xem danh sách hóa đơn từ robot
5. Click "Xem chi tiết" để kiểm tra batch info
```

### 2. Tra cứu hóa đơn theo ngày
```
1. Click "Bộ lọc"
2. Nhập "Từ ngày" và "Đến ngày"
3. Danh sách tự động cập nhật
4. Xem thống kê tổng quan ở trên
```

### 3. Tìm hóa đơn của dược sĩ cụ thể
```
1. Gõ tên dược sĩ vào ô search
2. Hoặc sử dụng filter "Tên dược sĩ"
3. Xem tất cả hóa đơn của dược sĩ đó
```

### 4. Xem chi tiết lô hàng đã bán
```
1. Click "Xem chi tiết" trên hóa đơn
2. Trong bảng danh sách thuốc, xem cột "Lô hàng"
3. Mỗi thuốc hiển thị Batch ID mà nó được trừ
4. Thông tin batch number và expiry date
```

## 📝 Notes

### Transaction Safety
- Backend sử dụng database transactions
- Rollback tự động nếu có lỗi
- Inventory được cập nhật đồng thời với invoice

### Performance
- Indexes trên `is_simulated` và `invoice_date`
- Lazy loading cho invoice details
- Pagination có thể thêm nếu cần

### Security
- CORS đã được cấu hình
- Input validation ở cả frontend và backend
- SQL injection prevention với PreparedStatement

## 🐛 Troubleshooting

### Không load được dữ liệu
1. Check backend server đang chạy
2. Kiểm tra database connection
3. Xem console log để debug

### Filter không hoạt động
1. Clear filters và thử lại
2. Kiểm tra date format
3. Refresh trang

### Modal không hiển thị chi tiết
1. Kiểm tra API endpoint `/api/invoices/{id}`
2. Xem network tab để debug
3. Kiểm tra invoice có details không

## 👥 Người phụ trách
- **Developed by**: KIM (Group 5)
- **Feature**: Invoice Management & Simulator Integration
- **Date**: February 2026

## 📞 Support
Nếu gặp vấn đề, liên hệ team phát triển hoặc tạo issue trên repository.
