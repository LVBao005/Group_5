# ✅ FIX: Hiển thị BRANCH_NAME trên Frontend

## 🐛 Vấn đề
Frontend không hiển thị được tên chi nhánh (branch_name) vì:
- Backend Gson dùng **camelCase** (branchName) 
- Frontend expect **snake_case** (branch_name)

## 🔧 Giải pháp đã áp dụng

### 1. Cập nhật Backend Gson Configuration
Thêm `.setFieldNamingPolicy()` vào 3 Servlet:
- ✅ `InvoiceServlet.java`
- ✅ `InventoryServlet.java`
- ✅ `BatchApiServlet.java`

```java
this.gson = new GsonBuilder()
    .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
    .setFieldNamingPolicy(com.google.gson.FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
    .create();
```

### 2. Kết quả JSON API
**Trước (camelCase):**
```json
{
  "invoiceId": 1,
  "branchName": "Nhà thuốc An Khang",
  "pharmacistName": "Nguyễn Văn A"
}
```

**Sau (snake_case) - Khớp với database:**
```json
{
  "invoice_id": 1,
  "branch_name": "Nhà thuốc An Khang",
  "pharmacist_name": "Nguyễn Văn A"
}
```

## 🚀 Deploy Steps

### Bước 1: Build Backend
```powershell
cd d:\LAB\Group_5\src\core_app\backend
mvn clean package
```

### Bước 2: Deploy to Tomcat
**Mở PowerShell as Administrator:**
```powershell
cd d:\LAB\Group_5\src\core_app
.\deploy-backend.ps1
```

### Bước 3: Verify
1. Đợi 10 giây để Tomcat extract WAR file
2. Test API: http://localhost:8080/backend/api/invoices
3. Kiểm tra JSON có field `branch_name` thay vì `branchName`

### Bước 4: Start Frontend
```powershell
cd d:\LAB\Group_5\src\core_app\frontend
npm run dev
```

## 📋 Các field đã fix
| Java Model (camelCase) | JSON API (snake_case) | Database Column |
|------------------------|----------------------|-----------------|
| branchName             | branch_name          | branch_name     |
| pharmacistName         | pharmacist_name      | full_name       |
| customerName           | customer_name        | customer_name   |
| invoiceId              | invoice_id           | invoice_id      |
| invoiceDate            | invoice_date         | invoice_date    |
| isSimulated            | is_simulated         | is_simulated    |
| totalAmount            | total_amount         | total_amount    |

## ✅ Checklist
- [x] Backend build thành công
- [ ] Deploy backend.war vào Tomcat
- [ ] Test API trả về đúng snake_case
- [ ] Frontend hiển thị branch_name
- [ ] Không còn hiển thị "N/A" hoặc "NaN đ"

## 🔗 Related Files
- Backend: `InvoiceServlet.java`, `InventoryServlet.java`, `BatchApiServlet.java`
- Frontend: `Invoices.jsx` (line 378: `invoice.branch_name`)
- Deploy: `deploy-backend.ps1`
