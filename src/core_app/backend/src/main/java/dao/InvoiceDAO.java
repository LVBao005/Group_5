package dao;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import model.Invoice;
import model.InvoiceDetail;
import model.Customer;
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
            double totalAmount = jsonData.get("total_amount").getAsDouble();
            boolean isSimulated = jsonData.has("is_simulated") ? jsonData.get("is_simulated").getAsBoolean() : false;

            // Handle customer: resolve by phone or create new
            Integer customerId = null;
            if (jsonData.has("customer_phone") && !jsonData.get("customer_phone").isJsonNull()) {
                String customerPhone = jsonData.get("customer_phone").getAsString();
                if (customerPhone != null && !customerPhone.trim().isEmpty()) {
                    CustomerDAO customerDAO = new CustomerDAO();
                    Customer customer = customerDAO.getCustomerByPhone(customerPhone);
                    
                    if (customer == null) {
                        // Create new customer with phone and optional name
                        customer = new Customer();
                        customer.setPhoneNumber(customerPhone);
                        
                        // Get customer name from request (optional)
                        String customerName = null;
                        if (jsonData.has("customer_name") && !jsonData.get("customer_name").isJsonNull()) {
                            customerName = jsonData.get("customer_name").getAsString();
                            if (customerName != null && !customerName.trim().isEmpty()) {
                                customer.setCustomerName(customerName.trim());
                            }
                        }
                        
                        customerDAO.createCustomer(customer);
                        
                        // Get the newly created customer
                        customer = customerDAO.getCustomerByPhone(customerPhone);
                    }
                    
                    if (customer != null) {
                        customerId = customer.getCustomerId();
                    }
                }
            }

            // Insert invoice
            String sqlInvoice = "INSERT INTO invoices (branch_id, pharmacist_id, customer_id, total_amount, is_simulated) "
                    + "VALUES (?, ?, ?, ?, ?)";
            psInvoice = conn.prepareStatement(sqlInvoice, Statement.RETURN_GENERATED_KEYS);
            psInvoice.setInt(1, branchId);
            psInvoice.setInt(2, pharmacistId);
            if (customerId != null) {
                psInvoice.setInt(3, customerId);
            } else {
                psInvoice.setNull(3, Types.INTEGER);
            }
            psInvoice.setDouble(4, totalAmount);
            psInvoice.setBoolean(5, isSimulated);

            psInvoice.executeUpdate();

            // Get generated invoice_id
            rs = psInvoice.getGeneratedKeys();
            int invoiceId = 0;
            if (rs.next()) {
                invoiceId = rs.getInt(1);
            }

            // Insert invoice details
            JsonArray details = jsonData.getAsJsonArray("details");
            String sqlDetail = "INSERT INTO invoice_details (invoice_id, batch_id, unit_sold, quantity_sold, unit_price, total_std_quantity) "
                    + "VALUES (?, ?, ?, ?, ?, ?)";
            psDetail = conn.prepareStatement(sqlDetail);

            // Update inventory only (quantity_std per branch)
            String sqlUpdateInventory = "UPDATE inventory SET quantity_std = quantity_std - ? WHERE batch_id = ? AND branch_id = ?";
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

                // Update inventory (deduct stock at branch level)
                psUpdateInventory.setInt(1, totalStdQuantity);
                psUpdateInventory.setInt(2, batchId);
                psUpdateInventory.setInt(3, branchId);
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
    public List<Invoice> getInvoices(String dateFrom, String dateTo, Integer pharmacistId, Integer branchId, Boolean isSimulated)
            throws SQLException {
        List<Invoice> invoices = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
                "SELECT i.invoice_id, i.invoice_date, i.branch_id, i.pharmacist_id, i.customer_id, " +
                        "i.total_amount, i.is_simulated, " +
                        "b.branch_name, p.full_name as pharmacist_name, c.customer_name as customer_name " +
                        "FROM invoices i " +
                        "LEFT JOIN branches b ON i.branch_id = b.branch_id " +
                        "LEFT JOIN pharmacists p ON i.pharmacist_id = p.pharmacist_id " +
                        "LEFT JOIN customers c ON i.customer_id = c.customer_id " +
                        "WHERE 1=1 ");

        List<Object> params = new ArrayList<>();

        if (dateFrom != null && !dateFrom.isEmpty()) {
            sql.append("AND i.invoice_date >= ? ");
            params.add(dateFrom);
        }

        if (dateTo != null && !dateTo.isEmpty()) {
            sql.append("AND i.invoice_date <= ? ");
            params.add(dateTo);
        }

        if (pharmacistId != null) {
            sql.append("AND i.pharmacist_id = ? ");
            params.add(pharmacistId);
        }

        if (branchId != null) {
            sql.append("AND i.branch_id = ? ");
            params.add(branchId);
        }

        if (isSimulated != null) {
            sql.append("AND i.is_simulated = ? ");
            params.add(isSimulated);
        }

        sql.append("ORDER BY i.invoice_date DESC");

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
        String sql = "SELECT i.invoice_id, i.invoice_date, i.branch_id, i.pharmacist_id, i.customer_id, " +
                "i.total_amount, i.is_simulated, " +
                "b.branch_name, p.full_name as pharmacist_name, c.customer_name as customer_name " +
                "FROM invoices i " +
                "LEFT JOIN branches b ON i.branch_id = b.branch_id " +
                "LEFT JOIN pharmacists p ON i.pharmacist_id = p.pharmacist_id " +
                "LEFT JOIN customers c ON i.customer_id = c.customer_id " +
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
                "m.name as medicine_name, b.batch_number, b.expiry_date " +
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

    /**
     * Get invoice statistics
     */
    public JsonObject getInvoiceStats(String dateFrom, String dateTo) throws SQLException {
        JsonObject stats = new JsonObject();

        StringBuilder sql = new StringBuilder(
                "SELECT COUNT(*) as total_invoices, " +
                        "SUM(total_amount) as total_revenue, " +
                        "SUM(CASE WHEN is_simulated = FALSE THEN 1 ELSE 0 END) as real_count, " +
                        "SUM(CASE WHEN is_simulated = TRUE THEN 1 ELSE 0 END) as simulated_count " +
                        "FROM invoices WHERE 1=1 ");

        List<Object> params = new ArrayList<>();

        if (dateFrom != null && !dateFrom.isEmpty()) {
            sql.append("AND invoice_date >= ? ");
            params.add(dateFrom);
        }

        if (dateTo != null && !dateTo.isEmpty()) {
            sql.append("AND invoice_date <= ? ");
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

        String sql = "SELECT i.invoice_id, i.invoice_date, i.branch_id, i.pharmacist_id, i.customer_id, " +
                "i.total_amount, i.is_simulated, " +
                "b.branch_name, p.full_name as pharmacist_name, c.customer_name as customer_name " +
                "FROM invoices i " +
                "LEFT JOIN branches b ON i.branch_id = b.branch_id " +
                "LEFT JOIN pharmacists p ON i.pharmacist_id = p.pharmacist_id " +
                "LEFT JOIN customers c ON i.customer_id = c.customer_id " +
                "WHERE CAST(i.invoice_id AS VARCHAR) LIKE ? " +
                "OR p.full_name LIKE ? " +
                "OR c.customer_name LIKE ? " +
                "ORDER BY i.invoice_date DESC";

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
        invoice.setInvoiceDate(rs.getTimestamp("invoice_date"));
        invoice.setBranchId(rs.getInt("branch_id"));
        invoice.setPharmacistId(rs.getInt("pharmacist_id"));

        int customerId = rs.getInt("customer_id");
        if (!rs.wasNull()) {
            invoice.setCustomerId(customerId);
        }

        invoice.setTotalAmount(rs.getDouble("total_amount"));
        invoice.setIsSimulated(rs.getBoolean("is_simulated"));
        invoice.setBranchName(rs.getString("branch_name"));
        invoice.setPharmacistName(rs.getString("pharmacist_name"));
        invoice.setCustomerName(rs.getString("customer_name"));

        return invoice;
    }
}
