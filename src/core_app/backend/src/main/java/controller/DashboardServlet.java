package controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import utils.DBContext;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.google.gson.Gson;

/**
 * Dashboard API Servlet
 * Provides comprehensive dashboard statistics and visualization data
 */
@WebServlet(name = "DashboardServlet", urlPatterns = { "/api/dashboard/*" })
public class DashboardServlet extends HttpServlet {

    private final Gson gson = new Gson();
    private final DBContext dbContext = new DBContext();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        HttpSession session = request.getSession(false);
        String pathInfo = request.getPathInfo();
        PrintWriter out = response.getWriter();

        // 1. Authentication Check
        if (session == null || session.getAttribute("user") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.write(gson.toJson(Map.of("error", "Unauthorized: Please login first")));
            return;
        }

        // 2. Authorization Check (Role Check) - Allow both ADMIN and PHARMACIST for now
        // to view dashboard
        // String role = (String) session.getAttribute("role");
        // if (!"ADMIN".equals(role)) {
        // response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        // out.write(gson.toJson(Map.of("error", "Forbidden: You do not have permission
        // to access dashboard")));
        // return;
        // }

        try {
            if (pathInfo == null || pathInfo.equals("/")) {
                pathInfo = "/stats";
            }

            switch (pathInfo) {
                case "/stats":
                    getOverallStats(out);
                    break;
                case "/revenue-timeline":
                    getRevenueTimeline(request, out);
                    break;
                case "/revenue-by-category":
                    getRevenueByCategory(out);
                    break;
                case "/alerts":
                    getAlerts(out);
                    break;
                case "/realtime":
                    getRealtimeData(out);
                    break;
                default:
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.write(gson.toJson(Map.of("error", "Endpoint not found")));
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(gson.toJson(Map.of("error", e.getMessage())));
            e.printStackTrace();
        }
    }

    /**
     * Get overall statistics (total revenue, orders, medicines count)
     */
    private void getOverallStats(PrintWriter out) throws SQLException, ClassNotFoundException {
        Connection conn = null;
        try {
            conn = dbContext.getConnection();
            conn.setAutoCommit(false);

            Map<String, Object> stats = new HashMap<>();

            // Total Revenue Today
            String revenueQuery = "SELECT COALESCE(SUM(total_amount), 0) as total_revenue " +
                    "FROM invoices " +
                    "WHERE DATE(invoice_date) = CURDATE()";
            try (PreparedStatement ps = conn.prepareStatement(revenueQuery);
                    ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    stats.put("totalRevenue", rs.getDouble("total_revenue"));
                }
            }

            // Total Orders Today
            String ordersQuery = "SELECT COUNT(*) as total_orders " +
                    "FROM invoices " +
                    "WHERE DATE(invoice_date) = CURDATE()";
            try (PreparedStatement ps = conn.prepareStatement(ordersQuery);
                    ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    stats.put("totalOrders", rs.getInt("total_orders"));
                }
            }

            // Total Medicines
            String medicinesQuery = "SELECT COUNT(DISTINCT medicine_id) as total_medicines FROM medicines";
            try (PreparedStatement ps = conn.prepareStatement(medicinesQuery);
                    ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    stats.put("totalMedicines", rs.getInt("total_medicines"));
                }
            }

            // Total Customers
            String customersQuery = "SELECT COUNT(*) as total_customers FROM customers";
            try (PreparedStatement ps = conn.prepareStatement(customersQuery);
                    ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    stats.put("totalCustomers", rs.getInt("total_customers"));
                }
            }

            // Low Stock Alert Count
            String lowStockQuery = "SELECT COUNT(DISTINCT i.batch_id) as low_stock_count " +
                    "FROM inventory i " +
                    "WHERE i.quantity_std < 50";
            try (PreparedStatement ps = conn.prepareStatement(lowStockQuery);
                    ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    stats.put("lowStockCount", rs.getInt("low_stock_count"));
                }
            }

            // Expiring Soon Alert Count
            String expiringSoonQuery = "SELECT COUNT(DISTINCT batch_id) as expiring_count " +
                    "FROM batches " +
                    "WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)";
            try (PreparedStatement ps = conn.prepareStatement(expiringSoonQuery);
                    ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    stats.put("expiringCount", rs.getInt("expiring_count"));
                }
            }

            out.write(gson.toJson(Map.of("success", true, "data", stats)));

        } finally {
            if (conn != null)
                conn.close();
        }
    }

    /**
     * Get revenue timeline data (hourly or daily)
     */
    private void getRevenueTimeline(HttpServletRequest request, PrintWriter out)
            throws SQLException, ClassNotFoundException {
        Connection conn = null;
        try {
            conn = dbContext.getConnection();
            conn.setAutoCommit(false);

            String period = request.getParameter("period"); // 'today', 'week', 'month'
            if (period == null)
                period = "today";

            List<Map<String, Object>> timeline = new ArrayList<>();
            String query;

            switch (period) {
                case "today":
                    // Hourly data for today
                    query = "SELECT HOUR(invoice_date) as hour, " +
                            "SUM(total_amount) as revenue, " +
                            "COUNT(*) as order_count " +
                            "FROM invoices " +
                            "WHERE DATE(invoice_date) = CURDATE() " +
                            "GROUP BY HOUR(invoice_date) " +
                            "ORDER BY hour";

                    try (PreparedStatement ps = conn.prepareStatement(query);
                            ResultSet rs = ps.executeQuery()) {
                        while (rs.next()) {
                            Map<String, Object> point = new HashMap<>();
                            point.put("time", String.format("%02d:00", rs.getInt("hour")));
                            point.put("revenue", rs.getDouble("revenue"));
                            point.put("orders", rs.getInt("order_count"));
                            timeline.add(point);
                        }
                    }
                    break;

                case "week":
                    // Daily data for last 7 days
                    query = "SELECT DATE(invoice_date) as date, " +
                            "SUM(total_amount) as revenue, " +
                            "COUNT(*) as order_count " +
                            "FROM invoices " +
                            "WHERE invoice_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) " +
                            "GROUP BY DATE(invoice_date) " +
                            "ORDER BY date";

                    try (PreparedStatement ps = conn.prepareStatement(query);
                            ResultSet rs = ps.executeQuery()) {
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
                        while (rs.next()) {
                            Map<String, Object> point = new HashMap<>();
                            LocalDate date = rs.getDate("date").toLocalDate();
                            point.put("time", date.format(formatter));
                            point.put("revenue", rs.getDouble("revenue"));
                            point.put("orders", rs.getInt("order_count"));
                            timeline.add(point);
                        }
                    }
                    break;

                case "month":
                    // Daily data for last 30 days
                    query = "SELECT DATE(invoice_date) as date, " +
                            "SUM(total_amount) as revenue, " +
                            "COUNT(*) as order_count " +
                            "FROM invoices " +
                            "WHERE invoice_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) " +
                            "GROUP BY DATE(invoice_date) " +
                            "ORDER BY date";

                    try (PreparedStatement ps = conn.prepareStatement(query);
                            ResultSet rs = ps.executeQuery()) {
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
                        while (rs.next()) {
                            Map<String, Object> point = new HashMap<>();
                            LocalDate date = rs.getDate("date").toLocalDate();
                            point.put("time", date.format(formatter));
                            point.put("revenue", rs.getDouble("revenue"));
                            point.put("orders", rs.getInt("order_count"));
                            timeline.add(point);
                        }
                    }
                    break;

                case "all":
                    // All time data grouped by month for clarity
                    query = "SELECT DATE_FORMAT(invoice_date, '%Y-%m') as month, " +
                            "SUM(total_amount) as revenue, " +
                            "COUNT(*) as order_count " +
                            "FROM invoices " +
                            "GROUP BY DATE_FORMAT(invoice_date, '%Y-%m') " +
                            "ORDER BY month";

                    try (PreparedStatement ps = conn.prepareStatement(query);
                            ResultSet rs = ps.executeQuery()) {
                        while (rs.next()) {
                            Map<String, Object> point = new HashMap<>();
                            point.put("time", rs.getString("month"));
                            point.put("revenue", rs.getDouble("revenue"));
                            point.put("orders", rs.getInt("order_count"));
                            timeline.add(point);
                        }
                    }
                    break;
            }

            out.write(gson.toJson(Map.of(
                    "success", true,
                    "data", timeline,
                    "period", period)));

        } finally {
            if (conn != null)
                conn.close();
        }
    }

    /**
     * Get revenue breakdown by medicine category
     */
    private void getRevenueByCategory(PrintWriter out) throws SQLException, ClassNotFoundException {
        Connection conn = null;
        try {
            conn = dbContext.getConnection();
            conn.setAutoCommit(false);

            String query = "SELECT c.category_name as category, " +
                    "SUM(id.total_std_quantity * id.unit_price) as revenue, " +
                    "COUNT(DISTINCT i.invoice_id) as order_count " +
                    "FROM invoice_details id " +
                    "JOIN batches b ON id.batch_id = b.batch_id " +
                    "JOIN medicines m ON b.medicine_id = m.medicine_id " +
                    "JOIN categories c ON m.category_id = c.category_id " +
                    "JOIN invoices i ON id.invoice_id = i.invoice_id " +
                    "GROUP BY c.category_id, c.category_name " +
                    "ORDER BY revenue DESC";

            List<Map<String, Object>> categories = new ArrayList<>();

            try (PreparedStatement ps = conn.prepareStatement(query);
                    ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> category = new HashMap<>();
                    category.put("name", rs.getString("category"));
                    category.put("value", rs.getDouble("revenue"));
                    category.put("orders", rs.getInt("order_count"));
                    categories.add(category);
                }
            }

            out.write(gson.toJson(Map.of("success", true, "data", categories)));

        } finally {
            if (conn != null)
                conn.close();
        }
    }

    /**
     * Get alerts for expiring medicines and low stock
     */
    private void getAlerts(PrintWriter out) throws SQLException, ClassNotFoundException {
        Connection conn = null;
        try {
            conn = dbContext.getConnection();
            conn.setAutoCommit(false);

            Map<String, Object> alerts = new HashMap<>();

            // Expiring Soon Medicines (within 30 days)
            String expiringQuery = "SELECT " +
                    "m.medicine_id, " +
                    "m.name, " +
                    "b.batch_id, " +
                    "b.expiry_date, " +
                    "DATEDIFF(b.expiry_date, CURDATE()) as days_until_expiry, " +
                    "SUM(i.quantity_std) as total_quantity " +
                    "FROM medicines m " +
                    "JOIN batches b ON m.medicine_id = b.medicine_id " +
                    "JOIN inventory i ON b.batch_id = i.batch_id " +
                    "WHERE b.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) " +
                    "GROUP BY m.medicine_id, m.name, b.batch_id, b.expiry_date " +
                    "ORDER BY b.expiry_date ASC " +
                    "LIMIT 10";

            List<Map<String, Object>> expiringMeds = new ArrayList<>();
            try (PreparedStatement ps = conn.prepareStatement(expiringQuery);
                    ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> med = new HashMap<>();
                    med.put("medicineId", rs.getString("medicine_id"));
                    med.put("name", rs.getString("name"));
                    med.put("batchId", rs.getString("batch_id"));
                    med.put("expiryDate", rs.getDate("expiry_date").toString());
                    med.put("daysUntilExpiry", rs.getInt("days_until_expiry"));
                    med.put("quantity", rs.getInt("total_quantity"));
                    expiringMeds.add(med);
                }
            }
            alerts.put("expiring", expiringMeds);

            // Low Stock Medicines (quantity < 50)
            String lowStockQuery = "SELECT " +
                    "m.medicine_id, " +
                    "m.name, " +
                    "b.batch_id, " +
                    "SUM(i.quantity_std) as total_quantity, " +
                    "m.base_unit " +
                    "FROM medicines m " +
                    "JOIN batches b ON m.medicine_id = b.medicine_id " +
                    "JOIN inventory i ON b.batch_id = i.batch_id " +
                    "GROUP BY m.medicine_id, m.name, b.batch_id, m.base_unit " +
                    "HAVING total_quantity < 50 " +
                    "ORDER BY total_quantity ASC " +
                    "LIMIT 10";

            List<Map<String, Object>> lowStockMeds = new ArrayList<>();
            try (PreparedStatement ps = conn.prepareStatement(lowStockQuery);
                    ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> med = new HashMap<>();
                    med.put("medicineId", rs.getString("medicine_id"));
                    med.put("name", rs.getString("name"));
                    med.put("batchId", rs.getString("batch_id"));
                    med.put("quantity", rs.getInt("total_quantity"));
                    med.put("unit", rs.getString("base_unit"));
                    lowStockMeds.add(med);
                }
            }
            alerts.put("lowStock", lowStockMeds);

            out.write(gson.toJson(Map.of("success", true, "data", alerts)));

        } finally {
            if (conn != null)
                conn.close();
        }
    }

    /**
     * Get real-time data for live updates
     */
    private void getRealtimeData(PrintWriter out) throws SQLException, ClassNotFoundException {
        Connection conn = null;
        try {
            conn = dbContext.getConnection();
            conn.setAutoCommit(false);

            Map<String, Object> realtime = new HashMap<>();

            // Last 5 minutes revenue
            String recentRevenueQuery = "SELECT " +
                    "COUNT(*) as recent_orders, " +
                    "COALESCE(SUM(total_amount), 0) as recent_revenue " +
                    "FROM invoices " +
                    "WHERE invoice_date >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)";

            try (PreparedStatement ps = conn.prepareStatement(recentRevenueQuery);
                    ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    realtime.put("recentOrders", rs.getInt("recent_orders"));
                    realtime.put("recentRevenue", rs.getDouble("recent_revenue"));
                }
            }

            // Current hour revenue
            String hourlyQuery = "SELECT " +
                    "COUNT(*) as hourly_orders, " +
                    "COALESCE(SUM(total_amount), 0) as hourly_revenue " +
                    "FROM invoices " +
                    "WHERE HOUR(invoice_date) = HOUR(NOW()) " +
                    "AND DATE(invoice_date) = CURDATE()";

            try (PreparedStatement ps = conn.prepareStatement(hourlyQuery);
                    ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    realtime.put("hourlyOrders", rs.getInt("hourly_orders"));
                    realtime.put("hourlyRevenue", rs.getDouble("hourly_revenue"));
                }
            }

            realtime.put("timestamp", LocalDateTime.now().toString());

            out.write(gson.toJson(Map.of("success", true, "data", realtime)));

        } finally {
            if (conn != null)
                conn.close();
        }
    }
}
