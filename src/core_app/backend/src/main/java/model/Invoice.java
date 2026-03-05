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
    private int subTotal;
    private int discountAmount;
    private int totalAmount;
    private int pointsRedeemed;
    private int pointsEarned;
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
            Integer customerId, int subTotal, int discountAmount, int totalAmount,
            int pointsRedeemed, int pointsEarned, boolean isSimulated) {
        this.invoiceId = invoiceId;
        this.invoiceDate = invoiceDate;
        this.branchId = branchId;
        this.pharmacistId = pharmacistId;
        this.customerId = customerId;
        this.subTotal = subTotal;
        this.discountAmount = discountAmount;
        this.totalAmount = totalAmount;
        this.pointsRedeemed = pointsRedeemed;
        this.pointsEarned = pointsEarned;
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

    public int getSubTotal() {
        return subTotal;
    }

    public void setSubTotal(int subTotal) {
        this.subTotal = subTotal;
    }

    public int getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(int discountAmount) {
        this.discountAmount = discountAmount;
    }

    public int getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(int totalAmount) {
        this.totalAmount = totalAmount;
    }

    public int getPointsRedeemed() {
        return pointsRedeemed;
    }

    public void setPointsRedeemed(int pointsRedeemed) {
        this.pointsRedeemed = pointsRedeemed;
    }

    public int getPointsEarned() {
        return pointsEarned;
    }

    public void setPointsEarned(int pointsEarned) {
        this.pointsEarned = pointsEarned;
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
                ", subTotal=" + subTotal +
                ", discountAmount=" + discountAmount +
                ", totalAmount=" + totalAmount +
                ", pointsRedeemed=" + pointsRedeemed +
                ", pointsEarned=" + pointsEarned +
                ", isSimulated=" + isSimulated +
                '}';
    }
}
