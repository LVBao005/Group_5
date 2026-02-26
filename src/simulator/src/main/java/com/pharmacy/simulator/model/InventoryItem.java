package com.pharmacy.simulator.model;

import com.google.gson.annotations.SerializedName;

/**
 * Represents inventory item returned from the API
 */
public class InventoryItem {
    @SerializedName("inventory_id")
    private int inventoryId;

    @SerializedName("branch_id")
    private int branchId;

    @SerializedName("batch_id")
    private int batchId;

    @SerializedName("quantity_std")
    private int quantityStd;

    @SerializedName("medicine_name")
    private String medicineName;

    @SerializedName("medicine_id")
    private int medicineId;

    @SerializedName("batch_number")
    private String batchNumber;

    @SerializedName("base_unit")
    private String baseUnit;

    @SerializedName("sub_unit")
    private String subUnit;

    @SerializedName("conversion_rate")
    private int conversionRate;

    @SerializedName("base_sell_price")
    private double baseSellPrice;

    @SerializedName("sub_sell_price")
    private double subSellPrice;

    @SerializedName("expiry_date")
    private String expiryDate;

    @SerializedName("category_name")
    private String categoryName;

    @SerializedName("brand")
    private String brand;

    // Getters and Setters
    public int getInventoryId() {
        return inventoryId;
    }

    public void setInventoryId(int inventoryId) {
        this.inventoryId = inventoryId;
    }

    public int getBranchId() {
        return branchId;
    }

    public void setBranchId(int branchId) {
        this.branchId = branchId;
    }

    public int getBatchId() {
        return batchId;
    }

    public void setBatchId(int batchId) {
        this.batchId = batchId;
    }

    public int getQuantityStd() {
        return quantityStd;
    }

    public void setQuantityStd(int quantityStd) {
        this.quantityStd = quantityStd;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
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

    public double getBaseSellPrice() {
        return baseSellPrice;
    }

    public void setBaseSellPrice(double baseSellPrice) {
        this.baseSellPrice = baseSellPrice;
    }

    public double getSubSellPrice() {
        return subSellPrice;
    }

    public void setSubSellPrice(double subSellPrice) {
        this.subSellPrice = subSellPrice;
    }

    public String getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    @Override
    public String toString() {
        return String.format("%s (%s) - Batch: %s - Stock: %d %s", 
            medicineName, brand != null ? brand : "N/A", 
            batchNumber, quantityStd, subUnit != null ? subUnit : baseUnit);
    }
}
