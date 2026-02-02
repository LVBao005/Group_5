package dao;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import model.Invoice;
import model.InvoiceDetail;
import utils.DBContext;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * DAO for Invoice operations
 */
public class InvoiceDAO {

    private Connection connection;

    public InvoiceDAO() {
        try {
            this.connection = new DBContext().getConnection();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Create a new invoice with its details
     * 
     * @param jsonData Invoice data from frontend
     * @return Created invoice object
     */
    public Invoice createInvoice(JsonObject jsonData) throws SQLException {
        Connection conn = null;
        PreparedStatement psInvoice = null;
        PreparedStatement psDetail = null;
        PreparedStatement psUpdateInventory = null;
        ResultSet rs = null;

        try {
            conn = new DBContext().getConnection();
            conn.setAutoCommit(false); // Start transaction

            // Extract invoice data
            int branchId = jsonData.get("branch_id").getAsInt();
            int pharmacistId = jsonData.get("pharmacist_id").getAsInt();
            Integer customerId = jsonData.has("customer_id") && !jsonData.get("customer_id").isJsonNull()
                    ? jsonData.get("customer_id").getAsInt()
                    : null;
            double totalAmount = jsonData.get("total_amount").getAsDouble();
            boolean isSimulated = jsonData.has("is_simulated") ? jsonData.get("is_simulated").getAsBoolean() : false;

            // Insert invoice (Using source_type ENUM: 'MANUAL' or 'SIMULATED')
            String sqlInvoice = "INSERT INTO Invoices (branch_id, pharmacist_id, customer_id, total_amount, source_type) "
                    +
                    "VALUES (?, ?, ?, ?, ?)";
            psInvoice = conn.prepareStatement(sqlInvoice, Statement.RETURN_GENERATED_KEYS);
            psInvoice.setInt(1, branchId);
            psInvoice.setInt(2, pharmacistId);
            if (customerId != null) {
                psInvoice.setInt(3, customerId);
            } else {
                psInvoice.setNull(3, Types.INTEGER);
            }
            psInvoice.setDouble(4, totalAmount);
            psInvoice.setString(5, isSimulated ? "SIMULATED" : "MANUAL"); // Map boolean to ENUM

            psInvoice.executeUpdate();

            // Get generated invoice_id
            rs = psInvoice.getGeneratedKeys();
            int invoiceId = 0;
            if (rs.next()) {
                invoiceId = rs.getInt(1);
            }

            // Insert invoice details
            JsonArray details = jsonData.getAsJsonArray("details");
            String sqlDetail = "INSERT INTO Invoice_Details (invoice_id, batch_id, unit_sold, quantity_sold, unit_price, total_std_quantity) "
                    +
                    "VALUES (?, ?, ?, ?, ?, ?)";
            psDetail = conn.prepareStatement(sqlDetail);

            // Update inventory (Use quantity_std)
            String sqlUpdateInventory = "UPDATE Inventory SET quantity_std = quantity_std - ? WHERE batch_id = ?";
            psUpdateInventory = conn.prepareStatement(sqlUpdateInventory);

            for (JsonElement detailElement : details) {
                JsonObject detail = detailElement.getAsJsonObject();

                int batchId = detail.get("batch_id").getAsInt();
                String unitSold = detail.get("unit_sold").getAsString();
                int quantitySold = detail.get("quantity_sold").getAsInt();
                double unitPrice = detail.get("unit_price").getAsDouble();
                int totalStdQuantity = detail.get("total_std_quantity").getAsInt();

                // Insert detail
                psDetail.setInt(1, invoiceId);
                psDetail.setInt(2, batchId);
                psDetail.setString(3, unitSold);
                psDetail.setInt(4, quantitySold);
                psDetail.setDouble(5, unitPrice);
                psDetail.setInt(6, totalStdQuantity);
                psDetail.addBatch();

                // Update inventory
                psUpdateInventory.setInt(1, totalStdQuantity);
                psUpdateInventory.setInt(2, batchId);
                psUpdateInventory.addBatch();
            }

            psDetail.executeBatch();
            psUpdateInventory.executeBatch();

            conn.commit(); // Commit transaction

            // Return created invoice
            return getInvoiceById(invoiceId);

        } catch (Exception e) {
            if (conn != null) {
                try {
                    conn.rollback(); // Rollback on error
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            throw new SQLException("Failed to create invoice: " + e.getMessage(), e);
        } finally {
            // Close resources
            if (rs != null)
                rs.close();
            if (psInvoice != null)
                psInvoice.close();
            if (psDetail != null)
                psDetail.close();
            if (psUpdateInventory != null)
                psUpdateInventory.close();
            if (conn != null) {
                conn.setAutoCommit(true);
                conn.close();
            }
        }
    }

    /**
     * Get all invoices with optional filters
     */
    public List<Invoice> getInvoices(String dateFrom, String dateTo, Integer pharmacistId, Boolean isSimulated)
            throws SQLException {
        List<Invoice> invoices = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
                "SELECT i.invoice_id, i.SALE_DATE, i.branch_id, i.pharmacist_id, i.customer_id, " +
                        "i.total_amount, i.source_type, " +
                        "b.branch_name, p.full_name as pharmacist_name, c.CUSTOMER_ID as customer_name " +
                        "FROM Invoices i " +
                        "LEFT JOIN Branches b ON i.branch_id = b.branch_id " +
                        "LEFT JOIN Pharmacists p ON i.pharmacist_id = p.pharmacist_id " +
                        "LEFT JOIN Customers c ON i.customer_id = c.customer_id " +
                        "WHERE 1=1 ");

        List<Object> params = new ArrayList<>();

        if (dateFrom != null && !dateFrom.isEmpty()) {
            sql.append("AND i.SALE_DATE >= ? ");
            params.add(dateFrom);
        }

        if (dateTo != null && !dateTo.isEmpty()) {
            sql.append("AND i.SALE_DATE <= ? ");
            params.add(dateTo);
        }

        if (pharmacistId != null) {
            sql.append("AND i.pharmacist_id = ? ");
            params.add(pharmacistId);
        }

        if (isSimulated != null) {
            sql.append("AND i.source_type = ? ");
            params.add(isSimulated ? "SIMULATED" : "MANUAL");
        }

        sql.append("ORDER BY i.SALE_DATE DESC");

        try (PreparedStatement ps = connection.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Invoice invoice = extractInvoiceFromResultSet(rs);
                    invoices.add(invoice);
                }
            }
        }

        return invoices;
    }

    /**
     * Get a specific invoice by ID with full details
     */
    public Invoice getInvoiceById(int invoiceId) throws SQLException {
        String sql = "SELECT i.invoice_id, i.SALE_DATE, i.branch_id, i.pharmacist_id, i.customer_id, " +
                "i.total_amount, i.source_type, " +
                "b.branch_name, p.full_name as pharmacist_name, c.CUSTOMER_ID as customer_name " +
                "FROM Invoices i " +
                "LEFT JOIN Branches b ON i.branch_id = b.branch_id " +
                "LEFT JOIN Pharmacists p ON i.pharmacist_id = p.pharmacist_id " +
                "LEFT JOIN Customers c ON i.customer_id = c.customer_id " +
                "WHERE i.invoice_id = ?";

        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, invoiceId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Invoice invoice = extractInvoiceFromResultSet(rs);

                    // Get invoice details
                    invoice.setDetails(getInvoiceDetails(invoiceId));

                    return invoice;
                }
            }
        }

        return null;
    }

    /**
     * Get invoice details for a specific invoice
     */
    private List<InvoiceDetail> getInvoiceDetails(int invoiceId) throws SQLException {
        List<InvoiceDetail> details = new ArrayList<>();

        String sql = "SELECT id.detail_id, id.invoice_id, id.batch_id, id.unit_sold, " +
                "id.quantity_sold, id.unit_price, id.total_std_quantity, " +
                "m.medicine_name, b.batch_number, b.expiry_date " +
                "FROM Invoice_Details id " +
                "JOIN Batches b ON id.batch_id = b.batch_id " +
                "JOIN Medicines m ON b.medicine_id = m.medicine_id " +
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

    /**
     * Get invoice statistics
     */
    public JsonObject getInvoiceStats(String dateFrom, String dateTo) throws SQLException {
        JsonObject stats = new JsonObject();

        StringBuilder sql = new StringBuilder(
                "SELECT COUNT(*) as total_invoices, " +
                        "SUM(total_amount) as total_revenue, " +
                        "SUM(CASE WHEN source_type = 'MANUAL' THEN 1 ELSE 0 END) as real_count, " +
                        "SUM(CASE WHEN source_type = 'SIMULATED' THEN 1 ELSE 0 END) as simulated_count " +
                        "FROM Invoices WHERE 1=1 ");

        List<Object> params = new ArrayList<>();

        if (dateFrom != null && !dateFrom.isEmpty()) {
            sql.append("AND SALE_DATE >= ? ");
            params.add(dateFrom);
        }

        if (dateTo != null && !dateTo.isEmpty()) {
            sql.append("AND SALE_DATE <= ? ");
            params.add(dateTo);
        }

        try (PreparedStatement ps = connection.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    stats.addProperty("total_invoices", rs.getInt("total_invoices"));
                    stats.addProperty("total_revenue", rs.getDouble("total_revenue"));
                    stats.addProperty("real_count", rs.getInt("real_count"));
                    stats.addProperty("simulated_count", rs.getInt("simulated_count"));
                }
            }
        }

        return stats;
    }

    /**
     * Search invoices by invoice ID, pharmacist name, or customer name
     */
    public List<Invoice> searchInvoices(String searchTerm) throws SQLException {
        List<Invoice> invoices = new ArrayList<>();

        String sql = "SELECT i.invoice_id, i.SALE_DATE, i.branch_id, i.pharmacist_id, i.customer_id, " +
                "i.total_amount, i.source_type, " +
                "b.branch_name, p.full_name as pharmacist_name, c.CUSTOMER_ID as customer_name " +
                "FROM Invoices i " +
                "LEFT JOIN Branches b ON i.branch_id = b.branch_id " +
                "LEFT JOIN Pharmacists p ON i.pharmacist_id = p.pharmacist_id " +
                "LEFT JOIN Customers c ON i.customer_id = c.customer_id " +
                "WHERE CAST(i.invoice_id AS VARCHAR) LIKE ? " +
                "OR p.full_name LIKE ? " +
                "OR c.CUSTOMER_ID LIKE ? " +
                "ORDER BY i.SALE_DATE DESC";

        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            String searchPattern = "%" + searchTerm + "%";
            ps.setString(1, searchPattern);
            ps.setString(2, searchPattern);
            ps.setString(3, searchPattern);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Invoice invoice = extractInvoiceFromResultSet(rs);
                    invoices.add(invoice);
                }
            }
        }

        return invoices;
    }

    /**
     * Extract Invoice object from ResultSet
     */
    private Invoice extractInvoiceFromResultSet(ResultSet rs) throws SQLException {
        Invoice invoice = new Invoice();
        invoice.setInvoiceId(rs.getInt("invoice_id"));
        invoice.setInvoiceDate(rs.getTimestamp("SALE_DATE"));
        invoice.setBranchId(rs.getInt("branch_id"));
        invoice.setPharmacistId(rs.getInt("pharmacist_id"));

        int customerId = rs.getInt("customer_id");
        if (!rs.wasNull()) {
            invoice.setCustomerId(customerId);
        }

        invoice.setTotalAmount(rs.getDouble("total_amount"));
        invoice.setIsSimulated("SIMULATED".equalsIgnoreCase(rs.getString("source_type")));
        invoice.setBranchName(rs.getString("branch_name"));
        invoice.setPharmacistName(rs.getString("pharmacist_name"));
        invoice.setCustomerName(rs.getString("customer_name"));

        return invoice;
    }
}
