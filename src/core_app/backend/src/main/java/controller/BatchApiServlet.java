package controller;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import service.PharmacyService;
import model.Batch;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@WebServlet(name = "BatchApiServlet", urlPatterns = { "/api/batches" })
public class BatchApiServlet extends HttpServlet {

    private PharmacyService pharmacyService;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        this.pharmacyService = new PharmacyService();
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

        PrintWriter out = response.getWriter();

        try {
            String branchIdStr = request.getParameter("branchId");
            int branchId = 1; // Default Chi nhánh 1
            if (branchIdStr != null && !branchIdStr.isEmpty()) {
                branchId = Integer.parseInt(branchIdStr);
            }

            List<Batch> batches = pharmacyService.getBatchInventoryForBranch(branchId);
            out.print(gson.toJson(batches));

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(Map.of("error", e.getMessage())));
        }
    }
}
