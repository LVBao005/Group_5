# FLOWCHART 3: QUY TRÌNH NHẬP THUỐC TỪ KHO TỔNG (100% TIẾNG VIỆT)

```mermaid
flowchart TD
    Start([Bắt đầu]) --> SelectMed[Chọn thuốc cần nhập]
    
    SelectMed --> CheckCentral{Kho tổng còn hàng?}
    
    CheckCentral -->|Không| NoCentral[Thông báo: Kho tổng hết hàng]
    NoCentral --> End1([Kết thúc])
    
    CheckCentral -->|Có| ShowBatch[Hiển thị danh sách lô hàng có sẵn]
    
    ShowBatch --> SelectBatch[Nhân viên chọn lô hàng]
    
    SelectBatch --> InputQty[Nhập số lượng muốn nhập về chi nhánh]
    
    InputQty --> ValidateQty{Số lượng hợp lệ?}
    
    ValidateQty -->|Không| QtyError[Thông báo: Số lượng vượt quá tồn kho tổng]
    QtyError --> InputQty
    
    ValidateQty -->|Có| StartTransaction[Bắt đầu giao dịch database]
    
    StartTransaction --> DeductCentral[Trừ số lượng từ kho tổng]
    
    DeductCentral --> CheckDeduct{Trừ thành công?}
    
    CheckDeduct -->|Không| Rollback[Hoàn tác giao dịch]
    Rollback --> TransError[Hiển thị lỗi giao dịch]
    TransError --> End2([Kết thúc])
    
    CheckDeduct -->|Có| AddBranch[Cộng số lượng vào kho chi nhánh]
    
    AddBranch --> CheckAdd{Cộng thành công?}
    
    CheckAdd -->|Không| Rollback
    
    CheckAdd -->|Có| LogTransaction[Ghi log nhập xuất kho]
    
    LogTransaction --> Commit[Xác nhận giao dịch]
    
    Commit --> Success[Thông báo: Nhập thuốc thành công]
    
    Success --> Refresh[Cập nhật hiển thị tồn kho]
    
    Refresh --> End3([Kết thúc])
    
    style Start fill:#4ade80,stroke:#22c55e,stroke-width:3px,color:#000
    style End1 fill:#4ade80,stroke:#22c55e,stroke-width:3px,color:#000
    style End2 fill:#4ade80,stroke:#22c55e,stroke-width:3px,color:#000
    style End3 fill:#4ade80,stroke:#22c55e,stroke-width:3px,color:#000
    style NoCentral fill:#fca5a5,stroke:#ef4444,stroke-width:2px
    style QtyError fill:#fca5a5,stroke:#ef4444,stroke-width:2px
    style TransError fill:#fca5a5,stroke:#ef4444,stroke-width:2px
    style Rollback fill:#fed7aa,stroke:#f97316,stroke-width:2px
    style Success fill:#a5f3fc,stroke:#06b6d4,stroke-width:2px
    style Commit fill:#bfdbfe,stroke:#3b82f6,stroke-width:2px
```

## Hướng dẫn xuất ra PNG:

1. Copy đoạn code Mermaid ở trên
2. Vào https://mermaid.live
3. Paste vào
4. Click "Actions" → "PNG" → Download
5. Lưu đè lên file: `flowchart-nhap-kho.png`
