package service;

import dao.InventoryDAO;
import dao.InvoiceDetailDAO;
import model.InvoiceDetail;
import java.sql.SQLException;

public class SaleService {
    private InvoiceDetailDAO invoiceDetailDAO;
    private InventoryDAO inventoryDAO;

    public SaleService() {
        this.invoiceDetailDAO = new InvoiceDetailDAO();
        this.inventoryDAO = new InventoryDAO();
    }

    /**
     * Processes an individual sale item: saves detail and updates inventory.
     * 
     * @param branchId The branch where the sale occurred
     * @param detail   The sale detail to save
     */
    public void processSaleItem(int branchId, InvoiceDetail detail) throws SQLException {
        // 1. Insert the invoice detail record
        invoiceDetailDAO.insertDetail(detail);

        // 2. Decrement inventory (quantityChange is negative)
        // detail.getTotalStdQuantity should be the amount to subtract
        int quantityToSubtract = -detail.getTotalStdQuantity();
        inventoryDAO.updateBatchQuantity(branchId, detail.getBatchId(), quantityToSubtract);
    }
}
