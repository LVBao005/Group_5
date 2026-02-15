package service;

import dao.BatchDAO;
import dao.BranchDAO;
import dao.CategoryDAO;
import model.Batch;
import model.Branch;
import model.Category;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

public class PharmacyService {
    private BatchDAO batchDAO;
    private CategoryDAO categoryDAO;
    private BranchDAO branchDAO;

    public PharmacyService() {
        this.batchDAO = new BatchDAO();
        this.categoryDAO = new CategoryDAO();
        this.branchDAO = new BranchDAO();
    }

    public List<Batch> getBatchInventoryForBranch(int branchId) throws SQLException {
        List<Batch> batches = batchDAO.getBatchesByBranch(branchId);
        LocalDate now = LocalDate.now();

        for (Batch b : batches) {
            // 1. Expiry Warning Logic
            if (b.getExpiryDate() != null) {
                LocalDate expiry = b.getExpiryDate().toLocalDate();
                long daysToExpiry = ChronoUnit.DAYS.between(now, expiry);

                if (daysToExpiry < 0) {
                    b.setExpiryStatus("EXPIRED");
                } else if (daysToExpiry < 15) {
                    b.setExpiryStatus("RED"); // Warning: < 15 days
                } else {
                    b.setExpiryStatus("NORMAL");
                }
            }

            // 2. Unit Conversion Logic
            b.processUnits();
        }
        return batches;
    }

    public List<Category> getAllCategories() throws SQLException {
        return categoryDAO.getAllCategories();
    }

    public List<Map<String, Object>> getCategoryStats() throws SQLException {
        return categoryDAO.getCategoryStatistics();
    }

    public List<Map<String, Object>> getBranchStatistics() throws SQLException {
        List<Branch> branches = branchDAO.getAllBranches();
        List<Map<String, Object>> statsList = new java.util.ArrayList<>();

        for (Branch b : branches) {
            Map<String, Object> stats = new java.util.HashMap<>();
            stats.put("branchId", b.getBranchId());
            stats.put("branchName", b.getBranchName());
            stats.put("address", b.getAddress());
            stats.put("phoneNumber", b.getPhoneNumber());

            // Real statistics from DAO
            stats.put("pharmacistCount", branchDAO.getPharmacistCount(b.getBranchId()));
            stats.put("invoiceCount", branchDAO.getInvoiceCount(b.getBranchId()));
            statsList.add(stats);
        }
        return statsList;
    }
}
