package controller;

import com.google.gson.Gson;
import dao.InvoiceDetailDAO;
import model.InvoiceDetail;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@WebServlet(name = "InvoiceDetailApiServlet", urlPatterns = { "/api/invoice-details" })
public class InvoiceDetailApiServlet extends HttpServlet {

    private InvoiceDetailDAO invoiceDetailDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        this.invoiceDetailDAO = new InvoiceDetailDAO();
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
            String invoiceIdStr = request.getParameter("invoiceId");
            if (invoiceIdStr != null && !invoiceIdStr.isEmpty()) {
                int invoiceId = Integer.parseInt(invoiceIdStr);
                List<InvoiceDetail> details = invoiceDetailDAO.getInvoiceDetailsByInvoiceId(invoiceId);
                out.print(gson.toJson(details));
            } else {
                List<InvoiceDetail> allDetails = invoiceDetailDAO.getAllInvoiceDetails();
                out.print(gson.toJson(allDetails));
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(Map.of("error", e.getMessage())));
        }
    }
}
