package model;

import java.sql.Date;

/**
 * Model class for Invoice Detail
 */
public class InvoiceDetail {
    private int detailId;
    private int invoiceId;
    private int batchId;
    private String unitSold;
    private int quantitySold;
    private double unitPrice;
    private int totalStdQuantity;
    
    // Joined fields
    private String medicineName;
    private String batchNumber;
    private Date expiryDate;

    // Constructors
    public InvoiceDetail() {
    }

    public InvoiceDetail(int detailId, int invoiceId, int batchId, String unitSold, 
                        int quantitySold, double unitPrice, int totalStdQuantity) {
        this.detailId = detailId;
        this.invoiceId = invoiceId;
        this.batchId = batchId;
        this.unitSold = unitSold;
        this.quantitySold = quantitySold;
        this.unitPrice = unitPrice;
        this.totalStdQuantity = totalStdQuantity;
    }

    // Getters and Setters
    public int getDetailId() {
        return detailId;
    }

    public void setDetailId(int detailId) {
        this.detailId = detailId;
    }

    public int getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(int invoiceId) {
        this.invoiceId = invoiceId;
    }

    public int getBatchId() {
        return batchId;
    }

    public void setBatchId(int batchId) {
        this.batchId = batchId;
    }

    public String getUnitSold() {
        return unitSold;
    }

    public void setUnitSold(String unitSold) {
        this.unitSold = unitSold;
    }

    public int getQuantitySold() {
        return quantitySold;
    }

    public void setQuantitySold(int quantitySold) {
        this.quantitySold = quantitySold;
    }

    public double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public int getTotalStdQuantity() {
        return totalStdQuantity;
    }

    public void setTotalStdQuantity(int totalStdQuantity) {
        this.totalStdQuantity = totalStdQuantity;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public Date getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(Date expiryDate) {
        this.expiryDate = expiryDate;
    }

    @Override
    public String toString() {
        return "InvoiceDetail{" +
                "detailId=" + detailId +
                ", invoiceId=" + invoiceId +
                ", batchId=" + batchId +
                ", unitSold='" + unitSold + '\'' +
                ", quantitySold=" + quantitySold +
                ", unitPrice=" + unitPrice +
                ", totalStdQuantity=" + totalStdQuantity +
                ", medicineName='" + medicineName + '\'' +
                ", batchNumber='" + batchNumber + '\'' +
                ", expiryDate=" + expiryDate +
                '}';
    }
}
