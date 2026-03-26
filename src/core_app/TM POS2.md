# Tài liệu phân tích trang Bán hàng (POS.jsx)

---

## I. CÁC HÀM TRONG POS.JSX VÀ TÁC DỤNG

### 1. `fetchData(showLoading)` — Dòng 63
**Tác dụng:** Tải dữ liệu tồn kho từ server cho chi nhánh hiện tại.

**Làm gì:**
- Gọi `inventoryService.getInventoryByBranch(branch_id)` để lấy danh sách tồn kho.
- Nhóm (group) các item theo `medicine_id` → tạo ra danh sách thuốc kèm các lô (batches).
- Lọc bỏ các lô đã hết hạn (expiry_date < ngày hôm nay).
- Tính `total_stock` cho từng thuốc bằng cách cộng tổng `quantity_std` các lô còn hạn.
- Sắp xếp các lô theo ngày hết hạn tăng dần (**FEFO** – First Expired, First Out).
- Tính `availableStock` = tổng tồn kho trừ đi số lượng đang có trong giỏ hàng.
- Cập nhật state: `medicines`, `categories`, `availableStock`.

---

### 2. `useEffect` (khởi động và polling) — Dòng 153
**Tác dụng:** Thiết lập cơ chế tự động làm mới dữ liệu.

**Làm gì:**
- Gọi `fetchData(true)` lần đầu khi component mount (có hiển thị loading).
- Tạo interval **60 giây** để gọi `fetchData(false)` (làm mới âm thầm, không hiện loading).
- Đăng ký sự kiện `focus` trên `window` → khi người dùng chuyển tab quay lại, tự làm mới dữ liệu.
- Tạo `BroadcastChannel('pharmacy_sync')` để lắng nghe sự kiện `NEW_INVOICE` từ tab khác → khi tab khác thanh toán xong, tab này tự động tải lại tồn kho.
- Cleanup: xóa interval, bỏ lắng nghe focus, đóng BroadcastChannel khi component unmount.

---

### 3. `filteredMedicines` (computed value) — Dòng 183
**Tác dụng:** Lọc danh sách thuốc theo bộ lọc đang chọn.

**Làm gì:**
- Lọc theo `activeCategory`: nếu = 0 thì hiển thị tất cả, ngược lại chỉ hiện thuốc của danh mục đó.
- Lọc theo `searchTerm`: so sánh tên thuốc (không phân biệt hoa/thường) với chuỗi tìm kiếm.

---

### 4. `displayMedicines` (computed value) — Dòng 191
**Tác dụng:** Phân trang danh sách thuốc.

**Làm gì:**
- Nếu đang ở tab "Tất cả" (`activeCategory === 0`): cắt mảng theo trang hiện tại (10 item/trang).
- Nếu đang lọc theo danh mục cụ thể: hiển thị toàn bộ, không phân trang.

---

### 5. `handleCategoryChange(catId)` — Dòng 197
**Tác dụng:** Xử lý khi người dùng chọn danh mục.

**Làm gì:**
- Cập nhật `activeCategory` thành danh mục được chọn.
- Reset `currentPage` về 1 để tránh lỗi trang không tồn tại sau khi đổi danh mục.

---

### 6. `getIcon(type)` — Dòng 202
**Tác dụng:** Trả về icon tương ứng với loại thuốc.

**Làm gì:**
- Nhận vào chuỗi `type` ('pill', 'flask', 'thermometer', 'heart').
- Trả về component icon từ thư viện `lucide-react`. Mặc định là `Pill`.

---

### 7. `formatPrice(price)` — Dòng 212
**Tác dụng:** Định dạng số tiền sang dạng hiển thị Việt Nam.

**Làm gì:**
- Nhận vào số `price`.
- Trả về chuỗi định dạng theo `vi-VN` (ví dụ: `1.500.000`).
- Xử lý trường hợp `price` là `null/undefined` bằng cách dùng `|| 0`.

---

### 8. `handleUpdateLocalQty(id, delta)` — Dòng 216
**Tác dụng:** Tăng/giảm số lượng trên card sản phẩm (chưa thêm vào giỏ).

**Làm gì:**
- Tính số lượng tối đa có thể chọn theo đơn vị hiện tại (base/sub).
- Cộng hoặc trừ `delta` (+1 hoặc -1) vào số lượng hiện tại.
- Giới hạn giá trị trong khoảng `[0, maxAvailable]`.

---

### 9. `handleManualQtyChange(id, value)` — Dòng 235
**Tác dụng:** Xử lý khi người dùng gõ trực tiếp số lượng vào ô input.

**Làm gì:**
- Cho phép giá trị rỗng (`''`) tạm thời để người dùng xóa rồi nhập lại.
- Parse giá trị thành số nguyên (parseInt).
- Giới hạn giá trị trong khoảng `[0, maxAvailable]` tùy theo đơn vị đang chọn.

---

### 10. `handleUnitChange(medicineId, unit)` — Dòng 257
**Tác dụng:** Xử lý khi người dùng đổi đơn vị bán (VD: từ Hộp sang Viên).

**Làm gì:**
- Cập nhật đơn vị được chọn cho thuốc đó vào state `selectedUnits`.
- Tính lại `maxAvailable` theo đơn vị mới.
- Nếu số lượng đang chọn vượt quá max mới, điều chỉnh xuống `maxAvailable`.

---

### 11. `addToCart(medicine)` — Dòng 280
**Tác dụng:** Thêm thuốc vào giỏ hàng.

**Làm gì:**
- Lấy số lượng và đơn vị đang chọn của thuốc đó.
- Quy đổi số lượng về đơn vị nhỏ nhất (std) để so sánh với tồn kho.
- Nếu vượt tồn kho: hiện `alert` thông báo không đủ hàng, dừng lại.
- Nếu đủ hàng:
  - Nếu thuốc (đúng đơn vị) **đã có trong giỏ**: cộng thêm số lượng vào item đó.
  - Nếu **chưa có**: thêm item mới vào giỏ.
- Trừ số lượng vừa thêm vào ra khỏi `availableStock` (để các card khác biết còn bao nhiêu).
- Reset số lượng trên card về 1.

---

### 12. `removeFromCart(item)` — Dòng 330
**Tác dụng:** Xóa một item ra khỏi giỏ hàng.

**Làm gì:**
- Tính số lượng std của item cần xóa.
- Cộng lại số lượng đó vào `availableStock` (hoàn trả tồn kho).
- Xóa item khỏi mảng `cart`.

---

### 13. `clearCart()` — Dòng 348
**Tác dụng:** Xóa toàn bộ giỏ hàng.

**Làm gì:**
- Duyệt qua tất cả item trong giỏ.
- Hoàn trả từng item về `availableStock`.
- Set `cart` thành mảng rỗng `[]`.

---

### 14. `totalAmount` và `finalAmount` (computed) — Dòng 367–368
**Tác dụng:** Tính tổng tiền.

**Làm gì:**
- `totalAmount`: cộng `price * quantity` của tất cả item trong giỏ.
- `finalAmount`: `totalAmount` trừ điểm sử dụng (`pointsToUse`), tối thiểu là 0.

---

### 15. `checkCustomer()` — Dòng 370
**Tác dụng:** Tìm kiếm thông tin khách hàng theo số điện thoại.

**Làm gì:**
- Validate: số điện thoại không rỗng và đủ 10 số.
- Gọi `invoiceService.getCustomerByPhone(phone)`.
- Nếu **khách cũ** (có `customer_id`): điền sẵn tên, hiển thị điểm tích lũy hiện tại, cho phép dùng điểm.
- Nếu **khách mới** (không tìm thấy): để trống tên, điểm = 0.
- Trong cả hai trường hợp: hiển thị ô nhập tên (`showNameInput = true`).

---

### 16. `handleUsePointsChange(e)` — Dòng 413
**Tác dụng:** Xử lý khi người dùng tick/bỏ tick "Sử dụng điểm tích lũy".

**Làm gì:**
- Nếu tick vào và khách có ≥ 1.000 điểm:
  - Tính số điểm có thể dùng tối đa (không vượt quá tổng tiền và điểm hiện có).
  - Làm tròn xuống bội số 1.000 (`Math.floor(maxUsable / 1000) * 1000`).
  - Set `pointsToUse`.
- Nếu bỏ tick: đặt `pointsToUse = 0`.

---

### 17. `handleCheckout()` — Dòng 428
**Tác dụng:** Mở modal xem trước hóa đơn.

**Làm gì:**
- Kiểm tra giỏ hàng không rỗng.
- Set `showInvoice = true` để hiển thị modal xác nhận thanh toán.

---

### 18. `confirmPayment()` — Dòng 434
**Tác dụng:** Xác nhận và gửi thanh toán lên server.

**Làm gì:**
1. Kiểm tra người dùng đã đăng nhập.
2. Duyệt qua từng item trong giỏ hàng:
   - Tìm thuốc tương ứng trong danh sách.
   - Phân bổ số lượng bán vào từng lô theo thứ tự **FEFO** (lô sắp hết hạn trước).
   - Tính `unit_price` tương ứng (theo đơn vị base hoặc sub).
   - Đẩy vào mảng `invoiceDetails`.
3. Nếu không đủ tồn kho: throw error.
4. Tạo `payload` gồm: branch_id, pharmacist_id, phone, tên KH, tổng tiền, giảm giá, điểm, chi tiết hàng bán.
5. Gọi `invoiceService.createInvoice(payload)`.
6. Sau khi thành công:
   - Broadcast `NEW_INVOICE` qua `BroadcastChannel` để các tab khác tự làm mới.
   - Gọi lại `fetchData(false)` để cập nhật tồn kho.
   - Sau 1.5 giây: reset toàn bộ state (giỏ hàng, thông tin KH, điểm) về ban đầu.

---

## II. TOÀN BỘ TÍNH NĂNG CỦA TRANG BÁN HÀNG (POS)

| # | Tính năng | Mô tả |
|---|-----------|-------|
| 1 | **Tải dữ liệu tồn kho** | Tải danh sách thuốc còn hàng từ API theo chi nhánh của người dùng đăng nhập |
| 2 | **Tự làm mới dữ liệu** | Polling 60 giây + làm mới khi tab nhận focus + đồng bộ qua BroadcastChannel |
| 3 | **Tìm kiếm thuốc** | Ô tìm kiếm theo tên thuốc, lọc realtime không cần nhấn Enter |
| 4 | **Lọc theo danh mục** | Tab danh mục (Tất cả + các nhóm thuốc), reset trang khi đổi danh mục |
| 5 | **Phân trang** | Hiển thị 10 thuốc/trang ở tab "Tất cả"; danh mục cụ thể hiện tất cả |
| 6 | **Chọn đơn vị bán** | Dropdown chọn đơn vị base (Hộp) hoặc sub (Viên), giá hiển thị theo đúng đơn vị |
| 7 | **Chọn số lượng** | Nút +/- hoặc gõ trực tiếp; tự giới hạn theo tồn kho thực tế |
| 8 | **Hiển thị tồn kho** | Hiện số lượng còn lại theo đơn vị, màu đỏ (hết), vàng (sắp hết), xám (còn hàng) |
| 9 | **Thêm vào giỏ hàng** | Kiểm tra tồn kho → thêm vào giỏ → trừ tồn kho tạm thời |
| 10 | **Giỏ hàng** | Danh sách item đã chọn, hiển thị số lượng, đơn giá, thành tiền |
| 11 | **Xóa item khỏi giỏ** | Nút X ẩn, hiện khi hover; hoàn trả tồn kho khi xóa |
| 12 | **Xóa toàn bộ giỏ** | Nút Trash2 ở header giỏ hàng; hoàn trả tất cả tồn kho |
| 13 | **Tìm kiếm khách hàng** | Nhập SĐT 10 số, bấm "Kiểm tra" để tra cứu KH cũ/mới |
| 14 | **Khách cũ – điểm tích lũy** | Hiển thị điểm hiện tại; preview điểm sau giao dịch |
| 15 | **Sử dụng điểm giảm giá** | Checkbox "Sử dụng điểm tích lũy"; chỉ kích hoạt nếu ≥ 1.000 điểm; tự tính tối đa có thể dùng |
| 16 | **Tính tiền** | Tạm tính + hiển thị điểm sẽ được cộng + giảm điểm (nếu có) + Tổng thanh toán |
| 17 | **Xuất hóa đơn (modal)** | Mở modal preview: thông tin dược sĩ, KH, chi nhánh, danh sách hàng, bảng thanh toán |
| 18 | **Xác nhận thanh toán** | Gửi hóa đơn lên API, phân bổ lô theo FEFO, lưu điểm KH |
| 19 | **In hóa đơn** | Nút "In hóa đơn" trong modal (UI đã có, chức năng in sẽ tích hợp sau) |
| 20 | **Đồng hồ trực tiếp** | Component `LiveClock` hiển thị giờ thực tế ở góc trên phải |

---

## III. FLOW CHẠY CỦA TRANG BÁN HÀNG

```
[Người dùng vào trang POS]
        │
        ▼
[fetchData() – Tải tồn kho từ API]
        │   Nhóm theo medicine_id, lọc lô hết hạn,
        │   sắp xếp FEFO, tính total_stock
        ▼
[Hiển thị danh sách thuốc + danh mục]
        │
        ▼
[Nhân viên dùng thanh tìm kiếm hoặc chọn danh mục]
        │   filteredMedicines → displayMedicines (phân trang)
        ▼
[Chọn đơn vị (Hộp/Viên) + nhập số lượng]
        │   handleUnitChange / handleUpdateLocalQty / handleManualQtyChange
        │   Giới hạn theo availableStock
        ▼
[Bấm "Thêm vào giỏ" – addToCart()]
        │   Kiểm tra tồn kho → Thêm vào cart
        │   → Trừ availableStock tạm thời
        ▼
[Nhập SĐT khách hàng + bấm "Kiểm tra"]
        │   checkCustomer() → API tra cứu
        │   → Khách cũ: hiện điểm, cho dùng điểm
        │   → Khách mới: ô nhập tên
        ▼
[Tick "Dùng điểm" (nếu có) – handleUsePointsChange()]
        │   Tính pointsToUse (bội số 1000, ≤ tổng tiền)
        │   finalAmount = totalAmount - pointsToUse
        ▼
[Bấm "Xuất hóa đơn" – handleCheckout()]
        │   showInvoice = true → Hiện modal
        ▼
[Xem lại chi tiết hóa đơn trong modal]
        │   Thông tin dược sĩ, KH, chi nhánh,
        │   Danh sách hàng, tạm tính, giảm điểm, tổng
        ▼
[Bấm "Xác nhận thanh toán" – confirmPayment()]
        │   1. Phân bổ số lượng bán vào từng lô (FEFO)
        │   2. Gọi invoiceService.createInvoice(payload)
        │   3. Broadcast NEW_INVOICE → các tab tự refresh
        │   4. Gọi fetchData(false) cập nhật tồn kho
        │   5. Sau 1.5s: reset toàn bộ state
        ▼
[Sẵn sàng giao dịch tiếp theo]
```

---

## IV. 10 CÂU HỎI BÁO CÁO – TẬP TRUNG VÀO 2 TÍNH NĂNG DỄ TRÌNH BÀY

> **Tính năng 1: Quản lý giỏ hàng & Tồn kho tạm thời**
> **Tính năng 2: Khách hàng & Điểm tích lũy**

---

### 🛒 Tính năng 1 – Giỏ hàng & Tồn kho

**Câu 1:** Khi nhân viên thêm 2 hộp thuốc vào giỏ, tồn kho hiển thị trên màn hình có bị trừ ngay lập tức không? Hệ thống xử lý điều đó như thế nào?

> **Trả lời:** Có. Hàm `addToCart()` sẽ trừ ngay vào state `availableStock` (trừ theo đơn vị nhỏ nhất – std). Điều này giúp nhân viên không thể thêm quá số lượng tồn kho thực tế, ngay cả khi chưa thanh toán.

---

**Câu 2:** Nếu nhân viên xóa một thuốc ra khỏi giỏ hàng, tồn kho có được hoàn trả không?

> **Trả lời:** Có. Hàm `removeFromCart()` sẽ cộng lại đúng số lượng std vừa xóa vào `availableStock`. Điều tương tự xảy ra với `clearCart()` (xóa toàn bộ giỏ).

---

**Câu 3:** Tại sao hệ thống phân biệt đơn vị "base" và "sub"? Việc này ảnh hưởng gì đến giá bán và tồn kho?

> **Trả lời:** Base unit là đơn vị lớn (Hộp), sub unit là đơn vị nhỏ (Viên). Mỗi đơn vị có giá bán riêng (`base_sell_price` / `sub_sell_price`). Khi thêm vào giỏ, số lượng được quy đổi về std để trừ kho chính xác. VD: 2 hộp (base) với tỉ lệ conversion 30 → trừ 60 viên khỏi kho.

---

**Câu 4:** Điều gì xảy ra nếu nhân viên cố thêm số lượng nhiều hơn tồn kho thực tế?

> **Trả lời:** Hàm `addToCart()` so sánh `requestedStdQty` với `availableStock`. Nếu vượt quá, hiện `alert` thông báo cụ thể còn bao nhiêu hộp + viên, và không thêm vào giỏ.

---

**Câu 5:** Khi người dùng đổi đơn vị từ "Hộp" sang "Viên", số lượng đang nhập có bị thay đổi không? Tại sao?

> **Trả lời:** Có thể bị điều chỉnh. Hàm `handleUnitChange()` tính lại `maxAvailable` theo đơn vị mới. Nếu số lượng đang chọn (VD: 5 hộp = 150 viên) vượt quá max tính theo viên, nó sẽ tự điều chỉnh về max. Điều này tránh chọn quá tồn kho.

---

### 👤 Tính năng 2 – Khách hàng & Điểm tích lũy

**Câu 6:** Làm sao hệ thống biết đây là khách cũ hay khách mới khi nhân viên nhập số điện thoại?

> **Trả lời:** Hàm `checkCustomer()` gọi API `invoiceService.getCustomerByPhone()`. Nếu API trả về object có `customer_id` → khách cũ (hiện tên + điểm). Nếu không tìm thấy (hoặc lỗi) → coi là khách mới (để trống tên, điểm = 0).

---

**Câu 7:** Điểm tích lũy được tính và lưu như thế nào sau một giao dịch thành công?

> **Trả lời:** Trong `confirmPayment()`, payload gửi lên bao gồm `points_earned = Math.floor(finalAmount / 10)` (cứ 10đ được 1 điểm) và `points_redeemed = pointsToUse`. Backend chịu trách nhiệm cập nhật điểm tích lũy của khách hàng trong CSDL.

---

**Câu 8:** Tại sao điểm tích lũy dùng để giảm giá phải là bội số 1.000? Hệ thống tính toán điều này như thế nào?

> **Trả lời:** Đây là quy định kinh doanh: 1.000 điểm = giảm 1.000đ. Hàm `handleUsePointsChange()` dùng `Math.floor(maxUsable / 1000) * 1000` để lấy số điểm hợp lệ lớn nhất, tránh trường hợp dùng lẻ điểm gây rắc rối khi tính tiền.

---

**Câu 9:** Nếu khách có 5.000 điểm nhưng tổng hoá đơn chỉ 3.500đ, hệ thống sẽ tự dùng bao nhiêu điểm?

> **Trả lời:** Hệ thống tính `maxUsable = Math.min(customerPoints, totalAmount) = Math.min(5000, 3500) = 3500`. Sau đó `autoUsePoints = Math.floor(3500 / 1000) * 1000 = 3000`. Khách được giảm 3.000đ, còn phải trả 500đ.

---

**Câu 10:** Nếu nhân viên không nhập số điện thoại khách hàng, hóa đơn có được tạo không? Dữ liệu gì được lưu trong trường hợp đó?

> **Trả lời:** Có. Giao dịch vẫn được thực hiện bình thường. Trong payload gửi lên, `customer_phone: null` và `customer_name: null`. Hóa đơn được ghi nhận là **"KHÁCH VÃNG LAI"** – không liên kết với khách hàng cụ thể nào trong hệ thống, và điểm tích lũy sẽ không được ghi nhận.
