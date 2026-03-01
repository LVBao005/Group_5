# FLOWCHART 1: QUY TRÌNH ĐĂNG NHẬP (100% TIẾNG VIỆT)

```mermaid
flowchart TD
    Start([Bắt đầu]) --> Input[Nhập tên đăng nhập và mật khẩu]
    Input --> Validate{Thông tin hợp lệ?}
    
    Validate -->|Không| Error[Hiển thị thông báo lỗi]
    Error --> Input
    
    Validate -->|Có| CheckDB[Kiểm tra trong cơ sở dữ liệu]
    CheckDB --> Found{Tìm thấy tài khoản?}
    
    Found -->|Không| NotFound[Thông báo: Tài khoản không tồn tại]
    NotFound --> Input
    
    Found -->|Có| CheckPass{Mật khẩu đúng?}
    
    CheckPass -->|Không| WrongPass[Thông báo: Mật khẩu sai]
    WrongPass --> Input
    
    CheckPass -->|Có| CheckRole{Kiểm tra quyền}
    
    CheckRole -->|ADMIN| AdminDash[Chuyển đến Dashboard Quản trị]
    CheckRole -->|STAFF| StaffDash[Chuyển đến Dashboard Nhân viên]
    
    AdminDash --> SaveSession[Lưu phiên đăng nhập]
    StaffDash --> SaveSession
    
    SaveSession --> End([Kết thúc])
    
    style Start fill:#4ade80,stroke:#22c55e,stroke-width:3px,color:#000
    style End fill:#4ade80,stroke:#22c55e,stroke-width:3px,color:#000
    style Error fill:#fca5a5,stroke:#ef4444,stroke-width:2px
    style NotFound fill:#fca5a5,stroke:#ef4444,stroke-width:2px
    style WrongPass fill:#fca5a5,stroke:#ef4444,stroke-width:2px
    style AdminDash fill:#bfdbfe,stroke:#3b82f6,stroke-width:2px
    style StaffDash fill:#bfdbfe,stroke:#3b82f6,stroke-width:2px
```

## Hướng dẫn xuất ra PNG:

1. Copy đoạn code Mermaid ở trên
2. Vào https://mermaid.live
3. Paste vào
4. Click "Actions" → "PNG" → Download
5. Lưu đè lên file cũ: `flowchart-moisua.png`
