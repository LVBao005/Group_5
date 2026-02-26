package com.pharmacy.simulator;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
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
import java.util.Scanner;

/**
 * POS Simulator - Simulates continuous checkout requests to pharmacy backend
 * 
 * This application continuously:
 * 1. Fetches available inventory from the API
 * 2. Randomly selects a medicine and quantity (1-5)
 * 3. Sends a checkout request to the backend
 * 4. Sleeps for 2-3 seconds between requests
 * 
 * Purpose: Demonstrate real-time inventory deduction in the database
 */
public class PosSimulator {
    
    // Configuration
    private static final String DEFAULT_BASE_URL = "http://localhost:8080/backend";
    private static final int DEFAULT_BRANCH_ID = 1;
    private static final int DEFAULT_PHARMACIST_ID = 1;
    private static final int MIN_QUANTITY = 1;
    private static final int MAX_QUANTITY = 5;
    private static final int MIN_SLEEP_MS = 2000;
    private static final int MAX_SLEEP_MS = 3000;
    
    private final String baseUrl;
    private final int branchId;
    private final int pharmacistId;
    private final Gson gson;
    private final Random random;
    private final CloseableHttpClient httpClient;
    private final DateTimeFormatter dateFormatter;
    
    private int successCount = 0;
    private int errorCount = 0;
    private int requestCount = 0;
    
    public PosSimulator(String baseUrl, int branchId, int pharmacistId) {
        this.baseUrl = baseUrl;
        this.branchId = branchId;
        this.pharmacistId = pharmacistId;
        this.gson = new GsonBuilder()
                .setPrettyPrinting()
                .create();
        this.random = new Random();
        this.httpClient = HttpClients.createDefault();
        this.dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    }
    
    /**
     * Main simulation loop
     */
    public void start() {
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println("   PHARMACY POS SIMULATOR - STARTING");
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println("Backend URL:    " + baseUrl);
        System.out.println("Branch ID:      " + branchId);
        System.out.println("Pharmacist ID:  " + pharmacistId);
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println("Simulator will continuously send checkout requests...");
        System.out.println("Press Ctrl+C to stop\n");
        
        // Main simulation loop
        while (true) {
            try {
                requestCount++;
                logInfo("═══ Request #" + requestCount + " ═══");
                
                // Step 1: Fetch available inventory
                InventoryItem[] inventory = fetchInventory();
                
                if (inventory == null || inventory.length == 0) {
                    logWarning("No inventory available. Waiting 5 seconds...");
                    Thread.sleep(5000);
                    continue;
                }
                
                // Step 2: Randomly select a medicine
                InventoryItem selectedItem = inventory[random.nextInt(inventory.length)];
                
                // Step 3: Randomly select quantity (1-5 or max available)
                int maxQuantity = Math.min(MAX_QUANTITY, selectedItem.getQuantityStd());
                if (maxQuantity < MIN_QUANTITY) {
                    logWarning("Selected item has insufficient stock: " + selectedItem.getMedicineName());
                    continue;
                }
                int quantity = random.nextInt(maxQuantity - MIN_QUANTITY + 1) + MIN_QUANTITY;
                
                // Step 4: Send checkout request
                boolean success = sendCheckoutRequest(selectedItem, quantity);
                
                if (success) {
                    successCount++;
                } else {
                    errorCount++;
                }
                
                // Display statistics
                logInfo(String.format("Statistics: Success=%d, Error=%d, Total=%d", 
                    successCount, errorCount, requestCount));
                
                // Step 5: Sleep for 2-3 seconds
                int sleepTime = random.nextInt(MAX_SLEEP_MS - MIN_SLEEP_MS + 1) + MIN_SLEEP_MS;
                System.out.println();
                Thread.sleep(sleepTime);
                
            } catch (InterruptedException e) {
                logError("Simulator interrupted. Shutting down...");
                break;
            } catch (Exception e) {
                logError("Unexpected error: " + e.getMessage());
                e.printStackTrace();
                try {
                    Thread.sleep(3000); // Wait before retrying
                } catch (InterruptedException ie) {
                    break;
                }
            }
        }
        
        cleanup();
    }
    
    /**
     * Fetch available inventory from API
     */
    private InventoryItem[] fetchInventory() {
        try {
            String url = baseUrl + "/api/inventory?branchId=" + branchId;
            HttpGet request = new HttpGet(url);
            
            try (ClassicHttpResponse response = httpClient.executeOpen(null, request, null)) {
                String jsonResponse = EntityUtils.toString(response.getEntity());
                
                if (response.getCode() != 200) {
                    logError("Failed to fetch inventory. Status: " + response.getCode());
                    return null;
                }
                
                InventoryResponse inventoryResponse = gson.fromJson(jsonResponse, InventoryResponse.class);
                
                if (!inventoryResponse.isSuccess()) {
                    logError("Inventory API returned error: " + inventoryResponse.getError());
                    return null;
                }
                
                logSuccess("Fetched " + inventoryResponse.getData().length + " inventory items");
                return inventoryResponse.getData();
            }
            
        } catch (IOException | ParseException e) {
            logError("Network error while fetching inventory: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Send checkout request to API
     */
    private boolean sendCheckoutRequest(InventoryItem item, int quantity) {
        try {
            // Determine unit and calculate total standard quantity
            String unitSold = item.getSubUnit() != null ? item.getSubUnit() : item.getBaseUnit();
            double unitPrice = item.getSubUnit() != null ? item.getSubSellPrice() : item.getBaseSellPrice();
            int totalStdQuantity = quantity; // Assuming we're selling in sub units (smallest unit)
            
            // Create checkout request
            CheckoutRequest checkoutRequest = new CheckoutRequest();
            checkoutRequest.setBranchId(branchId);
            checkoutRequest.setPharmacistId(pharmacistId);
            checkoutRequest.setSimulated(true);
            
            InvoiceDetailRequest detail = new InvoiceDetailRequest(
                item.getBatchId(),
                unitSold,
                quantity,
                unitPrice,
                totalStdQuantity
            );
            checkoutRequest.addDetail(detail);
            checkoutRequest.calculateTotalAmount();
            
            // Convert to JSON
            String jsonRequest = gson.toJson(checkoutRequest);
            
            // Log request details
            logInfo(String.format("Checkout: %s x%d @ %.2f = %.2f VNĐ",
                item.getMedicineName(), quantity, unitPrice, checkoutRequest.getTotalAmount()));
            
            // Send POST request
            String url = baseUrl + "/api/invoices";
            HttpPost request = new HttpPost(url);
            request.setEntity(new StringEntity(jsonRequest, ContentType.APPLICATION_JSON));
            
            try (ClassicHttpResponse response = httpClient.executeOpen(null, request, null)) {
                String jsonResponse = EntityUtils.toString(response.getEntity());
                
                if (response.getCode() == 201 || response.getCode() == 200) {
                    CheckoutResponse checkoutResponse = gson.fromJson(jsonResponse, CheckoutResponse.class);
                    
                    if (checkoutResponse.isSuccess()) {
                        logSuccess("Invoice created successfully! ID: " + checkoutResponse.getInvoiceId());
                        return true;
                    } else {
                        logError("Checkout failed: " + checkoutResponse.getMessage());
                        return false;
                    }
                } else {
                    logError("Checkout request failed. Status: " + response.getCode());
                    logError("Response: " + jsonResponse);
                    return false;
                }
            }
            
        } catch (IOException | ParseException e) {
            logError("Network error during checkout: " + e.getMessage());
            return false;
        } catch (Exception e) {
            logError("Error processing checkout: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Clean up resources
     */
    private void cleanup() {
        try {
            if (httpClient != null) {
                httpClient.close();
            }
        } catch (IOException e) {
            logError("Error closing HTTP client: " + e.getMessage());
        }
        
        System.out.println("\n═══════════════════════════════════════════════════════════════");
        System.out.println("   PHARMACY POS SIMULATOR - STOPPED");
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println("Final Statistics:");
        System.out.println("  Total Requests:  " + requestCount);
        System.out.println("  Successful:      " + successCount);
        System.out.println("  Errors:          " + errorCount);
        System.out.println("═══════════════════════════════════════════════════════════════");
    }
    
    // Logging methods
    private void logInfo(String message) {
        System.out.println("[" + getCurrentTime() + "] [INFO] " + message);
    }
    
    private void logSuccess(String message) {
        System.out.println("[" + getCurrentTime() + "] [✓] " + message);
    }
    
    private void logWarning(String message) {
        System.out.println("[" + getCurrentTime() + "] [⚠] " + message);
    }
    
    private void logError(String message) {
        System.err.println("[" + getCurrentTime() + "] [✗] " + message);
    }
    
    private String getCurrentTime() {
        return LocalDateTime.now().format(dateFormatter);
    }
    
    /**
     * Main entry point
     */
    public static void main(String[] args) {
        // Parse command line arguments or use defaults
        String baseUrl = DEFAULT_BASE_URL;
        int branchId = DEFAULT_BRANCH_ID;
        int pharmacistId = DEFAULT_PHARMACIST_ID;
        
        // Check for command line arguments
        if (args.length > 0) {
            baseUrl = args[0];
        }
        if (args.length > 1) {
            try {
                branchId = Integer.parseInt(args[1]);
            } catch (NumberFormatException e) {
                System.err.println("Invalid branch ID. Using default: " + DEFAULT_BRANCH_ID);
            }
        }
        if (args.length > 2) {
            try {
                pharmacistId = Integer.parseInt(args[2]);
            } catch (NumberFormatException e) {
                System.err.println("Invalid pharmacist ID. Using default: " + DEFAULT_PHARMACIST_ID);
            }
        }
        
        // Interactive mode if no arguments provided
        if (args.length == 0) {
            try (Scanner scanner = new Scanner(System.in)) {
                System.out.println("═══════════════════════════════════════════════════════════════");
                System.out.println("   PHARMACY POS SIMULATOR - CONFIGURATION");
                System.out.println("═══════════════════════════════════════════════════════════════");
                
                System.out.print("Enter Backend URL [" + DEFAULT_BASE_URL + "]: ");
                String input = scanner.nextLine().trim();
                if (!input.isEmpty()) {
                    baseUrl = input;
                }
                
                System.out.print("Enter Branch ID [" + DEFAULT_BRANCH_ID + "]: ");
                input = scanner.nextLine().trim();
                if (!input.isEmpty()) {
                    try {
                        branchId = Integer.parseInt(input);
                    } catch (NumberFormatException e) {
                        System.out.println("Invalid input. Using default: " + DEFAULT_BRANCH_ID);
                    }
                }
                
                System.out.print("Enter Pharmacist ID [" + DEFAULT_PHARMACIST_ID + "]: ");
                input = scanner.nextLine().trim();
                if (!input.isEmpty()) {
                    try {
                        pharmacistId = Integer.parseInt(input);
                    } catch (NumberFormatException e) {
                        System.out.println("Invalid input. Using default: " + DEFAULT_PHARMACIST_ID);
                    }
                }
                
                System.out.println();
            }
        }
        
        // Create and start simulator
        PosSimulator simulator = new PosSimulator(baseUrl, branchId, pharmacistId);
        
        // Add shutdown hook for graceful shutdown
        Runtime.getRuntime().addShutdownHook(new Thread(simulator::cleanup));
        
        // Start simulation
        simulator.start();
    }
}
