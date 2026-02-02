package service;

import dao.CustomerDAO;
import model.Customer;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public class CustomerService {
    private CustomerDAO customerDAO;

    public CustomerService() {
        this.customerDAO = new CustomerDAO();
    }

    public Customer searchByPhone(String phoneNumber) throws SQLException {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return null;
        }
        return customerDAO.getCustomerByPhone(phoneNumber);
    }

    public List<Customer> getAllCustomers() throws SQLException {
        return customerDAO.getAllCustomers();
    }

    public boolean registerCustomer(Customer customer) throws SQLException {
        // 1. Validate phone (simple check: 10-11 digits)
        if (customer.getPhoneNumber() == null || !customer.getPhoneNumber().matches("\\d{10,11}")) {
            throw new IllegalArgumentException("Số điện thoại không hợp lệ (cần 10-11 chữ số)");
        }

        // 2. Check for existence
        if (customerDAO.getCustomerByPhone(customer.getPhoneNumber()) != null) {
            throw new IllegalArgumentException("Khách hàng với số điện thoại này đã tồn tại");
        }

        // 3. Create
        customerDAO.createCustomer(customer);
        return true;
    }

    public List<Map<String, Object>> getTopCustomers() throws SQLException {
        return customerDAO.getTopCustomers(10);
    }
}
