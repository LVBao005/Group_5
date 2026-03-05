package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import model.Branch;
import utils.DBContext;

public class BranchDAO {

    public BranchDAO() {
    }

    public List<Branch> getAllBranches() throws SQLException {
        List<Branch> branches = new ArrayList<>();
        String sql = "SELECT * FROM branches";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                branches.add(new Branch(
                        rs.getInt("branch_id"),
                        rs.getString("branch_name"),
                        rs.getString("address"),
                        rs.getString("phone_number")));
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
        return branches;
    }

    public Branch getBranchById(int id) throws SQLException {
        String sql = "SELECT * FROM branches WHERE branch_id = ?";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {
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
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
        return null;
    }

    public int getPharmacistCount(int branchId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM pharmacists WHERE branch_id = ?";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, branchId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
        return 0;
    }

    public int getInvoiceCount(int branchId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM invoices WHERE branch_id = ?";
        try (Connection connection = new DBContext().getConnection();
                PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, branchId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException(e);
        }
        return 0;
    }
}
