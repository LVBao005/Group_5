// 1. Branches Table
export const MOCK_BRANCHES = [
    { branch_id: 1, branch_name: 'Chi nhánh Quận 1', address: '123 Lê Lợi, Q1, HCM', phone_number: '02812345678' },
    { branch_id: 2, branch_name: 'Chi nhánh Quận 7', address: '456 Nguyễn Văn Linh, Q7, HCM', phone_number: '02887654321' }
];

// 2. Categories Table
export const MOCK_CATEGORIES = [
    { category_id: 1, category_name: 'Giảm đau' },
    { category_id: 2, category_name: 'Kháng sinh' },
    { category_id: 3, category_name: 'Tiêu hóa' },
    { category_id: 4, category_name: 'Thực phẩm chức năng' },
    { category_id: 5, category_name: 'Hạ sốt' }
];

// 3. Medicines Table
export const MOCK_MEDICINES_TABLE = [
    {
        medicine_id: 1,
        category_id: 1,
        name: 'Panadol Extra',
        brand: 'GSK',
        base_unit: 'HỘP',
        sub_unit: 'Viên',
        conversion_rate: 100,
        base_sell_price: 120000,
        sub_sell_price: 1500,
        created_at: '2026-01-01T08:00:00'
    }
    // ... more added below in the combined export for UI convenience
];

// 4. Batches Table
export const MOCK_BATCHES = [
    { batch_id: 101, medicine_id: 1, batch_number: 'PND-001', manufacturing_date: '2025-01-01', expiry_date: '2026-12-01', import_price_package: 90000 },
    { batch_id: 201, medicine_id: 2, batch_number: 'AMX-001', manufacturing_date: '2024-10-01', expiry_date: '2025-10-15', import_price_package: 180000 },
    { batch_id: 301, medicine_id: 3, batch_number: 'BER-001', manufacturing_date: '2025-01-01', expiry_date: '2026-01-01', import_price_package: 20000 },
    { batch_id: 401, medicine_id: 4, batch_number: 'VITC-01', manufacturing_date: '2025-05-01', expiry_date: '2026-05-01', import_price_package: 65000 },
    { batch_id: 501, medicine_id: 5, batch_number: 'PARA-01', manufacturing_date: '2025-08-01', expiry_date: '2026-08-01', import_price_package: 35000 }
];

// 5. Inventory Table
export const MOCK_INVENTORY = [
    { inventory_id: 1, branch_id: 1, batch_id: 101, quantity_std: 5000, last_updated: '2026-01-28T13:00:00' },
    { inventory_id: 2, branch_id: 1, batch_id: 201, quantity_std: 1000, last_updated: '2026-01-28T13:00:00' },
    { inventory_id: 3, branch_id: 1, batch_id: 301, quantity_std: 100, last_updated: '2026-01-28T13:00:00' },
    { inventory_id: 4, branch_id: 1, batch_id: 401, quantity_std: 900, last_updated: '2026-01-28T13:00:00' },
    { inventory_id: 5, branch_id: 1, batch_id: 501, quantity_std: 1000, last_updated: '2026-01-28T13:00:00' }
];

// 6. Pharmacists (Users) Table
export const MOCK_PHARMACISTS = [
    { pharmacist_id: 1, branch_id: 1, username: 'admin', password: '123', fullName: 'Dược sĩ BẢO', role: 'ADMIN', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bao' },
    { pharmacist_id: 2, branch_id: 2, username: 'staff01', password: '123', fullName: 'Nguyễn Văn Nhân', role: 'STAFF', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nhan' }
];

// Alias for Login component
export const MOCK_USERS = MOCK_PHARMACISTS;

// 7. Customers Table
export const MOCK_CUSTOMERS = [
    { customer_id: 1, phone_number: '0987654321', name: 'Nguyễn Văn A', points: 1250 },
    { customer_id: 2, phone_number: '0123456789', name: 'Lê Thị B', points: 300 }
];

// 8. Invoices Table
export const MOCK_INVOICES = [
    { invoice_id: 1, branch_id: 1, pharmacist_id: 1, customer_id: 1, total_amount: 170000, sale_date: '2026-01-27T19:00:19' }
];

// 9. Invoice Details Table
export const MOCK_INVOICE_DETAILS = [
    { detail_id: 1, invoice_id: 1, batch_id: 101, unit_sold: 'Viên', quantity_sold: 10, unit_price: 1500, total_std_quantity: 10 },
    { detail_id: 2, invoice_id: 1, batch_id: 201, unit_sold: 'HỘP', quantity_sold: 1, unit_price: 250000, total_std_quantity: 10 }
];

// ==========================================================
// UI HELPER: Combined Medicines for easy UI rendering
// ==========================================================
export const MOCK_MEDICINES = [
    {
        medicine_id: 1,
        category_id: 1,
        category_name: 'GIẢM ĐAU',
        name: 'Panadol Extra',
        brand: 'GSK',
        base_unit: 'HỘP',
        sub_unit: 'Viên',
        conversion_rate: 100,
        base_sell_price: 120000,
        sub_sell_price: 1500,
        icon: 'pill',
        batches: [MOCK_BATCHES.find(b => b.medicine_id === 1)]
    },
    {
        medicine_id: 2,
        category_id: 2,
        category_name: 'KHÁNG SINH',
        name: 'Amoxicillin 500mg',
        brand: 'Imexpharm',
        base_unit: 'HỘP',
        sub_unit: 'Vỉ',
        conversion_rate: 10,
        base_sell_price: 250000,
        sub_sell_price: 28000,
        icon: 'flask',
        batches: [MOCK_BATCHES.find(b => b.medicine_id === 2)]
    },
    {
        medicine_id: 3,
        category_id: 3,
        category_name: 'TIÊU HÓA',
        name: 'Berberin',
        brand: 'Nội địa',
        base_unit: 'LỌ',
        sub_unit: 'Viên',
        conversion_rate: 1,
        base_sell_price: 30000,
        sub_sell_price: 30000,
        icon: 'thermometer',
        batches: [MOCK_BATCHES.find(b => b.medicine_id === 3)]
    },
    {
        medicine_id: 4,
        category_id: 4,
        category_name: 'THỰC PHẨM CHỨC NĂNG',
        name: 'Vitamin C Enervon',
        brand: 'United Pharma',
        base_unit: 'LỌ',
        sub_unit: 'Viên',
        conversion_rate: 30,
        base_sell_price: 85000,
        sub_sell_price: 3000,
        icon: 'heart',
        batches: [MOCK_BATCHES.find(b => b.medicine_id === 4)]
    },
    {
        medicine_id: 5,
        category_id: 5,
        category_name: 'HẠ SỐT',
        name: 'Paracetamol 500mg',
        brand: 'Nội địa',
        base_unit: 'HỘP',
        sub_unit: 'Viên',
        conversion_rate: 10,
        base_sell_price: 50000,
        sub_sell_price: 5500,
        icon: 'pill',
        batches: [MOCK_BATCHES.find(b => b.medicine_id === 5)]
    }
];
