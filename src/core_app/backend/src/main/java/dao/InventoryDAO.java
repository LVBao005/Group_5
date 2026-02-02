package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import model.Inventory;
import utils.DBContext;

public class InventoryDAO {
    private Connection connection;

    public InventoryDAO() {
        try {
            this.connection = new DBContext().getConnection();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<Inventory> getInventoryByBranch(int branchId) throws SQLException {
        List<Inventory> inventoryList = new ArrayList<>();
        String sql = "SELECT i.*, m.name as medicine_name, b.batch_number, b.expiry_date, b.import_price_package, " +
                "m.base_unit, m.sub_unit, m.conversion_rate, m.base_sell_price, " +
                "m.category_id, c.category_name, m.medicine_id, m.brand " +
                "FROM inventory i " +
                "JOIN batches b ON i.batch_id = b.batch_id " +
                "JOIN medicines m ON b.medicine_id = m.medicine_id " +
                "JOIN categories c ON m.category_id = c.category_id " +
                "WHERE i.branch_id = ?";

        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, branchId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Inventory inv = new Inventory();
                    inv.setInventoryId(rs.getInt("inventory_id"));
                    inv.setBranchId(rs.getInt("branch_id"));
                    inv.setBatchId(rs.getInt("batch_id"));
                    inv.setQuantityStd(rs.getInt("quantity_std"));
                    inv.setLastUpdated(rs.getTimestamp("last_updated"));

                    // Joined fields
                    inv.setMedicineName(rs.getString("medicine_name"));
                    inv.setBatchNumber(rs.getString("batch_number"));
                    inv.setExpiryDate(rs.getDate("expiry_date"));
                    inv.setImportPrice(rs.getDouble("import_price_package"));
                    inv.setBaseUnit(rs.getString("base_unit"));
                    inv.setSubUnit(rs.getString("sub_unit"));
                    inv.setConversionRate(rs.getInt("conversion_rate"));
                    inv.setBaseSellPrice(rs.getDouble("base_sell_price"));
                    inv.setCategoryId(rs.getInt("category_id"));
                    inv.setCategoryName(rs.getString("category_name"));
                    inv.setMedicineId(rs.getInt("medicine_id"));
                    inv.setBrand(rs.getString("brand"));

                    inventoryList.add(inv);
                }
            }
        }
        return inventoryList;
    }

    // Method to import legacy CSV data (simplified for now)
    public void importBatch(int branchId, int medicineId, String batchNumber, Date expiry, int quantity,
            double importPrice) throws SQLException {
        // 1. Create Batch
        String batchSql = "INSERT INTO batches (medicine_id, batch_number, expiry_date, import_price_package) VALUES (?, ?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(batchSql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, medicineId);
            ps.setString(2, batchNumber);
            ps.setDate(3, expiry);
            ps.setDouble(4, importPrice);
            ps.executeUpdate();

            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) {
                int batchId = rs.getInt(1);

                // 2. Add to Inventory
                String invSql = "INSERT INTO inventory (branch_id, batch_id, quantity_std) VALUES (?, ?, ?)";
                try (PreparedStatement psInv = connection.prepareStatement(invSql)) {
                    psInv.setInt(1, branchId);
                    psInv.setInt(2, batchId);
                    psInv.setInt(3, quantity);
                    psInv.executeUpdate();
                }
            }
        }
    }
}
