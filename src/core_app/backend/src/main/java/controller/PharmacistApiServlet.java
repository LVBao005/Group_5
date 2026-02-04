package controller;

import com.google.gson.Gson;
import dao.PharmacistDAO;
import model.Pharmacist;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@WebServlet(name = "PharmacistApiServlet", urlPatterns = { "/api/pharmacists" })
public class PharmacistApiServlet extends HttpServlet {

    private PharmacistDAO pharmacistDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        this.pharmacistDAO = new PharmacistDAO();
        this.gson = new Gson();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();

        try {
            String branchIdStr = request.getParameter("branchId");
            List<Pharmacist> pharmacists;

            if (branchIdStr != null && !branchIdStr.isEmpty()) {
                int branchId = Integer.parseInt(branchIdStr);
                pharmacists = pharmacistDAO.getPharmacistsByBranch(branchId);
            } else {
                pharmacists = pharmacistDAO.getAllPharmacists();
            }

            // Important: Hide passwords before sending to frontend
            for (Pharmacist p : pharmacists) {
                p.setPassword(null);
            }

            out.print(gson.toJson(pharmacists));
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(Map.of("error", e.getMessage())));
        }
    }
}
