package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import dao.PharmacistDAO;
import model.Pharmacist;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
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
        this.gson = new com.google.gson.GsonBuilder()
                .setFieldNamingPolicy(com.google.gson.FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
                .create();
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

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();

        try {
            // Read request body
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = request.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }

            // Parse JSON
            JsonObject jsonData = gson.fromJson(sb.toString(), JsonObject.class);
            
            String username = jsonData.get("username").getAsString();
            String password = jsonData.get("password").getAsString();
            String fullName = jsonData.get("full_name").getAsString();
            String role = jsonData.get("role").getAsString();
            int branchId = jsonData.get("branch_id").getAsInt();

            // Validate input
            if (username == null || username.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(gson.toJson(Map.of("success", false, "error", "Tên đăng nhập không được để trống")));
                return;
            }

            if (password == null || password.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print(gson.toJson(Map.of("success", false, "error", "Mật khẩu không được để trống")));
                return;
            }

            // Check if username already exists
            if (pharmacistDAO.getUserByUsername(username) != null) {
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                out.print(gson.toJson(Map.of("success", false, "error", "Tên đăng nhập đã tồn tại")));
                return;
            }

            // Create pharmacist object
            Pharmacist pharmacist = new Pharmacist();
            pharmacist.setUsername(username);
            pharmacist.setPassword(password); // Will be hashed in DAO
            pharmacist.setFullName(fullName);
            pharmacist.setRole(role);
            pharmacist.setBranchId(branchId);

            // Save to database
            boolean created = pharmacistDAO.createPharmacist(pharmacist);

            if (created) {
                out.print(gson.toJson(Map.of("success", true, "message", "Đăng ký thành công")));
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print(gson.toJson(Map.of("success", false, "error", "Không thể tạo tài khoản")));
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(Map.of("success", false, "error", e.getMessage())));
        }
    }
}
