package com.pharmacy.simulator.model;

import com.google.gson.annotations.SerializedName;

/**
 * Represents a detail item in an invoice
 */
public class InvoiceDetailRequest {
    @SerializedName("batch_id")
    private int batchId;

    @SerializedName("unit_sold")
    private String unitSold;

    @SerializedName("quantity_sold")
    private int quantitySold;

    @SerializedName("unit_price")
    private double unitPrice;

    @SerializedName("total_std_quantity")
    private int totalStdQuantity;

    public InvoiceDetailRequest(int batchId, String unitSold, int quantitySold, 
                               double unitPrice, int totalStdQuantity) {
        this.batchId = batchId;
        this.unitSold = unitSold;
        this.quantitySold = quantitySold;
        this.unitPrice = unitPrice;
        this.totalStdQuantity = totalStdQuantity;
    }

    // Getters and Setters
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
}
