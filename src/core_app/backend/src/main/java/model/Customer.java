package model;

public class Customer {
    private int customerId;
    private String phoneNumber;
    private String customerName;

    public Customer() {
    }

    public Customer(int customerId, String phoneNumber, String customerName) {
        this.customerId = customerId;
        this.phoneNumber = phoneNumber;
        this.customerName = customerName;
    }

    public int getCustomerId() {
        return customerId;
    }

    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
}
