// 1. Danh sách thuốc mẫu (Dùng chung cho Người A và Người B)
export const MOCK_DRUGS = [
  { 
    id: 1, 
    name: 'Paracetamol 500mg', 
    price: 2000, 
    unit: 'Viên', 
    stock: 150, 
    category: 'Giảm đau',
    expiryDate: '2026-12-30',
    batchCode: 'LOT-PARA-001'
  },
  { 
    id: 2, 
    name: 'Amoxicillin 250mg', 
    price: 5000, 
    unit: 'Vỉ', 
    stock: 45, 
    category: 'Kháng sinh',
    expiryDate: '2025-06-15', // Sắp hết hạn để test cảnh báo
    batchCode: 'LOT-AMOX-202'
  },
  { 
    id: 3, 
    name: 'Decolgen Forte', 
    price: 3000, 
    unit: 'Viên', 
    stock: 200, 
    category: 'Cảm cúm',
    expiryDate: '2026-08-20',
    batchCode: 'LOT-DECO-99'
  },
  { 
    id: 4, 
    name: 'Vitamin C 1000mg', 
    price: 120000, 
    unit: 'Hộp', 
    stock: 5, // Sắp hết hàng để test Dashboard
    category: 'Thực phẩm chức năng',
    expiryDate: '2027-01-10',
    batchCode: 'LOT-VITC-01'
  },
];

// 2. Danh sách hóa đơn mẫu (Dùng cho Người D)
export const MOCK_INVOICES = [
  { 
    id: 'INV-2026-001', 
    customerName: 'Khách lẻ', 
    totalPrice: 45000, 
    createDate: '2026-01-28 08:30', 
    staffName: 'Người A',
    details: [
      { drugId: 1, name: 'Paracetamol', quantity: 10, subTotal: 20000 },
      { drugId: 2, name: 'Amoxicillin', quantity: 5, subTotal: 25000 }
    ]
  },
  { 
    id: 'INV-2026-002', 
    customerName: 'Nguyễn Văn B', 
    totalPrice: 120000, 
    createDate: '2026-01-28 09:15', 
    staffName: 'Người A',
    details: [
      { drugId: 4, name: 'Vitamin C', quantity: 1, subTotal: 120000 }
    ]
  }
];

// 3. Dữ liệu tổng quan (Dùng cho Người C làm Dashboard)
export const MOCK_STATISTICS = {
  totalRevenue: 165000,
  totalOrders: 2,
  outOfStockItems: 1,
  expiringSoonItems: 1
};

// 4. Tài khoản đăng nhập mẫu
export const MOCK_USERS = [
  { username: 'admin', password: '123', fullName: 'Quản trị viên' },
  { username: 'staff', password: '123', fullName: 'Nhân viên bán hàng' }
];