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
                    details.add(detail);
                }
            }
        }
        return details;
    }
}
