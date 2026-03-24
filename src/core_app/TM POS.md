# 20 CÂU HỎI & TRẢ LỜI VỀ TRANG BÁN HÀNG (POS)

> Tài liệu tham chiếu code cho trang **Bán hàng tại quầy (POS)** của hệ thống **PharmaPOS**.
> File chính: `frontend/src/pages/POS.jsx` (1089 dòng)

---

## Câu 1: Trang POS tự động load dữ liệu mới bằng cách nào? Làm sao nó biết mà cập nhật lại trang?

**Trả lời:** Trang POS sử dụng **3 cơ chế đồng bộ dữ liệu** song song, tất cả được thiết lập trong hook `useEffect` tại **POS.jsx dòng 153–180**:

### Cơ chế 1: Polling (Tự động gọi API mỗi 60 giây)
- **File:** `POS.jsx`, **dòng 157–159**
```js
const pollInterval = setInterval(() => {
    fetchData(false); // Silent refresh — không hiện loading spinner
}, 60000);
```
- **Cách hoạt động:** Dùng `setInterval` để cứ mỗi 60 giây lại gọi hàm `fetchData(false)`. Tham số `false` có nghĩa là **không hiện loading spinner** (refresh ngầm, user không thấy gì cả). Hàm `fetchData` gọi API lấy toàn bộ dữ liệu tồn kho mới nhất từ backend.
- **Cleanup:** Khi component unmount, `clearInterval(pollInterval)` được gọi tại **dòng 176** để tránh memory leak.

### Cơ chế 2: Focus Sync (Refresh khi user quay lại tab)
- **File:** `POS.jsx`, **dòng 161–165**
```js
const handleFocus = () => {
    fetchData(false); // Silent refresh
};
window.addEventListener('focus', handleFocus);
```
- **Cách hoạt động:** Khi user chuyển sang tab khác rồi quay lại tab POS, sự kiện `focus` của `window` sẽ được kích hoạt → tự động gọi `fetchData(false)` để lấy dữ liệu mới nhất. Điều này đảm bảo nếu có ai bán hàng ở tab khác hoặc ai đó nhập kho, khi quay lại tab POS sẽ thấy dữ liệu đúng.
- **Cleanup:** `window.removeEventListener('focus', handleFocus)` tại **dòng 177**.

### Cơ chế 3: BroadcastChannel (Đồng bộ tức thì giữa các tab)
- **File:** `POS.jsx`, **dòng 168–173** (listener) và **dòng 511–517** (sender)
```js
// LISTENER (dòng 168–173):
const syncChannel = new BroadcastChannel('pharmacy_sync');
syncChannel.onmessage = (event) => {
    if (event.data.type === 'NEW_INVOICE') {
        fetchData(false);
    }
};

Frontend (POS.jsx): Quá trình tạo hóa đơn và thanh toán (confirmPayment) diễn ra từ dòng 431 đến 539 (nơi gọi hàm API tạo hóa đơn là dòng 507).
Frontend (invoiceService.js): Hàm gọi API tạo hóa đơn thực tế nằm từ dòng 11 đến 39.
Backend (InvoiceServlet.java): Servlet nhận request tạo hóa đơn nằm từ dòng 77 đến 117.
Backend (InvoiceDAO.java): Hàm xử lý logic tạo hóa đơn vào database (createInvoice) nằm từ dòng 31 đến 189.

// SENDER (dòng 511–517 — sau khi thanh toán thành công):
const syncChannel = new BroadcastChannel('pharmacy_sync');
syncChannel.postMessage({ type: 'NEW_INVOICE' });
syncChannel.close();
```
- **Cách hoạt động:** Đây là Web API `BroadcastChannel` — cho phép các tab cùng origin giao tiếp với nhau. Khi một tab thanh toán thành công, nó gửi message `{ type: 'NEW_INVOICE' }` vào channel `pharmacy_sync`. Tất cả các tab khác đang mở POS sẽ nhận được message này và tự động gọi `fetchData(false)` để cập nhật tồn kho **ngay lập tức**, không cần chờ polling.
- **Cleanup:** `syncChannel.close()` tại **dòng 178**.

### Hàm fetchData — Trung tâm của cơ chế refresh
- **File:** `POS.jsx`, **dòng 63–151**
- **Luồng hoạt động:**
  1. Gọi `inventoryService.getInventoryByBranch(branchId)` (**dòng 67**) → gọi API `GET /api/inventory?branchId=X`
  2. Nhận dữ liệu inventory thô, group theo `medicine_id` (**dòng 78–108**)
  3. Lọc bỏ các lô thuốc đã hết hạn (**dòng 116–119**)
  4. Tính tổng tồn kho và sắp xếp theo FIFO/FEFO (**dòng 121–124**)
  5. Cập nhật state `medicines` (**dòng 129**) và `availableStock` (**dòng 144**)
  6. React tự động re-render UI dựa trên state mới

### Tổng kết cơ chế refresh:
| Cơ chế | Khi nào kích hoạt | Dòng code | Độ trễ |
|---|---|---|---|
| Polling | Mỗi 60 giây | 157–159 | ≤ 60s |
| Focus Sync | User quay lại tab | 161–165 | Tức thì |
| BroadcastChannel | Tab khác thanh toán xong | 168–173, 511–517 | Tức thì |
| Sau thanh toán | Ngay sau `confirmPayment` thành công | 520 | Tức thì |

---

## Câu 2: Dữ liệu thuốc được load từ đâu và xử lý như thế nào?

**Trả lời:**
- **Frontend gọi API:** `inventoryService.getInventoryByBranch(branchId)` — File `inventoryService.js`, **dòng 4–12**
- **API endpoint:** `GET /api/inventory?branchId=X` — File `axios.js`, **dòng 9** (baseURL = `/api`)
- **Xử lý dữ liệu trả về:** Hàm `fetchData` trong `POS.jsx`, **dòng 63–151** nhận raw data rồi group theo `medicine_id`, gắn batches, lọc expired, tính total_stock.

---

## Câu 3: Giỏ hàng hoạt động như thế nào?

**Trả lời:**
- **State giỏ hàng:** `const [cart, setCart] = useState([])` — `POS.jsx`, **dòng 36**
- **Thêm vào giỏ:** Hàm `addToCart(medicine)` — **dòng 281–329**
  - Kiểm tra số lượng > 0 (**dòng 283**)
  - Tính đơn giá theo đơn vị đã chọn (Hộp/Viên) (**dòng 288**)
  - Kiểm tra tồn kho đủ không (**dòng 296–301**)
  - Nếu sản phẩm đã có trong giỏ (cùng đơn vị) → cộng dồn (**dòng 307–310**)
  - Nếu chưa có → thêm mới (**dòng 311–319**)
  - Trừ `availableStock` ngay tại frontend (**dòng 322–325**)

---

## Câu 4: Làm sao xóa sản phẩm khỏi giỏ hàng?

**Trả lời:**
- **Xóa 1 sản phẩm:** Hàm `removeFromCart(item)` — `POS.jsx`, **dòng 331–347**
  - Hoàn trả lại tồn kho `availableStock` (**dòng 340–343**)
  - Loại bỏ item khỏi cart (**dòng 346**)
- **Xóa tất cả:** Hàm `clearCart()` — **dòng 349–366**
  - Duyệt tất cả item trong giỏ, hoàn trả stock (**dòng 351–362**)
  - Set `cart = []` (**dòng 365**)

---

## Câu 5: Đơn vị tính (Hộp/Viên) được chọn và xử lý ra sao?

**Trả lời:**
- **State:** `const [selectedUnits, setSelectedUnits] = useState({})` — `POS.jsx`, **dòng 38**
- **Hàm xử lý:** `handleUnitChange(medicineId, unit)` — **dòng 258–279**
  - Cập nhật unit đã chọn (**dòng 259–262**)
  - Tính lại max available theo đơn vị mới (**dòng 267–269**)
  - Nếu số lượng hiện tại vượt max → giảm xuống (**dòng 271–277**)
- **UI dropdown:** Render tại **dòng 639–650** — chỉ hiện khi thuốc có `sub_unit`

---

## Câu 6: Tính toán FIFO (First Expired, First Out) hoạt động thế nào?

**Trả lời:**
- **Sắp xếp lô theo hạn dùng:** `POS.jsx`, **dòng 124**
```js
m.batches.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
```
- **Trừ kho theo thứ tự FIFO khi thanh toán:** Hàm `confirmPayment`, **dòng 462–486**
  - Duyệt qua từng batch đã sắp xếp (**dòng 464**)
  - Lấy tối đa số lượng có thể từ lô gần hết hạn nhất (**dòng 472**)
  - Tiếp tục lấy từ lô tiếp theo cho đến khi đủ (**dòng 465**)
- **Lọc lô đã hết hạn:** **dòng 116–119** (khi load) và **dòng 469–470** (khi thanh toán)

---

## Câu 7: Quy trình thanh toán (Checkout) diễn ra như thế nào?

**Trả lời:**
1. **Bước 1:** User nhấn "Xuất hóa đơn" → `handleCheckout()` tại **dòng 425–429** → hiện modal xác nhận
2. **Bước 2:** User nhấn "Xác nhận thanh toán" → `confirmPayment()` tại **dòng 431–539**
   - Kiểm tra user đăng nhập (**dòng 438–442**)
   - Tạo `invoiceDetails` theo FIFO (**dòng 445–491**)
   - Gửi payload lên backend (**dòng 493–507**)
   - Gọi `invoiceService.createInvoice(payload)` (**dòng 507**)
   - Broadcast sync event (**dòng 511–517**)
   - Silent refresh tồn kho (**dòng 520**)
   - Reset giỏ hàng sau 1.5s (**dòng 522–532**)

---

## Câu 8: Backend xử lý tạo hóa đơn như thế nào?

**Trả lời:**
- **Servlet nhận request:** `InvoiceServlet.java`, **dòng 77–117** (method `doPost`)
  - Đọc JSON body (**dòng 84–89**)
  - Parse và gọi DAO (**dòng 92–95**)
- **DAO xử lý:** `InvoiceDAO.java`, **dòng 31–189** (method `createInvoice`)
  - Bật transaction: `conn.setAutoCommit(false)` (**dòng 39**)
  - Xử lý khách hàng (tạo mới hoặc tìm) (**dòng 50–84**)
  - Insert bảng `invoices` (**dòng 87–111**)
  - Insert bảng `invoice_details` (**dòng 114–134**)
  - Trừ kho `inventory` + ghi log `stock_movements` (**dòng 136–171**)
  - Commit transaction (**dòng 173**) hoặc rollback nếu lỗi (**dòng 178**)

---

## Câu 9: Hệ thống khách hàng & tích điểm hoạt động ra sao?

**Trả lời:**
- **Nhập SĐT & kiểm tra:** Hàm `checkCustomer()` — `POS.jsx`, **dòng 371–408**
  - Gọi API `GET /api/customers?phoneNumber=...` qua `invoiceService.getCustomerByPhone(phone)` (**dòng 378**)
  - Nếu khách cũ → hiện tên + điểm (**dòng 380–384**)
  - Nếu khách mới → hiện form nhập tên (**dòng 390–394**)
- **Sử dụng điểm:** Hàm `handleUsePointsChange` — **dòng 410–421**
  - Chỉ dùng bội số của 1000 (**dòng 416**)
  - Điểm tối đa sử dụng = min(điểm có, tổng tiền) (**dòng 415**)
- **Tính điểm mới:** `Math.floor(finalAmount / 10)` — **dòng 504**
- **Backend cập nhật điểm:** `InvoiceDAO.java`, **dòng 73–81**

---

## Câu 10: Tìm kiếm thuốc hoạt động thế nào?

**Trả lời:**
- **State:** `const [searchTerm, setSearchTerm] = useState('')` — `POS.jsx`, **dòng 53**
- **Input UI:** **dòng 552–558** — input có icon Search
- **Logic lọc:** **dòng 183–189**
```js
const filteredMedicines = medicines.filter(m => {
    const matchesCategory = activeCategory === 0 || m.category_id === activeCategory;
    const matchesSearch = searchTerm.trim() === '' ||
        (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.brand || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
});
```
- Tìm theo **tên thuốc** và **thương hiệu**, không phân biệt hoa - thường.

---

## Câu 11: Phân trang (Pagination) hoạt động ra sao?

**Trả lời:**
- **Hằng số:** `ITEMS_PER_PAGE = 10` — `POS.jsx`, **dòng 34**
- **Logic cắt trang:** **dòng 192–194** — chỉ phân trang khi category = "Tất cả"
```js
const displayMedicines = activeCategory === 0
    ? filteredMedicines.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : filteredMedicines;
```
- **Tổng số trang:** **dòng 196**
- **UI pagination:** **dòng 703–757** — bao gồm nút trước/sau, số trang, dấu `...`

---

## Câu 12: Lọc theo danh mục (Category) hoạt động thế nào?

**Trả lời:**
- **State:** `const [activeCategory, setActiveCategory] = useState(0)` — `POS.jsx`, **dòng 32** (0 = Tất cả)
- **Hàm chuyển category:** `handleCategoryChange(catId)` — **dòng 198–201** — reset về trang 1
- **Categories được load từ API:** Trong `fetchData`, **dòng 79–85** — trích xuất từ dữ liệu inventory
- **UI nút category:** **dòng 571–593**

---

## Câu 13: Số lượng thuốc trên card (trước khi thêm vào giỏ) được quản lý ra sao?

**Trả lời:**
- **State riêng:** `const [quantities, setQuantities] = useState({})` — `POS.jsx`, **dòng 37**
- **Tăng/giảm bằng nút +/-:** `handleUpdateLocalQty(id, delta)` — **dòng 217–234**
  - Giới hạn min = 0, max = available stock (**dòng 228–231**)
- **Nhập tay:** `handleManualQtyChange(id, value)` — **dòng 236–256**
- **Sau khi thêm vào giỏ:** Reset lại về 1 — **dòng 328**

---

## Câu 14: Tồn kho khả dụng (`availableStock`) được tính như thế nào?

**Trả lời:**
- **State:** `const [availableStock, setAvailableStock] = useState({})` — `POS.jsx`, **dòng 39**
- **Tính khi load data:** **dòng 134–144**
  - `total_stock` trừ đi số lượng đã có trong giỏ (quy đổi ra std unit)
- **Khi thêm vào giỏ:** Trừ tiếp — **dòng 322–325**
- **Khi xóa khỏi giỏ:** Hoàn lại — **dòng 340–343**

---

## Câu 15: Hiển thị tồn kho trên card thuốc như thế nào?

**Trả lời:**
- **Tính toán:** `POS.jsx`, **dòng 606–609**
```js
const totalTablets = availableStock[medicine.medicine_id] || 0;
const conversionRate = medicine.conversion_rate || 1;
const boxes = Math.floor(totalTablets / conversionRate);
const tablets = totalTablets % conversionRate;
```
- **Hiển thị:** **dòng 620–632**
  - Nếu chọn sub_unit → hiện số viên
  - Nếu chọn base → hiện `X hộp + Y viên`
  - **Đổi màu:** Hết hàng → đỏ, sắp hết → vàng, bình thường → xám (**dòng 623–627**)

---

## Câu 16: Nút "Thêm vào giỏ" bị disable khi nào?

**Trả lời:**
- **Điều kiện:** `disabled={totalTablets === 0}` — `POS.jsx`, **dòng 686**
- Khi hết hàng → nút chuyển sang màu xám, text = "Hết hàng" (**dòng 695**)
- Khi còn hàng → nút xanh lá, text = "Thêm vào giỏ" (**dòng 691**)

---

## Câu 17: Tổng tiền và tổng thanh toán được tính ra sao?

**Trả lời:**
- **Tạm tính (subtotal):** `POS.jsx`, **dòng 368**
```js
const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
```
- **Tổng thanh toán (sau giảm điểm):** **dòng 369**
```js
const finalAmount = Math.max(0, totalAmount - pointsToUse);
```
- **Format giá VNĐ:** Hàm `formatPrice` — **dòng 213–215** — dùng `toLocaleString('vi-VN')`

---

## Câu 18: Modal hóa đơn (Checkout Modal) hiển thị những gì?

**Trả lời:**
- **Hiện modal:** Khi `showInvoice === true` — `POS.jsx`, **dòng 943–1083**
- **Nội dung:**
  - Mã hóa đơn ngẫu nhiên (**dòng 958**)
  - Thông tin dược sĩ, khách hàng, chi nhánh (**dòng 968–1000**)
  - Bảng danh sách sản phẩm (**dòng 1003–1019**)
  - Tạm tính, sử dụng điểm, tổng cần thanh toán (**dòng 1023–1053**)
  - Nút "Xác nhận thanh toán" + "In hóa đơn" (**dòng 1054–1078**)

---

## Câu 19: Axios được cấu hình như thế nào cho POS?

**Trả lời:**
- **File:** `api/axios.js`, **dòng 8–16**
  - `baseURL: '/api'` — được proxy sang `localhost:8080/backend` qua Vite
  - `timeout: 10000` (10 giây)
  - `withCredentials: true` — gửi cookies/session
- **Interceptor xử lý 401:** **dòng 31–58** — nếu session hết hạn → xóa localStorage → redirect về `/login`
- **POS gọi 2 service:**
  - `inventoryService` (file `inventoryService.js`) — lấy tồn kho
  - `invoiceService` (file `invoiceService.js`) — tạo hóa đơn, kiểm tra khách hàng

---

## Câu 20: Backend đảm bảo an toàn dữ liệu khi bán hàng bằng cách nào?

**Trả lời:**
- **Transaction:** `InvoiceDAO.java`, **dòng 39** — `conn.setAutoCommit(false)`
- **Row locking:** **dòng 137** — `SELECT ... FOR UPDATE` để khóa dòng khi đọc tồn kho, tránh race condition
- **Kiểm tra tồn kho đủ:** **dòng 154–156** — nếu `available < totalNeeded` → throw exception
- **Rollback khi lỗi:** **dòng 177–178** — `conn.rollback()` nếu bất kỳ bước nào thất bại
- **Commit cuối cùng:** **dòng 173** — `conn.commit()` chỉ khi tất cả thành công
- **Ghi log movement:** **dòng 164** — `stockMovementDAO.logMovement(...)` ghi nhận "BÁN HÀNG"

---

## TỔNG HỢP FILE VÀ DÒNG CODE QUAN TRỌNG

| Chức năng | File | Dòng |
|---|---|---|
| Load dữ liệu (fetchData) | `POS.jsx` | 63–151 |
| Polling 60s | `POS.jsx` | 157–159 |
| Focus Sync | `POS.jsx` | 161–165 |
| BroadcastChannel Sync | `POS.jsx` | 168–173, 511–517 |
| Thêm vào giỏ | `POS.jsx` | 281–329 |
| Xóa khỏi giỏ | `POS.jsx` | 331–347 |
| Đổi đơn vị Hộp/Viên | `POS.jsx` | 258–279 |
| Thanh toán (FIFO) | `POS.jsx` | 431–539 |
| Kiểm tra khách hàng | `POS.jsx` | 371–408 |
| Sử dụng điểm | `POS.jsx` | 410–421 |
| Tìm kiếm | `POS.jsx` | 183–189 |
| Phân trang | `POS.jsx` | 192–196 |
| Gọi API inventory | `inventoryService.js` | 4–12 |
| Gọi API tạo hóa đơn | `invoiceService.js` | 11–39 |
| Gọi API khách hàng | `invoiceService.js` | 47–55 |
| Cấu hình Axios | `axios.js` | 8–16 |
| Servlet nhận hóa đơn | `InvoiceServlet.java` | 77–117 |
| DAO tạo hóa đơn (transaction) | `InvoiceDAO.java` | 31–189 |
| Trừ kho + log movement | `InvoiceDAO.java` | 136–171 |
| Xử lý điểm khách hàng | `InvoiceDAO.java` | 73–81 |

Việc phân quyền hiển thị và chặn truy cập giữa ADMIN và STAFF được thực hiện hoàn toàn ở phần Frontend thông qua 2 file chính sau:

File chặn truy cập đường dẫn (Routing Guard):

File: 

frontend/src/components/ProtectedRoute.jsx
Hàm xử lý: Component 

ProtectedRoute
Dòng code: Từ dòng 22 đến 24
javascript
if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/pos" replace />;
}
Tác dụng: Kiểm tra xem role của user đang đăng nhập có nằm trong danh sách được phép không. Nếu là STAFF mà cố tình gõ link của trang ADMIN (báo cáo, kho), hệ thống sẽ đá ngược về trang bán hàng (/pos).
File ẩn/hiện menu (Sidebar):

File: 

frontend/src/components/Sidebar.jsx
Hàm xử lý: Việc khai báo và filter mảng menuItems
Dòng code: Từ dòng 27 đến 32
javascript
const menuItems = [
    { icon: ShoppingCart, label: 'Bán hàng', path: '/pos', roles: ['ADMIN', 'STAFF'] },
    { icon: Receipt, label: 'Hóa đơn', path: '/invoices', roles: ['ADMIN', 'STAFF'] },
    { icon: LayoutDashboard, label: 'Báo cáo', path: '/dashboard', roles: ['ADMIN'] },
    { icon: Package, label: 'Kho thuốc', path: '/inventory', roles: ['ADMIN'] },
].filter(item => item.roles.includes(user?.role || 'STAFF'));
Tác dụng: Tự động lọc các nút trên thanh menu. Nếu đang là STAFF, sẽ tự động gỡ bỏ nút "Báo cáo" và "Kho thuốc" khỏi màn hình.