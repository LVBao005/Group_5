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
import jakarta.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet(name = "LoginServlet", urlPatterns = { "/api/login", "/api/logout" })
public class LoginServlet extends HttpServlet {

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
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        String path = request.getServletPath();
        
        if ("/api/login".equals(path)) {
            handleLogin(request, response);
        } else if ("/api/logout".equals(path)) {
            handleLogout(request, response);
        }
    }

    private void handleLogin(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
        JsonObject jsonResponse = new JsonObject();

        try {
            // Read request body
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = request.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }

            JsonObject loginData = gson.fromJson(sb.toString(), JsonObject.class);
            String username = loginData.get("username").getAsString();
            String password = loginData.get("password").getAsString();

            // Check for hardcoded admin account
            if ("admin".equals(username) && "123".equals(password)) {
                // Create admin user object
                Pharmacist admin = new Pharmacist();
                admin.setPharmacistId(0);
                admin.setUsername("admin");
                admin.setFullName("Administrator");
                admin.setRole("ADMIN");
                admin.setBranchId(1);
                admin.setBranchName("Chi nhánh chính");

                // Create session
                HttpSession session = request.getSession(true);
                session.setAttribute("user", admin);
                session.setAttribute("pharmacistId", 0);
                session.setAttribute("username", "admin");
                session.setAttribute("role", "ADMIN");

                // Return success response
                jsonResponse.addProperty("success", true);
                jsonResponse.addProperty("message", "Đăng nhập thành công");
                jsonResponse.add("user", gson.toJsonTree(admin));
                
                response.setStatus(HttpServletResponse.SC_OK);
                out.print(gson.toJson(jsonResponse));
                return;
            }

            // Check database for pharmacist
            Pharmacist pharmacist = pharmacistDAO.getPharmacistByUsername(username);

            if (pharmacist == null) {
                jsonResponse.addProperty("success", false);
                jsonResponse.addProperty("error", "Tên đăng nhập không tồn tại");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                out.print(gson.toJson(jsonResponse));
                return;
            }

            // Verify password (simple comparison - in production use BCrypt)
            if (!password.equals(pharmacist.getPassword())) {
                jsonResponse.addProperty("success", false);
                jsonResponse.addProperty("error", "Mật khẩu không chính xác");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                out.print(gson.toJson(jsonResponse));
                return;
            }

            // Hide password before sending to frontend
            pharmacist.setPassword(null);

            // Create session
            HttpSession session = request.getSession(true);
            session.setAttribute("user", pharmacist);
            session.setAttribute("pharmacistId", pharmacist.getPharmacistId());
            session.setAttribute("username", pharmacist.getUsername());
            session.setAttribute("role", pharmacist.getRole());

            // Return success response
            jsonResponse.addProperty("success", true);
            jsonResponse.addProperty("message", "Đăng nhập thành công");
            jsonResponse.add("user", gson.toJsonTree(pharmacist));

            response.setStatus(HttpServletResponse.SC_OK);
            out.print(gson.toJson(jsonResponse));

        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("error", "Lỗi hệ thống: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(jsonResponse));
        }
    }

    private void handleLogout(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
        JsonObject jsonResponse = new JsonObject();

        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }

            jsonResponse.addProperty("success", true);
            jsonResponse.addProperty("message", "Đăng xuất thành công");
            response.setStatus(HttpServletResponse.SC_OK);
            out.print(gson.toJson(jsonResponse));

        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("error", "Lỗi đăng xuất: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(jsonResponse));
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Check current session
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
        JsonObject jsonResponse = new JsonObject();

        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("user") != null) {
            Pharmacist user = (Pharmacist) session.getAttribute("user");
            jsonResponse.addProperty("success", true);
            jsonResponse.add("user", gson.toJsonTree(user));
        } else {
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("error", "Chưa đăng nhập");
        }

        out.print(gson.toJson(jsonResponse));
    }
}
