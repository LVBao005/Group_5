# 🎮 SIMULATOR INTEGRATION - Real-time Dashboard Updates

## 🎯 Mục Đích

Khi Simulator (Data Generator) chạy và tạo đơn hàng liên tục, Dashboard sẽ:
- ✅ Tự động cập nhật số liệu mỗi 30 giây
- ✅ Biểu đồ "nhảy số" theo thời gian thực
- ✅ Hiển thị doanh thu tăng liên tục
- ✅ Cảnh báo cập nhật khi có thay đổi

---

## 🔄 Cách Hoạt Động

### 1. Auto-Refresh Mechanism
```javascript
// Dashboard tự động refresh mỗi 30 giây
useEffect(() => {
    const interval = setInterval(() => {
        loadDashboardData(); // Gọi API mới
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
}, [period]);
```

### 2. Manual Refresh
Người dùng có thể click nút **"Làm mới"** để update ngay lập tức.

---

## 🚀 Setup Simulator

### Option 1: Sử dụng POS System
```bash
# Mở POS page
http://localhost:5173/pos

# Tạo đơn hàng liên tục
# → Dashboard tự động cập nhật
```

### Option 2: SQL Script Auto-Insert
Tạo stored procedure tự động insert invoice:

```sql
DELIMITER //

CREATE PROCEDURE generate_random_invoice()
BEGIN
    DECLARE random_amount DECIMAL(10,2);
    DECLARE random_customer INT;
    
    -- Random amount 100k - 500k
    SET random_amount = FLOOR(100000 + RAND() * 400000);
    
    -- Random customer
    SET random_customer = FLOOR(1 + RAND() * 20);
    
    -- Insert invoice
    INSERT INTO Invoices (branch_id, pharmacist_id, customer_id, total_amount, created_at)
    VALUES (1, 1, random_customer, random_amount, NOW());
    
    SELECT LAST_INSERT_ID() as invoice_id, random_amount as amount;
END //

DELIMITER ;

-- Test chạy
CALL generate_random_invoice();
```

### Option 3: Python Simulator Script
```python
# simulator.py
import mysql.connector
import random
import time
from datetime import datetime

def connect_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="password",
        database="pharmacy_db"
    )

def generate_invoice():
    conn = connect_db()
    cursor = conn.cursor()
    
    # Random data
    amount = random.randint(100000, 500000)
    customer_id = random.randint(1, 20)
    
    # Insert invoice
    query = """
        INSERT INTO Invoices (branch_id, pharmacist_id, customer_id, total_amount, created_at)
        VALUES (1, 1, %s, %s, NOW())
    """
    cursor.execute(query, (customer_id, amount))
    conn.commit()
    
    invoice_id = cursor.lastrowid
    print(f"✅ Created Invoice #{invoice_id} - Amount: {amount:,} VND")
    
    cursor.close()
    conn.close()

def run_simulator(interval_seconds=10):
    """
    Chạy simulator - tạo invoice mỗi N giây
    """
    print("🎮 Simulator Starting...")
    print(f"⏱️  Generating invoice every {interval_seconds} seconds")
    print("🛑 Press Ctrl+C to stop\n")
    
    try:
        while True:
            generate_invoice()
            time.sleep(interval_seconds)
    except KeyboardInterrupt:
        print("\n🛑 Simulator stopped")

if __name__ == "__main__":
    # Tạo invoice mỗi 10 giây
    run_simulator(interval_seconds=10)
```

**Chạy simulator:**
```bash
python simulator.py
```

### Option 4: Node.js Simulator
```javascript
// simulator.js
const mysql = require('mysql2/promise');

const config = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'pharmacy_db'
};

async function generateInvoice() {
    const connection = await mysql.createConnection(config);
    
    const amount = Math.floor(100000 + Math.random() * 400000);
    const customerId = Math.floor(1 + Math.random() * 20);
    
    const [result] = await connection.execute(
        'INSERT INTO Invoices (branch_id, pharmacist_id, customer_id, total_amount, created_at) VALUES (1, 1, ?, ?, NOW())',
        [customerId, amount]
    );
    
    console.log(`✅ Created Invoice #${result.insertId} - Amount: ${amount.toLocaleString('vi-VN')} VND`);
    
    await connection.end();
}

async function runSimulator(intervalSeconds = 10) {
    console.log('🎮 Simulator Starting...');
    console.log(`⏱️  Generating invoice every ${intervalSeconds} seconds`);
    console.log('🛑 Press Ctrl+C to stop\n');
    
    setInterval(async () => {
        try {
            await generateInvoice();
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }, intervalSeconds * 1000);
}

runSimulator(10); // Tạo invoice mỗi 10 giây
```

**Chạy:**
```bash
npm install mysql2
node simulator.js
```

---

## 📊 Xem Dashboard Real-time

### Setup Multi-Screen
1. **Screen 1:** Dashboard
   ```
   http://localhost:5173/dashboard
   ```

2. **Screen 2:** Simulator Console
   ```bash
   # Chạy simulator (Python/Node.js/SQL)
   ```

3. **Screen 3:** Database Monitor
   ```sql
   -- Watch live
   SELECT COUNT(*) as total, SUM(total_amount) as revenue
   FROM Invoices 
   WHERE DATE(created_at) = CURDATE();
   ```

### Expected Behavior
```
⏰ 00:00 - Simulator tạo invoice #1
⏰ 00:10 - Simulator tạo invoice #2
⏰ 00:20 - Simulator tạo invoice #3
⏰ 00:30 - Dashboard refresh → Hiển thị 3 invoices mới
⏰ 00:40 - Simulator tạo invoice #4
⏰ 00:50 - Simulator tạo invoice #5
⏰ 01:00 - Dashboard refresh → Hiển thị 5 invoices mới
```

---

## 🎨 Visual Effects

### Khi Dashboard Update
- 📊 Chart animation smooth
- 💰 Numbers count up effect
- 🔄 Refresh icon spin
- ⚡ Fast transition

### Indicators
- 🟢 Green: Đang chạy
- 🟡 Yellow: Đang refresh
- 🔵 Blue: Idle

---

## 🔧 Configuration

### Thay đổi refresh interval

**File:** `frontend/src/pages/Dashboard.jsx`

```javascript
// Mặc định: 30 giây
const interval = setInterval(() => {
    loadDashboardData();
}, 30000);

// Nhanh hơn: 15 giây
}, 15000);

// Chậm hơn: 60 giây
}, 60000);
```

### Disable auto-refresh
```javascript
// Comment out auto-refresh
/*
useEffect(() => {
    const interval = setInterval(() => {
        loadDashboardData();
    }, 30000);
    return () => clearInterval(interval);
}, [period]);
*/
```

---

## 📈 Performance Tips

### 1. Optimize Database Queries
```sql
-- Add indexes
CREATE INDEX idx_invoices_created_at ON Invoices(created_at);
CREATE INDEX idx_batches_expiry ON Batches(expiry_date);
CREATE INDEX idx_inventory_quantity ON Inventory(quantity);
```

### 2. Cache Results (Backend)
```java
// Cache trong 30s
private Map<String, Object> statsCache;
private long lastCacheTime;

private Map<String, Object> getCachedStats() {
    if (statsCache != null && System.currentTimeMillis() - lastCacheTime < 30000) {
        return statsCache;
    }
    // Fetch new data
    statsCache = fetchStatsFromDB();
    lastCacheTime = System.currentTimeMillis();
    return statsCache;
}
```

### 3. Lazy Loading Charts
```javascript
// Chỉ load khi visible
import { lazy, Suspense } from 'react';

const RevenueChart = lazy(() => import('./RevenueChart'));

<Suspense fallback={<Loading />}>
    <RevenueChart data={data} />
</Suspense>
```

---

## 🎯 Testing Scenarios

### Test 1: Slow Generation (Thực tế)
```bash
# Tạo invoice mỗi 60 giây
simulator.run(interval=60)

# Expected: Dashboard smooth updates
```

### Test 2: Fast Generation (Stress Test)
```bash
# Tạo invoice mỗi 5 giây
simulator.run(interval=5)

# Expected: Dashboard handles high frequency
```

### Test 3: Burst Mode
```bash
# Tạo 100 invoices cùng lúc
for i in range(100):
    generate_invoice()

# Expected: Dashboard shows spike
```

---

## 🐛 Troubleshooting

### Dashboard không update
✅ **Check:**
1. Simulator có đang chạy?
2. Database có nhận được data mới?
3. Backend API có hoạt động?
4. Console có lỗi không?

### Chart không "nhảy số"
✅ **Check:**
1. Auto-refresh có enable?
2. Period có đúng không? (Today để thấy real-time)
3. Data có trong khoảng thời gian hiện tại?

### Performance chậm
✅ **Solutions:**
1. Tăng interval refresh (60s thay vì 30s)
2. Add database indexes
3. Enable API caching
4. Giảm số data points trên chart

---

## 💡 Advanced Features

### WebSocket Real-time (Optional)
Nếu muốn update ngay lập tức không cần đợi 30s:

**Backend:**
```java
// Add WebSocket support
@ServerEndpoint("/dashboard-ws")
public class DashboardWebSocket {
    @OnMessage
    public void onMessage(String message, Session session) {
        // Send real-time updates
    }
}
```

**Frontend:**
```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8080/dashboard-ws');
ws.onmessage = (event) => {
    const newData = JSON.parse(event.data);
    updateDashboard(newData);
};
```

### Push Notifications
```javascript
// Thông báo khi có invoice mới
if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            new Notification('Dashboard Update', {
                body: 'New invoice received!',
                icon: '/icon.png'
            });
        }
    });
}
```

---

## 📊 Demo Script

### Full Demo Scenario
```bash
# Terminal 1: Start Backend
cd backend
mvn tomcat7:run

# Terminal 2: Start Frontend
cd frontend
npm run dev

# Terminal 3: Start Simulator
python simulator.py

# Browser: Open Dashboard
http://localhost:5173/dashboard

# Watch the magic! ✨
```

---

## ✅ Success Metrics

Dashboard thành công khi:
- ✅ Tự động refresh mỗi 30s
- ✅ Hiển thị data mới từ simulator
- ✅ Chart animation mượt
- ✅ Không có lỗi console
- ✅ Performance < 2s load time
- ✅ Responsive mọi device

---

**Happy Simulating! 🎮🚀**
