package dao;

import java.sql.*;
import model.Pharmacist;
import utils.DBContext;

public class PharmacistDAO {
    private Connection connection;

    public PharmacistDAO() {
        try {
            this.connection = new DBContext().getConnection();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public Pharmacist login(String username, String password) throws SQLException {
        String sql = "SELECT * FROM pharmacists WHERE username = ? AND password = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, username);
            ps.setString(2, password);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractPharmacist(rs);
                }
            }
        }
        return null;
    }

    public Pharmacist getPharmacistById(int id) throws SQLException {
        String sql = "SELECT * FROM pharmacists WHERE pharmacist_id = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractPharmacist(rs);
                }
            }
        }
        return null;
    }

    private Pharmacist extractPharmacist(ResultSet rs) throws SQLException {
        Pharmacist p = new Pharmacist();
        p.setPharmacistId(rs.getInt("pharmacist_id"));
        p.setBranchId(rs.getInt("branch_id"));
        p.setUsername(rs.getString("username"));
        p.setPassword(rs.getString("password"));
        p.setFullName(rs.getString("full_name"));
        return p;
    }
}
