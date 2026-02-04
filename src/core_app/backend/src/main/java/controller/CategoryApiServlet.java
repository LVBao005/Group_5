package controller;

import com.google.gson.Gson;
import service.PharmacyService;
import model.Category;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@WebServlet(name = "CategoryApiServlet", urlPatterns = { "/api/categories", "/api/categories/stats" })
public class CategoryApiServlet extends HttpServlet {

    private PharmacyService pharmacyService;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        this.pharmacyService = new PharmacyService();
        this.gson = new Gson();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();

        try {
            if (request.getRequestURI().endsWith("/stats")) {
                List<Map<String, Object>> stats = pharmacyService.getCategoryStats();
                out.print(gson.toJson(stats));
            } else {
                List<Category> categories = pharmacyService.getAllCategories();
                out.print(gson.toJson(categories));
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(Map.of("error", e.getMessage())));
        }
    }
}
