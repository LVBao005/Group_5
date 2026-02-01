package model;

import java.sql.Timestamp;
import java.util.List;

/**
 * Model class for Invoice
 */
public class Invoice {
    private int invoiceId;
    private Timestamp invoiceDate;
    private int branchId;
    private int pharmacistId;
    private Integer customerId;
    private double totalAmount;
    private boolean isSimulated;
    
    // Joined fields
    private String branchName;
    private String pharmacistName;
    private String customerName;
    
    // Invoice details
    private List<InvoiceDetail> details;

    // Constructors
    public Invoice() {
    }

    public Invoice(int invoiceId, Timestamp invoiceDate, int branchId, int pharmacistId, 
                   Integer customerId, double totalAmount, boolean isSimulated) {
        this.invoiceId = invoiceId;
        this.invoiceDate = invoiceDate;
        this.branchId = branchId;
        this.pharmacistId = pharmacistId;
        this.customerId = customerId;
        this.totalAmount = totalAmount;
        this.isSimulated = isSimulated;
    }

    // Getters and Setters
    public int getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(int invoiceId) {
        this.invoiceId = invoiceId;
    }

    public Timestamp getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(Timestamp invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public int getBranchId() {
        return branchId;
    }

    public void setBranchId(int branchId) {
        this.branchId = branchId;
    }

    public int getPharmacistId() {
        return pharmacistId;
    }

    public void setPharmacistId(int pharmacistId) {
        this.pharmacistId = pharmacistId;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public boolean isSimulated() {
        return isSimulated;
    }
    
    public boolean getIsSimulated() {
        return isSimulated;
    }

    public void setIsSimulated(boolean isSimulated) {
        this.isSimulated = isSimulated;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public String getPharmacistName() {
        return pharmacistName;
    }

    public void setPharmacistName(String pharmacistName) {
        this.pharmacistName = pharmacistName;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public List<InvoiceDetail> getDetails() {
        return details;
    }

    public void setDetails(List<InvoiceDetail> details) {
        this.details = details;
    }

    @Override
    public String toString() {
        return "Invoice{" +
                "invoiceId=" + invoiceId +
                ", invoiceDate=" + invoiceDate +
                ", branchId=" + branchId +
                ", pharmacistId=" + pharmacistId +
                ", customerId=" + customerId +
                ", totalAmount=" + totalAmount +
                ", isSimulated=" + isSimulated +
                ", branchName='" + branchName + '\'' +
                ", pharmacistName='" + pharmacistName + '\'' +
                ", customerName='" + customerName + '\'' +
                '}';
    }
}
