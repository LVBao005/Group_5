package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import model.InvoiceDetail;
import utils.DBContext;

public class InvoiceDetailDAO {

    public InvoiceDetailDAO() {
    }

    public void insertDetail(InvoiceDetail detail) throws SQLException {
        String sql = "INSERT INTO invoice_details (invoice_id, batch_id, quantity_sold, unit_price) VALUES (?, ?, ?, ?)";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, detail.getInvoiceId());
            ps.setInt(2, detail.getBatchId());
            ps.setInt(3, detail.getQuantitySold());
            ps.setInt(4, detail.getUnitPrice());
            ps.executeUpdate();
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
    }

    public List<InvoiceDetail> getAllInvoiceDetails() throws SQLException {
        List<InvoiceDetail> details = new ArrayList<>();
        String sql = "SELECT id.*, m.name as medicine_name, b.batch_number, b.expiry_date " +
                "FROM invoice_details id " +
                "JOIN batches b ON id.batch_id = b.batch_id " +
                "JOIN medicines m ON b.medicine_id = m.medicine_id " +
                "ORDER BY id.detail_id DESC";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                details.add(extractInvoiceDetail(rs));
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
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
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, invoiceId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    details.add(extractInvoiceDetail(rs));
                }
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
        return details;
    }

    private InvoiceDetail extractInvoiceDetail(ResultSet rs) throws SQLException {
        InvoiceDetail detail = new InvoiceDetail();
        detail.setDetailId(rs.getInt("detail_id"));
        detail.setInvoiceId(rs.getInt("invoice_id"));
        detail.setBatchId(rs.getInt("batch_id"));
        detail.setQuantitySold(rs.getInt("quantity_sold"));
        detail.setUnitPrice(rs.getInt("unit_price"));
        detail.setMedicineName(rs.getString("medicine_name"));
        detail.setBatchNumber(rs.getString("batch_number"));
        detail.setExpiryDate(rs.getDate("expiry_date"));
        return detail;
    }
}
