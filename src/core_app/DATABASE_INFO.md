# Thông Tin Database

## ⚠️ QUAN TRỌNG - DATABASE ĐANG SỬ DỤNG

**File database chính thức:** `Pharmacy_Lab211_Full_Final.sql`

- Đường dẫn: `CodeGenData/Pharmacy_Lab211_Full_Final.sql`
- Đây là file database đầy đủ và mới nhất đang được sử dụng cho dự án
- **KHÔNG SỬ DỤNG** các file SQL khác trong thư mục CodeGenData

## Các file SQL khác (chỉ tham khảo)

- `pharmacy_database.sql` - Phiên bản cũ
- `Pharmacy_POS_MySQL_Data.sql` - Data mẫu
- `DataBase_MySQL_Empty.sql` - Schema rỗng
- `dashboard_demo_data.sql` - Demo data
- `invoice_schema_update.sql` - Update schema

## Hướng dẫn Import Database

1. Mở MySQL Workbench hoặc phpMyAdmin
2. Tạo database mới (nếu chưa có)
3. Import file: `CodeGenData/Pharmacy_Lab211_Full_Final.sql`

```sql
-- Hoặc sử dụng command line:
mysql -u root -p pharmacy_db < CodeGenData/Pharmacy_Lab211_Full_Final.sql
```

---
**Cập nhật lần cuối:** 19/02/2026
