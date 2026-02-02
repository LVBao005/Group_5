package model;

import java.sql.Date;
import java.time.LocalDate;

public class Batch {
    private int batchId;
    private int medicineId;
    private String batchNumber;
    private Date manufacturingDate;
    private Date expiryDate;
    private double importPricePackage;

    public Batch() {
    }

    public Batch(int batchId, int medicineId, String batchNumber, Date manufacturingDate, Date expiryDate,
            double importPricePackage) {
        this.batchId = batchId;
        this.medicineId = medicineId;
        this.batchNumber = batchNumber;
        this.manufacturingDate = manufacturingDate;
        this.expiryDate = expiryDate;
        this.importPricePackage = importPricePackage;
    }

    public int getBatchId() {
        return batchId;
    }

    public void setBatchId(int batchId) {
        this.batchId = batchId;
    }

    public int getMedicineId() {
        return medicineId;
    }

    public void setMedicineId(int medicineId) {
        this.medicineId = medicineId;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public Date getManufacturingDate() {
        return manufacturingDate;
    }

    public void setManufacturingDate(Date manufacturingDate) {
        this.manufacturingDate = manufacturingDate;
    }

    public Date getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(Date expiryDate) {
        this.expiryDate = expiryDate;
    }

    public double getImportPricePackage() {
        return importPricePackage;
    }

    public void setImportPricePackage(double importPricePackage) {
        this.importPricePackage = importPricePackage;
    }

    // Helper to check expiry
    public boolean isExpiringSoon(int daysThreshold) {
        if (expiryDate == null)
            return false;
        LocalDate expiry = expiryDate.toLocalDate();
        LocalDate now = LocalDate.now();
        return !expiry.isBefore(now) && expiry.isBefore(now.plusDays(daysThreshold));
    }

    public boolean isExpired() {
        if (expiryDate == null)
            return false;
        return expiryDate.toLocalDate().isBefore(LocalDate.now());
    }
}
