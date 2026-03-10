package com.pharmacy.simulator;

/**
 * Cấu hình cho PosSimulator
 * Bạn có thể thay đổi các giá trị ở đây để simulator chạy theo ý muốn.
 */
public class SimulatorConfig {

    // 1. Cổng và URL của Backend
    public static final String BASE_URL = "http://localhost:8080/backend";

    // 2. Thông tin đăng nhập
    public static final String USERNAME = "nv_1_1";
    public static final String PASSWORD = "Password123";

    // 3. Cấu hình lấy thuốc
    public static final int BRANCH_ID = 1; // ID của chi nhánh
    public static final int MAX_QUANTITY = 2; // Số lượng thuốc tối đa mỗi lần mua
    public static final boolean IS_FIXED_MEDICINE = false; // Bật để chỉ chọn 1 loại thuốc cố định false
    public static final int FIXED_MEDICINE_ID = 1; // ID của thuốc cố định nếu IS_FIXED_MEDICINE = true

    // 4. Cấu hình thời gian
    public static final int DELAY_SECONDS = 10; // Nghỉ bao nhiêu giây mới gửi tiếp
}
