package model;

public class Customer {
    private int customerId;
    private String phoneNumber;
    private String customerName;
    private int points;

    public Customer() {
    }

    public Customer(int customerId, String phoneNumber, String customerName, int points) {
        this.customerId = customerId;
        this.phoneNumber = phoneNumber;
        this.customerName = customerName;
        this.points = points;
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

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }
}
