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
