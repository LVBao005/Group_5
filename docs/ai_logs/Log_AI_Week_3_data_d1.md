**User:**

<task>
Prompt: Script Node.js (JavaScript) Generate 10,000 dòng dữ liệu chuẩn SQL Server
"Hãy viết một script Node.js sử dụng thư viện @faker-js/faker để tạo 10,000 dòng dữ liệu mẫu (Mock Data). Dữ liệu phải khớp hoàn toàn với cấu trúc SQL Server sau: 

Yêu cầu kỹ thuật chi tiết:

Quy tắc Số điện thoại (Bắt buộc):

Tất cả các trường phone_number phải là chuỗi đúng 10 chữ số, bắt đầu bằng số 0. Hãy dùng faker.helpers.replaceSymbolWithNumber('0#########').

Dữ liệu Logic (Đảm bảo toàn vẹn):

Bảng Categories & Medicines: Tạo 10 danh mục. Tạo 500 loại thuốc, cột unit chỉ được chọn ngẫu nhiên từ: tablet, vial, bottle, box.

Bảng Batches & Inventory: Tạo 2,000 lô hàng (expiry_date từ 2024 - 2027). Mỗi lô hàng phải được tạo tồn kho (inventory) cho 5 chi nhánh khác nhau.

FIFO Test: Đảm bảo mỗi medicine_id có nhiều batch_id với ngày hết hạn khác nhau để test logic bán hàng.

Invoices & Details: Tạo 7,000 hóa đơn. Mỗi hóa đơn có từ 1-5 sản phẩm, liên kết đúng batch_id và invoice_id.

Xử lý dữ liệu rác (5% tổng số):

Xen kẽ các dòng lỗi để test module Import: phone_number sai độ dài, tên thuốc bị rỗng, số lượng âm, hoặc đơn vị (unit) không hợp lệ.

Đầu ra (Output):

Sử dụng module fs để xuất ra các file CSV riêng lẻ: branches.csv, medicines.csv, batches.csv, inventory.csv, pharmacists.csv, customers.csv, invoices.csv, invoice_details.csv. Hãy sử dụng thư viện csv-writer hoặc tự viết file thủ công."
</task>


New instructions for task continuation:
<user_message>
Prompt: Script Node.js (JavaScript) Generate 10,000 dòng dữ liệu chuẩn SQL Server
"Hãy viết một script Node.js sử dụng thư viện @faker-js/faker để tạo 10,000 dòng dữ liệu mẫu (Mock Data). Dữ liệu phải khớp hoàn toàn với cấu trúc SQL Server sau: 
-- ==========================================================
-- ĐỒ ÁN LAB211: HỆ THỐNG QUẢN LÝ CHUỖI NHÀ THUỐC
-- DATABASE: SQL SERVER
-- ==========================================================

-- 1. TẠO BẢNG CHI NHÁNH
CREATE TABLE [branches] (
  [branch_id] INT PRIMARY KEY IDENTITY(1, 1),
  [branch_name] NVARCHAR(100) NOT NULL,
  [address] NVARCHAR(MAX),
  [phone_number] VARCHAR(20)
)
GO

-- 2. TẠO BẢNG DANH MỤC THUỐC (Giải quyết thách thức Dashboard)
CREATE TABLE [categories] (
  [category_id] INT PRIMARY KEY IDENTITY(1, 1),
  [category_name] NVARCHAR(100) NOT NULL,
  [description] NVARCHAR(MAX)
)
GO

-- 3. TẠO BẢNG THUỐC
CREATE TABLE [medicines] (
  [medicine_id] INT PRIMARY KEY IDENTITY(1, 1),
  [category_id] INT NOT NULL,
  [name] NVARCHAR(255) NOT NULL,
  [brand] NVARCHAR(100),
  [unit] NVARCHAR(50) NOT NULL CHECK ([unit] IN ('tablet', 'vial', 'bottle', 'box')),
  [description] NVARCHAR(MAX),
  [created_at] DATETIME DEFAULT GETDATE()
)
GO

-- 4. TẠO BẢNG LÔ HÀNG (Quan trọng để xử lý FIFO)
CREATE TABLE [batches] (
  [batch_id] INT PRIMARY KEY IDENTITY(1, 1),
  [medicine_id] INT NOT NULL,
  [batch_number] VARCHAR(50) NOT NULL,
  [manufacturing_date] DATE,
  [expiry_date] DATE NOT NULL,
  [import_price] DECIMAL(15,2)
)
GO

-- 5. TẠO BẢNG TỒN KHO THEO CHI NHÁNH
CREATE TABLE [inventory] (
  [inventory_id] INT PRIMARY KEY IDENTITY(1, 1),
  [branch_id] INT NOT NULL,
  [batch_id] INT NOT NULL,
  [quantity] INT NOT NULL DEFAULT (0) CHECK ([quantity] >= 0), -- Chống âm kho
  [last_updated] DATETIME DEFAULT GETDATE()
)
GO

-- 6. TẠO BẢNG DƯỢC SĨ (Kết hợp tài khoản Đăng nhập)
CREATE TABLE [pharmacists] (
  [pharmacist_id] INT PRIMARY KEY IDENTITY(1, 1),
  [branch_id] INT NOT NULL,
  [full_name] NVARCHAR(100) NOT NULL,
  [license_number] VARCHAR(50) UNIQUE,
  [username] VARCHAR(50) UNIQUE NOT NULL,
  [password] VARCHAR(255) NOT NULL, -- Lưu plaintext theo yêu cầu debug
  [role] VARCHAR(20) DEFAULT 'STAFF' -- STAFF hoặc ADMIN
)
GO

-- 7. TẠO BẢNG KHÁCH HÀNG
CREATE TABLE [customers] (
  [customer_id] INT PRIMARY KEY IDENTITY(1, 1),
  [full_name] NVARCHAR(100),
  [phone_number] VARCHAR(20) UNIQUE,
  [loyalty_points] INT DEFAULT (0)
)
GO

-- 8. TẠO BẢNG HÓA ĐƠN
CREATE TABLE [invoices] (
  [invoice_id] INT PRIMARY KEY IDENTITY(1, 1),
  [branch_id] INT NOT NULL,
  [pharmacist_id] INT NOT NULL,
  [customer_id] INT,
  [total_amount] DECIMAL(15,2) NOT NULL,
  [sale_date] DATETIME DEFAULT GETDATE()
)
GO

-- 9. TẠO BẢNG CHI TIẾT HÓA ĐƠN (Liên kết trực tiếp với Lô hàng)
CREATE TABLE [invoice_details] (
  [detail_id] INT PRIMARY KEY IDENTITY(1, 1),
  [invoice_id] INT NOT NULL,
  [batch_id] INT NOT NULL,
  [quantity] INT NOT NULL,
  [unit_price] DECIMAL(15,2) NOT NULL
)
GO

-- ==========================================================
-- THIẾT LẬP RÀNG BUỘC KHÓA NGOẠI (FOREIGN KEYS)
-- ==========================================================

ALTER TABLE [medicines] ADD FOREIGN KEY ([category_id]) REFERENCES [categories] ([category_id])
GO
ALTER TABLE [batches] ADD FOREIGN KEY ([medicine_id]) REFERENCES [medicines] ([medicine_id])
GO
ALTER TABLE [inventory] ADD FOREIGN KEY ([branch_id]) REFERENCES [branches] ([branch_id])
GO
ALTER TABLE [inventory] ADD FOREIGN KEY ([batch_id]) REFERENCES [batches] ([batch_id])
GO
ALTER TABLE [pharmacists] ADD FOREIGN KEY ([branch_id]) REFERENCES [branches] ([branch_id])
GO
ALTER TABLE [invoices] ADD FOREIGN KEY ([branch_id]) REFERENCES [branches] ([branch_id])
GO
ALTER TABLE [invoices] ADD FOREIGN KEY ([pharmacist_id]) REFERENCES [pharmacists] ([pharmacist_id])
GO
ALTER TABLE [invoices] ADD FOREIGN KEY ([customer_id]) REFERENCES [customers] ([customer_id])
GO
ALTER TABLE [invoice_details] ADD FOREIGN KEY ([invoice_id]) REFERENCES [invoices] ([invoice_id])
GO
ALTER TABLE [invoice_details] ADD FOREIGN KEY ([batch_id]) REFERENCES [batches] ([batch_id])
GO

-- ==========================================================
-- TẠO INDEX ĐỂ TỐI ƯU HÓA (FIFO & TRUY VẤN)
-- ==========================================================

-- Index cho ngày hết hạn giúp truy vấn FIFO cực nhanh
CREATE INDEX [idx_batches_expiry] ON [batches] ([expiry_date] ASC)
GO

-- Đảm bảo mỗi lô hàng chỉ xuất hiện 1 lần trong 1 chi nhánh
CREATE UNIQUE INDEX [unique_branch_batch] ON [inventory] ([branch_id], [batch_id])
GO

Yêu cầu kỹ thuật chi tiết:

Quy tắc Số điện thoại (Bắt buộc):

Tất cả các trường phone_number phải là chuỗi đúng 10 chữ số, bắt đầu bằng số 0. Hãy dùng faker.helpers.replaceSymbolWithNumber('0#########').

Dữ liệu Logic (Đảm bảo toàn vẹn):

Bảng Categories & Medicines: Tạo 10 danh mục. Tạo 500 loại thuốc, cột unit chỉ được chọn ngẫu nhiên từ: tablet, vial, bottle, box.

Bảng Batches & Inventory: Tạo 2,000 lô hàng (expiry_date từ 2024 - 2027). Mỗi lô hàng phải được tạo tồn kho (inventory) cho 5 chi nhánh khác nhau.

FIFO Test: Đảm bảo mỗi medicine_id có nhiều batch_id với ngày hết hạn khác nhau để test logic bán hàng.

Invoices & Details: Tạo 7,000 hóa đơn. Mỗi hóa đơn có từ 1-5 sản phẩm, liên kết đúng batch_id và invoice_id.

Xử lý dữ liệu rác (5% tổng số):

Xen kẽ các dòng lỗi để test module Import: phone_number sai độ dài, tên thuốc bị rỗng, số lượng âm, hoặc đơn vị (unit) không hợp lệ.

Đầu ra (Output):

Sử dụng module fs để xuất ra các file CSV riêng lẻ: branches.csv, medicines.csv, batches.csv, inventory.csv, pharmacists.csv, customers.csv, invoices.csv, invoice_details.csv. Hãy sử dụng thư viện csv-writer hoặc tự viết file thủ công."
</user_message>
<environment_details>
# VSCode Visible Files
generate_data.py

# VSCode Open Tabs
generate_data.py

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:52:49.875Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>


# Current Workspace Directory (d:/Môn học/LAB/Data/d1) Files
generate_data.py
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: write_to_file]
Path: generate_data.js
Content: const { faker } = require('@faker-js/faker');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Constants
const NUM_BRANCHES = 5;
const NUM_CATEGORIES = 10;
const NUM_MEDICINES = 500;
const NUM_BATCHES = 2000; // 4 per medicine
const NUM_PHARMACISTS = 50; // 10 per branch
const NUM_CUSTOMERS = 1000;
const NUM_INVOICES = 7000;

// Units
const UNITS = ['tablet', 'vial', 'bottle', 'box'];

// Generate branches
function generateBranches() {
  const branches = [];
  for (let i = 0; i < NUM_BRANCHES; i++) {
    branches.push({
      branch_id: i + 1,
      branch_name: faker.company.name() + ' Pharmacy',
      address: faker.address.streetAddress(),
      phone_number: faker.helpers.replaceSymbolWithNumber('0#########')
    });
  }
  return branches;
}

// Generate categories
function generateCategories() {
  const categories = [];
  for (let i = 0; i < NUM_CATEGORIES; i++) {
    categories.push({
      category_id: i + 1,
      category_name: faker.commerce.department(),
      description: faker.lorem.sentence()
    });
  }
  return categories;
}

// Generate medicines
function generateMedicines() {
  const medicines = [];
  for (let i = 0; i < NUM_MEDICINES; i++) {
    const isBad = Math.random() < 0.05; // 5% bad data
    const unit = isBad && Math.random() < 0.5 ? faker.random.word() : faker.helpers.arrayElement(UNITS);
    const name = isBad && Math.random() < 0.5 ? '' : faker.commerce.productName();
    medicines.push({
      medicine_id: i + 1,
      category_id: faker.datatype.number({ min: 1, max: NUM_CATEGORIES }),
      name: name,
      brand: faker.company.name(),
      unit: unit,
      description: faker.lorem.sentence(),
      created_at: faker.date.past().toISOString().slice(0, 19).replace('T', ' ')
    });
  }
  return medicines;
}

// Generate batches
function generateBatches() {
  const batches = [];
  let batchId = 1;
  for (let medId = 1; medId <= NUM_MEDICINES; medId++) {
    for (let b = 0; b < 4; b++) { // 4 batches per medicine
      const expiryYear = faker.datatype.number({ min: 2024, max: 2027 });
      const manufacturingDate = faker.date.between('2020-01-01', '2023-12-31');
      const expiryDate = faker.date.between(`${expiryYear}-01-01`, `${expiryYear}-12-31`);
      batches.push({
        batch_id: batchId++,
        medicine_id: medId,
        batch_number: faker.random.alphaNumeric(10).toUpperCase(),
        manufacturing_date: manufacturingDate.toISOString().split('T')[0],
        expiry_date: expiryDate.toISOString().split('T')[0],
        import_price: faker.datatype.float({ min: 1, max: 100, precision: 0.01 })
      });
    }
  }
  return batches;
}

// Generate inventory
function generateInventory(batches) {
  const inventory = [];
  let invId = 1;
  batches.forEach(batch => {
    for (let branchId = 1; branchId <= NUM_BRANCHES; branchId++) {
      const isBad = Math.random() < 0.05;
      const quantity = isBad && Math.random() < 0.5 ? faker.datatype.number({ min: -100, max: -1 }) : faker.datatype.number({ min: 0, max: 1000 });
      inventory.push({
        inventory_id: invId++,
        branch_id: branchId,
        batch_id: batch.batch_id,
        quantity: quantity,
        last_updated: faker.date.recent().toISOString().slice(0, 19).replace('T', ' ')
      });
    }
  });
  return inventory;
}

// Generate pharmacists
function generatePharmacists() {
  const pharmacists = [];
  for (let i = 0; i < NUM_PHARMACISTS; i++) {
    const branchId = ((i % NUM_BRANCHES) + 1);
    pharmacists.push({
      pharmacist_id: i + 1,
      branch_id: branchId,
      full_name: faker.name.fullName(),
      license_number: faker.random.alphaNumeric(10),
      username: faker.internet.userName(),
      password: faker.internet.password(),
      role: faker.helpers.arrayElement(['STAFF', 'ADMIN'])
    });
  }
  return pharmacists;
}

// Generate customers
function generateCustomers() {
  const customers = [];
  for (let i = 0; i < NUM_CUSTOMERS; i++) {
    const isBad = Math.random() < 0.05;
    const phone = isBad && Math.random() < 0.5 ? faker.phone.number() : faker.helpers.replaceSymbolWithNumber('0#########');
    customers.push({
      customer_id: i + 1,
      full_name: faker.name.fullName(),
      phone_number: phone,
      loyalty_points: faker.datatype.number({ min: 0, max: 1000 })
    });
  }
  return customers;
}

// Generate invoices and details
function generateInvoicesAndDetails(batches, pharmacists, customers) {
  const invoices = [];
  const invoiceDetails = [];
  let invId = 1;
  let detId = 1;
  for (let i = 0; i < NUM_INVOICES; i++) {
    const branchId = faker.datatype.number({ min: 1, max: NUM_BRANCHES });
    const pharmacist = pharmacists.find(p => p.branch_id === branchId);
    const customerId = faker.datatype.number({ min: 1, max: NUM_CUSTOMERS });
    const saleDate = faker.date.recent(365).toISOString().slice(0, 19).replace('T', ' ');
    invoices.push({
      invoice_id: invId,
      branch_id: branchId,
      pharmacist_id: pharmacist.pharmacist_id,
      customer_id: customerId,
      total_amount: 0, // will calculate
      sale_date: saleDate
    });

    let total = 0;
    const numDetails = faker.datatype.number({ min: 1, max: 5 });
    for (let d = 0; d < numDetails; d++) {
      const batch = faker.helpers.arrayElement(batches);
      const quantity = faker.datatype.number({ min: 1, max: 10 });
      const unitPrice = batch.import_price * faker.datatype.float({ min: 1.1, max: 2.0, precision: 0.01 }); // markup
      total += quantity * unitPrice;
      invoiceDetails.push({
        detail_id: detId++,
        invoice_id: invId,
        batch_id: batch.batch_id,
        quantity: quantity,
        unit_price: unitPrice
      });
    }
    invoices[i].total_amount = total.toFixed(2);
    invId++;
  }
  return { invoices, invoiceDetails };
}

// Write to CSV
function writeToCSV(filename, records, headers) {
  const csvWriter = createCsvWriter({
    path: filename,
    header: headers
  });
  csvWriter.writeRecords(records).then(() => console.log(`${filename} written`));
}

// Main
async function main() {
  const branches = generateBranches();
  const categories = generateCategories();
  const medicines = generateMedicines();
  const batches = generateBatches();
  const inventory = generateInventory(batches);
  const pharmacists = generatePharmacists();
  const customers = generateCustomers();
  const { invoices, invoiceDetails } = generateInvoicesAndDetails(batches, pharmacists, customers);

  // Write CSVs
  writeToCSV('branches.csv', branches, [
    { id: 'branch_id', title: 'branch_id' },
    { id: 'branch_name', title: 'branch_name' },
    { id: 'address', title: 'address' },
    { id: 'phone_number', title: 'phone_number' }
  ]);

  writeToCSV('categories.csv', categories, [
    { id: 'category_id', title: 'category_id' },
    { id: 'category_name', title: 'category_name' },
    { id: 'description', title: 'description' }
  ]);

  writeToCSV('medicines.csv', medicines, [
    { id: 'medicine_id', title: 'medicine_id' },
    { id: 'category_id', title: 'category_id' },
    { id: 'name', title: 'name' },
    { id: 'brand', title: 'brand' },
    { id: 'unit', title: 'unit' },
    { id: 'description', title: 'description' },
    { id: 'created_at', title: 'created_at' }
  ]);

  writeToCSV('batches.csv', batches, [
    { id: 'batch_id', title: 'batch_id' },
    { id: 'medicine_id', title: 'medicine_id' },
    { id: 'batch_number', title: 'batch_number' },
    { id: 'manufacturing_date', title: 'manufacturing_date' },
    { id: 'expiry_date', title: 'expiry_date' },
    { id: 'import_price', title: 'import_price' }
  ]);

  writeToCSV('inventory.csv', inventory, [
    { id: 'inventory_id', title: 'inventory_id' },
    { id: 'branch_id', title: 'branch_id' },
    { id: 'batch_id', title: 'batch_id' },
    { id: 'quantity', title: 'quantity' },
    { id: 'last_updated', title: 'last_updated' }
  ]);

  writeToCSV('pharmacists.csv', pharmacists, [
    { id: 'pharmacist_id', title: 'pharmacist_id' },
    { id: 'branch_id', title: 'branch_id' },
    { id: 'full_name', title: 'full_name' },
    { id: 'license_number', title: 'license_number' },
    { id: 'username', title: 'username' },
    { id: 'password', title: 'password' },
    { id: 'role', title: 'role' }
  ]);

  writeToCSV('customers.csv', customers, [
    { id: 'customer_id', title: 'customer_id' },
    { id: 'full_name', title: 'full_name' },
    { id: 'phone_number', title: 'phone_number' },
    { id: 'loyalty_points', title: 'loyalty_points' }
  ]);

  writeToCSV('invoices.csv', invoices, [
    { id: 'invoice_id', title: 'invoice_id' },
    { id: 'branch_id', title: 'branch_id' },
    { id: 'pharmacist_id', title: 'pharmacist_id' },
    { id: 'customer_id', title: 'customer_id' },
    { id: 'total_amount', title: 'total_amount' },
    { id: 'sale_date', title: 'sale_date' }
  ]);

  writeToCSV('invoice_details.csv', invoiceDetails, [
    { id: 'detail_id', title: 'detail_id' },
    { id: 'invoice_id', title: 'invoice_id' },
    { id: 'batch_id', title: 'batch_id' },
    { id: 'quantity', title: 'quantity' },
    { id: 'unit_price', title: 'unit_price' }
  ]);

  console.log('All CSVs generated');
}

main();

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"created","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:53:35.639Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: execute_command]
Command: npm init -y
Cwd: null

---

**User:**

[Tool]
Working directory 'd:\Môn học\LAB\Data\d1\null' does not exist.
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:53:41.266Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: execute_command]
Command: npm init -y
Cwd: .

---

**User:**

[Tool]
Command executed in terminal  within working directory 'd:/Môn học/LAB/Data/d1'. Exit code: 0
Output:
Wrote to d:\Môn học\LAB\Data\d1\package.json:

{
  "name": "d1",
  "version": "1.0.0",
  "description": "",
  "main": "generate_data.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs"
}




<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:53:47.389Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: execute_command]
Command: npm install @faker-js/faker csv-writer
Cwd: .

---

**User:**

[Tool]
Command executed in terminal  within working directory 'd:/Môn học/LAB/Data/d1'. Exit code: 0
Output:

added 2 packages, and audited 3 packages in 3s

1 package is looking for funding
  run `npm fund` for details

found 0 vulnerabilities

<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:54:04.954Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: execute_command]
Command: node generate_data.js
Cwd: .

---

**User:**

[Tool]
Command executed in terminal  within working directory 'd:/Môn học/LAB/Data/d1'. Command execution was not successful, inspect the cause and adjust as needed.
Exit code: 1
Output:
d:\Môn học\LAB\Data\d1\generate_data.js:23
      address: faker.address.streetAddress(),
                             ^

TypeError: Cannot read properties of undefined (reading 'streetAddress')
    at generateBranches (d:\Môn học\LAB\Data\d1\generate_data.js:23:30)
    at main (d:\Môn học\LAB\Data\d1\generate_data.js:191:20)
    at Object.<anonymous> (d:\Môn học\LAB\Data\d1\generate_data.js:278:1)
    at Module._compile (node:internal/modules/cjs/loader:1761:14)
    at Object..js (node:internal/modules/cjs/loader:1893:10)
    at Module.load (node:internal/modules/cjs/loader:1481:32)
    at Module._load (node:internal/modules/cjs/loader:1300:12)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:245:24)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)

Node.js v24.12.0

<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:54:14.139Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: read_file]
Files: [
  {
    "path": "generate_data.js"
  }
]

---

**User:**

[Tool]
File: generate_data.js
Lines 1-278:
  1 | const { faker } = require('@faker-js/faker');
  2 | const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  3 | 
  4 | // Constants
  5 | const NUM_BRANCHES = 5;
  6 | const NUM_CATEGORIES = 10;
  7 | const NUM_MEDICINES = 500;
  8 | const NUM_BATCHES = 2000; // 4 per medicine
  9 | const NUM_PHARMACISTS = 50; // 10 per branch
 10 | const NUM_CUSTOMERS = 1000;
 11 | const NUM_INVOICES = 7000;
 12 | 
 13 | // Units
 14 | const UNITS = ['tablet', 'vial', 'bottle', 'box'];
 15 | 
 16 | // Generate branches
 17 | function generateBranches() {
 18 |   const branches = [];
 19 |   for (let i = 0; i < NUM_BRANCHES; i++) {
 20 |     branches.push({
 21 |       branch_id: i + 1,
 22 |       branch_name: faker.company.name() + ' Pharmacy',
 23 |       address: faker.address.streetAddress(),
 24 |       phone_number: faker.helpers.replaceSymbolWithNumber('0#########')
 25 |     });
 26 |   }
 27 |   return branches;
 28 | }
 29 | 
 30 | // Generate categories
 31 | function generateCategories() {
 32 |   const categories = [];
 33 |   for (let i = 0; i < NUM_CATEGORIES; i++) {
 34 |     categories.push({
 35 |       category_id: i + 1,
 36 |       category_name: faker.commerce.department(),
 37 |       description: faker.lorem.sentence()
 38 |     });
 39 |   }
 40 |   return categories;
 41 | }
 42 | 
 43 | // Generate medicines
 44 | function generateMedicines() {
 45 |   const medicines = [];
 46 |   for (let i = 0; i < NUM_MEDICINES; i++) {
 47 |     const isBad = Math.random() < 0.05; // 5% bad data
 48 |     const unit = isBad && Math.random() < 0.5 ? faker.random.word() : faker.helpers.arrayElement(UNITS);
 49 |     const name = isBad && Math.random() < 0.5 ? '' : faker.commerce.productName();
 50 |     medicines.push({
 51 |       medicine_id: i + 1,
 52 |       category_id: faker.datatype.number({ min: 1, max: NUM_CATEGORIES }),
 53 |       name: name,
 54 |       brand: faker.company.name(),
 55 |       unit: unit,
 56 |       description: faker.lorem.sentence(),
 57 |       created_at: faker.date.past().toISOString().slice(0, 19).replace('T', ' ')
 58 |     });
 59 |   }
 60 |   return medicines;
 61 | }
 62 | 
 63 | // Generate batches
 64 | function generateBatches() {
 65 |   const batches = [];
 66 |   let batchId = 1;
 67 |   for (let medId = 1; medId <= NUM_MEDICINES; medId++) {
 68 |     for (let b = 0; b < 4; b++) { // 4 batches per medicine
 69 |       const expiryYear = faker.datatype.number({ min: 2024, max: 2027 });
 70 |       const manufacturingDate = faker.date.between('2020-01-01', '2023-12-31');
 71 |       const expiryDate = faker.date.between(`${expiryYear}-01-01`, `${expiryYear}-12-31`);
 72 |       batches.push({
 73 |         batch_id: batchId++,
 74 |         medicine_id: medId,
 75 |         batch_number: faker.random.alphaNumeric(10).toUpperCase(),
 76 |         manufacturing_date: manufacturingDate.toISOString().split('T')[0],
 77 |         expiry_date: expiryDate.toISOString().split('T')[0],
 78 |         import_price: faker.datatype.float({ min: 1, max: 100, precision: 0.01 })
 79 |       });
 80 |     }
 81 |   }
 82 |   return batches;
 83 | }
 84 | 
 85 | // Generate inventory
 86 | function generateInventory(batches) {
 87 |   const inventory = [];
 88 |   let invId = 1;
 89 |   batches.forEach(batch => {
 90 |     for (let branchId = 1; branchId <= NUM_BRANCHES; branchId++) {
 91 |       const isBad = Math.random() < 0.05;
 92 |       const quantity = isBad && Math.random() < 0.5 ? faker.datatype.number({ min: -100, max: -1 }) : faker.datatype.number({ min: 0, max: 1000 });
 93 |       inventory.push({
 94 |         inventory_id: invId++,
 95 |         branch_id: branchId,
 96 |         batch_id: batch.batch_id,
 97 |         quantity: quantity,
 98 |         last_updated: faker.date.recent().toISOString().slice(0, 19).replace('T', ' ')
 99 |       });
100 |     }
101 |   });
102 |   return inventory;
103 | }
104 | 
105 | // Generate pharmacists
106 | function generatePharmacists() {
107 |   const pharmacists = [];
108 |   for (let i = 0; i < NUM_PHARMACISTS; i++) {
109 |     const branchId = ((i % NUM_BRANCHES) + 1);
110 |     pharmacists.push({
111 |       pharmacist_id: i + 1,
112 |       branch_id: branchId,
113 |       full_name: faker.name.fullName(),
114 |       license_number: faker.random.alphaNumeric(10),
115 |       username: faker.internet.userName(),
116 |       password: faker.internet.password(),
117 |       role: faker.helpers.arrayElement(['STAFF', 'ADMIN'])
118 |     });
119 |   }
120 |   return pharmacists;
121 | }
122 | 
123 | // Generate customers
124 | function generateCustomers() {
125 |   const customers = [];
126 |   for (let i = 0; i < NUM_CUSTOMERS; i++) {
127 |     const isBad = Math.random() < 0.05;
128 |     const phone = isBad && Math.random() < 0.5 ? faker.phone.number() : faker.helpers.replaceSymbolWithNumber('0#########');
129 |     customers.push({
130 |       customer_id: i + 1,
131 |       full_name: faker.name.fullName(),
132 |       phone_number: phone,
133 |       loyalty_points: faker.datatype.number({ min: 0, max: 1000 })
134 |     });
135 |   }
136 |   return customers;
137 | }
138 | 
139 | // Generate invoices and details
140 | function generateInvoicesAndDetails(batches, pharmacists, customers) {
141 |   const invoices = [];
142 |   const invoiceDetails = [];
143 |   let invId = 1;
144 |   let detId = 1;
145 |   for (let i = 0; i < NUM_INVOICES; i++) {
146 |     const branchId = faker.datatype.number({ min: 1, max: NUM_BRANCHES });
147 |     const pharmacist = pharmacists.find(p => p.branch_id === branchId);
148 |     const customerId = faker.datatype.number({ min: 1, max: NUM_CUSTOMERS });
149 |     const saleDate = faker.date.recent(365).toISOString().slice(0, 19).replace('T', ' ');
150 |     invoices.push({
151 |       invoice_id: invId,
152 |       branch_id: branchId,
153 |       pharmacist_id: pharmacist.pharmacist_id,
154 |       customer_id: customerId,
155 |       total_amount: 0, // will calculate
156 |       sale_date: saleDate
157 |     });
158 | 
159 |     let total = 0;
160 |     const numDetails = faker.datatype.number({ min: 1, max: 5 });
161 |     for (let d = 0; d < numDetails; d++) {
162 |       const batch = faker.helpers.arrayElement(batches);
163 |       const quantity = faker.datatype.number({ min: 1, max: 10 });
164 |       const unitPrice = batch.import_price * faker.datatype.float({ min: 1.1, max: 2.0, precision: 0.01 }); // markup
165 |       total += quantity * unitPrice;
166 |       invoiceDetails.push({
167 |         detail_id: detId++,
168 |         invoice_id: invId,
169 |         batch_id: batch.batch_id,
170 |         quantity: quantity,
171 |         unit_price: unitPrice
172 |       });
173 |     }
174 |     invoices[i].total_amount = total.toFixed(2);
175 |     invId++;
176 |   }
177 |   return { invoices, invoiceDetails };
178 | }
179 | 
180 | // Write to CSV
181 | function writeToCSV(filename, records, headers) {
182 |   const csvWriter = createCsvWriter({
183 |     path: filename,
184 |     header: headers
185 |   });
186 |   csvWriter.writeRecords(records).then(() => console.log(`${filename} written`));
187 | }
188 | 
189 | // Main
190 | async function main() {
191 |   const branches = generateBranches();
192 |   const categories = generateCategories();
193 |   const medicines = generateMedicines();
194 |   const batches = generateBatches();
195 |   const inventory = generateInventory(batches);
196 |   const pharmacists = generatePharmacists();
197 |   const customers = generateCustomers();
198 |   const { invoices, invoiceDetails } = generateInvoicesAndDetails(batches, pharmacists, customers);
199 | 
200 |   // Write CSVs
201 |   writeToCSV('branches.csv', branches, [
202 |     { id: 'branch_id', title: 'branch_id' },
203 |     { id: 'branch_name', title: 'branch_name' },
204 |     { id: 'address', title: 'address' },
205 |     { id: 'phone_number', title: 'phone_number' }
206 |   ]);
207 | 
208 |   writeToCSV('categories.csv', categories, [
209 |     { id: 'category_id', title: 'category_id' },
210 |     { id: 'category_name', title: 'category_name' },
211 |     { id: 'description', title: 'description' }
212 |   ]);
213 | 
214 |   writeToCSV('medicines.csv', medicines, [
215 |     { id: 'medicine_id', title: 'medicine_id' },
216 |     { id: 'category_id', title: 'category_id' },
217 |     { id: 'name', title: 'name' },
218 |     { id: 'brand', title: 'brand' },
219 |     { id: 'unit', title: 'unit' },
220 |     { id: 'description', title: 'description' },
221 |     { id: 'created_at', title: 'created_at' }
222 |   ]);
223 | 
224 |   writeToCSV('batches.csv', batches, [
225 |     { id: 'batch_id', title: 'batch_id' },
226 |     { id: 'medicine_id', title: 'medicine_id' },
227 |     { id: 'batch_number', title: 'batch_number' },
228 |     { id: 'manufacturing_date', title: 'manufacturing_date' },
229 |     { id: 'expiry_date', title: 'expiry_date' },
230 |     { id: 'import_price', title: 'import_price' }
231 |   ]);
232 | 
233 |   writeToCSV('inventory.csv', inventory, [
234 |     { id: 'inventory_id', title: 'inventory_id' },
235 |     { id: 'branch_id', title: 'branch_id' },
236 |     { id: 'batch_id', title: 'batch_id' },
237 |     { id: 'quantity', title: 'quantity' },
238 |     { id: 'last_updated', title: 'last_updated' }
239 |   ]);
240 | 
241 |   writeToCSV('pharmacists.csv', pharmacists, [
242 |     { id: 'pharmacist_id', title: 'pharmacist_id' },
243 |     { id: 'branch_id', title: 'branch_id' },
244 |     { id: 'full_name', title: 'full_name' },
245 |     { id: 'license_number', title: 'license_number' },
246 |     { id: 'username', title: 'username' },
247 |     { id: 'password', title: 'password' },
248 |     { id: 'role', title: 'role' }
249 |   ]);
250 | 
251 |   writeToCSV('customers.csv', customers, [
252 |     { id: 'customer_id', title: 'customer_id' },
253 |     { id: 'full_name', title: 'full_name' },
254 |     { id: 'phone_number', title: 'phone_number' },
255 |     { id: 'loyalty_points', title: 'loyalty_points' }
256 |   ]);
257 | 
258 |   writeToCSV('invoices.csv', invoices, [
259 |     { id: 'invoice_id', title: 'invoice_id' },
260 |     { id: 'branch_id', title: 'branch_id' },
261 |     { id: 'pharmacist_id', title: 'pharmacist_id' },
262 |     { id: 'customer_id', title: 'customer_id' },
263 |     { id: 'total_amount', title: 'total_amount' },
264 |     { id: 'sale_date', title: 'sale_date' }
265 |   ]);
266 | 
267 |   writeToCSV('invoice_details.csv', invoiceDetails, [
268 |     { id: 'detail_id', title: 'detail_id' },
269 |     { id: 'invoice_id', title: 'invoice_id' },
270 |     { id: 'batch_id', title: 'batch_id' },
271 |     { id: 'quantity', title: 'quantity' },
272 |     { id: 'unit_price', title: 'unit_price' }
273 |   ]);
274 | 
275 |   console.log('All CSVs generated');
276 | }
277 | 
278 | main();

<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:54:20.587Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string: // Generate branches
function generateBranches() {
  const branches = [];
  for (let i = 0; i < NUM_BRANCHES; i++) {
    branches.push({
      branch_id: i + 1,
      branch_name: faker.company.name() + ' Pharmacy',
      address: faker.address.streetAddress(),
      phone_number: faker.helpers.replaceSymbolWithNumber('0#########')
    });
  }
  return branches;
}
New_string: // Generate branches
function generateBranches() {
  const branches = [];
  for (let i = 0; i < NUM_BRANCHES; i++) {
    branches.push({
      branch_id: i + 1,
      branch_name: faker.company.name() + ' Pharmacy',
      address: faker.location.streetAddress(),
      phone_number: faker.helpers.replaceSymbolWithNumber('0#########')
    });
  }
  return branches;
}

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:54:36.288Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string: // Generate medicines
function generateMedicines() {
  const medicines = [];
  for (let i = 0; i < NUM_MEDICINES; i++) {
    const isBad = Math.random() < 0.05; // 5% bad data
    const unit = isBad && Math.random() < 0.5 ? faker.random.word() : faker.helpers.arrayElement(UNITS);
    const name = isBad && Math.random() < 0.5 ? '' : faker.commerce.productName();
    medicines.push({
      medicine_id: i + 1,
      category_id: faker.datatype.number({ min: 1, max: NUM_CATEGORIES }),
      name: name,
      brand: faker.company.name(),
      unit: unit,
      description: faker.lorem.sentence(),
      created_at: faker.date.past().toISOString().slice(0, 19).replace('T', ' ')
    });
  }
  return medicines;
}
New_string: // Generate medicines
function generateMedicines() {
  const medicines = [];
  for (let i = 0; i < NUM_MEDICINES; i++) {
    const isBad = Math.random() < 0.05; // 5% bad data
    const unit = isBad && Math.random() < 0.5 ? faker.lorem.word() : faker.helpers.arrayElement(UNITS);
    const name = isBad && Math.random() < 0.5 ? '' : faker.commerce.productName();
    medicines.push({
      medicine_id: i + 1,
      category_id: faker.datatype.number({ min: 1, max: NUM_CATEGORIES }),
      name: name,
      brand: faker.company.name(),
      unit: unit,
      description: faker.lorem.sentence(),
      created_at: faker.date.past().toISOString().slice(0, 19).replace('T', ' ')
    });
  }
  return medicines;
}

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:54:45.228Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string: // Generate batches
function generateBatches() {
  const batches = [];
  let batchId = 1;
  for (let medId = 1; medId <= NUM_MEDICINES; medId++) {
    for (let b = 0; b < 4; b++) { // 4 batches per medicine
      const expiryYear = faker.datatype.number({ min: 2024, max: 2027 });
      const manufacturingDate = faker.date.between('2020-01-01', '2023-12-31');
      const expiryDate = faker.date.between(`${expiryYear}-01-01`, `${expiryYear}-12-31`);
      batches.push({
        batch_id: batchId++,
        medicine_id: medId,
        batch_number: faker.random.alphaNumeric(10).toUpperCase(),
        manufacturing_date: manufacturingDate.toISOString().split('T')[0],
        expiry_date: expiryDate.toISOString().split('T')[0],
        import_price: faker.datatype.float({ min: 1, max: 100, precision: 0.01 })
      });
    }
  }
  return batches;
}
New_string: // Generate batches
function generateBatches() {
  const batches = [];
  let batchId = 1;
  for (let medId = 1; medId <= NUM_MEDICINES; medId++) {
    for (let b = 0; b < 4; b++) { // 4 batches per medicine
      const expiryYear = faker.datatype.number({ min: 2024, max: 2027 });
      const manufacturingDate = faker.date.between('2020-01-01', '2023-12-31');
      const expiryDate = faker.date.between(`${expiryYear}-01-01`, `${expiryYear}-12-31`);
      batches.push({
        batch_id: batchId++,
        medicine_id: medId,
        batch_number: faker.string.alphanumeric(10).toUpperCase(),
        manufacturing_date: manufacturingDate.toISOString().split('T')[0],
        expiry_date: expiryDate.toISOString().split('T')[0],
        import_price: faker.datatype.float({ min: 1, max: 100, precision: 0.01 })
      });
    }
  }
  return batches;
}

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:54:52.543Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string: // Generate pharmacists
function generatePharmacists() {
  const pharmacists = [];
  for (let i = 0; i < NUM_PHARMACISTS; i++) {
    const branchId = ((i % NUM_BRANCHES) + 1);
    pharmacists.push({
      pharmacist_id: i + 1,
      branch_id: branchId,
      full_name: faker.name.fullName(),
      license_number: faker.random.alphaNumeric(10),
      username: faker.internet.userName(),
      password: faker.internet.password(),
      role: faker.helpers.arrayElement(['STAFF', 'ADMIN'])
    });
  }
  return pharmacists;
}
New_string: // Generate pharmacists
function generatePharmacists() {
  const pharmacists = [];
  for (let i = 0; i < NUM_PHARMACISTS; i++) {
    const branchId = ((i % NUM_BRANCHES) + 1);
    pharmacists.push({
      pharmacist_id: i + 1,
      branch_id: branchId,
      full_name: faker.person.fullName(),
      license_number: faker.string.alphanumeric(10),
      username: faker.internet.userName(),
      password: faker.internet.password(),
      role: faker.helpers.arrayElement(['STAFF', 'ADMIN'])
    });
  }
  return pharmacists;
}

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:54:59.646Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string: // Generate customers
function generateCustomers() {
  const customers = [];
  for (let i = 0; i < NUM_CUSTOMERS; i++) {
    const isBad = Math.random() < 0.05;
    const phone = isBad && Math.random() < 0.5 ? faker.phone.number() : faker.helpers.replaceSymbolWithNumber('0#########');
    customers.push({
      customer_id: i + 1,
      full_name: faker.name.fullName(),
      phone_number: phone,
      loyalty_points: faker.datatype.number({ min: 0, max: 1000 })
    });
  }
  return customers;
}
New_string: // Generate customers
function generateCustomers() {
  const customers = [];
  for (let i = 0; i < NUM_CUSTOMERS; i++) {
    const isBad = Math.random() < 0.05;
    const phone = isBad && Math.random() < 0.5 ? faker.phone.number() : faker.helpers.replaceSymbolWithNumber('0#########');
    customers.push({
      customer_id: i + 1,
      full_name: faker.person.fullName(),
      phone_number: phone,
      loyalty_points: faker.datatype.number({ min: 0, max: 1000 })
    });
  }
  return customers;
}

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:55:16.747Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: execute_command]
Command: node generate_data.js
Cwd: .

---

**User:**

[Tool]
Command executed in terminal  within working directory 'd:/Môn học/LAB/Data/d1'. Command execution was not successful, inspect the cause and adjust as needed.
Exit code: 1
Output:
d:\Môn học\LAB\Data\d1\generate_data.js:24
      phone_number: faker.helpers.replaceSymbolWithNumber('0#########')
                                  ^

TypeError: faker.helpers.replaceSymbolWithNumber is not a function
    at generateBranches (d:\Môn học\LAB\Data\d1\generate_data.js:24:35)
    at main (d:\Môn học\LAB\Data\d1\generate_data.js:191:20)
    at Object.<anonymous> (d:\Môn học\LAB\Data\d1\generate_data.js:278:1)
    at Module._compile (node:internal/modules/cjs/loader:1761:14)
    at Object..js (node:internal/modules/cjs/loader:1893:10)
    at Module.load (node:internal/modules/cjs/loader:1481:32)
    at Module._load (node:internal/modules/cjs/loader:1300:12)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:245:24)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)

Node.js v24.12.0

<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:55:23.026Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string: // Generate branches
function generateBranches() {
  const branches = [];
  for (let i = 0; i < NUM_BRANCHES; i++) {
    branches.push({
      branch_id: i + 1,
      branch_name: faker.company.name() + ' Pharmacy',
      address: faker.location.streetAddress(),
      phone_number: faker.helpers.replaceSymbolWithNumber('0#########')
    });
  }
  return branches;
}
New_string: // Generate branches
function generateBranches() {
  const branches = [];
  for (let i = 0; i < NUM_BRANCHES; i++) {
    branches.push({
      branch_id: i + 1,
      branch_name: faker.company.name() + ' Pharmacy',
      address: faker.location.streetAddress(),
      phone_number: '0' + faker.string.numeric(9)
    });
  }
  return branches;
}

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:55:30.074Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string: // Generate customers
function generateCustomers() {
  const customers = [];
  for (let i = 0; i < NUM_CUSTOMERS; i++) {
    const isBad = Math.random() < 0.05;
    const phone = isBad && Math.random() < 0.5 ? faker.phone.number() : faker.helpers.replaceSymbolWithNumber('0#########');
    customers.push({
      customer_id: i + 1,
      full_name: faker.person.fullName(),
      phone_number: phone,
      loyalty_points: faker.datatype.number({ min: 0, max: 1000 })
    });
  }
  return customers;
}
New_string: // Generate customers
function generateCustomers() {
  const customers = [];
  for (let i = 0; i < NUM_CUSTOMERS; i++) {
    const isBad = Math.random() < 0.05;
    const phone = isBad && Math.random() < 0.5 ? faker.phone.number() : '0' + faker.string.numeric(9);
    customers.push({
      customer_id: i + 1,
      full_name: faker.person.fullName(),
      phone_number: phone,
      loyalty_points: faker.datatype.number({ min: 0, max: 1000 })
    });
  }
  return customers;
}

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:55:36.489Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: execute_command]
Command: node generate_data.js
Cwd: .

---

**User:**

[Tool]
Command executed in terminal  within working directory 'd:/Môn học/LAB/Data/d1'. Command execution was not successful, inspect the cause and adjust as needed.
Exit code: 1
Output:
d:\Môn học\LAB\Data\d1\generate_data.js:52
      category_id: faker.datatype.number({ min: 1, max: NUM_CATEGORIES }),
                                  ^

TypeError: faker.datatype.number is not a function
    at generateMedicines (d:\Môn học\LAB\Data\d1\generate_data.js:52:35)
    at main (d:\Môn học\LAB\Data\d1\generate_data.js:193:21)
    at Object.<anonymous> (d:\Môn học\LAB\Data\d1\generate_data.js:278:1)
    at Module._compile (node:internal/modules/cjs/loader:1761:14)
    at Object..js (node:internal/modules/cjs/loader:1893:10)
    at Module.load (node:internal/modules/cjs/loader:1481:32)
    at Module._load (node:internal/modules/cjs/loader:1300:12)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:245:24)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)

Node.js v24.12.0

<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:55:42.243Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_files]
Path: .
Regex: faker\.datatype
File_pattern: *.js

---

**User:**

[Tool]
Found 9 results.

# generate_data.js
 51 |       medicine_id: i + 1,
 52 |       category_id: faker.datatype.number({ min: 1, max: NUM_CATEGORIES }),
 53 |       name: name,
----
 68 |     for (let b = 0; b < 4; b++) { // 4 batches per medicine
 69 |       const expiryYear = faker.datatype.number({ min: 2024, max: 2027 });
 70 |       const manufacturingDate = faker.date.between('2020-01-01', '2023-12-31');
----
 77 |         expiry_date: expiryDate.toISOString().split('T')[0],
 78 |         import_price: faker.datatype.float({ min: 1, max: 100, precision: 0.01 })
 79 |       });
----
 91 |       const isBad = Math.random() < 0.05;
 92 |       const quantity = isBad && Math.random() < 0.5 ? faker.datatype.number({ min: -100, max: -1 }) : faker.datatype.number({ min: 0, max: 1000 });
 93 |       inventory.push({
----
132 |       phone_number: phone,
133 |       loyalty_points: faker.datatype.number({ min: 0, max: 1000 })
134 |     });
----
145 |   for (let i = 0; i < NUM_INVOICES; i++) {
146 |     const branchId = faker.datatype.number({ min: 1, max: NUM_BRANCHES });
147 |     const pharmacist = pharmacists.find(p => p.branch_id === branchId);
148 |     const customerId = faker.datatype.number({ min: 1, max: NUM_CUSTOMERS });
149 |     const saleDate = faker.date.recent(365).toISOString().slice(0, 19).replace('T', ' ');
----
159 |     let total = 0;
160 |     const numDetails = faker.datatype.number({ min: 1, max: 5 });
161 |     for (let d = 0; d < numDetails; d++) {
162 |       const batch = faker.helpers.arrayElement(batches);
163 |       const quantity = faker.datatype.number({ min: 1, max: 10 });
164 |       const unitPrice = batch.import_price * faker.datatype.float({ min: 1.1, max: 2.0, precision: 0.01 }); // markup
165 |       total += quantity * unitPrice;
----

# node_modules/@faker-js/faker/dist/chunk-C2PDNA75.js
  1 | var l=class extends Error{};function Me(i){let e=Object.getPrototypeOf(i);do{for(let r of Object.getOwnPropertyNames(e))typeof i[r]=="function"&&r!=="constructor"&&(i[r]=i[r].bind(i));e=Object.getPrototypeOf(e)}while(e!==Object.prototype)}var x=class{constructor(e){this.faker=e;Me(this)}},p=class extends x{constructor(r){super(r);this.faker=r}};var Ce=(t=>(t.Narrowbody="narrowbody",t.Regional="regional",t.Widebody="widebody",t))(Ce||{}),xr=["0","1","2","3","4","5","6","7","8","9"],Ar=["0","O","1 [truncated...]
  2 |   If you think this is a bug, please report it at: https://github.com/faker-js/faker`);if(i===void 0)throw new l(`The locale data for '${e.join(".")}' are missing in this locale.
----
  4 |   Please contribute the missing data to the project or use a locale/Faker instance that has these data.
  5 |   For more information see https://fakerjs.dev/guide/localization.html`)}function $r(i,e={}){return new Proxy(e,{has(r,t){return r[t]!=null},get(r,t){let a=r[t];return typeof t=="symbol"||t==="nodeType"||H(a,i,t.toString()),a},set:j,deleteProperty:j})}var P=class extends x{anytime(e={}){let{refDate:r=this.faker.defaultRefDate()}=e,t=w(r).getTime();return this.between({from:t-1e3*60*60*24*365,to:t+1e3*60*60*24*365})}past(e={}){let{years:r=1,refDate:t=this.faker.defaultRefDate()}=e;if(r<=0)throw n [truncated...]
  6 | `:`
  7 | `;return n.join(f)}commitMessage(){return`${this.faker.hacker.verb()} ${this.faker.hacker.adjective()} ${this.faker.hacker.noun()}`}commitDate(e={}){let{refDate:r=this.faker.defaultRefDate()}=e,t=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],a=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],n=this.faker.date.recent({days:1,refDate:r}),o=t[n.getUTCDay()],s=a[n.getUTCMonth()],m=n.getUTCDate(),c=n.getUTCHours().toString().padStart(2,"0"),u=n.getUTCMinutes().toString().padSta [truncated...]
  8 | `){return this.faker.helpers.multiple(()=>this.paragraph(),{count:e}).join(r)}text(){let e=["sentence","sentences","paragraph","paragraphs","lines"],r=this.faker.helpers.arrayElement(e);return this[r]()}lines(e={min:1,max:5}){return this.sentences(e,`
  9 | `)}};var le=class extends p{album(){return this.faker.helpers.arrayElement(this.faker.definitions.music.album)}artist(){return this.faker.helpers.arrayElement(this.faker.definitions.music.artist)}genre(){return this.faker.helpers.arrayElement(this.faker.definitions.music.genre)}songName(){return this.faker.helpers.arrayElement(this.faker.definitions.music.song_name)}};var me=class extends p{number(e={}){let{style:r="human"}=e,a=this.faker.definitions.phone_number.format[r];if(!a)throw new Error( [truncated...]
----
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:56:11.572Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string:       category_id: faker.datatype.number({ min: 1, max: NUM_CATEGORIES }),
New_string:       category_id: faker.number.int({ min: 1, max: NUM_CATEGORIES }),

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:56:18.413Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string:       const expiryYear = faker.datatype.number({ min: 2024, max: 2027 });
New_string:       const expiryYear = faker.number.int({ min: 2024, max: 2027 });

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:56:24.698Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string:         import_price: faker.datatype.float({ min: 1, max: 100, precision: 0.01 })
New_string:         import_price: faker.number.float({ min: 1, max: 100, precision: 0.01 })

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:56:33.952Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string:       const quantity = isBad && Math.random() < 0.5 ? faker.datatype.number({ min: -100, max: -1 }) : faker.datatype.number({ min: 0, max: 1000 });
New_string:       const quantity = isBad && Math.random() < 0.5 ? faker.number.int({ min: -100, max: -1 }) : faker.number.int({ min: 0, max: 1000 });

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:56:40.680Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string:       loyalty_points: faker.datatype.number({ min: 0, max: 1000 })
New_string:       loyalty_points: faker.number.int({ min: 0, max: 1000 })

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:56:45.721Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string:     const branchId = faker.datatype.number({ min: 1, max: NUM_BRANCHES });
New_string:     const branchId = faker.number.int({ min: 1, max: NUM_BRANCHES });

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:56:52.166Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string:     const customerId = faker.datatype.number({ min: 1, max: NUM_CUSTOMERS });
New_string:     const customerId = faker.number.int({ min: 1, max: NUM_CUSTOMERS });

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:56:57.421Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string:     const numDetails = faker.datatype.number({ min: 1, max: 5 });
New_string:     const numDetails = faker.number.int({ min: 1, max: 5 });

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:57:02.569Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string:       const quantity = faker.datatype.number({ min: 1, max: 10 });
      const unitPrice = batch.import_price * faker.datatype.float({ min: 1.1, max: 2.0, precision: 0.01 }); // markup
New_string:       const quantity = faker.number.int({ min: 1, max: 10 });
      const unitPrice = batch.import_price * faker.number.float({ min: 1.1, max: 2.0, precision: 0.01 }); // markup

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:57:08.839Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: execute_command]
Command: node generate_data.js
Cwd: .

---

**User:**

[Tool]
Command executed in terminal  within working directory 'd:/Môn học/LAB/Data/d1'. Command execution was not successful, inspect the cause and adjust as needed.
Exit code: 1
Output:
file:///d:/M%C3%B4n%20h%E1%BB%8Dc/LAB/Data/d1/node_modules/@faker-js/faker/dist/chunk-C2PDNA75.js:1
var l=class extends Error{};function Me(i){let e=Object.getPrototypeOf(i);do{for(let r of Object.getOwnPropertyNames(e))typeof i[r]=="function"&&r!=="constructor"&&(i[r]=i[r].bind(i));e=Object.getPrototypeOf(e)}while(e!==Object.prototype)}var x=class{constructor(e){this.faker=e;Me(this)}},p=class extends x{constructor(r){super(r);this.faker=r}};var Ce=(t=>(t.Narrowbody="narrowbody",t.Regional="regional",t.Widebody="widebody",t))(Ce||{}),xr=["0","1","2","3","4","5","6","7","8","9"],Ar=["0","O","1","I","L"],Er={regional:20,narrowbody:35,widebody:60},wr={regional:["A","B","C","D"],narrowbody:["A","B","C","D","E","F"],widebody:["A","B","C","D","E","F","G","H","J","K"]},F=class extends p{airport(){return this.faker.helpers.arrayElement(this.faker.definitions.airline.airport)}airline(){return this.faker.helpers.arrayElement(this.faker.definitions.airline.airline)}airplane(){return this.faker.helpers.arrayElement(this.faker.definitions.airline.airplane)}recordLocator(e={}){let{allowNumerics:r=!1,allowVisuallySimilarCharacters:t=!1}=e,a=[];return r||a.push(...xr),t||a.push(...Ar),this.faker.string.alphanumeric({length:6,casing:"upper",exclude:a})}seat(e={}){let{aircraftType:r="narrowbody"}=e,t=Er[r],a=wr[r],n=this.faker.number.int({min:1,max:t}),o=this.faker.helpers.arrayElement(a);return`${n}${o}`}aircraftType(){return this.faker.helpers.enumValue(Ce)}flightNumber(e={}){let{length:r={min:1,max:4},addLeadingZeros:t=!1}=e,a=this.faker.string.numeric({length:r,allowLeadingZeros:!1});return t?a.padStart(4,"0"):a}};var Ne=(n=>(n.SRGB="sRGB",n.DisplayP3="display-p3",n.REC2020="rec2020",n.A98RGB="a98-rgb",n.ProphotoRGB="prophoto-rgb",n))(Ne||{}),De=(c=>(c.RGB="rgb",c.RGBA="rgba",c.HSL="hsl",c.HSLA="hsla",c.HWB="hwb",c.CMYK="cmyk",c.LAB="lab",c.LCH="lch",c.COLOR="color",c))(De||{});function Sr(i,e){let{prefix:r,casing:t}=e;switch(t){case"upper":{i=i.toUpperCase();break}case"lower":{i=i.toLowerCase();break}case"mixed":}return r&&(i=r+i),i}function Re(i){return i.map(r=>{if(r%1!==0){let a=new ArrayBuffer(4);new DataView(a).setFloat32(0,r);let n=new Uint8Array(a);return Re([...n]).replaceAll(" ","")}return(r>>>0).toString(2).padStart(8,"0")}).join(" ")}function A(i){return Math.round(i*100)}function Tr(i,e="rgb",r="sRGB"){switch(e){case"rgba":return`rgba(${i[0]}, ${i[1]}, ${i[2]}, ${i[3]})`;case"color":return`color(${r} ${i[0]} ${i[1]} ${i[2]})`;case"cmyk":return`cmyk(${A(i[0])}%, ${A(i[1])}%, ${A(i[2])}%, ${A(i[3])}%)`;case"hsl":return`hsl(${i[0]}deg ${A(i[1])}% ${A(i[2])}%)`;case"hsla":return`hsl(${i[0]}deg ${A(i[1])}% ${A(i[2])}% / ${A(i[3])})`;case"hwb":return`hwb(${i[0]} ${A(i[1])}% ${A(i[2])}%)`;case"lab":return`lab(${A(i[0])}% ${i[1]} ${i[2]})`;case"lch":return`lch(${A(i[0])}% ${i[1]} ${i[2]})`;case"rgb":return`rgb(${i[0]}, ${i[1]}, ${i[2]})`}}function N(i,e,r="rgb",t="sRGB"){switch(e){case"css":return Tr(i,r,t);case"binary":return Re(i);case"decimal":return i}}var G=class extends p{human(){return this.faker.helpers.arrayElement(this.faker.definitions.color.human)}space(){return this.faker.helpers.arrayElement(this.faker.definitions.color.space)}cssSupportedFunction(){return this.faker.helpers.enumValue(De)}cssSupportedSpace(){return this.faker.helpers.enumValue(Ne)}rgb(e={}){let{format:r="hex",includeAlpha:t=!1,prefix:a="#",casing:n="lower"}=e,o,s="rgb";return r==="hex"?(o=this.faker.string.hexadecimal({length:t?8:6,prefix:""}),o=Sr(o,{prefix:a,casing:n}),o):(o=Array.from({length:3},()=>this.faker.number.int(255)),t&&(o.push(this.faker.number.float({multipleOf:.01})),s="rgba"),N(o,r,s))}cmyk(e={}){let{format:r="decimal"}=e,t=Array.from({length:4},()=>this.faker.number.float({multipleOf:.01}));return N(t,r,"cmyk")}hsl(e={}){let{format:r="decimal",includeAlpha:t=!1}=e,a=[this.faker.number.int(360)];for(let n=0;n<(e?.includeAlpha?3:2);n++)a.push(this.faker.number.float({multipleOf:.01}));return N(a,r,t?"hsla":"hsl")}hwb(e={}){let{format:r="decimal"}=e,t=[this.faker.number.int(360)];for(let a=0;a<2;a++)t.push(this.faker.number.float({multipleOf:.01}));return N(t,r,"hwb")}lab(e={}){let{format:r="decimal"}=e,t=[this.faker.number.float({multipleOf:1e-6})];for(let a=0;a<2;a++)t.push(this.faker.number.float({min:-100,max:100,multipleOf:1e-4}));return N(t,r,"lab")}lch(e={}){let{format:r="decimal"}=e,t=[this.faker.number.float({multipleOf:1e-6})];for(let a=0;a<2;a++)t.push(this.faker.number.float({max:230,multipleOf:.1}));return N(t,r,"lch")}colorByCSSColorSpace(e={}){let{format:r="decimal",space:t="sRGB"}=e,a=Array.from({length:3},()=>this.faker.number.float({multipleOf:1e-4}));return N(a,r,"color",t)}};var be=(a=>(a.Legacy="legacy",a.Segwit="segwit",a.Bech32="bech32",a.Taproot="taproot",a))(be||{}),Le=(r=>(r.Mainnet="mainnet",r.Testnet="testnet",r))(Le||{}),Pe={legacy:{prefix:{mainnet:"1",testnet:"m"},length:{min:26,max:34},casing:"mixed",exclude:"0OIl"},segwit:{prefix:{mainnet:"3",testnet:"2"},length:{min:26,max:34},casing:"mixed",exclude:"0OIl"},bech32:{prefix:{mainnet:"bc1",testnet:"tb1"},length:{min:42,max:42},casing:"lower",exclude:"1bBiIoO"},taproot:{prefix:{mainnet:"bc1p",testnet:"tb1p"},length:{min:62,max:62},casing:"lower",exclude:"1bBiIoO"}};var de=typeof Buffer>"u"||!Be("base64")?i=>{let e=new TextEncoder().encode(i),r=Array.from(e,t=>String.fromCodePoint(t)).join("");return btoa(r)}:i=>Buffer.from(i).toString("base64"),ge=typeof Buffer>"u"||!Be("base64url")?i=>de(i).replaceAll("+","-").replaceAll("/","_").replaceAll(/=+$/g,""):i=>Buffer.from(i).toString("base64url");function Be(i){try{return typeof Buffer.from("test").toString(i)=="string"}catch{return!1}}var Mr=Object.fromEntries([["\u0410","A"],["\u0430","a"],["\u0411","B"],["\u0431","b"],["\u0412","V"],["\u0432","v"],["\u0413","G"],["\u0433","g"],["\u0414","D"],["\u0434","d"],["\u044A\u0435","ye"],["\u042A\u0435","Ye"],["\u044A\u0415","yE"],["\u042A\u0415","YE"],["\u0415","E"],["\u0435","e"],["\u0401","Yo"],["\u0451","yo"],["\u0416","Zh"],["\u0436","zh"],["\u0417","Z"],["\u0437","z"],["\u0418","I"],["\u0438","i"],["\u044B\u0439","iy"],["\u042B\u0439","Iy"],["\u042B\u0419","IY"],["\u044B\u0419","iY"],["\u0419","Y"],["\u0439","y"],["\u041A","K"],["\u043A","k"],["\u041B","L"],["\u043B","l"],["\u041C","M"],["\u043C","m"],["\u041D","N"],["\u043D","n"],["\u041E","O"],["\u043E","o"],["\u041F","P"],["\u043F","p"],["\u0420","R"],["\u0440","r"],["\u0421","S"],["\u0441","s"],["\u0422","T"],["\u0442","t"],["\u0423","U"],["\u0443","u"],["\u0424","F"],["\u0444","f"],["\u0425","Kh"],["\u0445","kh"],["\u0426","Ts"],["\u0446","ts"],["\u0427","Ch"],["\u0447","ch"],["\u0428","Sh"],["\u0448","sh"],["\u0429","Sch"],["\u0449","sch"],["\u042A",""],["\u044A",""],["\u042B","Y"],["\u044B","y"],["\u042C",""],["\u044C",""],["\u042D","E"],["\u044D","e"],["\u042E","Yu"],["\u044E","yu"],["\u042F","Ya"],["\u044F","ya"]]),Cr=Object.fromEntries([["\u03B1","a"],["\u03B2","v"],["\u03B3","g"],["\u03B4","d"],["\u03B5","e"],["\u03B6","z"],["\u03B7","i"],["\u03B8","th"],["\u03B9","i"],["\u03BA","k"],["\u03BB","l"],["\u03BC","m"],["\u03BD","n"],["\u03BE","ks"],["\u03BF","o"],["\u03C0","p"],["\u03C1","r"],["\u03C3","s"],["\u03C4","t"],["\u03C5","y"],["\u03C6","f"],["\u03C7","x"],["\u03C8","ps"],["\u03C9","o"],["\u03AC","a"],["\u03AD","e"],["\u03AF","i"],["\u03CC","o"],["\u03CD","y"],["\u03AE","i"],["\u03CE","o"],["\u03C2","s"],["\u03CA","i"],["\u03B0","y"],["\u03CB","y"],["\u0390","i"],["\u0391","A"],["\u0392","B"],["\u0393","G"],["\u0394","D"],["\u0395","E"],["\u0396","Z"],["\u0397","I"],["\u0398","TH"],["\u0399","I"],["\u039A","K"],["\u039B","L"],["\u039C","M"],["\u039D","N"],["\u039E","KS"],["\u039F","O"],["\u03A0","P"],["\u03A1","R"],["\u03A3","S"],["\u03A4","T"],["\u03A5","Y"],["\u03A6","F"],["\u03A7","X"],["\u03A8","PS"],["\u03A9","O"],["\u0386","A"],["\u0388","E"],["\u038A","I"],["\u038C","O"],["\u038E","Y"],["\u0389","I"],["\u038F","O"],["\u03AA","I"],["\u03AB","Y"]]),Nr=Object.fromEntries([["\u0621","e"],["\u0622","a"],["\u0623","a"],["\u0624","w"],["\u0625","i"],["\u0626","y"],["\u0627","a"],["\u0628","b"],["\u0629","t"],["\u062A","t"],["\u062B","th"],["\u062C","j"],["\u062D","h"],["\u062E","kh"],["\u062F","d"],["\u0630","dh"],["\u0631","r"],["\u0632","z"],["\u0633","s"],["\u0634","sh"],["\u0635","s"],["\u0636","d"],["\u0637","t"],["\u0638","z"],["\u0639","e"],["\u063A","gh"],["\u0640","_"],["\u0641","f"],["\u0642","q"],["\u0643","k"],["\u0644","l"],["\u0645","m"],["\u0646","n"],["\u0647","h"],["\u0648","w"],["\u0649","a"],["\u064A","y"],["\u064E\u200E","a"],["\u064F","u"],["\u0650\u200E","i"]]),Dr=Object.fromEntries([["\u0561","a"],["\u0531","A"],["\u0562","b"],["\u0532","B"],["\u0563","g"],["\u0533","G"],["\u0564","d"],["\u0534","D"],["\u0565","ye"],["\u0535","Ye"],["\u0566","z"],["\u0536","Z"],["\u0567","e"],["\u0537","E"],["\u0568","y"],["\u0538","Y"],["\u0569","t"],["\u0539","T"],["\u056A","zh"],["\u053A","Zh"],["\u056B","i"],["\u053B","I"],["\u056C","l"],["\u053C","L"],["\u056D","kh"],["\u053D","Kh"],["\u056E","ts"],["\u053E","Ts"],["\u056F","k"],["\u053F","K"],["\u0570","h"],["\u0540","H"],["\u0571","dz"],["\u0541","Dz"],["\u0572","gh"],["\u0542","Gh"],["\u0573","tch"],["\u0543","Tch"],["\u0574","m"],["\u0544","M"],["\u0575","y"],["\u0545","Y"],["\u0576","n"],["\u0546","N"],["\u0577","sh"],["\u0547","Sh"],["\u0578","vo"],["\u0548","Vo"],["\u0579","ch"],["\u0549","Ch"],["\u057A","p"],["\u054A","P"],["\u057B","j"],["\u054B","J"],["\u057C","r"],["\u054C","R"],["\u057D","s"],["\u054D","S"],["\u057E","v"],["\u054E","V"],["\u057F","t"],["\u054F","T"],["\u0580","r"],["\u0550","R"],["\u0581","c"],["\u0551","C"],["\u0578\u0582","u"],["\u0548\u0552","U"],["\u0548\u0582","U"],["\u0583","p"],["\u0553","P"],["\u0584","q"],["\u0554","Q"],["\u0585","o"],["\u0555","O"],["\u0586","f"],["\u0556","F"],["\u0587","yev"]]),Rr=Object.fromEntries([["\u0686","ch"],["\u06A9","k"],["\u06AF","g"],["\u067E","p"],["\u0698","zh"],["\u06CC","y"]]),Lr=Object.fromEntries([["\u05D0","a"],["\u05D1","b"],["\u05D2","g"],["\u05D3","d"],["\u05D4","h"],["\u05D5","v"],["\u05D6","z"],["\u05D7","ch"],["\u05D8","t"],["\u05D9","y"],["\u05DB","k"],["\u05DA","kh"],["\u05DC","l"],["\u05DD","m"],["\u05DE","m"],["\u05DF","n"],["\u05E0","n"],["\u05E1","s"],["\u05E2","a"],["\u05E4","f"],["\u05E3","ph"],["\u05E6","ts"],["\u05E5","ts"],["\u05E7","k"],["\u05E8","r"],["\u05E9","sh"],["\u05EA","t"],["\u05D5","v"]]),ye={...Mr,...Cr,...Nr,...Rr,...Dr,...Lr};var Pr=(u=>(u.Any="any",u.Loopback="loopback",u.PrivateA="private-a",u.PrivateB="private-b",u.PrivateC="private-c",u.TestNet1="test-net-1",u.TestNet2="test-net-2",u.TestNet3="test-net-3",u.LinkLocal="link-local",u.Multicast="multicast",u))(Pr||{}),Br={any:"0.0.0.0/0",loopback:"127.0.0.0/8","private-a":"10.0.0.0/8","private-b":"172.16.0.0/12","private-c":"192.168.0.0/16","test-net-1":"192.0.2.0/24","test-net-2":"198.51.100.0/24","test-net-3":"203.0.113.0/24","link-local":"169.254.0.0/16",multicast:"224.0.0.0/4"};function ve(i){return/^[a-z][a-z-]*[a-z]$/i.exec(i)!==null}function Ie(i,e){let r=i.helpers.slugify(e);if(ve(r))return r;let t=i.helpers.slugify(i.lorem.word());return ve(t)?t:i.string.alpha({casing:"lower",length:i.number.int({min:4,max:8})})}var O=class extends p{email(e={}){let{firstName:r,lastName:t,provider:a=this.faker.helpers.arrayElement(this.faker.definitions.internet.free_email),allowSpecialCharacters:n=!1}=e,o=this.username({firstName:r,lastName:t});if(o=o.replaceAll(/[^A-Za-z0-9._+-]+/g,""),o=o.substring(0,50),n){let s=[..."._-"],m=[...".!#$%&'*+-/=?^_`{|}~"];o=o.replace(this.faker.helpers.arrayElement(s),this.faker.helpers.arrayElement(m))}return o=o.replaceAll(/\.{2,}/g,"."),o=o.replace(/^\./,""),o=o.replace(/\.$/,""),`${o}@${a}`}exampleEmail(e={}){let{firstName:r,lastName:t,allowSpecialCharacters:a=!1}=e,n=this.faker.helpers.arrayElement(this.faker.definitions.internet.example_email);return this.email({firstName:r,lastName:t,provider:n,allowSpecialCharacters:a})}username(e={}){let{firstName:r=this.faker.person.firstName(),lastName:t=this.faker.person.lastName(),lastName:a}=e,n=this.faker.helpers.arrayElement([".","_"]),o=this.faker.number.int(99),s=[()=>`${r}${n}${t}${o}`,()=>`${r}${n}${t}`];a||s.push(()=>`${r}${o}`);let m=this.faker.helpers.arrayElement(s)();return m=m.normalize("NFKD").replaceAll(/[\u0300-\u036F]/g,""),m=[...m].map(c=>{if(ye[c])return ye[c];let u=c.codePointAt(0)??Number.NaN;return u<128?c:u.toString(36)}).join(""),m=m.replaceAll("'",""),m=m.replaceAll(" ",""),m}displayName(e={}){let{firstName:r=this.faker.person.firstName(),lastName:t=this.faker.person.lastName()}=e,a=this.faker.helpers.arrayElement([".","_"]),n=this.faker.number.int(99),o=[()=>`${r}${n}`,()=>`${r}${a}${t}`,()=>`${r}${a}${t}${n}`],s=this.faker.helpers.arrayElement(o)();return s=s.replaceAll("'",""),s=s.replaceAll(" ",""),s}protocol(){let e=["http","https"];return this.faker.helpers.arrayElement(e)}httpMethod(){let e=["GET","POST","PUT","DELETE","PATCH"];return this.faker.helpers.arrayElement(e)}httpStatusCode(e={}){let{types:r=Object.keys(this.faker.definitions.internet.http_status_code)}=e,t=this.faker.helpers.arrayElement(r);return this.faker.helpers.arrayElement(this.faker.definitions.internet.http_status_code[t])}url(e={}){let{appendSlash:r=this.faker.datatype.boolean(),protocol:t="https"}=e;return`${t}://${this.domainName()}${r?"/":""}`}domainName(){return`${this.domainWord()}.${this.domainSuffix()}`}domainSuffix(){return this.faker.helpers.arrayElement(this.faker.definitions.internet.domain_suffix)}domainWord(){let e=Ie(this.faker,this.faker.word.adjective()),r=Ie(this.faker,this.faker.word.noun());return`${e}-${r}`.toLowerCase()}ip(){return this.faker.datatype.boolean()?this.ipv4():this.ipv6()}ipv4(e={}){let{network:r="any",cidrBlock:t=Br[r]}=e;if(!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/.test(t))throw new l(`Invalid CIDR block provided: ${t}. Must be in the format x.x.x.x/y.`);let[a,n]=t.split("/"),o=4294967295>>>Number.parseInt(n),[s,m,c,u]=a.split(".").map(Number),f=(s<<24|m<<16|c<<8|u)&~o,k=this.faker.number.int(o),b=f|k;return[b>>>24&255,b>>>16&255,b>>>8&255,b&255].join(".")}ipv6(){return Array.from({length:8},()=>this.faker.string.hexadecimal({length:4,casing:"lower",prefix:""})).join(":")}port(){return this.faker.number.int(65535)}userAgent(){return this.faker.helpers.fake(this.faker.definitions.internet.user_agent_pattern)}mac(e={}){typeof e=="string"&&(e={separator:e});let{separator:r=":"}=e,t,a="";for([":","-",""].includes(r)||(r=":"),t=0;t<12;t++)a+=this.faker.number.hex(15),t%2===1&&t!==11&&(a+=r);return a}password(e={}){let r=/[aeiouAEIOU]$/,t=/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]$/,a=(c,u,h,f)=>{if(f.length>=c)return f;u&&(h=t.test(f)?r:t);let k=this.faker.number.int(94)+33,b=String.fromCodePoint(k);return u&&(b=b.toLowerCase()),h.test(b)?a(c,u,h,f+b):a(c,u,h,f)},{length:n=15,memorable:o=!1,pattern:s=/\w/,prefix:m=""}=e;return a(n,o,s,m)}emoji(e={}){let{types:r=Object.keys(this.faker.definitions.internet.emoji)}=e,t=this.faker.helpers.arrayElement(r);return this.faker.helpers.arrayElement(this.faker.definitions.internet.emoji[t])}jwtAlgorithm(){return this.faker.helpers.arrayElement(this.faker.definitions.internet.jwt_algorithm)}jwt(e={}){let{refDate:r=this.faker.defaultRefDate()}=e,t=this.faker.date.recent({refDate:r}),{header:a={alg:this.jwtAlgorithm(),typ:"JWT"},payload:n={iat:Math.round(t.valueOf()/1e3),exp:Math.round(this.faker.date.soon({refDate:t}).valueOf()/1e3),nbf:Math.round(this.faker.date.anytime({refDate:r}).valueOf()/1e3),iss:this.faker.company.name(),sub:this.faker.string.uuid(),aud:this.faker.string.uuid(),jti:this.faker.string.uuid()}}=e,o=ge(JSON.stringify(a)),s=ge(JSON.stringify(n)),m=this.faker.string.alphanumeric(64);return`${o}.${s}.${m}`}};var _e=(r=>(r.Female="female",r.Male="male",r))(_e||{});function D(i,e,r){let{generic:t,female:a,male:n}=r;switch(e){case"female":return a??t;case"male":return n??t;default:return t??i.helpers.arrayElement([a,n])??[]}}var U=class extends p{firstName(e){return this.faker.helpers.arrayElement(D(this.faker,e,this.faker.definitions.person.first_name))}lastName(e){if(this.faker.rawDefinitions.person?.last_name_pattern!=null){let r=this.faker.helpers.weightedArrayElement(D(this.faker,e,this.faker.rawDefinitions.person.last_name_pattern));return this.faker.helpers.fake(r)}return this.faker.helpers.arrayElement(D(this.faker,e,this.faker.definitions.person.last_name))}middleName(e){return this.faker.helpers.arrayElement(D(this.faker,e,this.faker.definitions.person.middle_name))}fullName(e={}){let{sex:r=this.faker.helpers.arrayElement(["female","male"]),firstName:t=this.firstName(r),lastName:a=this.lastName(r)}=e,n=this.faker.helpers.weightedArrayElement(this.faker.definitions.person.name);return this.faker.helpers.mustache(n,{"person.prefix":()=>this.prefix(r),"person.firstName":()=>t,"person.middleName":()=>this.middleName(r),"person.lastName":()=>a,"person.suffix":()=>this.suffix()})}gender(){return this.faker.helpers.arrayElement(this.faker.definitions.person.gender)}sex(){return this.faker.helpers.arrayElement(this.faker.definitions.person.sex)}sexType(){return this.faker.helpers.enumValue(_e)}bio(){let{bio_pattern:e}=this.faker.definitions.person;return this.faker.helpers.fake(e)}prefix(e){return this.faker.helpers.arrayElement(D(this.faker,e,this.faker.definitions.person.prefix))}suffix(){return this.faker.helpers.arrayElement(this.faker.definitions.person.suffix)}jobTitle(){return this.faker.helpers.fake(this.faker.definitions.person.job_title_pattern)}jobDescriptor(){return this.faker.helpers.arrayElement(this.faker.definitions.person.job_descriptor)}jobArea(){return this.faker.helpers.arrayElement(this.faker.definitions.person.job_area)}jobType(){return this.faker.helpers.arrayElement(this.faker.definitions.person.job_type)}zodiacSign(){return this.faker.helpers.arrayElement(this.faker.definitions.person.western_zodiac_sign)}};var vr=23283064365386963e-26,Ir=1/9007199254740992,{imul:xe,trunc:Ae}=Math;function $e(i){return typeof i=="number"?Fe(i):_r(i)}function Fe(i){let e=Array.from({length:624});e[0]=i;for(let r=1;r!==624;++r){let t=e[r-1]^e[r-1]>>>30;e[r]=Ae(xe(1812433253,t)+r)}return e}function _r(i){let e=Fe(19650218),r=1,t=0;for(let a=Math.max(624,i.length);a!==0;--a){let n=e[r-1]^e[r-1]>>>30;e[r]=Ae((e[r]^xe(n,1664525))+i[t]+t),r++,t++,r>=624&&(e[0]=e[623],r=1),t>=i.length&&(t=0)}for(let a=623;a!==0;a--)e[r]=Ae((e[r]^xe(e[r-1]^e[r-1]>>>30,1566083941))-r),r++,r>=624&&(e[0]=e[623],r=1);return e[0]=2147483648,e}function ke(i){for(let r=0;r!==227;++r){let t=(i[r]&2147483648)+(i[r+1]&2147483647);i[r]=i[r+397]^t>>>1^-(t&1)&2567483615}for(let r=227;r!==623;++r){let t=(i[r]&2147483648)+(i[r+1]&2147483647);i[r]=i[r+397-624]^t>>>1^-(t&1)&2567483615}let e=(i[623]&2147483648)+(i[0]&2147483647);return i[623]=i[396]^e>>>1^-(e&1)&2567483615,i}var R=class{constructor(e=Math.random()*Number.MAX_SAFE_INTEGER,r=ke($e(e)),t=0){this.states=r;this.index=t}nextU32(){let e=this.states[this.index];return e^=this.states[this.index]>>>11,e^=e<<7&2636928640,e^=e<<15&4022730752,e^=e>>>18,++this.index>=624&&(this.states=ke(this.states),this.index=0),e>>>0}nextF32(){return this.nextU32()*vr}nextU53(){let e=this.nextU32()>>>5,r=this.nextU32()>>>6;return e*67108864+r}nextF53(){return this.nextU53()*Ir}seed(e){this.states=ke($e(e)),this.index=0}};function L(){return Math.ceil(Math.random()*Number.MAX_SAFE_INTEGER)}function Rt(i=L()){let e=new R(i);return{next(){return e.nextF32()},seed(r){e.seed(r)}}}function Ge(i=L()){let e=new R(i);return{next(){return e.nextF53()},seed(r){e.seed(r)}}}var K=class extends x{boolean(e={}){typeof e=="number"&&(e={probability:e});let{probability:r=.5}=e;return r<=0?!1:r>=1?!0:this.faker.number.float()<r}};function w(i,e="refDate"){let r=new Date(i);if(Number.isNaN(r.valueOf()))throw new l(`Invalid ${e} date: ${i.toString()}`);return r}var j=()=>{throw new l("You cannot edit the locale data on the faker instance")};function Oe(i){let e={};return new Proxy(i,{has(){return!0},get(r,t){return typeof t=="symbol"||t==="nodeType"?r[t]:t in e?e[t]:e[t]=$r(t,r[t])},set:j,deleteProperty:j})}function H(i,...e){if(i===null)throw new l(`The locale data for '${e.join(".")}' aren't applicable to this locale.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            

TypeError: Cannot read properties of undefined (reading 'toString')
    at w (file:///d:/M%C3%B4n%20h%E1%BB%8Dc/LAB/Data/d1/node_modules/@faker-js/faker/dist/chunk-C2PDNA75.js:1:19717)
    at V.between (file:///d:/M%C3%B4n%20h%E1%BB%8Dc/LAB/Data/d1/node_modules/@faker-js/faker/dist/chunk-C2PDNA75.js:5:848)
    at generateBatches (d:\Môn học\LAB\Data\d1\generate_data.js:70:44)
    at main (d:\Môn học\LAB\Data\d1\generate_data.js:194:19)
    at Object.<anonymous> (d:\Môn học\LAB\Data\d1\generate_data.js:278:1)
    at Module._compile (node:internal/modules/cjs/loader:1761:14)
    at Object..js (node:internal/modules/cjs/loader:1893:10)
    at Module.load (node:internal/modules/cjs/loader:1481:32)
    at Module._load (node:internal/modules/cjs/loader:1300:12)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)

Node.js v24.12.0

<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:57:42.006Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string:       const manufacturingDate = faker.date.between('2020-01-01', '2023-12-31');
      const expiryDate = faker.date.between(`${expiryYear}-01-01`, `${expiryYear}-12-31`);
New_string:       const manufacturingDate = faker.date.between(new Date('2020-01-01'), new Date('2023-12-31'));
      const expiryDate = faker.date.between(new Date(`${expiryYear}-01-01`), new Date(`${expiryYear}-12-31`));

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:57:55.363Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: execute_command]
Command: node generate_data.js
Cwd: .

---

**User:**

[Tool]
Command executed in terminal  within working directory 'd:/Môn học/LAB/Data/d1'. Command execution was not successful, inspect the cause and adjust as needed.
Exit code: 1
Output:
file:///d:/M%C3%B4n%20h%E1%BB%8Dc/LAB/Data/d1/node_modules/@faker-js/faker/dist/chunk-C2PDNA75.js:1
var l=class extends Error{};function Me(i){let e=Object.getPrototypeOf(i);do{for(let r of Object.getOwnPropertyNames(e))typeof i[r]=="function"&&r!=="constructor"&&(i[r]=i[r].bind(i));e=Object.getPrototypeOf(e)}while(e!==Object.prototype)}var x=class{constructor(e){this.faker=e;Me(this)}},p=class extends x{constructor(r){super(r);this.faker=r}};var Ce=(t=>(t.Narrowbody="narrowbody",t.Regional="regional",t.Widebody="widebody",t))(Ce||{}),xr=["0","1","2","3","4","5","6","7","8","9"],Ar=["0","O","1","I","L"],Er={regional:20,narrowbody:35,widebody:60},wr={regional:["A","B","C","D"],narrowbody:["A","B","C","D","E","F"],widebody:["A","B","C","D","E","F","G","H","J","K"]},F=class extends p{airport(){return this.faker.helpers.arrayElement(this.faker.definitions.airline.airport)}airline(){return this.faker.helpers.arrayElement(this.faker.definitions.airline.airline)}airplane(){return this.faker.helpers.arrayElement(this.faker.definitions.airline.airplane)}recordLocator(e={}){let{allowNumerics:r=!1,allowVisuallySimilarCharacters:t=!1}=e,a=[];return r||a.push(...xr),t||a.push(...Ar),this.faker.string.alphanumeric({length:6,casing:"upper",exclude:a})}seat(e={}){let{aircraftType:r="narrowbody"}=e,t=Er[r],a=wr[r],n=this.faker.number.int({min:1,max:t}),o=this.faker.helpers.arrayElement(a);return`${n}${o}`}aircraftType(){return this.faker.helpers.enumValue(Ce)}flightNumber(e={}){let{length:r={min:1,max:4},addLeadingZeros:t=!1}=e,a=this.faker.string.numeric({length:r,allowLeadingZeros:!1});return t?a.padStart(4,"0"):a}};var Ne=(n=>(n.SRGB="sRGB",n.DisplayP3="display-p3",n.REC2020="rec2020",n.A98RGB="a98-rgb",n.ProphotoRGB="prophoto-rgb",n))(Ne||{}),De=(c=>(c.RGB="rgb",c.RGBA="rgba",c.HSL="hsl",c.HSLA="hsla",c.HWB="hwb",c.CMYK="cmyk",c.LAB="lab",c.LCH="lch",c.COLOR="color",c))(De||{});function Sr(i,e){let{prefix:r,casing:t}=e;switch(t){case"upper":{i=i.toUpperCase();break}case"lower":{i=i.toLowerCase();break}case"mixed":}return r&&(i=r+i),i}function Re(i){return i.map(r=>{if(r%1!==0){let a=new ArrayBuffer(4);new DataView(a).setFloat32(0,r);let n=new Uint8Array(a);return Re([...n]).replaceAll(" ","")}return(r>>>0).toString(2).padStart(8,"0")}).join(" ")}function A(i){return Math.round(i*100)}function Tr(i,e="rgb",r="sRGB"){switch(e){case"rgba":return`rgba(${i[0]}, ${i[1]}, ${i[2]}, ${i[3]})`;case"color":return`color(${r} ${i[0]} ${i[1]} ${i[2]})`;case"cmyk":return`cmyk(${A(i[0])}%, ${A(i[1])}%, ${A(i[2])}%, ${A(i[3])}%)`;case"hsl":return`hsl(${i[0]}deg ${A(i[1])}% ${A(i[2])}%)`;case"hsla":return`hsl(${i[0]}deg ${A(i[1])}% ${A(i[2])}% / ${A(i[3])})`;case"hwb":return`hwb(${i[0]} ${A(i[1])}% ${A(i[2])}%)`;case"lab":return`lab(${A(i[0])}% ${i[1]} ${i[2]})`;case"lch":return`lch(${A(i[0])}% ${i[1]} ${i[2]})`;case"rgb":return`rgb(${i[0]}, ${i[1]}, ${i[2]})`}}function N(i,e,r="rgb",t="sRGB"){switch(e){case"css":return Tr(i,r,t);case"binary":return Re(i);case"decimal":return i}}var G=class extends p{human(){return this.faker.helpers.arrayElement(this.faker.definitions.color.human)}space(){return this.faker.helpers.arrayElement(this.faker.definitions.color.space)}cssSupportedFunction(){return this.faker.helpers.enumValue(De)}cssSupportedSpace(){return this.faker.helpers.enumValue(Ne)}rgb(e={}){let{format:r="hex",includeAlpha:t=!1,prefix:a="#",casing:n="lower"}=e,o,s="rgb";return r==="hex"?(o=this.faker.string.hexadecimal({length:t?8:6,prefix:""}),o=Sr(o,{prefix:a,casing:n}),o):(o=Array.from({length:3},()=>this.faker.number.int(255)),t&&(o.push(this.faker.number.float({multipleOf:.01})),s="rgba"),N(o,r,s))}cmyk(e={}){let{format:r="decimal"}=e,t=Array.from({length:4},()=>this.faker.number.float({multipleOf:.01}));return N(t,r,"cmyk")}hsl(e={}){let{format:r="decimal",includeAlpha:t=!1}=e,a=[this.faker.number.int(360)];for(let n=0;n<(e?.includeAlpha?3:2);n++)a.push(this.faker.number.float({multipleOf:.01}));return N(a,r,t?"hsla":"hsl")}hwb(e={}){let{format:r="decimal"}=e,t=[this.faker.number.int(360)];for(let a=0;a<2;a++)t.push(this.faker.number.float({multipleOf:.01}));return N(t,r,"hwb")}lab(e={}){let{format:r="decimal"}=e,t=[this.faker.number.float({multipleOf:1e-6})];for(let a=0;a<2;a++)t.push(this.faker.number.float({min:-100,max:100,multipleOf:1e-4}));return N(t,r,"lab")}lch(e={}){let{format:r="decimal"}=e,t=[this.faker.number.float({multipleOf:1e-6})];for(let a=0;a<2;a++)t.push(this.faker.number.float({max:230,multipleOf:.1}));return N(t,r,"lch")}colorByCSSColorSpace(e={}){let{format:r="decimal",space:t="sRGB"}=e,a=Array.from({length:3},()=>this.faker.number.float({multipleOf:1e-4}));return N(a,r,"color",t)}};var be=(a=>(a.Legacy="legacy",a.Segwit="segwit",a.Bech32="bech32",a.Taproot="taproot",a))(be||{}),Le=(r=>(r.Mainnet="mainnet",r.Testnet="testnet",r))(Le||{}),Pe={legacy:{prefix:{mainnet:"1",testnet:"m"},length:{min:26,max:34},casing:"mixed",exclude:"0OIl"},segwit:{prefix:{mainnet:"3",testnet:"2"},length:{min:26,max:34},casing:"mixed",exclude:"0OIl"},bech32:{prefix:{mainnet:"bc1",testnet:"tb1"},length:{min:42,max:42},casing:"lower",exclude:"1bBiIoO"},taproot:{prefix:{mainnet:"bc1p",testnet:"tb1p"},length:{min:62,max:62},casing:"lower",exclude:"1bBiIoO"}};var de=typeof Buffer>"u"||!Be("base64")?i=>{let e=new TextEncoder().encode(i),r=Array.from(e,t=>String.fromCodePoint(t)).join("");return btoa(r)}:i=>Buffer.from(i).toString("base64"),ge=typeof Buffer>"u"||!Be("base64url")?i=>de(i).replaceAll("+","-").replaceAll("/","_").replaceAll(/=+$/g,""):i=>Buffer.from(i).toString("base64url");function Be(i){try{return typeof Buffer.from("test").toString(i)=="string"}catch{return!1}}var Mr=Object.fromEntries([["\u0410","A"],["\u0430","a"],["\u0411","B"],["\u0431","b"],["\u0412","V"],["\u0432","v"],["\u0413","G"],["\u0433","g"],["\u0414","D"],["\u0434","d"],["\u044A\u0435","ye"],["\u042A\u0435","Ye"],["\u044A\u0415","yE"],["\u042A\u0415","YE"],["\u0415","E"],["\u0435","e"],["\u0401","Yo"],["\u0451","yo"],["\u0416","Zh"],["\u0436","zh"],["\u0417","Z"],["\u0437","z"],["\u0418","I"],["\u0438","i"],["\u044B\u0439","iy"],["\u042B\u0439","Iy"],["\u042B\u0419","IY"],["\u044B\u0419","iY"],["\u0419","Y"],["\u0439","y"],["\u041A","K"],["\u043A","k"],["\u041B","L"],["\u043B","l"],["\u041C","M"],["\u043C","m"],["\u041D","N"],["\u043D","n"],["\u041E","O"],["\u043E","o"],["\u041F","P"],["\u043F","p"],["\u0420","R"],["\u0440","r"],["\u0421","S"],["\u0441","s"],["\u0422","T"],["\u0442","t"],["\u0423","U"],["\u0443","u"],["\u0424","F"],["\u0444","f"],["\u0425","Kh"],["\u0445","kh"],["\u0426","Ts"],["\u0446","ts"],["\u0427","Ch"],["\u0447","ch"],["\u0428","Sh"],["\u0448","sh"],["\u0429","Sch"],["\u0449","sch"],["\u042A",""],["\u044A",""],["\u042B","Y"],["\u044B","y"],["\u042C",""],["\u044C",""],["\u042D","E"],["\u044D","e"],["\u042E","Yu"],["\u044E","yu"],["\u042F","Ya"],["\u044F","ya"]]),Cr=Object.fromEntries([["\u03B1","a"],["\u03B2","v"],["\u03B3","g"],["\u03B4","d"],["\u03B5","e"],["\u03B6","z"],["\u03B7","i"],["\u03B8","th"],["\u03B9","i"],["\u03BA","k"],["\u03BB","l"],["\u03BC","m"],["\u03BD","n"],["\u03BE","ks"],["\u03BF","o"],["\u03C0","p"],["\u03C1","r"],["\u03C3","s"],["\u03C4","t"],["\u03C5","y"],["\u03C6","f"],["\u03C7","x"],["\u03C8","ps"],["\u03C9","o"],["\u03AC","a"],["\u03AD","e"],["\u03AF","i"],["\u03CC","o"],["\u03CD","y"],["\u03AE","i"],["\u03CE","o"],["\u03C2","s"],["\u03CA","i"],["\u03B0","y"],["\u03CB","y"],["\u0390","i"],["\u0391","A"],["\u0392","B"],["\u0393","G"],["\u0394","D"],["\u0395","E"],["\u0396","Z"],["\u0397","I"],["\u0398","TH"],["\u0399","I"],["\u039A","K"],["\u039B","L"],["\u039C","M"],["\u039D","N"],["\u039E","KS"],["\u039F","O"],["\u03A0","P"],["\u03A1","R"],["\u03A3","S"],["\u03A4","T"],["\u03A5","Y"],["\u03A6","F"],["\u03A7","X"],["\u03A8","PS"],["\u03A9","O"],["\u0386","A"],["\u0388","E"],["\u038A","I"],["\u038C","O"],["\u038E","Y"],["\u0389","I"],["\u038F","O"],["\u03AA","I"],["\u03AB","Y"]]),Nr=Object.fromEntries([["\u0621","e"],["\u0622","a"],["\u0623","a"],["\u0624","w"],["\u0625","i"],["\u0626","y"],["\u0627","a"],["\u0628","b"],["\u0629","t"],["\u062A","t"],["\u062B","th"],["\u062C","j"],["\u062D","h"],["\u062E","kh"],["\u062F","d"],["\u0630","dh"],["\u0631","r"],["\u0632","z"],["\u0633","s"],["\u0634","sh"],["\u0635","s"],["\u0636","d"],["\u0637","t"],["\u0638","z"],["\u0639","e"],["\u063A","gh"],["\u0640","_"],["\u0641","f"],["\u0642","q"],["\u0643","k"],["\u0644","l"],["\u0645","m"],["\u0646","n"],["\u0647","h"],["\u0648","w"],["\u0649","a"],["\u064A","y"],["\u064E\u200E","a"],["\u064F","u"],["\u0650\u200E","i"]]),Dr=Object.fromEntries([["\u0561","a"],["\u0531","A"],["\u0562","b"],["\u0532","B"],["\u0563","g"],["\u0533","G"],["\u0564","d"],["\u0534","D"],["\u0565","ye"],["\u0535","Ye"],["\u0566","z"],["\u0536","Z"],["\u0567","e"],["\u0537","E"],["\u0568","y"],["\u0538","Y"],["\u0569","t"],["\u0539","T"],["\u056A","zh"],["\u053A","Zh"],["\u056B","i"],["\u053B","I"],["\u056C","l"],["\u053C","L"],["\u056D","kh"],["\u053D","Kh"],["\u056E","ts"],["\u053E","Ts"],["\u056F","k"],["\u053F","K"],["\u0570","h"],["\u0540","H"],["\u0571","dz"],["\u0541","Dz"],["\u0572","gh"],["\u0542","Gh"],["\u0573","tch"],["\u0543","Tch"],["\u0574","m"],["\u0544","M"],["\u0575","y"],["\u0545","Y"],["\u0576","n"],["\u0546","N"],["\u0577","sh"],["\u0547","Sh"],["\u0578","vo"],["\u0548","Vo"],["\u0579","ch"],["\u0549","Ch"],["\u057A","p"],["\u054A","P"],["\u057B","j"],["\u054B","J"],["\u057C","r"],["\u054C","R"],["\u057D","s"],["\u054D","S"],["\u057E","v"],["\u054E","V"],["\u057F","t"],["\u054F","T"],["\u0580","r"],["\u0550","R"],["\u0581","c"],["\u0551","C"],["\u0578\u0582","u"],["\u0548\u0552","U"],["\u0548\u0582","U"],["\u0583","p"],["\u0553","P"],["\u0584","q"],["\u0554","Q"],["\u0585","o"],["\u0555","O"],["\u0586","f"],["\u0556","F"],["\u0587","yev"]]),Rr=Object.fromEntries([["\u0686","ch"],["\u06A9","k"],["\u06AF","g"],["\u067E","p"],["\u0698","zh"],["\u06CC","y"]]),Lr=Object.fromEntries([["\u05D0","a"],["\u05D1","b"],["\u05D2","g"],["\u05D3","d"],["\u05D4","h"],["\u05D5","v"],["\u05D6","z"],["\u05D7","ch"],["\u05D8","t"],["\u05D9","y"],["\u05DB","k"],["\u05DA","kh"],["\u05DC","l"],["\u05DD","m"],["\u05DE","m"],["\u05DF","n"],["\u05E0","n"],["\u05E1","s"],["\u05E2","a"],["\u05E4","f"],["\u05E3","ph"],["\u05E6","ts"],["\u05E5","ts"],["\u05E7","k"],["\u05E8","r"],["\u05E9","sh"],["\u05EA","t"],["\u05D5","v"]]),ye={...Mr,...Cr,...Nr,...Rr,...Dr,...Lr};var Pr=(u=>(u.Any="any",u.Loopback="loopback",u.PrivateA="private-a",u.PrivateB="private-b",u.PrivateC="private-c",u.TestNet1="test-net-1",u.TestNet2="test-net-2",u.TestNet3="test-net-3",u.LinkLocal="link-local",u.Multicast="multicast",u))(Pr||{}),Br={any:"0.0.0.0/0",loopback:"127.0.0.0/8","private-a":"10.0.0.0/8","private-b":"172.16.0.0/12","private-c":"192.168.0.0/16","test-net-1":"192.0.2.0/24","test-net-2":"198.51.100.0/24","test-net-3":"203.0.113.0/24","link-local":"169.254.0.0/16",multicast:"224.0.0.0/4"};function ve(i){return/^[a-z][a-z-]*[a-z]$/i.exec(i)!==null}function Ie(i,e){let r=i.helpers.slugify(e);if(ve(r))return r;let t=i.helpers.slugify(i.lorem.word());return ve(t)?t:i.string.alpha({casing:"lower",length:i.number.int({min:4,max:8})})}var O=class extends p{email(e={}){let{firstName:r,lastName:t,provider:a=this.faker.helpers.arrayElement(this.faker.definitions.internet.free_email),allowSpecialCharacters:n=!1}=e,o=this.username({firstName:r,lastName:t});if(o=o.replaceAll(/[^A-Za-z0-9._+-]+/g,""),o=o.substring(0,50),n){let s=[..."._-"],m=[...".!#$%&'*+-/=?^_`{|}~"];o=o.replace(this.faker.helpers.arrayElement(s),this.faker.helpers.arrayElement(m))}return o=o.replaceAll(/\.{2,}/g,"."),o=o.replace(/^\./,""),o=o.replace(/\.$/,""),`${o}@${a}`}exampleEmail(e={}){let{firstName:r,lastName:t,allowSpecialCharacters:a=!1}=e,n=this.faker.helpers.arrayElement(this.faker.definitions.internet.example_email);return this.email({firstName:r,lastName:t,provider:n,allowSpecialCharacters:a})}username(e={}){let{firstName:r=this.faker.person.firstName(),lastName:t=this.faker.person.lastName(),lastName:a}=e,n=this.faker.helpers.arrayElement([".","_"]),o=this.faker.number.int(99),s=[()=>`${r}${n}${t}${o}`,()=>`${r}${n}${t}`];a||s.push(()=>`${r}${o}`);let m=this.faker.helpers.arrayElement(s)();return m=m.normalize("NFKD").replaceAll(/[\u0300-\u036F]/g,""),m=[...m].map(c=>{if(ye[c])return ye[c];let u=c.codePointAt(0)??Number.NaN;return u<128?c:u.toString(36)}).join(""),m=m.replaceAll("'",""),m=m.replaceAll(" ",""),m}displayName(e={}){let{firstName:r=this.faker.person.firstName(),lastName:t=this.faker.person.lastName()}=e,a=this.faker.helpers.arrayElement([".","_"]),n=this.faker.number.int(99),o=[()=>`${r}${n}`,()=>`${r}${a}${t}`,()=>`${r}${a}${t}${n}`],s=this.faker.helpers.arrayElement(o)();return s=s.replaceAll("'",""),s=s.replaceAll(" ",""),s}protocol(){let e=["http","https"];return this.faker.helpers.arrayElement(e)}httpMethod(){let e=["GET","POST","PUT","DELETE","PATCH"];return this.faker.helpers.arrayElement(e)}httpStatusCode(e={}){let{types:r=Object.keys(this.faker.definitions.internet.http_status_code)}=e,t=this.faker.helpers.arrayElement(r);return this.faker.helpers.arrayElement(this.faker.definitions.internet.http_status_code[t])}url(e={}){let{appendSlash:r=this.faker.datatype.boolean(),protocol:t="https"}=e;return`${t}://${this.domainName()}${r?"/":""}`}domainName(){return`${this.domainWord()}.${this.domainSuffix()}`}domainSuffix(){return this.faker.helpers.arrayElement(this.faker.definitions.internet.domain_suffix)}domainWord(){let e=Ie(this.faker,this.faker.word.adjective()),r=Ie(this.faker,this.faker.word.noun());return`${e}-${r}`.toLowerCase()}ip(){return this.faker.datatype.boolean()?this.ipv4():this.ipv6()}ipv4(e={}){let{network:r="any",cidrBlock:t=Br[r]}=e;if(!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/.test(t))throw new l(`Invalid CIDR block provided: ${t}. Must be in the format x.x.x.x/y.`);let[a,n]=t.split("/"),o=4294967295>>>Number.parseInt(n),[s,m,c,u]=a.split(".").map(Number),f=(s<<24|m<<16|c<<8|u)&~o,k=this.faker.number.int(o),b=f|k;return[b>>>24&255,b>>>16&255,b>>>8&255,b&255].join(".")}ipv6(){return Array.from({length:8},()=>this.faker.string.hexadecimal({length:4,casing:"lower",prefix:""})).join(":")}port(){return this.faker.number.int(65535)}userAgent(){return this.faker.helpers.fake(this.faker.definitions.internet.user_agent_pattern)}mac(e={}){typeof e=="string"&&(e={separator:e});let{separator:r=":"}=e,t,a="";for([":","-",""].includes(r)||(r=":"),t=0;t<12;t++)a+=this.faker.number.hex(15),t%2===1&&t!==11&&(a+=r);return a}password(e={}){let r=/[aeiouAEIOU]$/,t=/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]$/,a=(c,u,h,f)=>{if(f.length>=c)return f;u&&(h=t.test(f)?r:t);let k=this.faker.number.int(94)+33,b=String.fromCodePoint(k);return u&&(b=b.toLowerCase()),h.test(b)?a(c,u,h,f+b):a(c,u,h,f)},{length:n=15,memorable:o=!1,pattern:s=/\w/,prefix:m=""}=e;return a(n,o,s,m)}emoji(e={}){let{types:r=Object.keys(this.faker.definitions.internet.emoji)}=e,t=this.faker.helpers.arrayElement(r);return this.faker.helpers.arrayElement(this.faker.definitions.internet.emoji[t])}jwtAlgorithm(){return this.faker.helpers.arrayElement(this.faker.definitions.internet.jwt_algorithm)}jwt(e={}){let{refDate:r=this.faker.defaultRefDate()}=e,t=this.faker.date.recent({refDate:r}),{header:a={alg:this.jwtAlgorithm(),typ:"JWT"},payload:n={iat:Math.round(t.valueOf()/1e3),exp:Math.round(this.faker.date.soon({refDate:t}).valueOf()/1e3),nbf:Math.round(this.faker.date.anytime({refDate:r}).valueOf()/1e3),iss:this.faker.company.name(),sub:this.faker.string.uuid(),aud:this.faker.string.uuid(),jti:this.faker.string.uuid()}}=e,o=ge(JSON.stringify(a)),s=ge(JSON.stringify(n)),m=this.faker.string.alphanumeric(64);return`${o}.${s}.${m}`}};var _e=(r=>(r.Female="female",r.Male="male",r))(_e||{});function D(i,e,r){let{generic:t,female:a,male:n}=r;switch(e){case"female":return a??t;case"male":return n??t;default:return t??i.helpers.arrayElement([a,n])??[]}}var U=class extends p{firstName(e){return this.faker.helpers.arrayElement(D(this.faker,e,this.faker.definitions.person.first_name))}lastName(e){if(this.faker.rawDefinitions.person?.last_name_pattern!=null){let r=this.faker.helpers.weightedArrayElement(D(this.faker,e,this.faker.rawDefinitions.person.last_name_pattern));return this.faker.helpers.fake(r)}return this.faker.helpers.arrayElement(D(this.faker,e,this.faker.definitions.person.last_name))}middleName(e){return this.faker.helpers.arrayElement(D(this.faker,e,this.faker.definitions.person.middle_name))}fullName(e={}){let{sex:r=this.faker.helpers.arrayElement(["female","male"]),firstName:t=this.firstName(r),lastName:a=this.lastName(r)}=e,n=this.faker.helpers.weightedArrayElement(this.faker.definitions.person.name);return this.faker.helpers.mustache(n,{"person.prefix":()=>this.prefix(r),"person.firstName":()=>t,"person.middleName":()=>this.middleName(r),"person.lastName":()=>a,"person.suffix":()=>this.suffix()})}gender(){return this.faker.helpers.arrayElement(this.faker.definitions.person.gender)}sex(){return this.faker.helpers.arrayElement(this.faker.definitions.person.sex)}sexType(){return this.faker.helpers.enumValue(_e)}bio(){let{bio_pattern:e}=this.faker.definitions.person;return this.faker.helpers.fake(e)}prefix(e){return this.faker.helpers.arrayElement(D(this.faker,e,this.faker.definitions.person.prefix))}suffix(){return this.faker.helpers.arrayElement(this.faker.definitions.person.suffix)}jobTitle(){return this.faker.helpers.fake(this.faker.definitions.person.job_title_pattern)}jobDescriptor(){return this.faker.helpers.arrayElement(this.faker.definitions.person.job_descriptor)}jobArea(){return this.faker.helpers.arrayElement(this.faker.definitions.person.job_area)}jobType(){return this.faker.helpers.arrayElement(this.faker.definitions.person.job_type)}zodiacSign(){return this.faker.helpers.arrayElement(this.faker.definitions.person.western_zodiac_sign)}};var vr=23283064365386963e-26,Ir=1/9007199254740992,{imul:xe,trunc:Ae}=Math;function $e(i){return typeof i=="number"?Fe(i):_r(i)}function Fe(i){let e=Array.from({length:624});e[0]=i;for(let r=1;r!==624;++r){let t=e[r-1]^e[r-1]>>>30;e[r]=Ae(xe(1812433253,t)+r)}return e}function _r(i){let e=Fe(19650218),r=1,t=0;for(let a=Math.max(624,i.length);a!==0;--a){let n=e[r-1]^e[r-1]>>>30;e[r]=Ae((e[r]^xe(n,1664525))+i[t]+t),r++,t++,r>=624&&(e[0]=e[623],r=1),t>=i.length&&(t=0)}for(let a=623;a!==0;a--)e[r]=Ae((e[r]^xe(e[r-1]^e[r-1]>>>30,1566083941))-r),r++,r>=624&&(e[0]=e[623],r=1);return e[0]=2147483648,e}function ke(i){for(let r=0;r!==227;++r){let t=(i[r]&2147483648)+(i[r+1]&2147483647);i[r]=i[r+397]^t>>>1^-(t&1)&2567483615}for(let r=227;r!==623;++r){let t=(i[r]&2147483648)+(i[r+1]&2147483647);i[r]=i[r+397-624]^t>>>1^-(t&1)&2567483615}let e=(i[623]&2147483648)+(i[0]&2147483647);return i[623]=i[396]^e>>>1^-(e&1)&2567483615,i}var R=class{constructor(e=Math.random()*Number.MAX_SAFE_INTEGER,r=ke($e(e)),t=0){this.states=r;this.index=t}nextU32(){let e=this.states[this.index];return e^=this.states[this.index]>>>11,e^=e<<7&2636928640,e^=e<<15&4022730752,e^=e>>>18,++this.index>=624&&(this.states=ke(this.states),this.index=0),e>>>0}nextF32(){return this.nextU32()*vr}nextU53(){let e=this.nextU32()>>>5,r=this.nextU32()>>>6;return e*67108864+r}nextF53(){return this.nextU53()*Ir}seed(e){this.states=ke($e(e)),this.index=0}};function L(){return Math.ceil(Math.random()*Number.MAX_SAFE_INTEGER)}function Rt(i=L()){let e=new R(i);return{next(){return e.nextF32()},seed(r){e.seed(r)}}}function Ge(i=L()){let e=new R(i);return{next(){return e.nextF53()},seed(r){e.seed(r)}}}var K=class extends x{boolean(e={}){typeof e=="number"&&(e={probability:e});let{probability:r=.5}=e;return r<=0?!1:r>=1?!0:this.faker.number.float()<r}};function w(i,e="refDate"){let r=new Date(i);if(Number.isNaN(r.valueOf()))throw new l(`Invalid ${e} date: ${i.toString()}`);return r}var j=()=>{throw new l("You cannot edit the locale data on the faker instance")};function Oe(i){let e={};return new Proxy(i,{has(){return!0},get(r,t){return typeof t=="symbol"||t==="nodeType"?r[t]:t in e?e[t]:e[t]=$r(t,r[t])},set:j,deleteProperty:j})}function H(i,...e){if(i===null)throw new l(`The locale data for '${e.join(".")}' aren't applicable to this locale.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            

TypeError: Cannot read properties of undefined (reading 'toString')
    at w (file:///d:/M%C3%B4n%20h%E1%BB%8Dc/LAB/Data/d1/node_modules/@faker-js/faker/dist/chunk-C2PDNA75.js:1:19717)
    at V.between (file:///d:/M%C3%B4n%20h%E1%BB%8Dc/LAB/Data/d1/node_modules/@faker-js/faker/dist/chunk-C2PDNA75.js:5:848)
    at generateBatches (d:\Môn học\LAB\Data\d1\generate_data.js:70:44)
    at main (d:\Môn học\LAB\Data\d1\generate_data.js:194:19)
    at Object.<anonymous> (d:\Môn học\LAB\Data\d1\generate_data.js:278:1)
    at Module._compile (node:internal/modules/cjs/loader:1761:14)
    at Object..js (node:internal/modules/cjs/loader:1893:10)
    at Module.load (node:internal/modules/cjs/loader:1481:32)
    at Module._load (node:internal/modules/cjs/loader:1300:12)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)

Node.js v24.12.0

<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:58:19.875Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string:       const manufacturingDate = faker.date.between(new Date('2020-01-01'), new Date('2023-12-31'));
      const expiryDate = faker.date.between(new Date(`${expiryYear}-01-01`), new Date(`${expiryYear}-12-31`));
New_string:       const manufacturingDate = faker.date.between({ from: new Date('2020-01-01'), to: new Date('2023-12-31') });
      const expiryDate = faker.date.between({ from: new Date(`${expiryYear}-01-01`), to: new Date(`${expiryYear}-12-31`) });

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:58:26.921Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string:     const saleDate = faker.date.recent(365).toISOString().slice(0, 19).replace('T', ' ');
New_string:     const saleDate = faker.date.recent({ days: 365 }).toISOString().slice(0, 19).replace('T', ' ');

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:58:47.810Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string:         last_updated: faker.date.recent().toISOString().slice(0, 19).replace('T', ' ')
New_string:         last_updated: faker.date.recent({ days: 1 }).toISOString().slice(0, 19).replace('T', ' ')

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:58:53.162Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: execute_command]
Command: node generate_data.js
Cwd: .

---

**User:**

[Tool]
Command executed in terminal  within working directory 'd:/Môn học/LAB/Data/d1'. Command execution was not successful, inspect the cause and adjust as needed.
Exit code: 1
Output:
d:\Môn học\LAB\Data\d1\generate_data.js:115
      username: faker.internet.userName(),
                               ^

TypeError: faker.internet.userName is not a function
    at generatePharmacists (d:\Môn học\LAB\Data\d1\generate_data.js:115:32)
    at main (d:\Môn học\LAB\Data\d1\generate_data.js:196:23)
    at Object.<anonymous> (d:\Môn học\LAB\Data\d1\generate_data.js:278:1)
    at Module._compile (node:internal/modules/cjs/loader:1761:14)
    at Object..js (node:internal/modules/cjs/loader:1893:10)
    at Module.load (node:internal/modules/cjs/loader:1481:32)
    at Module._load (node:internal/modules/cjs/loader:1300:12)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:245:24)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)

Node.js v24.12.0

<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:59:07.304Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: search_replace]
File_path: generate_data.js
Old_string:       username: faker.internet.userName(),
New_string:       username: faker.internet.username(),

---

**User:**

[Tool]
{"path":"generate_data.js","operation":"modified","notice":"You do not need to re-read the file, as you have seen all changes Proceed with the task using these changes as the new baseline."}
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:59:13.667Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: execute_command]
Command: node generate_data.js
Cwd: .

---

**User:**

[Tool]
Command executed in terminal  within working directory 'd:/Môn học/LAB/Data/d1'. Exit code: 0
Output:
All CSVs generated
branches.csv written
categories.csv written
medicines.csv written
batches.csv written
pharmacists.csv written
inventory.csv written
customers.csv written
invoices.csv written
invoice_details.csv written

<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:59:18.933Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: list_files]
Path: .
Recursive: false

---

**User:**

[Tool]
batches.csv
branches.csv
categories.csv
customers.csv
generate_data.js
generate_data.py
inventory.csv
invoice_details.csv
invoices.csv
medicines.csv
package-lock.json
package.json
pharmacists.csv
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:59:23.680Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: read_file]
Files: [
  {
    "path": "medicines.csv"
  }
]

---

**User:**

[Tool]
File: medicines.csv
Lines 1-501:
  1 | medicine_id,category_id,name,brand,unit,description,created_at
  2 | 1,10,Fantastic Bamboo Mouse,Feil - Kassulke,vial,Totus accendo cuius.,2026-01-15 14:19:42
  3 | 2,6,Fantastic Gold Salad,Price - Pfannerstill,tablet,Pauci eaque velum ago adeo summopere.,2025-10-04 14:29:37
  4 | 3,5,Rustic Concrete Ball,Dooley - Farrell,vial,Alias labore cavus patior calcar.,2025-12-03 12:30:18
  5 | 4,3,Frozen Steel Fish,"Lubowitz, Boyer and Bednar",box,Aestus damnatio cogo tracto alias laboriosam.,2025-01-20 21:51:47
  6 | 5,5,Fantastic Aluminum Pizza,Koch Inc,box,Vilis vinco vigilo delectus sufficio una alter clarus.,2025-02-17 20:48:36
  7 | 6,9,Small Marble Bike,Paucek - Turner,tablet,Tardus traho subvenio calculus.,2025-03-10 23:30:33
  8 | 7,7,Unbranded Granite Gloves,Satterfield - Stamm,box,Taedium vos tripudio tergeo depraedor et contra apostolus.,2025-12-31 09:45:52
  9 | 8,1,Bespoke Ceramic Mouse,Nader LLC,tablet,Accusamus apparatus atqui vorax tonsor termes.,2025-10-27 18:28:27
 10 | 9,4,Fresh Bronze Chips,"Bode, Kris and Zieme",bottle,Delego dedecor fugiat despecto uterque confido.,2025-07-31 14:29:43
 11 | 10,8,Sleek Cotton Cheese,Stokes - Turcotte,box,Clementia communis volubilis solus stella.,2025-10-31 04:45:16
 12 | 11,5,Bespoke Bamboo Keyboard,Kilback - Shanahan,averto,Coaegresco suasoria pauci vorax cupressus conatus.,2025-11-20 05:42:23
 13 | 12,7,Awesome Wooden Towels,Collier - Wilkinson,tablet,Trans similique necessitatibus.,2025-06-12 06:55:42
 14 | 13,8,Handcrafted Aluminum Fish,"Brekke, Buckridge and Hermann",vial,Cogito caecus sonitus succedo clibanus auctor ventosus deludo compello congregatio.,2025-12-10 04:22:49
 15 | 14,6,Practical Steel Shoes,Gleichner - Witting,bottle,Veniam apparatus vix fuga calco enim ulterius iste cilicium.,2025-01-23 09:48:06
 16 | 15,2,Ergonomic Aluminum Mouse,Schuster - Kovacek,box,Speculum minima odio ullus suasoria.,2025-04-28 05:41:20
 17 | 16,6,Intelligent Cotton Ball,"MacGyver, Satterfield and Thiel",vial,Trans sui voluptatibus adeo amicitia.,2025-10-26 20:41:17
 18 | 17,5,Refined Rubber Shirt,"Daniel, Shields and Heaney",bottle,Solus autem apto ipsa patior.,2025-03-26 21:10:31
 19 | 18,6,Handcrafted Cotton Tuna,"Koepp, Spinka and Mraz",box,Aegrotatio canis turbo deprecator aqua delectus denique ago.,2025-12-10 08:57:15
 20 | 19,8,Practical Rubber Sausages,Satterfield - Grady,bottle,Contego pecto consequatur vinculum torqueo asperiores fugiat umbra custodia super.,2025-11-21 14:47:39
 21 | 20,3,Incredible Marble Fish,Lockman Inc,vial,Coniuratio vere deleniti tibi caritas eius aperio viduo angustus demitto.,2025-06-13 22:52:20
 22 | 21,2,Licensed Wooden Table,"Ferry, Kub and Konopelski",bottle,Arguo caritas tener subseco dolore traho torrens comparo.,2025-03-14 13:02:04
 23 | 22,2,Handcrafted Metal Tuna,Thompson Group,tablet,Solium undique statim cornu addo dolorum.,2025-08-28 03:04:38
 24 | 23,8,Unbranded Plastic Pizza,Smitham Inc,tablet,Deporto adulatio officia sumptus tantillus et vivo ara totidem adimpleo.,2025-05-07 11:52:30
 25 | 24,4,Modern Gold Ball,Romaguera Inc,box,Vinculum itaque decet conatus teneo ab amplitudo abundans.,2025-08-15 00:56:13
 26 | 25,7,Electronic Granite Keyboard,"Littel, Jones and Kertzmann",vial,Compello maiores vestigium curo.,2025-11-17 17:30:19
 27 | 26,9,Ergonomic Bamboo Tuna,Jacobi Group,box,Decens cubicularis cresco currus corrupti.,2026-01-14 15:34:17
 28 | 27,5,Elegant Bronze Ball,King and Sons,tablet,Canonicus ab certe dapifer decretum adhuc.,2025-05-19 19:25:09
 29 | 28,4,Electronic Wooden Ball,Corwin - Bosco,vial,Sonitus stipes absum tibi.,2025-06-24 03:50:31
 30 | 29,5,Tasty Cotton Keyboard,Armstrong - Schulist,box,Acies corpus clamo teneo delectatio adsum usus tergiversatio.,2025-04-19 20:32:53
 31 | 30,7,,Murphy LLC,bottle,Pax turpis patrocinor placeat timor tempus ater valeo vitium abduco.,2025-12-19 09:35:23
 32 | 31,8,Practical Bronze Table,Huels LLC,tablet,Nam cuppedia umquam.,2025-10-19 05:50:56
 33 | 32,6,Licensed Silk Pants,Satterfield Group,tablet,Aperio ullam culpa valens venia in pariatur comprehendo.,2025-03-11 12:50:37
 34 | 33,8,Practical Marble Cheese,"Feil, Lebsack and Leuschke",tablet,Sonitus valeo atavus uter vis communis taedium dignissimos usque apto.,2025-05-09 14:07:40
 35 | 34,4,Incredible Silk Chicken,"Feeney, Wiegand and Schimmel",bottle,Aestus adimpleo agnitio desolo clarus repellendus una audentia.,2025-07-18 01:04:40
 36 | 35,2,Refined Silk Hat,Adams - Dooley,vial,Valens atrocitas curatio maxime absque conforto tero conspergo.,2025-11-27 13:26:38
 37 | 36,2,Recycled Wooden Pants,"Larkin, Carter and Senger",bottle,Eos vae vulgo cotidie bene.,2025-01-21 14:07:59
 38 | 37,9,Incredible Steel Tuna,Greenholt - Lynch,tablet,Amissio creber nesciunt non ago confido paulatim vicinus tantillus.,2025-12-27 01:55:23
 39 | 38,9,Rustic Concrete Ball,Hettinger - Collier,tablet,Adulescens triumphus pauci calculus curriculum suspendo vitiosus depono decretum deorsum.,2025-02-13 13:35:35
 40 | 39,2,Modern Metal Soap,Murray - Rogahn,tablet,Ullus verus amita.,2025-12-24 13:04:04
 41 | 40,3,Rustic Silk Computer,Hoeger - Bernier,tablet,Reiciendis inflammatio vilitas placeat sonitus vitiosus vorax calco calco sono.,2025-06-04 14:55:18
 42 | 41,8,Luxurious Ceramic Computer,Muller and Sons,vial,Triumphus umquam auditor virtus arbor.,2025-08-30 20:02:35
 43 | 42,10,Handcrafted Steel Tuna,Keeling - Hermiston,vial,Termes vinum eius modi urbs cornu.,2025-12-14 05:05:52
 44 | 43,9,Handcrafted Plastic Car,Ryan Inc,vial,Sub neque asperiores.,2025-06-17 03:09:28
 45 | 44,6,Modern Plastic Car,Konopelski Group,vial,Volaticus taedium teneo audax.,2025-08-05 05:49:06
 46 | 45,2,Generic Cotton Mouse,Corwin Inc,tablet,Verumtamen aestas desidero deprecator voluptate ait cunabula viriliter.,2025-06-30 07:05:45
 47 | 46,7,Soft Bronze Hat,Durgan - Gerhold,vial,Amet conqueror eius adipiscor odio tui alo cunctatio auxilium aveho.,2025-01-24 04:10:49
 48 | 47,5,Bespoke Gold Soap,Prohaska - Daniel,tablet,Anser apud cognatus sunt stips viscus convoco eaque.,2025-06-13 00:31:35
 49 | 48,9,Awesome Bamboo Computer,"Padberg, Boehm and Carroll",box,Facere candidus vobis tredecim deprecator accendo ullam curis sto.,2025-10-09 07:01:19
 50 | 49,2,Small Wooden Fish,Heller and Sons,vial,Cornu auditor conturbo allatus.,2025-08-03 04:58:42
 51 | 50,6,Modern Bamboo Sausages,Gulgowski - Hane,tablet,Repellendus desparatus stella voco repellat totus amitto.,2025-01-22 09:38:18
 52 | 51,7,Handmade Gold Chair,Bednar - O'Connell,tablet,Provident deludo sophismata ocer vilicus desparatus quisquam odio.,2025-10-18 13:19:11
 53 | 52,8,Incredible Ceramic Bike,Gislason - Moore,vial,Super rerum curo vestigium.,2025-12-17 05:41:40
 54 | 53,8,Tasty Rubber Car,Lesch Group,tablet,Caelestis appono arca denuo conduco vulgaris.,2025-06-15 03:03:35
 55 | 54,10,Fresh Marble Pizza,"Rohan, Spencer and Franecki",bottle,Odio cibus capio admoneo.,2025-10-02 14:57:11
 56 | 55,6,Handcrafted Bamboo Hat,"Ziemann, Grimes and Herman",vial,Commodo molestiae auditor.,2025-11-03 22:59:04
 57 | 56,2,Unbranded Aluminum Gloves,Hintz - West,box,Strues textus volup.,2025-07-29 09:08:56
 58 | 57,6,Incredible Wooden Cheese,"McLaughlin, Kshlerin and Boehm",vial,Alius supplanto umquam adeptio.,2025-12-14 04:19:42
 59 | 58,3,Intelligent Aluminum Pants,Green - Miller,vial,Venustas triumphus vinco viscus deleniti tandem incidunt curia umquam verbera.,2025-07-10 20:09:45
 60 | 59,7,Fresh Concrete Chips,"Williamson, Leuschke and Murazik",tablet,Supellex aeger porro antea.,2025-12-01 00:43:07
 61 | 60,6,Awesome Rubber Towels,"Weber, Williamson and Cartwright",tablet,Carpo thorax usitas.,2025-07-22 16:04:45
 62 | 61,2,Fantastic Granite Shoes,"Runolfsdottir, Turner and Rempel",box,Textor ceno amissio cinis sulum numquam error somnus peccatus spiculum.,2026-01-11 07:13:00
 63 | 62,4,Refined Plastic Car,Heathcote and Sons,tablet,Cogo vapulus studio administratio degenero absconditus debeo ipsam alioqui demitto.,2025-11-17 12:04:23
 64 | 63,2,Rustic Aluminum Soap,"Prosacco, Marvin and Murray",box,Addo agnitio volaticus corroboro umbra arma aestas.,2025-03-09 18:22:03
 65 | 64,5,Practical Bronze Ball,"Hand, Hoeger and Marks",vial,Sapiente vitae absconditus bestia teneo arguo delinquo succurro qui delectatio.,2025-11-20 21:13:17
 66 | 65,6,,"Thompson, Jacobson and Hane",censura,Amaritudo deleo spero tego artificiose argumentum sumo.,2025-02-14 21:06:27
 67 | 66,8,Tasty Rubber Bacon,Klein - Harber,bottle,Stella utroque aliquam vinculum comitatus atrocitas vesper tantum.,2025-02-07 22:40:08
 68 | 67,8,Tasty Marble Keyboard,"Goyette, Lockman and Senger",tablet,Delicate vita cohors valde suffoco.,2025-12-21 04:56:15
 69 | 68,10,Small Marble Hat,Goldner - Lesch,bottle,Cauda apud adficio cauda at ocer officia.,2025-05-07 00:21:34
 70 | 69,8,Electronic Steel Chips,"Kerluke, Kertzmann and Herman",bottle,Demum ago turpis praesentium volaticus censura.,2025-12-12 23:03:24
 71 | 70,2,Oriental Ceramic Tuna,"Spencer, Sipes and Parisian",box,Celebrer cattus tripudio armarium vulgus quibusdam conatus.,2025-03-14 08:30:01
 72 | 71,3,Licensed Metal Ball,Gusikowski Group,tablet,Solus aperio incidunt tamdiu pax.,2025-08-20 04:25:15
 73 | 72,9,Ergonomic Concrete Shoes,Ebert - Champlin,box,Cattus conor debitis voluptatum caries veniam vorago teneo amet.,2025-08-30 03:15:24
 74 | 73,4,Frozen Marble Sausages,Connelly - Beahan,vial,Adsuesco spes bene triduana.,2025-10-12 17:12:48
 75 | 74,8,Recycled Bronze Ball,Ullrich LLC,vial,Tripudio vacuus videlicet sui.,2025-09-07 07:17:33
 76 | 75,9,Fantastic Bronze Chair,Will LLC,box,Cupressus voveo delibero admitto decens.,2025-08-10 07:26:16
 77 | 76,7,Handmade Ceramic Bacon,"Balistreri, Swift and Schaefer",bottle,Arcus maiores amet confero.,2026-01-07 05:37:11
 78 | 77,7,Unbranded Granite Chips,Daugherty - Kessler,bottle,Cohibeo patruus libero complectus.,2025-11-29 22:58:54
 79 | 78,7,Oriental Marble Computer,Lockman - Watsica,box,Repudiandae error xiphias alius arbor confido.,2025-09-27 15:36:56
 80 | 79,1,Generic Cotton Car,Dooley - Denesik,vulgo,Denique tenax vacuus defessus nemo clam dignissimos.,2025-07-16 18:35:33
 81 | 80,4,Awesome Wooden Car,"Stracke, Effertz and Connelly",vial,Baiulus demonstro degenero quibusdam.,2025-03-23 10:38:41
 82 | 81,2,Tasty Plastic Car,Runolfsson Inc,bottle,Demum cunabula corpus decipio degero condico.,2025-02-01 13:10:37
 83 | 82,2,Luxurious Cotton Tuna,Lind Group,box,Deporto caute surculus velut crebro suasoria.,2025-11-16 06:40:56
 84 | 83,5,Rustic Cotton Tuna,Kuhic and Sons,box,Allatus vinculum bonus necessitatibus apparatus demo suppellex vereor.,2025-10-24 13:47:03
 85 | 84,2,Luxurious Granite Car,Fisher and Sons,tablet,Conforto depono torqueo arcus comitatus tempora animus spiculum spectaculum terror.,2025-06-22 05:17:38
 86 | 85,4,Gorgeous Aluminum Ball,"Waelchi, Metz and Hudson",box,Carus stipes arma.,2025-03-09 03:07:28
 87 | 86,8,Sleek Metal Car,Jones LLC,vial,Speciosus sortitus eum crur demergo suus toties.,2025-09-07 06:49:27
 88 | 87,4,Electronic Gold Chair,"Block, Rosenbaum and Schoen",tablet,Perspiciatis caelum derideo cruciamentum beneficium iste coadunatio vis.,2025-12-17 20:28:52
 89 | 88,7,Luxurious Cotton Chips,"Fahey, Howe and Smitham",vial,Desolo calcar adficio tot temptatio complectus aperiam argumentum corrigo tristis.,2025-08-05 15:56:29
 90 | 89,5,Fantastic Bronze Mouse,"Gerlach, Kassulke and Nienow",tablet,Vulgaris aliquid coniecto odio animi pel absens esse.,2025-10-30 18:01:31
 91 | 90,9,Modern Granite Towels,Grant and Sons,box,Supellex eos viduo tripudio impedit abstergo adipisci.,2025-05-10 12:01:13
 92 | 91,9,Awesome Steel Keyboard,Cole and Sons,vial,Desipio comitatus textilis voluptas decerno consuasor inflammatio sodalitas.,2025-10-08 02:46:27
 93 | 92,10,Gorgeous Wooden Salad,"Cruickshank, Hills and McClure",bottle,Bibo adulescens corporis tonsor provident sollicito aliquam contigo administratio quos.,2025-03-17 15:39:44
 94 | 93,7,Refined Marble Keyboard,Mueller - Connelly,bottle,Derideo aveho volubilis vicissitudo debeo votum decor perferendis tenus terra.,2025-11-26 14:41:16
 95 | 94,8,Electronic Rubber Table,"Metz, Hilpert and Mueller",box,Aperte vicinus casus accusamus demitto conscendo universe blandior.,2025-05-11 06:26:45
 96 | 95,5,Generic Granite Hat,Crooks - Ortiz,box,Dolores sublime uredo.,2025-11-02 04:11:01
 97 | 96,6,Small Plastic Towels,"Zulauf, Stokes and Smitham",vial,Accendo defetiscor conforto confido vel artificiose suffragium conduco.,2025-04-28 17:39:19
 98 | 97,8,Refined Aluminum Mouse,"Leffler, Schowalter and Russel",bottle,Doloremque truculenter officiis in curso acsi.,2025-10-07 11:25:49
 99 | 98,8,Licensed Granite Shirt,Vandervort - Schamberger,vial,Thorax arcesso cometes antiquus autus commodo tergum textus tepidus accusamus.,2025-08-19 10:40:20
100 | 99,1,Tasty Bronze Soap,"Krajcik, Wilkinson and Mitchell",box,Vinculum alius acer similique architecto conventus totam adstringo.,2025-11-25 10:06:13
101 | 100,1,Handcrafted Marble Bike,Bradtke Inc,vial,Vulariter utrimque sonitus cubo velut aiunt conservo.,2025-02-07 06:12:27
102 | 101,2,Intelligent Cotton Bacon,Treutel - Schuppe,vial,Minus pauper vergo provident conventus dolorum crebro curia.,2025-04-01 15:52:48
103 | 102,5,Licensed Gold Hat,"Herman, Carroll and Gorczany",box,Uxor tendo bestia cohibeo.,2025-11-25 22:16:51
104 | 103,5,Small Marble Pizza,Ryan Group,tablet,Audentia creo vobis crebro magni tego.,2025-01-31 01:53:04
105 | 104,2,Incredible Rubber Salad,"Koss, Rohan and Renner",bottle,Studio non eveniet colligo caries.,2025-07-12 07:32:51
106 | 105,10,Small Bamboo Table,Zieme Inc,vial,Usitas uterque tui cenaculum curis tredecim beneficium.,2025-07-22 03:00:32
107 | 106,6,Unbranded Rubber Fish,Conn Inc,vial,Quidem abeo accusantium denego voro via amplexus accendo admitto suus.,2025-10-18 23:35:04
108 | 107,2,Generic Concrete Keyboard,Ledner - Schmeler,vial,Concido eligendi apto apparatus.,2025-07-22 00:58:21
109 | 108,4,Intelligent Gold Soap,Shanahan - Casper,tablet,Patrocinor delectatio votum.,2026-01-07 12:29:24
110 | 109,6,Refined Ceramic Computer,"Abbott, Willms and Jakubowski",bottle,Alo demo dedecor deserunt cuius videlicet dolor veritatis maiores.,2025-05-30 16:38:13
111 | 110,9,Licensed Aluminum Tuna,Lowe - Breitenberg,tablet,Cito canonicus voluntarius.,2025-04-11 22:30:54
112 | 111,5,Ergonomic Concrete Table,"Hermiston, Collins and Dooley",box,Bos tabesco absorbeo accommodo terminatio possimus credo.,2025-11-25 17:27:49
113 | 112,3,Awesome Gold Chair,"Gusikowski, Schamberger and Effertz",bottle,Caveo expedita supplanto validus animi aufero.,2025-03-11 16:25:27
114 | 113,7,Modern Wooden Table,Zieme Inc,box,Attonbitus virgo caterva demum curvo.,2025-12-25 12:42:12
115 | 114,3,Incredible Cotton Fish,Kuphal Group,tablet,Tres villa terror villa volutabrum arguo damnatio tandem calcar.,2026-01-08 04:07:01
116 | 115,10,Oriental Metal Sausages,"Beier, Hahn and Bechtelar",tablet,Ars decerno curto tenetur non.,2025-10-20 22:51:06
117 | 116,10,Luxurious Metal Ball,Bode LLC,vial,Denuo labore villa appositus audax sui condico blanditiis deinde.,2025-06-02 09:47:36
118 | 117,9,Licensed Bronze Salad,Kub - Champlin,tablet,Super sto tergum adnuo.,2025-11-23 18:55:22
119 | 118,5,Elegant Marble Pants,"King, Schowalter and Fay",bottle,Summa terminatio quas dolores degusto tumultus tunc voro.,2025-09-29 19:43:11
120 | 119,7,Elegant Steel Towels,Ward - Pfannerstill,tablet,Cornu vespillo conventus vinitor animus aurum fugiat recusandae clam.,2025-05-24 23:58:02
121 | 120,4,Rustic Metal Bacon,"Stroman, Zemlak and Renner",vial,Dedico iusto temperantia demum itaque ultra molestias curso.,2025-05-06 22:22:27
122 | 121,2,Rustic Wooden Chicken,"Kuhlman, Balistreri and Simonis",bottle,Strenuus ago tabernus convoco torrens absorbeo.,2025-04-13 07:55:43
123 | 122,1,Generic Steel Sausages,Towne and Sons,bottle,Ex ratione demulceo vinum audacia vulariter demum verumtamen officia.,2025-11-21 09:36:06
124 | 123,1,Fresh Rubber Car,Veum Group,box,Thymbra trepide considero aperio victoria absorbeo summisse.,2025-03-16 17:10:09
125 | 124,2,Practical Bamboo Ball,"Mante, Gislason and Brakus",bottle,Congregatio recusandae custodia deleniti crebro video solio pauci campana arguo.,2025-10-25 18:53:51
126 | 125,8,Intelligent Steel Table,Fay LLC,tablet,Conspergo thema ars dedecor demonstro delectatio correptius aiunt necessitatibus.,2025-10-16 04:50:44
127 | 126,10,Ergonomic Silk Shoes,Walter Inc,vial,Doloribus ager ipsam.,2025-09-13 15:30:08
128 | 127,5,Recycled Metal Chips,Paucek - Murphy,vial,Vulgaris nemo carpo vinco adeptio.,2025-11-21 12:27:16
129 | 128,4,Generic Rubber Tuna,Willms - Wiegand,tablet,Defendo pax suppellex angustus.,2025-10-03 15:54:52
130 | 129,8,Incredible Aluminum Chair,Toy Inc,box,Cinis aptus depopulo quo carus.,2026-01-18 12:15:53
131 | 130,4,Practical Bamboo Pants,Daugherty - DuBuque,box,Abduco maxime trans.,2025-05-14 16:18:55
132 | 131,5,Small Aluminum Bike,Larson Inc,tablet,Repellat venustas vilitas speculum quasi careo debilito depromo amet coniecto.,2025-07-14 13:51:43
133 | 132,1,Soft Silk Chips,Marvin - Little,box,Suadeo amo spoliatio succedo tergo vitiosus.,2025-05-13 15:59:05
134 | 133,9,Luxurious Marble Bike,"Torp, Hagenes and Kling",bottle,Denuo causa cunabula depromo alias via argumentum.,2025-12-03 23:29:26
135 | 134,8,Tasty Rubber Soap,Jones - Rippin,tablet,Adeo cupressus voluptas corrigo sol rem nostrum.,2025-12-30 08:20:43
136 | 135,1,Recycled Bronze Shoes,Monahan Group,tablet,Vicissitudo cilicium nostrum curvo.,2025-05-02 16:02:27
137 | 136,3,Small Bronze Chips,"Lind, Herman and Terry",bottle,Fuga tandem vulariter.,2025-01-21 18:02:43
138 | 137,7,Handcrafted Granite Cheese,"Douglas, Jacobi and Treutel",tablet,Adsuesco contego enim vero clibanus nam umerus.,2025-08-30 09:11:16
139 | 138,9,Small Ceramic Gloves,"Swift, Reilly and Collins",vial,Tamen cura deporto voluptatum totidem sed sunt comburo facere circumvenio.,2026-01-17 11:03:15
140 | 139,2,Sleek Ceramic Shoes,Hermann and Sons,bottle,Tantillus suadeo depopulo vinum nobis universe verto dolorem.,2025-05-29 20:15:21
141 | 140,8,Frozen Rubber Gloves,Von Inc,vial,Decimus cibo derelinquo pauci aveho callide ars amet argumentum curriculum.,2025-03-27 12:45:41
142 | 141,4,Oriental Cotton Bike,O'Keefe - Klein,tablet,Turba tutis verumtamen animi reprehenderit creator.,2025-04-22 01:49:40
143 | 142,7,Refined Steel Table,Wolf Inc,tablet,Aequitas articulus accedo amplitudo tunc debilito cotidie molestiae.,2025-10-18 22:23:56
144 | 143,10,Frozen Rubber Shoes,"Kozey, Koss and Kub",tablet,Conforto argumentum tergum averto conqueror cohaero stella surgo.,2025-11-04 14:00:47
145 | 144,9,Unbranded Steel Cheese,"Emard, Cummerata and Hane",tablet,Molestiae quia vereor.,2025-04-11 23:34:26
146 | 145,1,Handcrafted Metal Hat,Romaguera - McCullough,bottle,Vulgus aggredior beneficium cohors cohibeo odit aestivus.,2025-02-03 01:06:16
147 | 146,3,Elegant Gold Tuna,Bartoletti LLC,box,Demonstro absconditus capitulus libero volva balbus auditor curso.,2025-05-11 18:50:54
148 | 147,8,Incredible Wooden Sausages,"Kunze, Cormier and Moen",vial,Temperantia umerus constans sto adfero.,2025-12-03 17:22:14
149 | 148,1,Frozen Marble Chips,Watsica - Shields,tablet,Creptio velut laudantium facere antiquus cubo thermae.,2025-03-23 09:13:56
150 | 149,8,Oriental Rubber Ball,Hane - Runte,bottle,Deleniti audacia creta coadunatio adnuo conor admoveo tergiversatio impedit apud.,2025-08-02 19:18:08
151 | 150,7,Licensed Gold Cheese,Fay Group,bottle,Curo subito temeritas certus uterque combibo.,2025-04-17 11:29:04
152 | 151,8,Handcrafted Ceramic Ball,Kunze Inc,box,Admoneo textus strenuus creo alienus voco accommodo triumphus.,2026-01-07 20:43:17
153 | 152,9,Generic Cotton Salad,"Satterfield, Dickinson and Feest",tablet,Quibusdam sumo velit.,2025-12-17 17:04:33
154 | 153,9,Fresh Silk Gloves,"Kunze, Douglas and Frami",tablet,Autem ascit tollo spectaculum.,2025-03-01 10:07:47
155 | 154,2,Rustic Granite Bike,Hodkiewicz Group,box,Commodi quis sopor voluptatibus provident quasi clam confero crur vos.,2025-02-17 17:17:48
156 | 155,1,Intelligent Steel Mouse,Goodwin - Flatley,bottle,Anser concedo valde adflicto ullus curso.,2025-11-27 06:55:32
157 | 156,10,Practical Bronze Bacon,Baumbach - Corwin,tablet,Socius tabernus abutor stultus conscendo agnosco traho.,2025-03-19 20:48:54
158 | 157,1,Awesome Bronze Pants,White - Gleichner,box,Anser arma minima.,2025-07-09 23:55:12
159 | 158,9,Tasty Ceramic Fish,Monahan - Franecki,tablet,Articulus contra calco debilito tertius cohibeo cubitum ipsa.,2025-06-11 12:35:23
160 | 159,3,Oriental Bronze Chips,Pacocha - Ruecker,bottle,Desidero solus ait venustas perferendis paens timor vicissitudo voveo sapiente.,2025-02-09 12:10:48
161 | 160,5,Fantastic Rubber Table,"Harber, Green and Feeney",tablet,Cervus cito auxilium summopere amita circumvenio sub trado.,2025-10-05 00:44:36
162 | 161,1,Licensed Cotton Chair,"Hickle, Hirthe and Jenkins",vial,Nesciunt tres undique voluptatibus.,2025-10-29 07:36:46
163 | 162,3,Intelligent Wooden Bacon,Kiehn - Goodwin,bottle,Absque summa stabilis excepturi agnosco pauper cupiditas compello.,2025-05-21 05:58:32
164 | 163,9,Fantastic Concrete Fish,"Block, Hilpert and Blanda",tablet,Beneficium conservo tardus astrum maiores comptus annus ater.,2025-01-23 21:36:37
165 | 164,10,Handcrafted Rubber Sausages,Schumm Group,bottle,Tergiversatio collum tibi tunc benevolentia.,2026-01-18 17:17:59
166 | 165,8,Practical Concrete Tuna,Maggio and Sons,bottle,Appono atrox absque alias carmen.,2025-07-30 07:18:53
167 | 166,7,Unbranded Steel Table,"Walker, Gislason and Schiller",tablet,Curso suus subvenio conventus saepe comis decerno contra.,2025-09-07 09:37:02
168 | 167,7,Unbranded Wooden Chips,Crist - Bartoletti,curis,Error cubo succedo volutabrum.,2025-08-02 03:35:10
169 | 168,3,Generic Plastic Cheese,Adams - McCullough,vial,Appono decretum claro sodalitas inventore cognomen condico depereo.,2025-02-25 06:01:13
170 | 169,8,Tasty Ceramic Gloves,Kerluke - Hand,vial,Patria apud statua somniculosus.,2025-05-22 17:54:32
171 | 170,3,Recycled Ceramic Bike,"Kohler, Leannon and Predovic",vial,Baiulus vulticulus voluptas.,2025-05-10 19:20:54
172 | 171,2,Elegant Cotton Pants,Schimmel - Casper,bottle,Delicate a auditor sortitus adficio tabula cibo tantum.,2025-08-21 06:05:53
173 | 172,8,Oriental Steel Shirt,Cruickshank - Hettinger,box,Vinum super sunt advenio acies.,2025-08-24 19:39:57
174 | 173,8,Handcrafted Rubber Cheese,Gorczany Group,tablet,Alias laboriosam coma depono denego acsi solutio tabgo turbo.,2025-12-05 14:36:55
175 | 174,6,Handmade Plastic Gloves,"Runte, Zieme and Kshlerin",tablet,Modi omnis adipisci tonsor.,2025-05-09 19:30:45
176 | 175,6,Unbranded Steel Bacon,"Lebsack, Mante and Sanford",bottle,Ea centum sit tantum adimpleo auctor deleniti.,2026-01-10 01:43:50
177 | 176,5,Handcrafted Gold Chicken,Gutkowski - Leannon,tablet,Decipio voluntarius sophismata.,2025-05-01 04:09:00
178 | 177,2,Fresh Silk Keyboard,Johnston LLC,ullus,Coruscus correptius amiculum.,2025-12-20 00:35:29
179 | 178,1,Recycled Cotton Computer,Erdman and Sons,bottle,Vacuus recusandae attollo.,2025-01-30 08:38:41
180 | 179,10,Fresh Ceramic Bike,"Stehr, Okuneva and Kreiger",box,Amiculum beatae amiculum ocer auxilium avaritia.,2025-05-08 23:47:23
181 | 180,1,,"Harber, Block and Schneider",apto,Adsum denego suspendo capio conor suscipit tenetur cursus administratio.,2025-09-15 06:07:35
182 | 181,4,Small Wooden Tuna,Jenkins - Rolfson,box,Vinculum subseco tumultus clibanus cum vestigium admoneo coepi.,2025-09-11 02:28:07
183 | 182,8,Rustic Cotton Soap,Macejkovic LLC,vial,Cinis cohors saepe campana.,2025-03-05 05:53:35
184 | 183,7,Sleek Marble Car,Leannon - Hayes,vial,Verto voluptatem vallum statua odit caste tremo.,2025-11-21 04:14:44
185 | 184,3,Practical Granite Cheese,"Smith, Price and Mayer",bottle,Sunt ater peccatus depono bene ulciscor infit cur ipsam.,2025-05-09 01:45:33
186 | 185,10,Small Marble Sausages,Collins - Rodriguez,bottle,Tabula defluo adeo validus abscido bellicus creber accusator.,2025-12-28 13:40:59
187 | 186,2,Bespoke Wooden Computer,Heidenreich - Hessel,bottle,Thesaurus tutis succedo compono tamquam territo ager crur.,2025-05-29 12:54:27
188 | 187,8,Intelligent Aluminum Pants,"Hills, Bruen and Streich",bottle,Velit crux non sophismata admoveo verus varius.,2026-01-08 18:24:28
189 | 188,9,Luxurious Bamboo Salad,Mayer - Abernathy,tablet,Acer decretum demulceo acerbitas terga veritatis utilis triumphus vulgivagus certus.,2025-09-03 09:10:55
190 | 189,7,Refined Marble Chicken,Wisoky - Hirthe,vial,Eum aro vallum patrocinor.,2025-09-08 09:26:07
191 | 190,6,Frozen Marble Pants,"Jast, Dare and Senger",box,Audio dolore vero cado confugo comburo centum.,2025-12-11 03:12:38
192 | 191,7,Bespoke Marble Shirt,Graham - Yost,box,Deficio accusator crebro spoliatio aer decor tum suppono suspendo.,2025-04-08 12:08:07
193 | 192,4,Modern Rubber Towels,Wolf and Sons,vial,Acerbitas viriliter esse stillicidium colo facere stips.,2025-12-13 18:44:43
194 | 193,7,Frozen Metal Pizza,"Hodkiewicz, Labadie and Kshlerin",bottle,Auctus tremo absconditus cur valens voluptatum vero asporto.,2025-08-21 00:35:31
195 | 194,6,Elegant Rubber Shoes,Wisoky LLC,vial,Accusantium suffoco tribuo.,2025-05-14 15:40:01
196 | 195,5,,Stokes - Jacobs,demum,Aggredior cattus distinctio bonus angulus eaque cogito vorax amet comburo.,2025-12-08 03:21:17
197 | 196,7,Frozen Wooden Table,"Tillman, Wuckert and Hansen",box,Ut adhaero adhaero expedita absque eum templum denuo.,2025-02-28 01:15:34
198 | 197,6,Unbranded Concrete Fish,"Sawayn, Larkin and Orn",bottle,Utique explicabo adinventitias ademptio.,2025-04-26 12:05:19
199 | 198,2,Handcrafted Silk Gloves,Larkin - Nolan,vial,Absum atrocitas tepidus aqua cupiditate.,2025-11-15 03:02:15
200 | 199,9,Generic Wooden Salad,Ullrich Inc,bottle,Apud defendo voluptatem cicuta.,2025-12-02 20:18:27
201 | 200,1,Frozen Granite Tuna,Kuvalis - Witting,box,Claro benigne vulariter creptio sublime vorax adeo demoror defetiscor benigne.,2025-02-06 03:34:56
202 | 201,4,Small Bronze Keyboard,Gibson - Mohr,tablet,Corona arbustum officia pecco concedo aureus bonus aiunt.,2025-04-13 10:49:16
203 | 202,8,Sleek Metal Mouse,Macejkovic and Sons,vial,Triduana sub sollicito degero thema aegrus rerum cetera.,2025-12-13 04:10:54
204 | 203,4,Modern Concrete Chips,Baumbach and Sons,tablet,Talus consequatur ulterius pariatur synagoga armarium.,2025-02-26 01:04:45
205 | 204,10,Fresh Granite Pizza,Rice - Hilll,box,Ventosus agnitio spiculum sperno vespillo denique.,2026-01-18 05:59:40
206 | 205,8,Ergonomic Steel Cheese,"Bosco, Christiansen and Murazik",bottle,Cunabula voluptatum tergiversatio argentum coruscus vulgaris.,2026-01-11 21:54:46
207 | 206,4,Soft Silk Tuna,Nikolaus - Runolfsdottir,tablet,Agnosco verto tubineus ter cattus vado aestus.,2025-06-21 22:10:15
208 | 207,4,Handcrafted Plastic Towels,Reynolds LLC,tablet,Cernuus sapiente tempora infit speculum abstergo damnatio copiose accommodo aestivus.,2025-01-24 16:36:06
209 | 208,4,Recycled Ceramic Shirt,Little - Bergstrom,tablet,Adaugeo turpis sum atrocitas creptio brevis.,2026-01-20 00:54:54
210 | 209,5,Licensed Steel Cheese,McLaughlin Inc,box,Umbra titulus tergeo alo aer.,2025-05-18 15:52:02
211 | 210,1,Soft Marble Ball,Walter Group,tablet,In demens nulla ambitus curis.,2025-04-04 17:14:13
212 | 211,8,Fresh Bronze Fish,Kihn - Berge,bottle,Spiculum depraedor cedo vilis virtus attollo.,2025-02-22 05:02:12
213 | 212,10,Modern Rubber Car,"Ryan, Nicolas and Swaniawski",bottle,Alii ipsum ademptio sollicito.,2025-08-04 20:13:06
214 | 213,3,Frozen Granite Fish,Runolfsson - Dare,bottle,Tum theatrum provident voluptatum atavus ara.,2025-05-30 01:03:04
215 | 214,5,Sleek Marble Salad,Rogahn - Torp,vial,Atqui viridis rerum eveniet crepusculum pecus.,2026-01-02 00:10:26
216 | 215,1,Awesome Marble Soap,"Barton, Kuhlman and Labadie",vial,Argumentum quae consequatur vester.,2026-01-12 11:00:59
217 | 216,2,Soft Rubber Cheese,Torphy and Sons,vial,Validus agnosco vehemens.,2025-02-11 22:18:41
218 | 217,1,Generic Bronze Pizza,Haag Inc,vial,Aduro ter pecco antiquus saepe velut ulciscor canonicus.,2025-10-07 18:34:47
219 | 218,4,Frozen Plastic Shirt,Miller - Koch,box,Angustus adduco absque torqueo creta crux terreo.,2025-12-30 02:18:30
220 | 219,10,Refined Silk Chair,Corwin Inc,bottle,Versus cognatus cras cimentarius.,2025-06-17 01:50:29
221 | 220,9,Fantastic Aluminum Bacon,"Haley, Jacobson and Koss",bottle,Denuncio tergo assumenda sordeo.,2025-07-16 23:04:12
222 | 221,1,Modern Rubber Shoes,Reilly LLC,bottle,Adstringo denuo clementia caelum cresco.,2025-08-04 22:32:42
223 | 222,9,Licensed Gold Car,Kohler and Sons,bottle,Civis patruus cernuus solus aspernatur vitiosus vesper curvo suppono.,2025-11-29 11:39:59
224 | 223,2,Modern Gold Ball,"Mitchell, Cummerata and Ondricka",bottle,Cui avarus venia suus corroboro.,2025-04-05 05:23:06
225 | 224,4,Handmade Wooden Chips,"Schimmel, Schmidt and Kertzmann",bottle,Depulso asper aestas comptus quas sunt cometes patrocinor nulla voluptas.,2025-09-13 23:45:26
226 | 225,9,Bespoke Aluminum Salad,"Senger, Jacobs and Sawayn",vial,Creta cavus possimus solvo ustilo succurro beneficium comminor barba.,2025-11-10 00:13:41
227 | 226,9,Handmade Steel Mouse,Wisozk LLC,box,Compono vociferor cupiditate curriculum censura.,2025-06-22 01:54:27
228 | 227,4,Luxurious Cotton Pants,"Harber, Rempel and Rogahn",bottle,Debeo deserunt carus.,2025-12-18 16:44:55
229 | 228,5,Luxurious Bamboo Chips,Daniel Group,vial,Cognatus agnosco tactus stultus magni suppono terminatio decipio.,2025-12-21 00:25:23
230 | 229,3,Handcrafted Ceramic Pants,Emmerich and Sons,bottle,Amplexus amor turbo quod surgo accendo victoria.,2025-10-25 13:04:44
231 | 230,10,Soft Gold Fish,Nitzsche LLC,vial,Color armarium vociferor canis arma aperte apto angelus modi.,2025-04-21 07:56:35
232 | 231,7,Awesome Silk Towels,Leffler Inc,tablet,Admitto corrumpo tenuis benevolentia absconditus suscipio crastinus.,2025-07-30 16:52:15
233 | 232,7,Intelligent Metal Cheese,Effertz - Gutkowski,tablet,Sustineo aiunt thermae.,2025-08-26 04:50:55
234 | 233,1,Rustic Gold Hat,Shields - Keeling,bottle,Omnis paens viriliter debeo vinculum ubi audeo urbanus commemoro.,2026-01-01 05:39:09
235 | 234,8,Licensed Marble Towels,Feest Inc,vial,Apto accusamus ago tempore calcar vinum.,2025-02-01 06:02:44
236 | 235,3,Ergonomic Rubber Salad,Quigley - Klocko,tablet,Aperio aro cunctatio.,2025-05-18 12:45:15
237 | 236,8,Incredible Cotton Pants,VonRueden - Heathcote,box,Toties derelinquo teres.,2025-03-22 11:26:07
238 | 237,2,Electronic Marble Table,Macejkovic - Gerhold,bottle,Patria harum territo urbanus virgo.,2025-02-05 13:14:03
239 | 238,2,Licensed Steel Computer,Collins Inc,bottle,Quam defleo soluta sed tutamen depereo laboriosam averto.,2025-09-04 22:27:12
240 | 239,4,Unbranded Rubber Fish,Connelly Inc,box,Corona attollo nostrum sonitus provident audax aperiam subito.,2025-04-02 04:20:20
241 | 240,7,Refined Plastic Soap,Schulist Inc,bottle,Sunt vulgivagus crur bos concido corroboro aliqua sunt.,2025-02-19 04:20:38
242 | 241,10,Incredible Bronze Chair,Conn - Morar,box,Coadunatio adficio socius sortitus accusamus possimus caecus suscipio cena consuasor.,2025-05-20 18:30:04
243 | 242,9,Intelligent Bronze Fish,"Runolfsson, Buckridge and Kautzer",box,Bibo volaticus vitae studio adflicto timidus aeneus nobis una.,2025-04-04 12:13:04
244 | 243,1,Modern Steel Chicken,"Bartell, Halvorson and Marquardt",bottle,Vorax ventosus numquam tumultus contigo.,2025-06-20 15:10:14
245 | 244,10,Bespoke Metal Table,Emmerich Group,vial,Ipsa peior succedo conicio demonstro corrupti.,2025-10-14 13:28:16
246 | 245,4,Fresh Bronze Hat,Howe LLC,bottle,Ter demens temperantia confero totam.,2025-04-05 09:31:05
247 | 246,2,Small Cotton Towels,Koch and Sons,bottle,Conculco aegrotatio fuga.,2026-01-13 00:17:03
248 | 247,5,Modern Metal Keyboard,Price Group,vial,Vomito adsuesco vaco cernuus votum timidus asporto peccatus.,2025-10-02 01:52:40
249 | 248,8,Small Wooden Bike,Dibbert - Swaniawski,box,Soluta triumphus deludo utor titulus incidunt.,2025-10-06 18:05:44
250 | 249,6,Luxurious Ceramic Tuna,Weimann - Kilback,box,Corpus mollitia cunae recusandae dolorem substantia coaegresco antepono aureus tepidus.,2025-04-11 23:41:44
251 | 250,5,Tasty Metal Tuna,Stroman - Padberg,box,Barba desipio peior compello aufero succurro.,2025-05-27 22:48:22
252 | 251,2,Recycled Aluminum Chair,Berge Inc,vial,Curo comes sono bonus enim audax.,2025-05-01 06:52:06
253 | 252,5,Ergonomic Marble Cheese,Hickle Inc,box,Cunctatio cauda velociter cohaero illum corrigo.,2025-11-28 13:32:59
254 | 253,7,Handcrafted Plastic Tuna,Turcotte - Moore,vial,Cotidie temporibus constans vinum deinde.,2025-03-13 03:58:32
255 | 254,5,Licensed Marble Bike,Herzog Inc,tablet,Libero tamquam defungo.,2025-10-25 07:00:19
256 | 255,4,Electronic Granite Car,Trantow - Hills,box,Virga sapiente uredo alius animadverto vito laborum sumptus.,2025-07-28 23:42:33
257 | 256,10,Tasty Marble Towels,Barton - Medhurst,tablet,Demo veritas verumtamen commodi studio clam contra in.,2025-09-24 11:47:04
258 | 257,2,Handmade Bamboo Soap,"Rau, Ryan and Waters",vial,Tergiversatio temporibus solio ut audeo.,2025-06-06 16:20:39
259 | 258,2,Oriental Plastic Pants,Trantow and Sons,bottle,Tremo perferendis pel.,2025-03-19 06:50:10
260 | 259,8,Ergonomic Gold Chicken,Little and Sons,bottle,Avaritia tantum xiphias vilis comis.,2026-01-18 09:01:27
261 | 260,2,Incredible Aluminum Bike,Volkman and Sons,vial,Cras assumenda altus amo angustus abundans.,2025-06-20 05:06:13
262 | 261,5,Sleek Marble Shoes,"Leuschke, Runolfsdottir and White",vial,Verecundia despecto contigo ut caveo auctor teneo vos.,2025-06-20 04:00:35
263 | 262,8,Licensed Rubber Hat,Dickens - Mills,bottle,Casso stips beatae denego conicio comprehendo clam atque defaeco.,2025-09-20 14:20:46
264 | 263,1,Luxurious Gold Keyboard,"Grimes, Murray and Gorczany",bottle,Porro vere aequus sopor charisma campana artificiose argentum bibo umbra.,2025-09-03 13:48:10
265 | 264,7,Recycled Rubber Salad,Jakubowski - Brown,vial,Succedo laborum terra validus summisse.,2025-08-24 19:53:20
266 | 265,10,Generic Plastic Pants,"Boyer, Botsford and Gerhold",box,Patruus tenuis beatae.,2025-07-02 07:11:44
267 | 266,6,Frozen Bamboo Pizza,Bailey - Stracke,tablet,Adstringo atrox super cras harum abbas.,2025-10-28 20:04:59
268 | 267,4,Elegant Gold Shoes,"Berge, Hettinger and Williamson",tablet,Debilito sui timidus consequatur conforto defero confero.,2025-09-01 00:51:03
269 | 268,10,Handmade Silk Computer,"Abshire, Muller and Herzog",vial,Curriculum eveniet vacuus error voluptatibus caries dicta confero.,2026-01-13 07:45:14
270 | 269,6,Fantastic Ceramic Computer,Witting LLC,tablet,Angulus calamitas bibo torqueo.,2025-10-01 09:55:04
271 | 270,3,Soft Steel Fish,Bosco - Swaniawski,box,Cubitum dens suspendo tenetur terebro blandior.,2025-04-16 18:21:51
272 | 271,9,Ergonomic Plastic Chips,Treutel - Bernier,bottle,Basium unde veniam desino callide utrimque.,2025-10-20 04:06:47
273 | 272,1,Sleek Bronze Towels,O'Hara and Sons,vial,Vir conscendo advenio studio eligendi curso.,2025-12-02 05:30:03
274 | 273,10,Gorgeous Cotton Shirt,"Dibbert, Hettinger and Schaden",box,Depopulo verbera cunctatio.,2025-09-02 04:15:35
275 | 274,4,Soft Granite Gloves,Hamill Group,vial,Sursum conatus adinventitias patruus.,2025-09-25 18:35:49
276 | 275,3,Unbranded Plastic Table,Langworth LLC,tablet,Deinde utrum viriliter.,2025-11-02 05:10:11
277 | 276,4,Frozen Rubber Shirt,"Schroeder, Boehm and Thompson",vial,Benevolentia corpus sed pariatur adhuc bellicus ambitus umquam depulso.,2025-08-03 20:58:57
278 | 277,2,,"Kilback, Hermiston and Balistreri",vial,Canonicus labore officiis cavus cometes conforto deleo casus dens.,2025-02-06 00:11:15
279 | 278,2,Handmade Bamboo Chips,"Hahn, Gorczany and Nolan",box,Tero vulgaris vir textus cotidie aeneus.,2025-05-09 14:33:57
280 | 279,7,Bespoke Wooden Computer,Mills LLC,tablet,Calco tersus angulus demulceo stabilis angustus velum vigor stabilis.,2025-04-23 10:10:29
281 | 280,10,Frozen Aluminum Soap,Schultz - Swaniawski,tablet,Viscus sequi acer atavus varius debitis desolo torrens tantum vigor.,2025-03-28 02:27:19
282 | 281,2,Small Concrete Soap,"White, Heidenreich and Heaney",box,Aiunt trans conculco consuasor abstergo.,2026-01-02 00:28:38
283 | 282,6,Gorgeous Cotton Salad,Lueilwitz - Price,box,Totidem careo congregatio arbustum.,2025-09-19 01:03:46
284 | 283,1,Small Plastic Hat,"Spencer, Fadel and Torp",vial,Alo timor socius thymum.,2025-07-22 06:31:20
285 | 284,3,Tasty Marble Pants,Beer - Hyatt,bottle,Autem aggero conor amplus patruus bellum alo non.,2025-05-07 00:03:44
286 | 285,6,Electronic Plastic Sausages,Stracke Group,tablet,Vix succedo audax succurro credo theca vis.,2025-04-15 19:02:39
287 | 286,8,Practical Concrete Table,Boehm and Sons,bottle,Suffragium desino similique.,2025-02-07 01:26:24
288 | 287,8,Awesome Marble Hat,VonRueden - Hane,vial,Vulgus speciosus angustus caveo demoror deorsum eos temeritas degero culpa.,2025-06-16 16:18:26
289 | 288,7,Small Gold Table,McClure - D'Amore,vial,Tum quia ait supellex crinis patrocinor credo labore bibo.,2025-10-20 17:41:56
290 | 289,7,Refined Cotton Shirt,Sporer LLC,bottle,Avaritia dolorem soluta vesica tepidus contabesco veritatis fugit aequus vilitas.,2025-12-22 11:33:23
291 | 290,4,Rustic Ceramic Keyboard,Wiegand - Oberbrunner,bottle,Voluptatum ater fugiat aureus alii tersus solus tempora caste.,2025-02-22 06:47:15
292 | 291,5,Licensed Plastic Gloves,"Leannon, Von and Jaskolski",box,Concido deporto degusto deserunt amo caveo subito complectus canis.,2025-12-05 00:12:58
293 | 292,6,Handmade Bronze Bike,"Mann, Rosenbaum and Sporer",tablet,Curis avarus alius taceo tamquam esse.,2025-09-09 09:43:42
294 | 293,1,Modern Bamboo Shirt,Rodriguez - Wehner,vial,Utrimque calculus viridis umerus adicio crur.,2025-03-15 04:03:10
295 | 294,3,Electronic Metal Pizza,"Fisher, Fadel and Klein",bottle,Avaritia quam ademptio celebrer crapula clam antiquus.,2025-04-05 01:58:10
296 | 295,8,Fresh Wooden Tuna,Spinka LLC,bottle,Ventosus coruscus conforto tantum tantillus admitto damno stipes somnus.,2025-11-15 07:53:09
297 | 296,4,Modern Bamboo Car,Bernhard - Leannon,box,Tempus spero trepide decerno terreo vulgo degero.,2025-10-09 21:35:08
298 | 297,5,Rustic Marble Pants,Wilderman Inc,bottle,Cavus cibus voluptates aureus tandem ocer crastinus defendo ater sapiente.,2025-04-09 04:27:04
299 | 298,1,Handcrafted Plastic Shirt,Ondricka Group,bottle,Conforto tamquam urbs aro utrum attero.,2025-10-25 12:26:45
300 | 299,5,Modern Plastic Bacon,Smitham and Sons,box,Aeger paulatim excepturi abduco tertius volubilis contabesco tamisium basium usitas.,2025-09-13 20:10:37
301 | 300,7,Soft Cotton Pants,McLaughlin and Sons,tablet,Optio terra argumentum cuppedia ad crebro acer subiungo.,2025-05-03 05:37:23
302 | 301,5,Oriental Plastic Hat,Bechtelar - Swaniawski,bottle,Victus defluo doloribus alius quasi summisse sollers corrupti denique.,2025-02-16 14:21:19
303 | 302,6,Generic Bamboo Car,Kilback - Greenholt,bottle,Suffoco colo adnuo.,2025-06-02 04:53:31
304 | 303,2,Small Gold Pizza,Stamm Inc,bottle,Atqui attollo cunabula compello supra amissio impedit acerbitas apud.,2025-03-04 06:42:54
305 | 304,9,Oriental Wooden Bacon,"Lang, Ziemann and Hettinger",vial,Utpote tametsi suffragium cupressus esse torrens.,2025-08-07 01:00:42
306 | 305,10,Gorgeous Plastic Cheese,Emmerich - Olson,bottle,Conscendo veritatis caput demonstro territo cenaculum desino enim territo defetiscor.,2025-10-29 01:21:40
307 | 306,2,Recycled Aluminum Towels,Jenkins - Gislason,tablet,Annus patruus candidus desidero cimentarius.,2025-01-30 03:50:10
308 | 307,3,Practical Marble Towels,Dickens - Altenwerth,bottle,Degenero correptius compono.,2025-12-04 05:47:59
309 | 308,10,Soft Silk Mouse,Flatley - Luettgen,vial,Bellicus curis sit apud umerus.,2025-12-29 23:06:00
310 | 309,1,Recycled Metal Hat,"Koelpin, Parisian and Simonis",bottle,Vilicus caste apparatus rerum vereor.,2025-02-12 08:57:09
311 | 310,10,Fantastic Rubber Tuna,Rempel Group,tablet,Denuo laboriosam testimonium bellum sonitus maxime.,2025-11-05 14:06:02
312 | 311,1,Handcrafted Wooden Shirt,Conn - Nienow,bottle,Ducimus teres tutamen aureus civis appello pariatur qui coadunatio.,2025-11-14 03:34:14
313 | 312,8,Recycled Bronze Gloves,"Treutel, Klocko and Tremblay",box,Ademptio cariosus solus verecundia defetiscor conscendo.,2025-05-08 01:06:53
314 | 313,8,Fresh Bamboo Chicken,"Senger, Weimann and Murazik",vial,Vere artificiose sto clam arx virga.,2025-03-16 12:24:20
315 | 314,8,Intelligent Silk Hat,"Lemke, Prohaska and Wunsch",box,Molestias tenetur currus ulterius.,2025-04-04 00:27:44
316 | 315,6,Fantastic Gold Shoes,Hyatt - Trantow,blanditiis,Tamen eligendi catena arbustum corroboro conduco non vae odit theca.,2025-12-08 07:02:00
317 | 316,9,Small Ceramic Towels,"Luettgen, Connelly and Rodriguez",box,Congregatio aptus sublime acies caecus denuo sponte ago.,2025-05-09 16:47:16
318 | 317,2,Awesome Bronze Tuna,"Nader, Altenwerth and Hand",vial,Demo despecto claustrum delectus utpote arcus communis pariatur strenuus.,2025-04-11 19:32:31
319 | 318,10,Handmade Wooden Keyboard,"Hagenes, Kulas and Renner",vial,Balbus thymbra arcesso cursus.,2025-08-05 13:19:40
320 | 319,9,Handcrafted Wooden Hat,"Maggio, Johnson and Hauck",box,Barba defendo curatio cruciamentum venustas temeritas peior.,2025-11-17 20:54:05
321 | 320,8,Soft Granite Pants,Lebsack - Pfeffer,vial,Benigne sapiente solvo approbo non tamen.,2026-01-11 02:13:38
322 | 321,9,Tasty Silk Chair,Walker Group,box,Aduro denuncio nihil vae spiculum adamo summa defessus voluptate.,2025-06-03 14:08:21
323 | 322,9,Fresh Marble Gloves,"Gulgowski, Bruen and Braun",bottle,Stipes vestrum teres consequatur arca soluta itaque cinis.,2025-08-14 09:41:06
324 | 323,5,Modern Granite Salad,"Kuphal, Leannon and Graham",bottle,Necessitatibus distinctio utor arto vitium thesis cribro.,2025-02-07 04:29:27
325 | 324,9,,Murray - Mueller,tablet,Cubitum culpo copia tibi dignissimos.,2025-06-02 05:02:11
326 | 325,2,Oriental Gold Salad,Schroeder - Gorczany,tablet,Cenaculum vulgo praesentium sed alter odio cubicularis.,2026-01-19 00:17:01
327 | 326,3,Frozen Wooden Tuna,Lubowitz LLC,box,Vindico certus desipio praesentium depono aspernatur subiungo cervus cedo.,2025-11-13 00:39:33
328 | 327,3,Handmade Cotton Soap,Cruickshank - Cole,tablet,Depereo suppellex testimonium vilitas derelinquo.,2025-11-17 19:05:42
329 | 328,6,Gorgeous Granite Chips,Keeling and Sons,box,Bonus eveniet apparatus dolorum.,2025-07-15 07:26:21
330 | 329,1,Practical Bamboo Shoes,Cremin Group,vial,Doloremque absens molestiae quasi considero texo bonus canis summisse anser.,2025-07-29 15:58:32
331 | 330,2,Soft Concrete Gloves,Bayer Inc,vial,Adficio quam conturbo corrigo.,2025-03-18 01:05:36
332 | 331,10,Recycled Wooden Keyboard,Howell Inc,box,Expedita velum quidem denuo tribuo conitor ipsam cribro sublime teres.,2025-12-29 08:05:12
333 | 332,9,Oriental Rubber Towels,Zboncak - Nolan,tablet,Ventus tabgo adaugeo sufficio defaeco solum.,2025-06-05 21:40:50
334 | 333,8,Practical Steel Chips,West Inc,bottle,Conspergo sapiente utrimque thymum.,2025-02-04 13:12:17
335 | 334,4,Fresh Ceramic Table,"Cummerata, Kris and Aufderhar",tablet,Crudelis delinquo vehemens vulticulus sulum crapula theca basium tener.,2025-06-10 23:08:54
336 | 335,7,Fresh Silk Fish,"Sanford, Gerlach and Hickle",tablet,Pectus abutor talus bibo saepe.,2025-02-09 07:32:13
337 | 336,5,Licensed Wooden Pizza,Maggio Inc,bottle,Apostolus caveo aegrus tamquam tepesco charisma volubilis coruscus.,2025-11-25 09:45:46
338 | 337,2,Sleek Steel Towels,Wiza - Bayer,bottle,Peior aduro cupressus.,2025-08-07 21:35:57
339 | 338,2,Rustic Granite Pants,Hermiston Inc,tablet,Tantum candidus calculus denuo astrum denego thesaurus.,2025-08-20 12:51:51
340 | 339,3,Handmade Concrete Computer,Haag - Becker,bottle,Caelestis asperiores viscus umquam adeo.,2025-02-11 21:45:03
341 | 340,3,Rustic Ceramic Chair,"Gottlieb, Torphy and Larson",bottle,Audacia argentum comedo pecto repudiandae stultus sed.,2025-06-15 06:40:48
342 | 341,3,Small Plastic Chips,"Mueller, Metz and Glover",alioqui,Ultio turpis soleo comis suasoria vulariter contabesco agnitio sollers cuius.,2025-06-14 22:01:58
343 | 342,7,Small Bamboo Tuna,Ratke Group,tablet,Quasi ago aeternus defungo voluptatem curatio sint aegrotatio quas thesaurus.,2025-07-08 09:22:46
344 | 343,7,Generic Rubber Bacon,Ullrich - Prosacco,vial,Ultio accusamus comprehendo ducimus deserunt turpis enim cometes arguo dicta.,2025-05-18 05:54:44
345 | 344,3,Luxurious Granite Chicken,Hickle Inc,bottle,Tenuis adipisci sortitus paulatim.,2025-10-27 23:45:13
346 | 345,8,Luxurious Ceramic Fish,Stark Group,tablet,Curvo cuppedia suffoco vivo denique patruus nemo utique suscipit.,2025-07-05 00:26:48
347 | 346,8,Luxurious Marble Bike,"Lind, Bogan and Pfeffer",tablet,Abundans deporto ver absconditus.,2025-08-19 11:13:23
348 | 347,4,Tasty Ceramic Cheese,Stokes - Swaniawski,tablet,Defaeco adiuvo colligo taceo copia amor surculus vobis capitulus.,2025-06-27 23:21:54
349 | 348,4,Handcrafted Marble Chair,Jerde - Nitzsche,tablet,Validus a textilis textor molestiae cunae.,2025-07-28 02:01:57
350 | 349,2,Frozen Cotton Towels,Terry - Buckridge,vial,Tam solus mollitia statim aut.,2025-05-27 00:15:07
351 | 350,5,Small Cotton Hat,Morar Group,box,Conturbo vomica comes eius adulatio tamen asporto velociter bis.,2025-09-06 17:37:26
352 | 351,2,Recycled Aluminum Tuna,Sawayn - Gorczany,box,Brevis aduro cunae.,2025-11-25 01:18:15
353 | 352,2,Handcrafted Metal Sausages,Smith - Spinka,vial,Certus validus velum tristis tamen cedo.,2025-03-01 22:00:45
354 | 353,7,Recycled Silk Hat,"Hartmann, Bogisich and Thiel",box,Admiratio cernuus nam valde sol contabesco.,2025-06-07 02:31:05
355 | 354,1,Bespoke Metal Fish,Kertzmann - Friesen,vial,Super verbum conservo via vehemens aliquam contra damnatio.,2025-04-20 08:33:53
356 | 355,3,Ergonomic Silk Mouse,"Kuhn, Satterfield and Walsh",bottle,Labore aer acer adsidue censura amo teneo consuasor accusamus caute.,2025-04-02 19:05:08
357 | 356,10,Fantastic Granite Gloves,Turner Inc,bottle,Expedita adiuvo delibero urbs decens tantillus.,2025-06-21 05:19:12
358 | 357,6,Ergonomic Steel Sausages,Kihn Inc,vial,Facere tribuo adicio arcesso atrox reprehenderit.,2025-04-07 15:18:04
359 | 358,7,Bespoke Bamboo Gloves,Mohr - Dach,box,Neque tepesco atrox ipsam agnosco nobis vapulus.,2025-10-13 02:51:02
360 | 359,3,Recycled Metal Sausages,Bogisich - Legros,bottle,Inventore doloribus qui victus allatus approbo subiungo aequus adulatio.,2025-06-04 12:09:15
361 | 360,9,,Kunde and Sons,vial,Tabgo uterque territo tempore adulescens temporibus distinctio quibusdam spectaculum volup.,2025-06-19 13:09:13
362 | 361,7,Soft Plastic Shirt,Mayert LLC,bottle,Depono ascit caput.,2025-04-27 06:46:01
363 | 362,9,Fantastic Bronze Salad,Johnson - Bruen,vial,Copiose triduana capio audio coepi crur.,2025-09-27 10:56:03
364 | 363,7,Refined Granite Table,Heidenreich - Schuppe,bottle,Terra tempora victus denique velum cursus caste clam.,2025-08-29 06:29:42
365 | 364,6,Licensed Cotton Ball,Hackett - Mante,tablet,Theatrum derideo arcesso angustus totam fugiat conscendo ipsa.,2025-01-26 23:14:37
366 | 365,6,Licensed Plastic Tuna,Wiza - Mitchell,bottle,Quae dolor depromo advenio concedo vesica adfero facilis sonitus.,2025-09-28 00:54:22
367 | 366,2,Intelligent Plastic Chicken,Littel LLC,box,Soleo dolorum approbo vere qui accedo fuga benigne cruentus.,2025-03-27 23:16:21
368 | 367,7,Licensed Bronze Ball,Reichel LLC,box,Deporto venustas subseco assumenda spectaculum dedico dolor.,2025-03-24 18:28:28
369 | 368,1,Tasty Granite Bacon,"Aufderhar, Abbott and Feil",box,Ante unus cubitum.,2025-04-22 03:02:28
370 | 369,9,Intelligent Ceramic Salad,Hilll Group,tablet,Cubitum ratione cervus.,2025-02-10 17:26:18
371 | 370,6,Ergonomic Ceramic Chips,Kunde and Sons,tablet,Nam solutio cetera itaque caries conturbo argumentum campana bene.,2025-05-02 04:11:52
372 | 371,9,Fantastic Steel Keyboard,Runolfsson - Dietrich,vial,Decumbo utilis advoco assumenda aedificium capio derelinquo deserunt.,2025-02-16 02:16:10
373 | 372,1,Unbranded Wooden Fish,Jaskolski - Hilll,box,Conatus volup strenuus.,2025-02-13 00:02:00
374 | 373,3,Ergonomic Gold Car,Kohler - Ankunding,vial,Mollitia conculco deficio.,2025-12-21 00:24:36
375 | 374,8,Rustic Cotton Chicken,"Bechtelar, Brakus and Luettgen",box,Apud trepide adeo aequus cetera demo adhaero cumque sperno.,2025-03-15 11:34:15
376 | 375,7,Oriental Cotton Pants,"Weissnat, Hane and Roob",vial,Thema video carcer textilis congregatio textor tertius cognomen aro.,2025-05-07 03:05:06
377 | 376,6,Handcrafted Aluminum Ball,Grant Group,bottle,Claudeo voro et animadverto.,2025-02-26 18:57:20
378 | 377,4,Tasty Granite Soap,Beer - Smitham,tablet,Deputo vigilo canto barba desidero cometes cresco.,2025-08-03 07:01:02
379 | 378,3,Modern Bamboo Hat,"Batz, Lang and Parisian",tablet,Tabernus solus cunctatio vigilo cibo.,2026-01-12 00:23:46
380 | 379,1,Soft Concrete Keyboard,Fahey - Swift,bottle,Teres cur reprehenderit cito cupio avaritia tredecim.,2025-11-23 20:01:43
381 | 380,7,Gorgeous Metal Computer,"MacGyver, Greenfelder and Nicolas",box,Nobis temperantia cavus vestrum amet compello civitas credo vado vociferor.,2025-02-16 21:09:37
382 | 381,2,Sleek Bronze Hat,Turner - Jast,bottle,Aliquid amo communis volo.,2025-09-10 23:30:58
383 | 382,7,Rustic Rubber Sausages,Russel Group,tablet,Ter adflicto stipes tribuo absens id aegrus ulterius suscipit.,2026-01-19 08:12:04
384 | 383,4,Modern Marble Computer,Cummings and Sons,bottle,Vivo comprehendo utpote arbustum desidero.,2025-07-30 11:53:26
385 | 384,8,Fantastic Steel Pants,Abbott - Parisian,tablet,Autem aptus terreo sordeo eos cicuta.,2025-02-04 22:57:47
386 | 385,7,Practical Concrete Hat,"Volkman, Mosciski and Ratke",box,Bardus thalassinus ter volutabrum textus ara contigo antiquus tracto omnis.,2025-01-24 03:45:11
387 | 386,6,Fresh Rubber Sausages,"Abbott, Schumm and Hamill",tablet,Saepe dolore crapula inflammatio aliquid statim.,2025-04-24 01:47:29
388 | 387,5,Unbranded Silk Ball,"Sporer, Kovacek and Runolfsdottir",bottle,Alii viscus arx artificiose voluptatum eveniet exercitationem.,2025-11-10 13:54:38
389 | 388,5,Generic Ceramic Shirt,"Hegmann, Wintheiser and Stiedemann",tablet,Bestia centum cur theatrum vulnus.,2025-08-06 04:23:05
390 | 389,2,Ergonomic Marble Shoes,Windler Group,vial,Eveniet varietas dolorum quae.,2025-09-18 18:12:44
391 | 390,3,Small Wooden Chicken,Frami - Feest,vial,Inventore claro curtus arbor cohibeo textor cultura.,2025-07-09 15:50:22
392 | 391,1,Fantastic Wooden Mouse,Denesik - Waters,tablet,Censura vacuus tubineus vinculum crur creber voluptatum crux decumbo.,2025-05-27 06:45:50
393 | 392,3,Handmade Rubber Car,McClure LLC,bottle,Repellat coerceo suasoria tergiversatio tam.,2025-04-02 13:16:01
394 | 393,9,,"Kuhn, Prohaska and Mitchell",certe,Vociferor aliquid civis desidero.,2025-10-29 17:12:14
395 | 394,7,Gorgeous Steel Salad,Breitenberg Inc,vial,Ambulo vicissitudo cornu.,2026-01-02 12:44:10
396 | 395,7,Refined Metal Computer,"Haag, Thompson and Olson",vial,Ulterius caries admitto aliqua.,2025-06-01 03:18:18
397 | 396,5,Awesome Gold Ball,"Strosin, Armstrong and Schulist",box,Venio velum modi circumvenio censura.,2025-12-22 03:24:40
398 | 397,3,Recycled Ceramic Table,"Schuppe, Tremblay and Armstrong",box,Caries decumbo defetiscor adversus centum.,2025-11-21 07:46:56
399 | 398,3,Modern Metal Hat,"Hickle, Muller and Yundt",vial,Vomito deserunt tenax trans alioqui adsuesco.,2025-04-10 01:41:01
400 | 399,10,Electronic Marble Sausages,Kuhlman - Metz,tablet,Aperiam carbo curo curriculum explicabo expedita nesciunt.,2025-03-14 16:14:12
401 | 400,3,Soft Concrete Bike,Prohaska LLC,tablet,Subvenio cupiditate voluptatem aer theatrum aegrotatio id absens.,2025-05-05 14:15:02
402 | 401,10,Bespoke Bamboo Keyboard,Bauch - Spencer,box,Xiphias decipio cubicularis careo unde inventore numquam tonsor tempore.,2025-04-07 01:05:18
403 | 402,3,Incredible Marble Ball,Gutmann LLC,tablet,Ambulo ventito vos argumentum abbas catena concedo uter adversus velociter.,2025-09-03 15:16:34
404 | 403,8,Handmade Wooden Pizza,"Bahringer, Corkery and Jacobs",tablet,Venio decipio admoveo pax taedium templum delectatio trucido.,2025-02-13 20:08:55
405 | 404,10,Frozen Bamboo Ball,Emmerich - Windler,bottle,Thesis cursim adiuvo ullus vir argumentum bellum torqueo theologus decor.,2025-04-14 12:34:35
406 | 405,8,Generic Concrete Towels,Bode - Lakin,box,Veritas defungo timidus ventito speciosus tero curriculum sufficio adnuo.,2025-03-07 12:42:49
407 | 406,10,Gorgeous Granite Sausages,"Swift, Stark and Pfeffer",bottle,Ducimus alienus clementia dignissimos cohaero nisi crepusculum sumo.,2025-12-19 06:50:49
408 | 407,8,Sleek Marble Towels,Swaniawski - Schulist,bottle,Adopto caecus tot amo cursus suspendo subito demo calco.,2025-11-26 22:40:19
409 | 408,4,Unbranded Concrete Keyboard,"Hessel, Nikolaus and Bauch",box,Totus subnecto vulpes decerno appositus voluptas stultus minima chirographum carbo.,2026-01-15 13:50:49
410 | 409,5,Luxurious Ceramic Bacon,"Padberg, Pacocha and Walter",tablet,Cenaculum ex claro turba terreo cubo anser.,2025-01-23 17:36:05
411 | 410,6,Electronic Plastic Sausages,Ruecker - Marvin,bottle,Alveus desolo creber spero solitudo quisquam truculenter defendo.,2025-11-06 20:55:56
412 | 411,3,Rustic Metal Bike,Dare LLC,box,Conspergo paens solutio desipio tenuis contigo dolorum voro temeritas tempora.,2025-06-09 09:14:54
413 | 412,2,Incredible Aluminum Soap,"Stanton, Doyle and Stracke",bottle,Magnam assumenda ubi veniam earum.,2025-01-29 23:27:47
414 | 413,6,Awesome Bronze Cheese,Johns - Stehr,vial,Apparatus sonitus tendo coma.,2025-04-30 11:38:22
415 | 414,5,Gorgeous Bamboo Car,Schowalter - Hartmann,vial,Cuius creo hic thesis ulterius aliqua sollers cupiditas deporto cibus.,2025-08-31 19:22:12
416 | 415,5,Luxurious Cotton Tuna,Thompson LLC,box,Amplus sonitus arcesso defetiscor comminor cuius sui stipes distinctio veritatis.,2025-02-03 07:54:37
417 | 416,3,Luxurious Silk Chips,Prohaska and Sons,tablet,Crepusculum demo accusamus victus crur collum.,2025-12-11 18:53:43
418 | 417,4,Frozen Aluminum Soap,"Sawayn, Halvorson and Tillman",vial,Aurum ipsam clarus catena benigne arguo assumenda debeo stips.,2025-06-05 08:39:18
419 | 418,1,Gorgeous Bamboo Fish,"Lemke, Nienow and Mohr",bottle,Cibus correptius torqueo cuius cohors socius tenetur.,2025-03-02 23:40:02
420 | 419,10,Bespoke Marble Towels,"Ondricka, Swift and Vandervort",box,Dolor appositus paens theca.,2025-09-19 17:30:20
421 | 420,7,Bespoke Bronze Salad,"Wolf, Satterfield and Price",box,Tenuis civis vilitas.,2025-05-20 06:25:23
422 | 421,7,Handcrafted Metal Mouse,Effertz Group,tablet,Tergo facere praesentium ullam pel aiunt.,2025-03-18 05:05:46
423 | 422,9,Elegant Cotton Pants,"Lindgren, Hoppe and Miller",bottle,Cumque veniam verus.,2025-02-01 01:55:24
424 | 423,10,Incredible Marble Pizza,"Harris, Bednar and Morissette",tablet,Cedo sequi tabgo aeternus timidus.,2025-09-23 08:28:57
425 | 424,3,Handcrafted Cotton Keyboard,Tillman - Welch,box,Vel vinco stips aequus.,2025-02-03 05:18:20
426 | 425,1,Tasty Steel Cheese,Cruickshank - Boyer,vial,Tredecim utrimque tantum ullam victoria.,2025-06-13 00:49:21
427 | 426,1,Recycled Aluminum Towels,"Miller, Homenick and Grant",bottle,Censura textor spes abbas tabella summa nobis virtus vinculum.,2025-03-16 14:54:03
428 | 427,8,Oriental Granite Cheese,"Roob, Mraz and Stokes",box,Crapula curso crinis aliquam.,2025-08-19 08:41:03
429 | 428,7,Practical Silk Car,Pfeffer Group,tablet,Adhuc vulnero ab molestiae adficio.,2025-04-12 11:58:54
430 | 429,10,Modern Gold Sausages,Klocko LLC,bottle,Asper vilicus creptio verumtamen aetas.,2025-09-13 14:35:46
431 | 430,5,Licensed Wooden Cheese,"Dibbert, Littel and Thompson",vial,Arca ulciscor tripudio usitas suscipit laboriosam.,2025-02-05 23:40:19
432 | 431,3,Practical Plastic Chair,Jones - Hirthe,vial,Nihil currus volup talio tibi cauda arguo thesaurus spiritus aliqua.,2025-10-28 18:38:10
433 | 432,4,Refined Granite Keyboard,Schaden - Schultz,tablet,Creta itaque absum aperte aliqua.,2025-05-05 13:32:50
434 | 433,8,Fresh Bamboo Chips,"Littel, Howell and Aufderhar",box,Balbus vapulus torrens sed careo valens cum capitulus corporis.,2025-04-19 17:57:06
435 | 434,7,Tasty Wooden Pizza,"Powlowski, Ondricka and Deckow",vial,Tricesimus desparatus solum vix.,2025-08-19 22:27:16
436 | 435,3,Sleek Concrete Salad,"O'Reilly, Hoeger and Keeling",box,Brevis compello terebro.,2025-02-13 03:35:18
437 | 436,7,Electronic Steel Mouse,"Boehm, Rohan and Nitzsche",bottle,In inflammatio terror copia surgo talis crebro defendo comparo.,2025-04-27 21:10:15
438 | 437,1,Oriental Ceramic Chips,"Doyle, Kemmer and Cummings",tablet,Tego vere adsum venustas suadeo comminor.,2025-04-06 23:57:21
439 | 438,4,Luxurious Rubber Hat,Bernier - Kuphal,tablet,Tantillus dens vociferor varius.,2025-12-18 10:17:35
440 | 439,3,Practical Silk Salad,Langosh Inc,box,Allatus cubitum defleo stips surgo triduana.,2025-03-16 00:43:27
441 | 440,2,Small Steel Salad,Funk - Metz,vial,Damnatio aeternus acer caelum.,2025-07-04 03:37:30
442 | 441,3,Awesome Concrete Chair,Walker LLC,vial,Ea antea patrocinor barba cavus accusamus eos acsi.,2025-02-12 06:48:39
443 | 442,4,Frozen Bronze Hat,Cassin - Collins,bottle,Accommodo voluptate curiositas calco adulescens adopto eos nobis defetiscor.,2025-01-31 03:08:25
444 | 443,8,Handmade Aluminum Ball,Powlowski LLC,bottle,Carcer alo officia.,2026-01-11 23:16:43
445 | 444,3,Generic Rubber Bacon,Crist - Bogan,bottle,Tener damnatio una.,2025-09-13 05:38:07
446 | 445,8,Luxurious Bamboo Salad,Huels - Prosacco,vial,Ulciscor vobis attollo asper ustilo aperio celer.,2025-08-29 04:39:15
447 | 446,2,Intelligent Steel Pizza,Von and Sons,box,Vinum ulterius aeternus curis triumphus tristis deserunt.,2026-01-03 11:35:58
448 | 447,8,Gorgeous Marble Hat,Kerluke - Leuschke,box,Acer deporto vesper peccatus vinum asper theatrum vigilo vesper.,2025-05-10 02:21:22
449 | 448,5,Oriental Marble Bike,Baumbach and Sons,vial,Coadunatio ubi videlicet thymum.,2025-10-31 18:51:15
450 | 449,8,Bespoke Ceramic Tuna,Toy - Abbott,bottle,Alveus tubineus testimonium.,2025-08-21 02:49:07
451 | 450,4,Sleek Gold Towels,Renner - Ferry,bottle,Tego sollicito tricesimus solus adfectus inflammatio supra vix minima vero.,2025-02-23 22:47:08
452 | 451,5,Licensed Metal Computer,"Larkin, Johnston and Olson",vial,Valeo ratione celo verbera patria incidunt delicate.,2025-05-28 02:07:08
453 | 452,10,Handcrafted Steel Bacon,Jerde Group,bottle,Contego vos aspicio canis cursim corrigo conculco certe cum valetudo.,2025-05-06 17:05:30
454 | 453,2,Fantastic Ceramic Shirt,Pfeffer - Quitzon,bottle,Tui corrupti caelum cursus doloremque tego adimpleo.,2025-11-27 21:10:27
455 | 454,4,Tasty Silk Shirt,"Hauck, Legros and Hauck",box,Sint cultellus stillicidium tempore synagoga vorago abstergo arx amitto.,2025-03-08 09:00:12
456 | 455,1,Fresh Marble Bike,Hills Inc,tablet,Arbustum vomer argentum subiungo alias vix incidunt desolo eos qui.,2025-07-16 21:01:10
457 | 456,4,Luxurious Wooden Pizza,"Roob, Fay and Kilback",bottle,Tabernus blandior infit.,2025-03-23 04:52:27
458 | 457,7,Practical Concrete Soap,Raynor - Thompson,bottle,Caecus ultio volutabrum cupiditate surculus.,2025-07-17 12:26:00
459 | 458,4,Incredible Bronze Computer,"Prosacco, Nienow and Bayer",tablet,Tergiversatio adeo vitium delicate possimus spiculum decerno desipio.,2025-03-13 08:40:44
460 | 459,1,Recycled Concrete Cheese,Ankunding Inc,box,Dolores curtus bis sui nostrum voluptate.,2025-05-14 10:50:44
461 | 460,2,Generic Plastic Hat,"Schuppe, Predovic and Cassin",box,Blandior ultio calcar aveho minus.,2025-09-30 00:04:04
462 | 461,9,Incredible Metal Mouse,Miller and Sons,bottle,Conturbo aurum pel vallum aer ademptio omnis cultellus.,2025-05-03 13:43:40
463 | 462,9,Modern Gold Computer,"Monahan, Borer and Nitzsche",bottle,Aedificium sequi assentator cattus curatio fuga deficio.,2025-05-19 17:01:03
464 | 463,7,Fantastic Granite Pants,Cassin - Connelly,box,Terebro aro vomer.,2025-03-18 18:31:52
465 | 464,6,Luxurious Ceramic Pizza,Brakus - Cormier,bottle,Facere denuncio conduco occaecati amissio alveus traho.,2025-05-22 04:59:55
466 | 465,7,Tasty Granite Chips,"Kris, Glover and Conn",bottle,Adipisci conduco patrocinor tribuo cruciamentum arceo somnus.,2025-07-05 23:27:46
467 | 466,3,Oriental Concrete Computer,Lebsack Group,bottle,Inflammatio patruus arbor depraedor expedita civis alias deporto cognomen decor.,2025-12-21 08:10:50
468 | 467,8,Awesome Ceramic Towels,Von Group,bottle,Abbas creber audeo beatus dens conqueror adeo vinco armarium quis.,2025-10-26 10:09:00
469 | 468,3,Fantastic Granite Bacon,"Larson, Casper and Bogan",tablet,Adulatio thymbra artificiose adduco.,2025-01-29 16:36:49
470 | 469,5,Luxurious Ceramic Keyboard,Borer - Pollich,vial,Centum summopere bardus bibo.,2025-12-31 00:17:16
471 | 470,7,Generic Steel Mouse,Kuhic Group,bottle,Capto cattus maiores cupio possimus.,2025-12-07 14:48:19
472 | 471,1,Sleek Silk Sausages,Marvin - Mohr,box,Casso infit temeritas aestus ocer apostolus cupressus colligo.,2025-09-24 22:12:36
473 | 472,6,Fantastic Silk Car,"Torp, Yost and Senger",tablet,Temporibus distinctio vinitor atavus.,2025-10-23 06:54:26
474 | 473,2,Gorgeous Wooden Sausages,"Lesch, Jacobson and McLaughlin",vial,Facilis tonsor conqueror charisma eaque decens vestrum.,2025-01-22 01:27:20
475 | 474,8,Soft Bamboo Keyboard,Cremin - Mraz,box,Tredecim aperte aegrotatio tamen sed vitium odio.,2025-12-18 22:01:25
476 | 475,8,Handmade Aluminum Computer,"MacGyver, Ullrich and Goodwin",vial,Coma provident cohors turpis cribro statua totidem tergo cursus crastinus.,2025-08-05 00:25:10
477 | 476,9,Awesome Bronze Ball,Mohr - Toy,vial,Confero vomica abduco sustineo vinitor debitis.,2025-03-06 13:03:51
478 | 477,6,Handmade Granite Chicken,"Shanahan, Lehner and Murazik",tablet,Nam cupiditas abduco statua.,2025-02-26 02:45:38
479 | 478,2,Tasty Plastic Cheese,"Legros, Orn and Green",vial,Causa aequitas theatrum.,2025-07-13 19:39:42
480 | 479,4,Intelligent Concrete Sausages,Willms - Franecki,tablet,Vulgus coerceo virgo.,2025-12-26 15:10:50
481 | 480,4,Handcrafted Aluminum Computer,Friesen - Wolff,bottle,Adeptio adipisci conatus tutamen tempus traho acerbitas odit casus acervus.,2025-10-18 20:58:14
482 | 481,4,Ergonomic Rubber Ball,Blick - Larkin,bottle,Arca caelestis subito talio confero vitae sed veniam vicinus acies.,2025-10-08 07:06:12
483 | 482,6,Ergonomic Bronze Soap,Paucek Group,box,Vito utpote concedo porro abstergo ulterius nobis.,2025-04-09 08:38:58
484 | 483,6,Rustic Plastic Ball,Rowe Inc,tablet,Calculus deorsum arguo bellum temptatio stipes arbitro delego.,2025-02-26 09:16:55
485 | 484,2,Awesome Aluminum Towels,"Kuvalis, Wisoky and Huel",box,Conturbo ventito adduco unde voro.,2025-06-05 18:17:15
486 | 485,8,Recycled Steel Chips,"Rowe, Jast and Brakus",vial,Pauper alveus cupiditas aliquam statua demulceo aegrotatio suadeo quaerat.,2025-10-24 18:34:40
487 | 486,2,Sleek Marble Fish,"Batz, Grimes and Rodriguez",vial,Est summisse taceo maxime alter vado.,2025-04-16 02:18:43
488 | 487,2,Modern Bronze Salad,Howell LLC,bottle,Similique vivo aqua officiis sodalitas blandior minus cado defetiscor.,2025-02-19 15:54:02
489 | 488,9,Ergonomic Bamboo Shirt,Keeling - Barrows,tablet,Sumo aureus super amor coepi assumenda solitudo porro decens omnis.,2025-09-02 06:54:05
490 | 489,10,,Haley - Johnson,box,Crastinus officiis illo deduco curatio est cattus terra facilis desparatus.,2025-10-22 13:47:14
491 | 490,8,Elegant Steel Car,Trantow - Gleichner,box,Corrigo adopto delicate surculus vester quod illum advenio.,2025-09-19 07:50:27
492 | 491,2,Fantastic Concrete Bacon,"Funk, Osinski and Marquardt",vial,Unus tenetur aliqua patruus demonstro derideo utpote reiciendis.,2025-06-10 14:17:28
493 | 492,7,Electronic Concrete Pants,Schinner Inc,tablet,Porro nemo strenuus corpus deleo thymbra tergum artificiose aestivus.,2026-01-17 23:58:43
494 | 493,9,Luxurious Wooden Towels,Cassin LLC,tablet,Capillus teneo utor voro consuasor vero minus.,2025-03-16 02:05:07
495 | 494,6,Frozen Granite Hat,Wintheiser - Farrell,vial,Vorago tabernus coepi culpo tamen voluptatem.,2025-03-04 17:59:45
496 | 495,7,Gorgeous Concrete Keyboard,Kovacek LLC,vial,Arma asporto constans astrum.,2025-07-27 04:27:28
497 | 496,9,Recycled Wooden Chicken,Kreiger and Sons,box,Bis creta vinitor vehemens suppellex magnam corrupti voluptatibus inventore.,2025-02-25 13:07:23
498 | 497,6,,Lubowitz LLC,box,Temporibus vallum velit volubilis repellat tracto uredo sed substantia ascisco.,2025-05-23 04:32:31
499 | 498,4,Recycled Aluminum Shirt,Torphy and Sons,bottle,Nulla depraedor virtus nesciunt thorax.,2025-11-03 13:58:22
500 | 499,7,Intelligent Cotton Keyboard,"Cummings, Friesen and Schultz",bottle,Suggero sordeo terminatio dicta color demum currus.,2025-03-25 18:09:49
501 | 500,1,Awesome Ceramic Tuna,Emard Inc,tablet,Vivo peior turba.,2025-11-09 08:02:51

<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:59:26.752Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

The Node.js script has been successfully created and executed. It generates mock data for the SQL Server database schema you provided, including:

- **Branches**: 5 entries
- **Categories**: 10 entries
- **Medicines**: 500 entries with valid units (tablet, vial, bottle, box) and some invalid for 5% bad data
- **Batches**: 2,000 entries (4 per medicine), with expiry dates from 2024-2027, ensuring multiple batches per medicine for FIFO testing
- **Inventory**: 10,000 entries (5 per batch, one for each branch)
- **Pharmacists**: 50 entries (10 per branch)
- **Customers**: 1,000 entries with phone numbers starting with '0' and 10 digits, plus some invalid for bad data
- **Invoices**: 7,000 entries
- **Invoice Details**: Corresponding details for invoices (1-5 items each)

The script includes 5% bad data (e.g., invalid phone lengths, empty names, negative quantities, invalid units) randomly distributed for import testing. All data maintains referential integrity and outputs to separate CSV files as requested.

The CSVs are now available in your workspace directory for use or import into your database.

---

**User:**

[ERROR] You did not use a tool in your previous response! Please retry with a tool use.

# Reminder: Instructions for Tool Use

Tools are invoked using the platform's native tool calling mechanism. Each tool requires specific parameters as defined in the tool descriptions. Refer to the tool definitions provided in your system instructions for the correct parameter structure and usage examples.

Always ensure you provide all required parameters for the tool you wish to use.

# Next Steps

If you have completed the user's task, use the attempt_completion tool.
If you require additional information from the user, use the ask_followup_question tool.
Otherwise, if you have not completed the task and do not need additional information, then proceed with the next step of the task.
(This is an automated message, so do not respond to it conversationally.)
<environment_details>
# VSCode Visible Files
generate_data.js

# VSCode Open Tabs
generate_data.py,generate_data.js

# Current Time
Current time in ISO 8601 UTC format: 2026-01-20T14:59:33.952Z
User time zone: Asia/Saigon, UTC+7:00

# Current Cost
$0.00

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
<model>xai/grok-code-fast-1</model>
<tool_format>native</tool_format>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

[Tool Use: attempt_completion]
Result: The Node.js script has been successfully created and executed. It generates mock data for the SQL Server database schema you provided, including:

- **Branches**: 5 entries
- **Categories**: 10 entries
- **Medicines**: 500 entries with valid units (tablet, vial, bottle, box) and some invalid for 5% bad data
- **Batches**: 2,000 entries (4 per medicine), with expiry dates from 2024-2027, ensuring multiple batches per medicine for FIFO testing
- **Inventory**: 10,000 entries (5 per batch, one for each branch)
- **Pharmacists**: 50 entries (10 per branch)
- **Customers**: 1,000 entries with phone numbers starting with '0' and 10 digits, plus some invalid for bad data
- **Invoices**: 7,000 entries
- **Invoice Details**: Corresponding details for invoices (1-5 items each)

The script includes 5% bad data (e.g., invalid phone lengths, empty names, negative quantities, invalid units) randomly distributed for import testing. All data maintains referential integrity and outputs to separate CSV files as requested.

The CSVs are now available in your workspace directory for use or import into your database.

