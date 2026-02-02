package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import model.Batch;
import utils.DBContext;

public class BatchDAO {
    private Connection connection;

    public BatchDAO() {
        try {
            this.connection = new DBContext().getConnection();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<Batch> getBatchesByMedicine(int medicineId) throws SQLException {
        List<Batch> batches = new ArrayList<>();
        // FIFO: Order by expiry_date ASC
        String sql = "SELECT * FROM batches WHERE medicine_id = ? ORDER BY expiry_date ASC";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, medicineId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    batches.add(extractBatch(rs));
                }
            }
        }
        return batches;
    }

    public Batch getBatchById(int id) throws SQLException {
        String sql = "SELECT * FROM batches WHERE batch_id = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractBatch(rs);
                }
            }
        }
        return null;
    }

    public List<Batch> getBatchesByBranch(int branchId) throws SQLException {
        List<Batch> batches = new ArrayList<>();
        String sql = "SELECT b.*, m.name as medicine_name, m.base_unit, m.sub_unit, m.conversion_rate, i.quantity_std "
                +
                "FROM batches b " +
                "JOIN medicines m ON b.medicine_id = m.medicine_id " +
                "JOIN inventory i ON b.batch_id = i.batch_id " +
                "WHERE i.branch_id = ? AND i.quantity_std > 0 " +
                "ORDER BY b.expiry_date ASC";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, branchId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Batch b = extractBatch(rs);
                    // Set joined fields (Model needs these fields)
                    b.setMedicineName(rs.getString("medicine_name"));
                    b.setBaseUnit(rs.getString("base_unit"));
                    b.setSubUnit(rs.getString("sub_unit"));
                    b.setConversionRate(rs.getInt("conversion_rate"));
                    b.setQuantityStd(rs.getInt("quantity_std"));
                    batches.add(b);
                }
            }
        }
        return batches;
    }

    private Batch extractBatch(ResultSet rs) throws SQLException {
        Batch b = new Batch();
        b.setBatchId(rs.getInt("batch_id"));
        b.setMedicineId(rs.getInt("medicine_id"));
        b.setBatchNumber(rs.getString("batch_number"));
        b.setManufacturingDate(rs.getDate("manufacturing_date"));
        b.setExpiryDate(rs.getDate("expiry_date"));
        b.setImportPricePackage(rs.getFloat("import_price_package"));
        return b;
    }
}
