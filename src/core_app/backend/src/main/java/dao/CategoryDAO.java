package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import model.Category;
import utils.DBContext;

public class CategoryDAO {

    public CategoryDAO() {
    }

    public List<Category> getAllCategories() throws SQLException {
        List<Category> categories = new ArrayList<>();
        String sql = "SELECT * FROM categories ORDER BY category_name ASC";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                categories.add(new Category(
                        rs.getInt("category_id"),
                        rs.getString("category_name")));
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
        return categories;
    }

    public Category getCategoryById(int id) throws SQLException {
        String sql = "SELECT * FROM categories WHERE category_id = ?";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Category(
                            rs.getInt("category_id"),
                            rs.getString("category_name"));
                }
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
        return null;
    }

    public List<Map<String, Object>> getCategoryStatistics() throws SQLException {
        List<Map<String, Object>> stats = new ArrayList<>();
        String sql = "SELECT c.category_name, COUNT(m.medicine_id) as medicine_count " +
                "FROM categories c " +
                "LEFT JOIN medicines m ON c.category_id = m.category_id " +
                "GROUP BY c.category_id, c.category_name";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("categoryName", rs.getString("category_name"));
                map.put("medicineCount", rs.getInt("medicine_count"));
                stats.add(map);
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
        return stats;
    }
}
