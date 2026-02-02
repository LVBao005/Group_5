package controller;

import com.google.gson.Gson;
import service.PharmacyService;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@WebServlet(name = "BranchApiServlet", urlPatterns = { "/api/branches" })
public class BranchApiServlet extends HttpServlet {

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
            // Use statistics version to satisfy requirements for comparative reports
            List<Map<String, Object>> stats = pharmacyService.getBranchStatistics();
            out.print(gson.toJson(stats));
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(Map.of("error", e.getMessage())));
        }
    }
}
