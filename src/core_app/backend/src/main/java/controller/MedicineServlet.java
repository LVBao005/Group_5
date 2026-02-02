package controller;

import com.google.gson.Gson;
import dao.MedicineDAO;
import model.Medicine;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@WebServlet(name = "MedicineServlet", urlPatterns = { "/api/medicines", "/api/medicines/*" })
public class MedicineServlet extends HttpServlet {

    private MedicineDAO medicineDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        this.medicineDAO = new MedicineDAO();
        this.gson = new Gson();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String pathInfo = request.getPathInfo();
        PrintWriter out = response.getWriter();

        try {
            if (pathInfo == null || pathInfo.equals("/")) {
                // Check for search query
                String query = request.getParameter("q");
                if (query != null && !query.trim().isEmpty()) {
                    List<Medicine> medicines = medicineDAO.searchMedicines(query);
                    out.print(gson.toJson(medicines));
                } else {
                    List<Medicine> medicines = medicineDAO.getAllMedicines();
                    out.print(gson.toJson(medicines));
                }
            } else if (pathInfo.matches("/\\d+")) {
                int id = Integer.parseInt(pathInfo.substring(1));
                Medicine medicine = medicineDAO.getMedicineById(id);
                if (medicine != null) {
                    out.print(gson.toJson(medicine));
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.print(gson.toJson(Map.of("error", "Medicine not found")));
                }
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print(gson.toJson(Map.of("error", "Endpoint not found")));
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(Map.of("error", e.getMessage())));
        }
    }
}
