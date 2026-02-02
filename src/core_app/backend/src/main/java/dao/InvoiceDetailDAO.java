package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import model.InvoiceDetail;
import utils.DBContext;

public class InvoiceDetailDAO {
    private Connection connection;

    public InvoiceDetailDAO() {
        try {
            this.connection = new DBContext().getConnection();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void insertDetail(InvoiceDetail detail) throws SQLException {
        String sql = "INSERT INTO invoice_details (invoice_id, batch_id, unit_sold, quantity_sold, unit_price, total_std_quantity) "
                +
                "VALUES (?, ?, ?, ?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, detail.getInvoiceId());
            ps.setInt(2, detail.getBatchId());
            ps.setString(3, detail.getUnitSold());
            ps.setInt(4, detail.getQuantitySold());
            ps.setDouble(5, detail.getUnitPrice());
            ps.setInt(6, detail.getTotalStdQuantity());
            ps.executeUpdate();
        }
    }

    public List<InvoiceDetail> getAllInvoiceDetails() throws SQLException {
        List<InvoiceDetail> details = new ArrayList<>();
        String sql = "SELECT id.*, m.name as medicine_name, b.batch_number, b.expiry_date " +
                "FROM invoice_details id " +
                "JOIN batches b ON id.batch_id = b.batch_id " +
                "JOIN medicines m ON b.medicine_id = m.medicine_id " +
                "ORDER BY id.detail_id DESC";
        try (PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                details.add(extractInvoiceDetail(rs));
            }
        }
        return details;
    }

    public List<InvoiceDetail> getInvoiceDetailsByInvoiceId(int invoiceId) throws SQLException {
        List<InvoiceDetail> details = new ArrayList<>();
        String sql = "SELECT id.*, m.name as medicine_name, b.batch_number, b.expiry_date " +
                "FROM invoice_details id " +
                "JOIN batches b ON id.batch_id = b.batch_id " +
                "JOIN medicines m ON b.medicine_id = m.medicine_id " +
                "WHERE id.invoice_id = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, invoiceId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    details.add(extractInvoiceDetail(rs));
                }
            }
        }
        return details;
    }

    private InvoiceDetail extractInvoiceDetail(ResultSet rs) throws SQLException {
        InvoiceDetail detail = new InvoiceDetail();
        detail.setDetailId(rs.getInt("detail_id"));
        detail.setInvoiceId(rs.getInt("invoice_id"));
        detail.setBatchId(rs.getInt("batch_id"));
        detail.setUnitSold(rs.getString("unit_sold"));
        detail.setQuantitySold(rs.getInt("quantity_sold"));
        detail.setUnitPrice(rs.getDouble("unit_price"));
        detail.setTotalStdQuantity(rs.getInt("total_std_quantity"));
        detail.setMedicineName(rs.getString("medicine_name"));
        detail.setBatchNumber(rs.getString("batch_number"));
        detail.setExpiryDate(rs.getDate("expiry_date"));
        return detail;
    }
}
