package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import model.Medicine;
import utils.DBContext;

public class MedicineDAO {
    private Connection connection;

    public MedicineDAO() {
        try {
            this.connection = new DBContext().getConnection();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<Medicine> getAllMedicines() throws SQLException {
        List<Medicine> medicines = new ArrayList<>();
        String sql = "SELECT m.*, c.category_name FROM medicines m " +
                "JOIN categories c ON m.category_id = c.category_id";

        try (PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                medicines.add(extractMedicine(rs));
            }
        }
        return medicines;
    }

    public List<Medicine> searchMedicines(String query) throws SQLException {
        List<Medicine> medicines = new ArrayList<>();
        String sql = "SELECT m.*, c.category_name FROM medicines m " +
                "JOIN categories c ON m.category_id = c.category_id " +
                "WHERE m.name LIKE ? OR m.brand LIKE ?";

        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            String pattern = "%" + query + "%";
            ps.setString(1, pattern);
            ps.setString(2, pattern);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    medicines.add(extractMedicine(rs));
                }
            }
        }
        return medicines;
    }

    public Medicine getMedicineById(int id) throws SQLException {
        String sql = "SELECT m.*, c.category_name FROM medicines m " +
                "JOIN categories c ON m.category_id = c.category_id " +
                "WHERE m.medicine_id = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractMedicine(rs);
                }
            }
        }
        return null;
    }

    private Medicine extractMedicine(ResultSet rs) throws SQLException {
        Medicine m = new Medicine();
        m.setMedicineId(rs.getInt("medicine_id"));
        m.setCategoryId(rs.getInt("category_id"));
        m.setName(rs.getString("name"));
        m.setBrand(rs.getString("brand"));
        m.setBaseUnit(rs.getString("base_unit"));
        m.setSubUnit(rs.getString("sub_unit"));
        m.setConversionRate(rs.getInt("conversion_rate"));
        m.setBaseSellPrice(rs.getDouble("base_sell_price"));
        m.setSubSellPrice(rs.getDouble("sub_sell_price"));
        m.setCreatedAt(rs.getTimestamp("created_at"));
        m.setCategoryName(rs.getString("category_name"));
        return m;
    }
}
