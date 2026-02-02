package model;

import java.sql.Timestamp;

public class Medicine {
    private int medicineId;
    private int categoryId;
    private String name;
    private String brand;
    private String baseUnit;
    private String subUnit;
    private int conversionRate;
    private double baseSellPrice;
    private double subSellPrice;
    private Timestamp createdAt;

    // Joined fields (optional, for display)
    private String categoryName;

    public Medicine() {
    }

    public Medicine(int medicineId, int categoryId, String name, String brand, String baseUnit, String subUnit,
            int conversionRate, double baseSellPrice, double subSellPrice, Timestamp createdAt) {
        this.medicineId = medicineId;
        this.categoryId = categoryId;
        this.name = name;
        this.brand = brand;
        this.baseUnit = baseUnit;
        this.subUnit = subUnit;
        this.conversionRate = conversionRate;
        this.baseSellPrice = baseSellPrice;
        this.subSellPrice = subSellPrice;
        this.createdAt = createdAt;
    }

    public int getMedicineId() {
        return medicineId;
    }

    public void setMedicineId(int medicineId) {
        this.medicineId = medicineId;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
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

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
}
