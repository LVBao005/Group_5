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
    private int initialQuantity;
    private int currentTotalQuantity;
    private java.sql.Timestamp importDate;

    // Joined fields
    private String medicineName;
    private String baseUnit;
    private String subUnit;
    private int conversionRate;
    private int quantityStd;
    private int currentBoxes;
    private int currentUnits;
    private String expiryStatus; // e.g., "NORMAL", "RED", "EXPIRED"

    public Batch() {
    }

    public Batch(int batchId, int medicineId, String batchNumber, Date manufacturingDate, Date expiryDate,
            double importPricePackage, int initialQuantity, int currentTotalQuantity, java.sql.Timestamp importDate) {
        this.batchId = batchId;
        this.medicineId = medicineId;
        this.batchNumber = batchNumber;
        this.manufacturingDate = manufacturingDate;
        this.expiryDate = expiryDate;
        this.importPricePackage = importPricePackage;
        this.initialQuantity = initialQuantity;
        this.currentTotalQuantity = currentTotalQuantity;
        this.importDate = importDate;
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

    public int getInitialQuantity() {
        return initialQuantity;
    }

    public void setInitialQuantity(int initialQuantity) {
        this.initialQuantity = initialQuantity;
    }

    public int getCurrentTotalQuantity() {
        return currentTotalQuantity;
    }

    public void setCurrentTotalQuantity(int currentTotalQuantity) {
        this.currentTotalQuantity = currentTotalQuantity;
    }

    public java.sql.Timestamp getImportDate() {
        return importDate;
    }

    public void setImportDate(java.sql.Timestamp importDate) {
        this.importDate = importDate;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
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

    public int getConversionRate() {
        return conversionRate;
    }

    public void setConversionRate(int conversionRate) {
        this.conversionRate = conversionRate;
    }

    public int getQuantityStd() {
        return quantityStd;
    }

    public void setQuantityStd(int quantityStd) {
        this.quantityStd = quantityStd;
    }

    public String getExpiryStatus() {
        return expiryStatus;
    }

    public void setExpiryStatus(String expiryStatus) {
        this.expiryStatus = expiryStatus;
    }

    public int getCurrentBoxes() {
        return currentBoxes;
    }

    public void setCurrentBoxes(int currentBoxes) {
        this.currentBoxes = currentBoxes;
    }

    public int getCurrentUnits() {
        return currentUnits;
    }

    public void setCurrentUnits(int currentUnits) {
        this.currentUnits = currentUnits;
    }

    public void processUnits() {
        if (conversionRate > 0) {
            this.currentBoxes = quantityStd / conversionRate;
            this.currentUnits = quantityStd % conversionRate;
        } else {
            this.currentBoxes = 0;
            this.currentUnits = quantityStd;
        }
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
