package controller;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import dao.InvoiceDAO;
import model.Invoice;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.List;

/**
 * Servlet for managing pharmacy invoices
 * Handles CRUD operations and filtering for invoice management
 */
@WebServlet(name = "InvoiceServlet", urlPatterns = { "/api/invoices", "/api/invoices/*" })
public class InvoiceServlet extends HttpServlet {

    private InvoiceDAO invoiceDAO;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        super.init();
        this.invoiceDAO = new InvoiceDAO();
        this.gson = new GsonBuilder()
                .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
                .create();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String pathInfo = request.getPathInfo();

        try {
            if (pathInfo == null || pathInfo.equals("/")) {
                // Get all invoices with optional filters
                handleGetInvoices(request, response);
            } else if (pathInfo.matches("/\\d+")) {
                // Get specific invoice by ID
                int invoiceId = Integer.parseInt(pathInfo.substring(1));
                handleGetInvoiceById(invoiceId, response);
            } else if (pathInfo.equals("/stats")) {
                // Get invoice statistics
                handleGetStats(request, response);
            } else if (pathInfo.equals("/search")) {
                // Search invoices
                handleSearchInvoices(request, response);
            } else {
                sendErrorResponse(response, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Database error: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST,
                    "Invalid request: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            // Read request body
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = request.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }

            // Parse invoice data
            JsonObject jsonData = gson.fromJson(sb.toString(), JsonObject.class);

            // Create invoice
            Invoice invoice = invoiceDAO.createInvoice(jsonData);

            // Send success response
            JsonObject successResponse = new JsonObject();
            successResponse.addProperty("success", true);
            successResponse.addProperty("message", "Invoice created successfully");
            successResponse.addProperty("invoiceId", invoice.getInvoiceId());

            response.setStatus(HttpServletResponse.SC_CREATED);
            PrintWriter out = response.getWriter();
            out.print(gson.toJson(successResponse));
            out.flush();

        } catch (SQLException e) {
            e.printStackTrace();
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Failed to create invoice: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST,
                    "Invalid invoice data: " + e.getMessage());
        }
    }

    /**
     * Get all invoices with optional filters
     */
    private void handleGetInvoices(HttpServletRequest request, HttpServletResponse response)
            throws SQLException, IOException {
        String dateFrom = request.getParameter("dateFrom");
        String dateTo = request.getParameter("dateTo");
        String pharmacistIdStr = request.getParameter("pharmacistId");
        String isSimulatedStr = request.getParameter("isSimulated");

        Integer pharmacistId = null;
        Boolean isSimulated = null;

        if (pharmacistIdStr != null && !pharmacistIdStr.isEmpty()) {
            pharmacistId = Integer.parseInt(pharmacistIdStr);
        }

        if (isSimulatedStr != null && !isSimulatedStr.isEmpty()) {
            isSimulated = Boolean.parseBoolean(isSimulatedStr);
        }

        List<Invoice> invoices = invoiceDAO.getInvoices(dateFrom, dateTo, pharmacistId, isSimulated);

        PrintWriter out = response.getWriter();
        out.print(gson.toJson(invoices));
        out.flush();
    }

    /**
     * Get a specific invoice by ID with full details
     */
    private void handleGetInvoiceById(int invoiceId, HttpServletResponse response)
            throws SQLException, IOException {
        Invoice invoice = invoiceDAO.getInvoiceById(invoiceId);

        if (invoice == null) {
            sendErrorResponse(response, HttpServletResponse.SC_NOT_FOUND,
                    "Invoice not found with ID: " + invoiceId);
            return;
        }

        PrintWriter out = response.getWriter();
        out.print(gson.toJson(invoice));
        out.flush();
    }

    /**
     * Get invoice statistics
     */
    private void handleGetStats(HttpServletRequest request, HttpServletResponse response)
            throws SQLException, IOException {
        String dateFrom = request.getParameter("dateFrom");
        String dateTo = request.getParameter("dateTo");

        JsonObject stats = invoiceDAO.getInvoiceStats(dateFrom, dateTo);

        PrintWriter out = response.getWriter();
        out.print(gson.toJson(stats));
        out.flush();
    }

    /**
     * Search invoices by various criteria
     */
    private void handleSearchInvoices(HttpServletRequest request, HttpServletResponse response)
            throws SQLException, IOException {
        String searchTerm = request.getParameter("q");

        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            sendErrorResponse(response, HttpServletResponse.SC_BAD_REQUEST,
                    "Search term is required");
            return;
        }

        List<Invoice> invoices = invoiceDAO.searchInvoices(searchTerm);

        PrintWriter out = response.getWriter();
        out.print(gson.toJson(invoices));
        out.flush();
    }

    /**
     * Send error response
     */
    private void sendErrorResponse(HttpServletResponse response, int statusCode, String message)
            throws IOException {
        response.setStatus(statusCode);
        JsonObject error = new JsonObject();
        error.addProperty("success", false);
        error.addProperty("error", message);

        PrintWriter out = response.getWriter();
        out.print(gson.toJson(error));
        out.flush();
    }
}
