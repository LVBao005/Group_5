package model;

public class Pharmacist {
    private int pharmacistId;
    private int branchId;
    private String username;
    private String password;
    private String fullName;

    public Pharmacist() {
    }

    public Pharmacist(int pharmacistId, int branchId, String username, String password, String fullName) {
        this.pharmacistId = pharmacistId;
        this.branchId = branchId;
        this.username = username;
        this.password = password;
        this.fullName = fullName;
    }

    public int getPharmacistId() {
        return pharmacistId;
    }

    public void setPharmacistId(int pharmacistId) {
        this.pharmacistId = pharmacistId;
    }

    public int getBranchId() {
        return branchId;
    }

    public void setBranchId(int branchId) {
        this.branchId = branchId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
}
