package com.pharmacy.simulator.model;

import com.google.gson.annotations.SerializedName;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents the checkout/invoice creation request
 */
public class CheckoutRequest {
    @SerializedName("branch_id")
    private int branchId;

    @SerializedName("pharmacist_id")
    private int pharmacistId;

    @SerializedName("customer_id")
    private Integer customerId;

    @SerializedName("total_amount")
    private double totalAmount;

    @SerializedName("is_simulated")
    private boolean isSimulated;

    @SerializedName("details")
    private List<InvoiceDetailRequest> details;

    public CheckoutRequest() {
        this.details = new ArrayList<>();
        this.isSimulated = true; // Default to simulated
    }

    public void addDetail(InvoiceDetailRequest detail) {
        this.details.add(detail);
    }

    public void calculateTotalAmount() {
        this.totalAmount = details.stream()
            .mapToDouble(d -> d.getUnitPrice() * d.getQuantitySold())
            .sum();
    }

    // Getters and Setters
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

    public void setSimulated(boolean simulated) {
        isSimulated = simulated;
    }

    public List<InvoiceDetailRequest> getDetails() {
        return details;
    }

    public void setDetails(List<InvoiceDetailRequest> details) {
        this.details = details;
    }
}
