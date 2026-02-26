package com.pharmacy.simulator.model;

import com.google.gson.annotations.SerializedName;

/**
 * Represents the response from invoice creation
 */
public class CheckoutResponse {
    private boolean success;
    private String message;

    @SerializedName("invoiceId")
    private Integer invoiceId;

    @SerializedName("invoice_id")
    private Integer invoice_id; // Handle both naming conventions

    private String error;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getInvoiceId() {
        return invoiceId != null ? invoiceId : invoice_id;
    }

    public void setInvoiceId(Integer invoiceId) {
        this.invoiceId = invoiceId;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
