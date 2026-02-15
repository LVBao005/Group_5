package controller;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import dao.InventoryDAO;
import model.Inventory;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@WebServlet(name = "InventoryServlet", urlPatterns = { "/api/inventory", "/api/inventory/*" })
public class InventoryServlet extends HttpServlet {

    private InventoryDAO inventoryDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        this.inventoryDAO = new InventoryDAO();
        this.gson = new GsonBuilder()
                .setDateFormat("yyyy-MM-dd")
                .setFieldNamingPolicy(com.google.gson.FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
                .create();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        HttpSession session = request.getSession(false);
        PrintWriter out = response.getWriter();

        // 1. Authentication Check
        if (session == null || session.getAttribute("user") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.write(gson.toJson(Map.of("error", "Unauthorized: Please login first")));
            return;
        }

        // 2. Authorization Check (Role Check)
        String role = (String) session.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write(gson.toJson(Map.of("error", "Forbidden: You do not have permission to access inventory")));
            return;
        }

        try {
            String branchIdStr = request.getParameter("branchId");
            int branchId = 1; // Default to branch 1 if not specified

            if (branchIdStr != null && !branchIdStr.isEmpty()) {
                branchId = Integer.parseInt(branchIdStr);
            }

            String query = request.getParameter("q");
            List<Inventory> inventory;

            if (query != null && !query.trim().isEmpty()) {
                inventory = inventoryDAO.searchInventoryForPOS(branchId, query);
            } else {
                inventory = inventoryDAO.getInventoryByBranch(branchId);
            }

            out.print(gson.toJson(inventory));

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(Map.of("error", e.getMessage())));
        }
    }

    // Allow for future expansion (POST for import, etc.)
}
