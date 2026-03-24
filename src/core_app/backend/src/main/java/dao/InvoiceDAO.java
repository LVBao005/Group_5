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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * DAO for Invoice operations
 */
public class InvoiceDAO {

    public InvoiceDAO() {
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
        ResultSet rs = null;

        try {
            conn = new DBContext().getConnection();
            conn.setAutoCommit(false); // Start transaction

            // Extract invoice data
            int branchId = jsonData.get("branch_id").getAsInt();
            int pharmacistId = jsonData.get("pharmacist_id").getAsInt();
            int subTotal = jsonData.has("sub_total") ? jsonData.get("sub_total").getAsInt() : 0;
            int discountAmount = jsonData.has("discount_amount") ? jsonData.get("discount_amount").getAsInt() : 0;
            int totalAmount = jsonData.get("total_amount").getAsInt();
            boolean isSimulated = jsonData.has("is_simulated") ? jsonData.get("is_simulated").getAsBoolean() : false;

            // Handle customer: resolve by phone or create new
            Integer customerId = null;
            if (jsonData.has("customer_phone") && !jsonData.get("customer_phone").isJsonNull()) {
                String customerPhone = jsonData.get("customer_phone").getAsString();
                if (customerPhone != null && !customerPhone.trim().isEmpty()) {
                    CustomerDAO customerDAO = new CustomerDAO();
                    Customer customer = customerDAO.getCustomerByPhone(customerPhone, conn);

                    if (customer == null) {
                        customer = new Customer();
                        customer.setPhoneNumber(customerPhone);
                        String customerName = null;
                        if (jsonData.has("customer_name") && !jsonData.get("customer_name").isJsonNull()) {
                            customerName = jsonData.get("customer_name").getAsString();
                            if (customerName != null && !customerName.trim().isEmpty()) {
                                customer.setCustomerName(customerName.trim());
                            }
                        }
                        customerDAO.createCustomer(customer, conn);
                        customer = customerDAO.getCustomerByPhone(customerPhone, conn);
                    }

                    if (customer != null) {
                        customerId = customer.getCustomerId();
                        int pointsRedeemed = jsonData.has("points_redeemed")
                                ? jsonData.get("points_redeemed").getAsInt()
                                : 0;
                        int pointsEarned = jsonData.has("points_earned") ? jsonData.get("points_earned").getAsInt()
                                : (int) (totalAmount / 10);
                        int pointsDelta = pointsEarned - pointsRedeemed;
                        if (pointsDelta != 0) {
                            customerDAO.updateCustomerPoints(customerId, pointsDelta, conn);
                        }
                    }
                }
            }

            // Insert invoice (V15 schema)
            String sqlInvoice = "INSERT INTO invoices (branch_id, pharmacist_id, customer_id, sub_total, discount_amount, total_amount, points_redeemed, points_earned, is_simulated) "
                    + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            psInvoice = conn.prepareStatement(sqlInvoice, Statement.RETURN_GENERATED_KEYS);
            psInvoice.setInt(1, branchId);
            psInvoice.setInt(2, pharmacistId);
            if (customerId != null) {
                psInvoice.setInt(3, customerId);
            } else {
                psInvoice.setNull(3, Types.INTEGER);
            }
            psInvoice.setInt(4, subTotal);
            psInvoice.setInt(5, discountAmount);
            psInvoice.setInt(6, totalAmount);
            psInvoice.setInt(7, jsonData.has("points_redeemed") ? jsonData.get("points_redeemed").getAsInt() : 0);
            psInvoice.setInt(8, jsonData.has("points_earned") ? jsonData.get("points_earned").getAsInt()
                    : (int) (totalAmount / 10));
            psInvoice.setBoolean(9, isSimulated);

            psInvoice.executeUpdate();

            rs = psInvoice.getGeneratedKeys();
            int invoiceId = 0;
            if (rs.next()) {
                invoiceId = rs.getInt(1);
            }

            // Insert invoice details (V15 schema: removing unit_sold, total_std_quantity)
            JsonArray details = jsonData.getAsJsonArray("details");
            String sqlDetail = "INSERT INTO invoice_details (invoice_id, batch_id, quantity_sold, unit_price) VALUES (?, ?, ?, ?)";
            psDetail = conn.prepareStatement(sqlDetail);

            Map<Integer, Integer> batchInventoryDeductions = new HashMap<>();

            for (JsonElement detailElement : details) {
                JsonObject detail = detailElement.getAsJsonObject();
                int batchId = detail.get("batch_id").getAsInt();
                int quantitySold = detail.get("quantity_sold").getAsInt();
                double unitPrice = detail.get("unit_price").getAsDouble();

                batchInventoryDeductions.put(batchId, batchInventoryDeductions.getOrDefault(batchId, 0) + quantitySold);

                psDetail.setInt(1, invoiceId);
                psDetail.setInt(2, batchId);
                psDetail.setInt(3, quantitySold);
                psDetail.setDouble(4, unitPrice);
                psDetail.addBatch();
            }
            psDetail.executeBatch();

            // Perform consolidated inventory updates + LOG movements
            String sqlGetInventoryId = "SELECT inventory_id, quantity_std FROM inventory WHERE batch_id = ? AND branch_id = ? FOR UPDATE";
            String sqlUpdateInventory = "UPDATE inventory SET quantity_std = quantity_std - ? WHERE inventory_id = ?";
            StockMovementDAO stockMovementDAO = new StockMovementDAO();

            try (PreparedStatement psGetInv = conn.prepareStatement(sqlGetInventoryId);
                    PreparedStatement psUpdate = conn.prepareStatement(sqlUpdateInventory)) {

                for (Map.Entry<Integer, Integer> entry : batchInventoryDeductions.entrySet()) {
                    int batchId = entry.getKey();
                    int totalNeeded = entry.getValue();

                    psGetInv.setInt(1, batchId);
                    psGetInv.setInt(2, branchId);
                    try (ResultSet rsInv = psGetInv.executeQuery()) {
                        if (rsInv.next()) {
                            int invId = rsInv.getInt("inventory_id");
                            int available = rsInv.getInt("quantity_std");
                            if (available < totalNeeded) {
                                throw new SQLException("Insufficient stock for batch " + batchId);
                            }

                            // Update Inventory
                            psUpdate.setInt(1, totalNeeded);
                            psUpdate.setInt(2, invId);
                            psUpdate.executeUpdate();

                            // Log Movement
                            stockMovementDAO.logMovement(invId, "BÁN HÀNG", -totalNeeded, conn);
                        } else {
                            throw new SQLException(
                                    "Inventory record not found for batch " + batchId + " at branch " + branchId);
                        }
                    }
                }
            }

            conn.commit();
            return getInvoiceByIdWithConn(invoiceId, conn);

        } catch (Exception e) {
            if (conn != null)
                conn.rollback();
            throw new SQLException("Failed to create invoice: " + e.getMessage(), e);
        } finally {
            if (rs != null)
                rs.close();
            if (psInvoice != null)
                psInvoice.close();
            if (psDetail != null)
                psDetail.close();
            if (conn != null)
                conn.close();
        }
    }

    public List<Invoice> getInvoices(String dateFrom, String dateTo, Integer pharmacistId, Integer branchId,
            Boolean isSimulated) throws SQLException {
        List<Invoice> invoices = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
                "SELECT i.*, b.branch_name, p.full_name as pharmacist_name, c.customer_name " +
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

        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++)
                ps.setObject(i + 1, params.get(i));
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next())
                    invoices.add(extractInvoiceFromResultSet(rs));
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
        return invoices;
    }

    public Invoice getInvoiceById(int invoiceId) throws SQLException {
        try (Connection conn = new DBContext().getConnection()) {
            return getInvoiceByIdWithConn(invoiceId, conn);
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
    }

    private Invoice getInvoiceByIdWithConn(int invoiceId, Connection conn) throws SQLException {
        String sql = "SELECT i.*, b.branch_name, p.full_name as pharmacist_name, c.customer_name " +
                "FROM invoices i " +
                "LEFT JOIN branches b ON i.branch_id = b.branch_id " +
                "LEFT JOIN pharmacists p ON i.pharmacist_id = p.pharmacist_id " +
                "LEFT JOIN customers c ON i.customer_id = c.customer_id " +
                "WHERE i.invoice_id = ?";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, invoiceId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Invoice invoice = extractInvoiceFromResultSet(rs);
                    invoice.setDetails(getInvoiceDetails(invoiceId, conn));
                    return invoice;
                }
            }
        }
        return null;
    }

    private List<InvoiceDetail> getInvoiceDetails(int invoiceId, Connection conn) throws SQLException {
        List<InvoiceDetail> details = new ArrayList<>();
        String sql = "SELECT id.*, m.name as medicine_name, m.base_unit, m.sub_unit, m.conversion_rate, m.base_sell_price, m.sub_sell_price, b.batch_number, b.expiry_date "
                +
                "FROM invoice_details id " +
                "JOIN batches b ON id.batch_id = b.batch_id " +
                "JOIN medicines m ON b.medicine_id = m.medicine_id " +
                "WHERE id.invoice_id = ?";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, invoiceId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    InvoiceDetail detail = new InvoiceDetail();
                    detail.setDetailId(rs.getInt("detail_id"));
                    detail.setInvoiceId(rs.getInt("invoice_id"));
                    detail.setBatchId(rs.getInt("batch_id"));
                    detail.setQuantitySold(rs.getInt("quantity_sold"));
                    detail.setUnitPrice(rs.getDouble("unit_price"));
                    detail.setMedicineName(rs.getString("medicine_name"));
                    detail.setBatchNumber(rs.getString("batch_number"));
                    detail.setExpiryDate(rs.getDate("expiry_date"));
                    detail.setBaseUnit(rs.getString("base_unit"));
                    detail.setSubUnit(rs.getString("sub_unit"));
                    detail.setConversionRate(rs.getInt("conversion_rate"));

                    // Logic to determine unitSold based on price comparison
                    double unitPrice = rs.getDouble("unit_price");
                    String baseUnit = rs.getString("base_unit");
                    String subUnit = rs.getString("sub_unit");
                    int basePrice = rs.getInt("base_sell_price");
                    int subPrice = rs.getInt("sub_sell_price");
                    int conversionRate = rs.getInt("conversion_rate");

                    String unitSold = baseUnit; // Default to base unit

                    if (subUnit != null && !subUnit.isEmpty() && conversionRate > 1) {
                        // Check if the recorded price matches the sub unit price or is derived from
                        // base
                        if (unitPrice == subPrice || Math.abs(unitPrice - (double) basePrice / conversionRate) < 0.01) {
                            unitSold = subUnit;
                        } else if (unitPrice == basePrice) {
                            unitSold = baseUnit;
                        } else if (unitPrice < basePrice) {
                            // High chance it's the sub unit if significantly cheaper than base
                            unitSold = subUnit;
                        }
                    }
                    detail.setUnitSold(unitSold);

                    details.add(detail);
                }
            }
        }
        return details;
    }

    public JsonObject getInvoiceStats(String dateFrom, String dateTo) throws SQLException {
        JsonObject stats = new JsonObject();
        StringBuilder sql = new StringBuilder(
                "SELECT COUNT(*) as total_invoices, SUM(total_amount) as total_revenue, " +
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

        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++)
                ps.setObject(i + 1, params.get(i));
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    stats.addProperty("total_invoices", rs.getInt("total_invoices"));
                    stats.addProperty("total_revenue", rs.getLong("total_revenue"));
                    stats.addProperty("real_count", rs.getInt("real_count"));
                    stats.addProperty("simulated_count", rs.getInt("simulated_count"));
                }
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
        return stats;
    }

    public List<Invoice> searchInvoices(String searchTerm) throws SQLException {
        List<Invoice> invoices = new ArrayList<>();
        String sql = "SELECT i.*, b.branch_name, p.full_name as pharmacist_name, c.customer_name " +
                "FROM invoices i " +
                "LEFT JOIN branches b ON i.branch_id = b.branch_id " +
                "LEFT JOIN pharmacists p ON i.pharmacist_id = p.pharmacist_id " +
                "LEFT JOIN customers c ON i.customer_id = c.customer_id " +
                "WHERE CAST(i.invoice_id AS CHAR) LIKE ? OR p.full_name LIKE ? OR c.customer_name LIKE ? " +
                "ORDER BY i.invoice_date DESC";

        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {
            String searchPattern = "%" + searchTerm + "%";
            ps.setString(1, searchPattern);
            ps.setString(2, searchPattern);
            ps.setString(3, searchPattern);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next())
                    invoices.add(extractInvoiceFromResultSet(rs));
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
        return invoices;
    }

    private Invoice extractInvoiceFromResultSet(ResultSet rs) throws SQLException {
        Invoice inv = new Invoice();
        inv.setInvoiceId(rs.getInt("invoice_id"));
        inv.setInvoiceDate(rs.getTimestamp("invoice_date"));
        inv.setBranchId(rs.getInt("branch_id"));
        inv.setPharmacistId(rs.getInt("pharmacist_id"));
        int customerId = rs.getInt("customer_id");
        if (!rs.wasNull())
            inv.setCustomerId(customerId);
        inv.setSubTotal(rs.getInt("sub_total"));
        inv.setDiscountAmount(rs.getInt("discount_amount"));
        inv.setTotalAmount(rs.getInt("total_amount"));
        inv.setPointsRedeemed(rs.getInt("points_redeemed"));
        inv.setPointsEarned(rs.getInt("points_earned"));
        inv.setIsSimulated(rs.getBoolean("is_simulated"));
        inv.setBranchName(rs.getString("branch_name"));
        inv.setPharmacistName(rs.getString("pharmacist_name"));
        inv.setCustomerName(rs.getString("customer_name"));
        return inv;
    }
}
