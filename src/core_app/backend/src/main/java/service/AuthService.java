package service;

import dao.PharmacistDAO;
import model.Pharmacist;
import java.sql.SQLException;

public class AuthService {
    private PharmacistDAO pharmacistDAO;

    public AuthService() {
        this.pharmacistDAO = new PharmacistDAO();
    }

    /**
     * Authenticates a pharmacist and returns the object without password.
     */
    public Pharmacist authenticate(String username, String password) throws SQLException {
        Pharmacist p = pharmacistDAO.login(username, password);
        if (p != null) {
            p.setPassword(null); // Safety: clear password before returning to service/controller layers
            return p;
        }
        return null;
    }

    /**
     * Checks if the pharmacist has ADMIN role.
     */
    public boolean isAdmin(Pharmacist p) {
        return p != null && "ADMIN".equalsIgnoreCase(p.getRole());
    }
}
