package controller;

import com.google.gson.Gson;
import model.Customer;
import service.CustomerService;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@WebServlet(name = "CustomerApiServlet", urlPatterns = { "/api/customers", "/api/customers/top" })
public class CustomerApiServlet extends HttpServlet {

    private CustomerService customerService;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        this.customerService = new CustomerService();
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
        String uri = request.getRequestURI();

        try {
            if (uri.endsWith("/top")) {
                List<Map<String, Object>> topCustomers = customerService.getTopCustomers();
                out.print(gson.toJson(topCustomers));
            } else {
                String phoneNumber = request.getParameter("phoneNumber");
                if (phoneNumber != null) {
                    Customer customer = customerService.searchByPhone(phoneNumber);
                    out.print(gson.toJson(customer));
                } else {
                    List<Customer> allCustomers = customerService.getAllCustomers();
                    out.print(gson.toJson(allCustomers));
                }
            }
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
            Customer customer = gson.fromJson(request.getReader(), Customer.class);
            boolean success = customerService.registerCustomer(customer);

            if (success) {
                response.setStatus(HttpServletResponse.SC_CREATED);
                out.print(gson.toJson(Map.of("success", true, "message", "Đã thêm khách hàng thành công")));
            }
        } catch (IllegalArgumentException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print(gson.toJson(Map.of("error", e.getMessage())));
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(gson.toJson(Map.of("error", "Lỗi hệ thống: " + e.getMessage())));
        }
    }
}
