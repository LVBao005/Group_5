package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import model.Pharmacist;
import utils.DBContext;

public class PharmacistDAO {

    public PharmacistDAO() {
    }

    public Pharmacist login(String username, String password) throws SQLException {
        String sql = "SELECT p.*, b.branch_name FROM pharmacists p " +
                "JOIN branches b ON p.branch_id = b.branch_id " +
                "WHERE p.username = ? AND p.password = ?";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, username);
            ps.setString(2, password);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractPharmacist(rs, true);
                }
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
        return null;
    }

    public List<Pharmacist> getAllPharmacists() throws SQLException {
        List<Pharmacist> list = new ArrayList<>();
        String sql = "SELECT p.*, b.branch_name FROM pharmacists p " +
                "JOIN branches b ON p.branch_id = b.branch_id";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(extractPharmacist(rs, true));
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
        return list;
    }

    public List<Pharmacist> getPharmacistsByBranch(int branchId) throws SQLException {
        List<Pharmacist> list = new ArrayList<>();
        String sql = "SELECT p.*, b.branch_name FROM pharmacists p " +
                "JOIN branches b ON p.branch_id = b.branch_id " +
                "WHERE p.branch_id = ?";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, branchId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(extractPharmacist(rs, true));
                }
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
        return list;
    }

    public Pharmacist getPharmacistById(int id) throws SQLException {
        String sql = "SELECT p.*, b.branch_name FROM pharmacists p " +
                "JOIN branches b ON p.branch_id = b.branch_id " +
                "WHERE p.pharmacist_id = ?";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractPharmacist(rs, true);
                }
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
        return null;
    }

    public Pharmacist getPharmacistByUsername(String username) throws SQLException {
        String sql = "SELECT p.*, b.branch_name FROM pharmacists p " +
                "JOIN branches b ON p.branch_id = b.branch_id " +
                "WHERE p.username = ?";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractPharmacist(rs, true);
                }
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
        return null;
    }

    /**
     * Get user by username (without join - for checking existence)
     */
    public Pharmacist getUserByUsername(String username) throws SQLException {
        String sql = "SELECT * FROM pharmacists WHERE username = ?";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return extractPharmacist(rs, false);
                }
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
        return null;
    }

    /**
     * Create a new pharmacist
     */
    public boolean createPharmacist(Pharmacist pharmacist) throws SQLException {
        String sql = "INSERT INTO pharmacists (branch_id, username, password, full_name, role) VALUES (?, ?, ?, ?, ?)";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, pharmacist.getBranchId());
            ps.setString(2, pharmacist.getUsername());
            ps.setString(3, pharmacist.getPassword());
            ps.setString(4, pharmacist.getFullName());
            ps.setString(5, pharmacist.getRole());

            int rows = ps.executeUpdate();
            return rows > 0;
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
    }

    /**
     * Update an existing pharmacist (excluding username and password)
     */
    public boolean updatePharmacist(Pharmacist pharmacist) throws SQLException {
        String sql = "UPDATE pharmacists SET full_name = ?, role = ?, branch_id = ? WHERE pharmacist_id = ?";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, pharmacist.getFullName());
            ps.setString(2, pharmacist.getRole());
            ps.setInt(3, pharmacist.getBranchId());
            ps.setInt(4, pharmacist.getPharmacistId());

            int rows = ps.executeUpdate();
            return rows > 0;
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
    }

    /**
     * Delete a pharmacist
     */
    public boolean deletePharmacist(int id) throws SQLException {
        String sql = "DELETE FROM pharmacists WHERE pharmacist_id = ?";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, id);
            int rows = ps.executeUpdate();
            return rows > 0;
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
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
