# FLOWCHART 2: QUY TRÌNH BÁN HÀNG TẠI QUẦY (100% TIẾNG VIỆT)

```mermaid
flowchart TD
    Start([Bắt đầu]) --> Login[Nhân viên đăng nhập hệ thống]
    Login --> SelectMed[Chọn thuốc cần bán]
    
    SelectMed --> CheckStock{Thuốc còn trong kho?}
    
    CheckStock -->|Không| OutOfStock[Thông báo: Thuốc hết hàng]
    OutOfStock --> SelectMed
    
    CheckStock -->|Có| InputQty[Nhập số lượng cần bán]
    
    InputQty --> ValidateQty{Số lượng tồn kho đủ?}
    
    ValidateQty -->|Không| QtyError[Thông báo: Không đủ hàng]
    QtyError --> InputQty
    
    ValidateQty -->|Có| AddCart[Thêm vào giỏ hàng]
    
    AddCart --> MoreItem{Có thuốc khác?}
    
    MoreItem -->|Có| SelectMed
    MoreItem -->|Không| CalcTotal[Tính tổng tiền thanh toán]
    
    CalcTotal --> Payment[Nhận tiền từ khách hàng]
    
    Payment --> UpdateDB[Cập nhật số lượng tồn kho trong database]
    
    UpdateDB --> CreateInvoice[Tạo hóa đơn bán hàng]
    
    CreateInvoice --> PrintInvoice[In hóa đơn cho khách]
    
    PrintInvoice --> Success[Hiển thị thông báo thanh toán thành công]
    
    Success --> End([Kết thúc])
    
    style Start fill:#4ade80,stroke:#22c55e,stroke-width:3px,color:#000
    style End fill:#4ade80,stroke:#22c55e,stroke-width:3px,color:#000
    style OutOfStock fill:#fca5a5,stroke:#ef4444,stroke-width:2px
    style QtyError fill:#fca5a5,stroke:#ef4444,stroke-width:2px
    style Success fill:#a5f3fc,stroke:#06b6d4,stroke-width:2px
    style Payment fill:#fde047,stroke:#facc15,stroke-width:2px
    style CreateInvoice fill:#bfdbfe,stroke:#3b82f6,stroke-width:2px
```

## Hướng dẫn xuất ra PNG:

1. Copy đoạn code Mermaid ở trên
2. Vào https://mermaid.live
3. Paste vào
4. Click "Actions" → "PNG" → Download
5. Lưu đè lên file: `flowchart-ban-hang.png`
