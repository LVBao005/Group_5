-- =====================================================
-- DEMO DATA FOR DASHBOARD TESTING
-- Tạo dữ liệu mẫu để test Dashboard
-- =====================================================

USE pharmacy_db;

-- =====================================================
-- 1. Thêm dữ liệu hóa đơn mẫu (Invoices)
-- =====================================================

-- Hôm nay - Morning (6:00 - 12:00)
INSERT INTO Invoices (id, branch_id, pharmacist_id, customer_id, total_amount, created_at) VALUES
(10001, 1, 1, 1, 150000, DATE_FORMAT(NOW(), '%Y-%m-%d 08:30:00')),
(10002, 1, 1, 2, 200000, DATE_FORMAT(NOW(), '%Y-%m-%d 09:15:00')),
(10003, 1, 2, 3, 350000, DATE_FORMAT(NOW(), '%Y-%m-%d 10:45:00')),
(10004, 1, 1, 4, 180000, DATE_FORMAT(NOW(), '%Y-%m-%d 11:20:00'));

-- Hôm nay - Afternoon (12:00 - 18:00)
INSERT INTO Invoices (id, branch_id, pharmacist_id, customer_id, total_amount, created_at) VALUES
(10005, 1, 2, 5, 420000, DATE_FORMAT(NOW(), '%Y-%m-%d 13:30:00')),
(10006, 1, 1, 6, 280000, DATE_FORMAT(NOW(), '%Y-%m-%d 14:15:00')),
(10007, 1, 2, 7, 520000, DATE_FORMAT(NOW(), '%Y-%m-%d 15:45:00')),
(10008, 1, 1, 8, 190000, DATE_FORMAT(NOW(), '%Y-%m-%d 16:30:00'));

-- Hôm nay - Evening (18:00 - 22:00)
INSERT INTO Invoices (id, branch_id, pharmacist_id, customer_id, total_amount, created_at) VALUES
(10009, 1, 2, 9, 310000, DATE_FORMAT(NOW(), '%Y-%m-%d 18:20:00')),
(10010, 1, 1, 10, 450000, DATE_FORMAT(NOW(), '%Y-%m-%d 19:45:00'));

-- Hôm qua
INSERT INTO Invoices (id, branch_id, pharmacist_id, customer_id, total_amount, created_at) VALUES
(10011, 1, 1, 11, 280000, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(10012, 1, 2, 12, 350000, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(10013, 1, 1, 13, 420000, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 7 ngày qua
INSERT INTO Invoices (id, branch_id, pharmacist_id, customer_id, total_amount, created_at) VALUES
(10014, 1, 1, 14, 500000, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(10015, 1, 2, 15, 380000, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(10016, 1, 1, 16, 620000, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(10017, 1, 2, 17, 290000, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(10018, 1, 1, 18, 450000, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(10019, 1, 2, 19, 540000, DATE_SUB(NOW(), INTERVAL 7 DAY));

-- =====================================================
-- 2. Thêm chi tiết hóa đơn theo category
-- =====================================================

-- Category 1: Kháng sinh (Antibiotics)
INSERT INTO InvoiceDetails (id, invoice_id, batch_id, unit_sold, quantity_sold, unit_price, total_std_quantity) VALUES
(20001, 10001, 'BATCH001', 'HỘP', 1, 150000, 10),
(20002, 10003, 'BATCH001', 'HỘP', 2, 150000, 20),
(20003, 10006, 'BATCH001', 'HỘP', 1, 150000, 10);

-- Category 2: Thực phẩm chức năng (Supplements)
INSERT INTO InvoiceDetails (id, invoice_id, batch_id, unit_sold, quantity_sold, unit_price, total_std_quantity) VALUES
(20004, 10002, 'BATCH002', 'HỘP', 1, 200000, 30),
(20005, 10005, 'BATCH002', 'HỘP', 2, 200000, 60),
(20006, 10009, 'BATCH002', 'HỘP', 1, 200000, 30);

-- Category 3: Mỹ phẩm (Cosmetics)
INSERT INTO InvoiceDetails (id, invoice_id, batch_id, unit_sold, quantity_sold, unit_price, total_std_quantity) VALUES
(20007, 10004, 'BATCH003', 'CHAI', 1, 180000, 1),
(20008, 10007, 'BATCH003', 'CHAI', 3, 180000, 3),
(20009, 10010, 'BATCH003', 'CHAI', 2, 180000, 2);

-- =====================================================
-- 3. Tạo thuốc sắp hết hạn (Expiring Soon)
-- =====================================================

-- Hết hạn sau 5 ngày (Critical)
INSERT INTO Batches (id, medicine_id, expiry_date, quantity) VALUES
('BATCH_EXP_001', 'MED001', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 50),
('BATCH_EXP_002', 'MED002', DATE_ADD(CURDATE(), INTERVAL 6 DAY), 30);

-- Hết hạn sau 10 ngày (Warning)
INSERT INTO Batches (id, medicine_id, expiry_date, quantity) VALUES
('BATCH_EXP_003', 'MED003', DATE_ADD(CURDATE(), INTERVAL 10 DAY), 80),
('BATCH_EXP_004', 'MED004', DATE_ADD(CURDATE(), INTERVAL 12 DAY), 60);

-- Hết hạn sau 20 ngày (Notice)
INSERT INTO Batches (id, medicine_id, expiry_date, quantity) VALUES
('BATCH_EXP_005', 'MED005', DATE_ADD(CURDATE(), INTERVAL 20 DAY), 100),
('BATCH_EXP_006', 'MED006', DATE_ADD(CURDATE(), INTERVAL 25 DAY), 75);

-- =====================================================
-- 4. Tạo thuốc sắp hết hàng (Low Stock)
-- =====================================================

-- Tồn kho rất thấp (Critical) - <= 10
INSERT INTO Inventory (id, batch_id, branch_id, quantity) VALUES
(30001, 'BATCH_LOW_001', 1, 5),
(30002, 'BATCH_LOW_002', 1, 8);

-- Tồn kho thấp (Warning) - 11-30
INSERT INTO Inventory (id, batch_id, branch_id, quantity) VALUES
(30003, 'BATCH_LOW_003', 1, 15),
(30004, 'BATCH_LOW_004', 1, 25);

-- Tồn kho sắp hết (Notice) - 31-49
INSERT INTO Inventory (id, batch_id, branch_id, quantity) VALUES
(30005, 'BATCH_LOW_005', 1, 35),
(30006, 'BATCH_LOW_006', 1, 42);

-- =====================================================
-- 5. Link Batches với Medicines (nếu chưa có)
-- =====================================================

-- Cập nhật medicine_id cho các batches
UPDATE Batches SET medicine_id = 'MED_PARACETAMOL' WHERE id LIKE 'BATCH_EXP_%';
UPDATE Batches SET medicine_id = 'MED_VITAMIN_C' WHERE id LIKE 'BATCH_LOW_%';

-- =====================================================
-- 6. Verify Data
-- =====================================================

-- Kiểm tra tổng doanh thu hôm nay
SELECT 
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value
FROM Invoices
WHERE DATE(created_at) = CURDATE();

-- Kiểm tra cảnh báo hết hạn
SELECT 
    COUNT(*) as expiring_count
FROM Batches
WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY);

-- Kiểm tra cảnh báo hết hàng
SELECT 
    COUNT(*) as low_stock_count
FROM Inventory
WHERE quantity < 50;

-- =====================================================
-- SCRIPT COMPLETED
-- Dashboard sẵn sàng test với dữ liệu mẫu!
-- =====================================================

-- Để xóa dữ liệu test và reset:
-- DELETE FROM InvoiceDetails WHERE id >= 20001;
-- DELETE FROM Invoices WHERE id >= 10001;
-- DELETE FROM Inventory WHERE id >= 30001;
-- DELETE FROM Batches WHERE id LIKE 'BATCH_EXP_%' OR id LIKE 'BATCH_LOW_%';
