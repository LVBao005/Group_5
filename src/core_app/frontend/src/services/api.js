/**
 * Central API Service
 * Import và export tất cả services để dễ quản lý
 */

export { authService } from './authService';
export { invoiceService } from './invoiceService';
export { medicineService } from './medicineService';
export { inventoryService } from './inventoryService';
export { default as dashboardService } from './dashboardService';

/**
 * API Endpoints Reference
 * 
 * INVOICES:
 * - POST   /api/invoices                - Tạo hóa đơn mới
 * - GET    /api/invoices                - Lấy danh sách hóa đơn (với filters)
 * - GET    /api/invoices/:id            - Chi tiết hóa đơn
 * - GET    /api/invoices/stats          - Thống kê hóa đơn
 * - GET    /api/invoices/search?q=...   - Tìm kiếm hóa đơn
 * 
 * MEDICINES:
 * - GET    /api/medicines               - Lấy danh sách thuốc
 * - GET    /api/medicines/search?q=...  - Tìm kiếm thuốc
 * - GET    /api/medicines/:id           - Chi tiết thuốc
 * 
 * BATCHES:
 * - GET    /api/batches                 - Lấy danh sách lô hàng
 * - GET    /api/batches/medicine/:id    - Lô hàng theo medicine
 * - GET    /api/batches/:id             - Chi tiết lô hàng
 * 
 * INVENTORY:
 * - GET    /api/inventory?branchId=...  - Tồn kho theo chi nhánh
 * - POST   /api/inventory/import        - Import CSV
 * 
 * DASHBOARD:
 * - GET    /api/dashboard/stats         - Thống kê tổng quan
 * - GET    /api/dashboard/revenue-timeline?period=... - Biểu đồ doanh thu
 * - GET    /api/dashboard/revenue-by-category - Doanh thu theo category
 * - GET    /api/dashboard/alerts        - Cảnh báo (hết hạn, hết hàng)
 * - GET    /api/dashboard/realtime      - Dữ liệu realtime
 */
