package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
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
        String sql = "SELECT p.*, b.branch_name FROM pharmacists p " +
                "JOIN branches b ON p.branch_id = b.branch_id " +
                "WHERE p.username = ? AND p.password = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, username);
            ps.setString(2, password);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractPharmacist(rs, true);
                }
            }
        }
        return null;
    }

    public List<Pharmacist> getAllPharmacists() throws SQLException {
        List<Pharmacist> list = new ArrayList<>();
        String sql = "SELECT p.*, b.branch_name FROM pharmacists p " +
                "JOIN branches b ON p.branch_id = b.branch_id";
        try (PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(extractPharmacist(rs, true));
            }
        }
        return list;
    }

    public List<Pharmacist> getPharmacistsByBranch(int branchId) throws SQLException {
        List<Pharmacist> list = new ArrayList<>();
        String sql = "SELECT p.*, b.branch_name FROM pharmacists p " +
                "JOIN branches b ON p.branch_id = b.branch_id " +
                "WHERE p.branch_id = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, branchId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(extractPharmacist(rs, true));
                }
            }
        }
        return list;
    }

    public Pharmacist getPharmacistById(int id) throws SQLException {
        String sql = "SELECT p.*, b.branch_name FROM pharmacists p " +
                "JOIN branches b ON p.branch_id = b.branch_id " +
                "WHERE p.pharmacist_id = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractPharmacist(rs, true);
                }
            }
        }
        return null;
    }

    private Pharmacist extractPharmacist(ResultSet rs, boolean includeJoined) throws SQLException {
        Pharmacist p = new Pharmacist();
        p.setPharmacistId(rs.getInt("pharmacist_id"));
        p.setBranchId(rs.getInt("branch_id"));
        p.setUsername(rs.getString("username"));
        p.setPassword(rs.getString("password"));
        p.setFullName(rs.getString("full_name"));
        p.setRole(rs.getString("role"));
        if (includeJoined) {
            p.setBranchName(rs.getString("branch_name"));
        }
        return p;
    }
}
