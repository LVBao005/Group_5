package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import model.Branch;
import utils.DBContext;

public class BranchDAO {
    private Connection connection;

    public BranchDAO() {
        try {
            this.connection = new DBContext().getConnection();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<Branch> getAllBranches() throws SQLException {
        List<Branch> branches = new ArrayList<>();
        String sql = "SELECT * FROM branches";
        try (PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                branches.add(new Branch(
                        rs.getInt("branch_id"),
                        rs.getString("branch_name"),
                        rs.getString("address"),
                        rs.getString("phone_number")));
            }
        }
        return branches;
    }

    public Branch getBranchById(int id) throws SQLException {
        String sql = "SELECT * FROM branches WHERE branch_id = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Branch(
                            rs.getInt("branch_id"),
                            rs.getString("branch_name"),
                            rs.getString("address"),
                            rs.getString("phone_number"));
                }
            }
        }
        return null;
    }

    public int getPharmacistCount(int branchId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM pharmacists WHERE branch_id = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, branchId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        return 0;
    }

    public int getInvoiceCount(int branchId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM invoices WHERE branch_id = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, branchId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }
        return 0;
    }
}
