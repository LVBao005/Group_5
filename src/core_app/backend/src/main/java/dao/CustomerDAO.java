package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import model.Customer;
import utils.DBContext;

public class CustomerDAO {
    private Connection connection;

    public CustomerDAO() {
        try {
            this.connection = new DBContext().getConnection();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<Customer> getAllCustomers() throws SQLException {
        List<Customer> list = new ArrayList<>();
        String sql = "SELECT * FROM customers";
        try (PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(extractCustomer(rs));
            }
        }
        return list;
    }

    public Customer getCustomerByPhone(String phoneNumber) throws SQLException {
        return getCustomerByPhone(phoneNumber, this.connection);
    }

    public Customer getCustomerByPhone(String phoneNumber, Connection conn) throws SQLException {
        String sql = "SELECT * FROM customers WHERE phone_number = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, phoneNumber);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractCustomer(rs);
                }
            }
        }
        return null;
    }

    public void createCustomer(Customer customer) throws SQLException {
        createCustomer(customer, this.connection);
    }

    public void createCustomer(Customer customer, Connection conn) throws SQLException {
        String sql = "INSERT INTO customers (phone_number, customer_name) VALUES (?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, customer.getPhoneNumber());
            ps.setString(2, customer.getCustomerName());
            ps.executeUpdate();
        }
    }

    public void updateCustomerPoints(int customerId, int pointsDelta, Connection conn) throws SQLException {
        String sql = "UPDATE customers SET points = points + ? WHERE customer_id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, pointsDelta);
            ps.setInt(2, customerId);
            ps.executeUpdate();
        }
    }

    public Customer getCustomerById(int id) throws SQLException {
        String sql = "SELECT * FROM customers WHERE customer_id = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractCustomer(rs);
                }
            }
        }
        return null;
    }

    /**
     * Get top customers by total spending
     */
    public List<Map<String, Object>> getTopCustomers(int limit) throws SQLException {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT c.customer_id, c.customer_name, c.phone_number, SUM(i.total_amount) as total_spent " +
                "FROM customers c " +
                "JOIN invoices i ON c.customer_id = i.customer_id " +
                "GROUP BY c.customer_id, c.customer_name, c.phone_number " +
                "ORDER BY total_spent DESC LIMIT ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, limit);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("customerId", rs.getInt("customer_id"));
                    map.put("customerName", rs.getString("customer_name"));
                    map.put("phoneNumber", rs.getString("phone_number"));
                    map.put("totalSpent", rs.getDouble("total_spent"));
                    list.add(map);
                }
            }
        }
        return list;
    }

    private Customer extractCustomer(ResultSet rs) throws SQLException {
        Customer c = new Customer();
        c.setCustomerId(rs.getInt("customer_id"));
        c.setPhoneNumber(rs.getString("phone_number"));
        c.setCustomerName(rs.getString("customer_name"));
        c.setPoints(rs.getInt("points"));
        return c;
    }
}
