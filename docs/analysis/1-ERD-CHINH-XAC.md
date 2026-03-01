# 1️⃣ ERD - SƠ ĐỒ QUAN HỆ THỰC THỂ (CHÍNH XÁC THEO DATABASE)

## 📊 Database: pharmacy_v15

```mermaid
erDiagram
    categories ||--o{ medicines : "có"
    medicines ||--o{ batches : "có nhiều lô"
    batches ||--o{ inventory : "phân bổ"
    batches ||--o{ invoice_details : "được bán"
    branches ||--o{ inventory : "quản lý"
    branches ||--o{ pharmacists : "có nhân viên"
    branches ||--o{ invoices : "phát sinh"
    pharmacists ||--o{ invoices : "tạo"
    customers ||--o{ invoices : "mua"
    invoices ||--o{ invoice_details : "chứa"

    categories {
        INT category_id PK
        VARCHAR category_name
    }

    medicines {
        INT medicine_id PK
        INT category_id FK
        VARCHAR name
        VARCHAR brand
        VARCHAR base_unit "Hộp"
        VARCHAR sub_unit "Viên"
        INT conversion_rate
        DECIMAL base_sell_price
        DECIMAL sub_sell_price
        INT min_stock_level
        TIMESTAMP created_at
    }

    batches {
        INT batch_id PK
        INT medicine_id FK
        VARCHAR batch_number
        DATE manufacturing_date
        DATE expiry_date
        DECIMAL import_price_package
        INT initial_quantity
        INT current_total_quantity
        TIMESTAMP import_date
    }

    branches {
        INT branch_id PK
        VARCHAR branch_name
        VARCHAR address
        VARCHAR phone_number
    }

    inventory {
        INT inventory_id PK
        INT branch_id FK
        INT batch_id FK
        INT quantity_std
        TIMESTAMP last_updated
    }

    pharmacists {
        INT pharmacist_id PK
        INT branch_id FK
        VARCHAR username UK
        VARCHAR password
        VARCHAR full_name
        VARCHAR role "ADMIN/STAFF"
    }

    customers {
        INT customer_id PK
        VARCHAR phone_number UK
        VARCHAR customer_name
        INT points
    }

    invoices {
        INT invoice_id PK
        TIMESTAMP invoice_date
        INT branch_id FK
        INT pharmacist_id FK
        INT customer_id FK
        DECIMAL total_amount
        BOOLEAN is_simulated
    }

    invoice_details {
        INT detail_id PK
        INT invoice_id FK
        INT batch_id FK
        ENUM unit_sold "Hộp/Viên"
        INT quantity_sold
        DECIMAL unit_price
        INT total_std_quantity
    }
```

---

## 🔗 QUAN HỆ GIỮA CÁC BẢNG:

| Bảng Chính | Quan hệ | Bảng Phụ | Giải thích |
|------------|---------|----------|------------|
| **categories** | 1 → N | medicines | 1 danh mục có nhiều loại thuốc |
| **medicines** | 1 → N | batches | 1 loại thuốc có nhiều lô hàng |
| **batches** | 1 → N | inventory | 1 lô được phân bổ cho nhiều chi nhánh |
| **batches** | 1 → N | invoice_details | 1 lô được bán trong nhiều đơn |
| **branches** | 1 → N | inventory | 1 chi nhánh quản lý nhiều lô |
| **branches** | 1 → N | pharmacists | 1 chi nhánh có nhiều nhân viên |
| **branches** | 1 → N | invoices | 1 chi nhánh phát sinh nhiều hóa đơn |
| **pharmacists** | 1 → N | invoices | 1 nhân viên tạo nhiều hóa đơn |
| **customers** | 1 → N | invoices | 1 khách hàng có nhiều đơn hàng |
| **invoices** | 1 → N | invoice_details | 1 hóa đơn có nhiều dòng chi tiết |

---

## 🎤 CÂU THUYẾT TRÌNH:

> **"Đây là sơ đồ ERD của hệ thống với 9 bảng chính. Ở trung tâm là bảng Medicines (thuốc) có quan hệ 1-nhiều với Batches (lô hàng). Mỗi lô được phân bổ cho các chi nhánh qua bảng Inventory (tồn kho). Khi bán hàng, nhân viên (Pharmacists) thuộc 1 chi nhánh (Branches) tạo hóa đơn (Invoices) cho khách hàng (Customers), trong đó chi tiết hóa đơn (Invoice_Details) liên kết với các lô thuốc cụ thể."**

---

## 📋 HƯỚNG DẪN XUẤT ẢNH:

1. Copy đoạn Mermaid code ở trên
2. Vào https://mermaid.live  
3. Paste vào và xuất PNG
4. Lưu thành: `ERD-pharmacy-v15.png`
