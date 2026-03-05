package model;

import java.sql.Date;

/**
 * Model class for Invoice Detail
 */
public class InvoiceDetail {
    private int detailId;
    private int invoiceId;
    private int batchId;
    private int quantitySold;
    private int unitPrice;
    private String unitSold;
    private int conversionRate;
    private String baseUnit;
    private String subUnit;

    // Joined fields
    private String medicineName;
    private String batchNumber;
    private Date expiryDate;

    // Constructors
    public InvoiceDetail() {
    }

    public InvoiceDetail(int detailId, int invoiceId, int batchId,
            int quantitySold, int unitPrice) {
        this.detailId = detailId;
        this.invoiceId = invoiceId;
        this.batchId = batchId;
        this.quantitySold = quantitySold;
        this.unitPrice = unitPrice;
        this.unitSold = "";
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

    public int getQuantitySold() {
        return quantitySold;
    }

    public void setQuantitySold(int quantitySold) {
        this.quantitySold = quantitySold;
    }

    public int getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(int unitPrice) {
        this.unitPrice = unitPrice;
    }

    public String getUnitSold() {
        return unitSold;
    }

    public void setUnitSold(String unitSold) {
        this.unitSold = unitSold;
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

    public int getConversionRate() {
        return conversionRate;
    }

    public void setConversionRate(int conversionRate) {
        this.conversionRate = conversionRate;
    }

    public String getBaseUnit() {
        return baseUnit;
    }

    public void setBaseUnit(String baseUnit) {
        this.baseUnit = baseUnit;
    }

    public String getSubUnit() {
        return subUnit;
    }

    public void setSubUnit(String subUnit) {
        this.subUnit = subUnit;
    }

    @Override
    public String toString() {
        return "InvoiceDetail{" +
                "detailId=" + detailId +
                ", invoiceId=" + invoiceId +
                ", batchId=" + batchId +
                ", quantitySold=" + quantitySold +
                ", unitPrice=" + unitPrice +
                ", unitSold='" + unitSold + '\'' +
                ", conversionRate=" + conversionRate +
                ", baseUnit='" + baseUnit + '\'' +
                ", subUnit='" + subUnit + '\'' +
                ", medicineName='" + medicineName + '\'' +
                ", batchNumber='" + batchNumber + '\'' +
                ", expiryDate=" + expiryDate +
                '}';
    }
}
