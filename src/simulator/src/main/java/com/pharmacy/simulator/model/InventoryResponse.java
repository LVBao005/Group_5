package com.pharmacy.simulator.model;

/**
 * Represents the response from the inventory API
 */
public class InventoryResponse {
    private boolean success;
    private InventoryItem[] data;
    private String error;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public InventoryItem[] getData() {
        return data;
    }

    public void setData(InventoryItem[] data) {
        this.data = data;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
