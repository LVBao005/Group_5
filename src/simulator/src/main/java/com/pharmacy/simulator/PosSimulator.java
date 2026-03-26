package com.pharmacy.simulator;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.pharmacy.simulator.model.*;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ClassicHttpResponse;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.ParseException;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

/**
 * POS Simulator - Simulates continuous checkout requests to pharmacy backend
 * Project B - Client acting as a customer/pharmacist
 */
public class PosSimulator {

    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private final Gson gson;
    private final Random random;
    private final CloseableHttpClient httpClient;

    private int pharmacistId = 1; // Default
    private int successCount = 0;
    private int errorCount = 0;
    private int requestCount = 0;

    public PosSimulator() {
        this.gson = new GsonBuilder()
                .setPrettyPrinting()
                .create();
        this.random = new Random();
        this.httpClient = HttpClients.createDefault();
    }

    /**
     * Thực hiện đăng nhập để lấy thông tin dược sĩ
     */
    private boolean login() {
        logInfo("Đang đăng nhập với tài khoản: " + SimulatorConfig.USERNAME);
        try {
            HttpPost request = new HttpPost(SimulatorConfig.BASE_URL + "/api/login");
            JsonObject loginData = new JsonObject();
            loginData.addProperty("username", SimulatorConfig.USERNAME);
            loginData.addProperty("password", SimulatorConfig.PASSWORD);

            request.setEntity(new StringEntity(gson.toJson(loginData), ContentType.APPLICATION_JSON));

            try (ClassicHttpResponse response = httpClient.executeOpen(null, request, null)) {
                String jsonResponse = EntityUtils.toString(response.getEntity());

                if (response.getCode() == 200) {
                    JsonObject result = gson.fromJson(jsonResponse, JsonObject.class);
                    if (result.get("success").getAsBoolean()) {
                        JsonObject user = result.getAsJsonObject("user");
                        // The backend field is pharmacist_id (snake_case)
                        this.pharmacistId = user.get("pharmacist_id").getAsInt();
                        logSuccess("Đăng nhập thành công! Pharmacist ID: " + this.pharmacistId);
                        return true;
                    }
                }
                logError("Đăng nhập thất bại. Kiểm tra lại SimulatorConfig.java. Status: " + response.getCode());
                return false;
            }
        } catch (Exception e) {
            logError("Lỗi kết nối khi đăng nhập: " + e.getMessage());
            return false;
        }
    }

    /**
     * Main simulation loop
     */
    public void start() {
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println("   PHARMACY POS SIMULATOR - STARTING (PROJECT B)");
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println("Backend URL:    " + SimulatorConfig.BASE_URL);
        System.out.println("Branch ID:      " + SimulatorConfig.BRANCH_ID);
        System.out.println("Max Quantity:   " + SimulatorConfig.MAX_QUANTITY);
        System.out.println("Fixed Medicine: "
                + (SimulatorConfig.IS_FIXED_MEDICINE ? "Bật (ID: " + SimulatorConfig.FIXED_MEDICINE_ID + ")"
                        : "Tắt (Ngẫu nhiên)"));
        System.out.println("Delay Seconds:  " + SimulatorConfig.DELAY_SECONDS + "s");
        System.out.println("Requests/Batch: " + SimulatorConfig.REQUESTS_PER_BATCH);
        System.out.println("═══════════════════════════════════════════════════════════════");

        // Bước 1: Đăng nhập
        if (!login()) {
            System.err.println("Dừng simulator do không thể đăng nhập.");
            return;
        }

        System.out.println("Simulator sẽ bắt đầu gửi yêu cầu liên tục...");
        System.out.println("Nhấn Ctrl+C để dừng\n");

        // Main simulation loop
        while (true) {
            try {
                logInfo("═══ BẮT ĐẦU ĐỢT GỬI (" + SimulatorConfig.REQUESTS_PER_BATCH + " requests) ═══");

                // Lấy danh sách thuốc 1 lần cho cả đợt
                InventoryItem[] inventory = fetchInventory();

                if (inventory == null || inventory.length == 0) {
                    logWarning("Không có thuốc trong kho. Đang đợi 5 giây...");
                    Thread.sleep(5000);
                    continue;
                }

                // Vòng lặp gửi REQUESTS_PER_BATCH requests trong 1 đợt
                for (int batchIndex = 0; batchIndex < SimulatorConfig.REQUESTS_PER_BATCH; batchIndex++) {
                    requestCount++;
                    logInfo(String.format("--- Request #%d (Đợt %d/%d) ---",
                            requestCount, batchIndex + 1, SimulatorConfig.REQUESTS_PER_BATCH));

                    // Chọn thuốc
                    InventoryItem selectedItem = null;
                    if (SimulatorConfig.IS_FIXED_MEDICINE) {
                        for (InventoryItem item : inventory) {
                            if (item.getMedicineId() == SimulatorConfig.FIXED_MEDICINE_ID) {
                                selectedItem = item;
                                break;
                            }
                        }
                        if (selectedItem == null) {
                            logWarning("Không tìm thấy thuốc có ID " + SimulatorConfig.FIXED_MEDICINE_ID
                                    + " trong kho. Đang chọn ngẫu nhiên...");
                        }
                    }

                    if (selectedItem == null) {
                        selectedItem = inventory[random.nextInt(inventory.length)];
                    }

                    // Chọn số lượng ngẫu nhiên (1 tới MAX_QUANTITY)
                    int maxAvailable = Math.min(SimulatorConfig.MAX_QUANTITY, selectedItem.getQuantityStd());
                    if (maxAvailable < 1) {
                        logWarning("Thuốc đã chọn hết hàng: " + selectedItem.getMedicineName());
                        continue;
                    }
                    int quantity = random.nextInt(maxAvailable) + 1;

                    // Gửi request thanh toán
                    boolean success = sendCheckoutRequest(selectedItem, quantity);

                    if (success) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                }

                // Hiển thị thống kê sau mỗi đợt
                logInfo(String.format("Thống kê: Thành công=%d, Lỗi=%d, Tổng=%d",
                        successCount, errorCount, requestCount));

                // Nghỉ sau khi hoàn thành cả đợt
                logInfo("Đã gửi xong đợt. Nghỉ " + SimulatorConfig.DELAY_SECONDS + " giây...\n");
                Thread.sleep(SimulatorConfig.DELAY_SECONDS * 1000L);

            } catch (InterruptedException e) {
                logError("Dừng simulator đột ngột.");
                break;
            } catch (Exception e) {
                logError("Lỗi không mong muốn: " + e.getMessage());
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException ie) {
                    break;
                }
            }
        }

        cleanup();
    }

    /**
     * Lấy danh sách tồn kho từ API
     */
    private InventoryItem[] fetchInventory() {
        try {
            String url = SimulatorConfig.BASE_URL + "/api/inventory?branchId=" + SimulatorConfig.BRANCH_ID;
            HttpGet request = new HttpGet(url);

            try (ClassicHttpResponse response = httpClient.executeOpen(null, request, null)) {
                String jsonResponse = EntityUtils.toString(response.getEntity());

                if (response.getCode() != 200) {
                    logError("Không thể lấy danh sách kho. Status: " + response.getCode());
                    return null;
                }

                InventoryResponse inventoryResponse = gson.fromJson(jsonResponse, InventoryResponse.class);
                logSuccess("Đã lấy " + inventoryResponse.getData().length + " mặt hàng từ kho");
                return inventoryResponse.getData();
            }

        } catch (IOException | ParseException e) {
            logError("Lỗi mạng khi lấy kho: " + e.getMessage());
            return null;
        }
    }

    /**
     * Gửi yêu cầu thanh toán
     */
    private boolean sendCheckoutRequest(InventoryItem item, int quantity) {
        try {
            String unitSold = item.getSubUnit() != null ? item.getSubUnit() : item.getBaseUnit();
            double unitPrice = item.getSubUnit() != null ? item.getSubSellPrice() : item.getBaseSellPrice();

            CheckoutRequest checkoutRequest = new CheckoutRequest();
            checkoutRequest.setBranchId(SimulatorConfig.BRANCH_ID);
            checkoutRequest.setPharmacistId(this.pharmacistId);
            checkoutRequest.setSimulated(true);

            InvoiceDetailRequest detail = new InvoiceDetailRequest(
                    item.getBatchId(), unitSold, quantity, unitPrice, quantity);
            checkoutRequest.addDetail(detail);
            checkoutRequest.calculateTotalAmount();

            logInfo(String.format("Thanh toán: %s x%d = %.2f VNĐ",
                    item.getMedicineName(), quantity, checkoutRequest.getTotalAmount()));

            HttpPost request = new HttpPost(SimulatorConfig.BASE_URL + "/api/invoices");
            request.setEntity(new StringEntity(gson.toJson(checkoutRequest), ContentType.APPLICATION_JSON));

            try (ClassicHttpResponse response = httpClient.executeOpen(null, request, null)) {
                String jsonResponse = EntityUtils.toString(response.getEntity());
                if (response.getCode() == 201 || response.getCode() == 200) {
                    CheckoutResponse res = gson.fromJson(jsonResponse, CheckoutResponse.class);
                    if (res.isSuccess()) {
                        logSuccess("Tạo hóa đơn thành công! ID: " + res.getInvoiceId());
                        return true;
                    }
                }
                logError("Thanh toán thất bại. Status: " + response.getCode() + " Response: " + jsonResponse);
                return false;
            }
        } catch (Exception e) {
            logError("Lỗi khi xử lý thanh toán: " + e.getMessage());
            return false;
        }
    }

    private void cleanup() {
        try {
            if (httpClient != null)
                httpClient.close();
        } catch (IOException e) {
        }
        System.out.println("\n═══════════════════════════════════════════════════════════════");
        System.out.println("   PHARMACY POS SIMULATOR - STOPPED");
        System.out.println("═══════════════════════════════════════════════════════════════");
    }

    private void logInfo(String message) {
        System.out.println("[" + LocalDateTime.now().format(dateFormatter) + "] [INFO] " + message);
    }

    private void logSuccess(String message) {
        System.out.println("[" + LocalDateTime.now().format(dateFormatter) + "] [✓] " + message);
    }

    private void logWarning(String message) {
        System.out.println("[" + LocalDateTime.now().format(dateFormatter) + "] [⚠] " + message);
    }

    private void logError(String message) {
        System.err.println("[" + LocalDateTime.now().format(dateFormatter) + "] [✗] " + message);
    }

    public static void main(String[] args) {
        new PosSimulator().start();
    }
}
