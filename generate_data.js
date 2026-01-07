const XLSX = require('xlsx');
const { faker } = require('@faker-js/faker');

// Set locale to Vietnamese if needed, but faker has limited locales
faker.locale = 'vi'; // if available

// Helper to format date
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Generate Products
function generateProducts() {
  const categories = ['Thuốc kê đơn', 'Thực phẩm chức năng', 'Thuốc không kê đơn'];
  const units = ['Viên', 'Gói', 'Chai', 'Ống'];
  const products = [];
  for (let i = 1; i <= 100; i++) {
    products.push({
      ProductID: i,
      ProductName: faker.commerce.productName(),
      ActiveIngredient: faker.lorem.words(2),
      BaseUnit: units[Math.floor(Math.random() * units.length)],
      PackingStandard: `${Math.floor(Math.random() * 50) + 1} ${units[Math.floor(Math.random() * units.length)]}/hộp`,
      CategoryID: categories[Math.floor(Math.random() * categories.length)]
    });
  }
  return products;
}

// Generate Batches
function generateBatches() {
  const statuses = ['Đang bán', 'Chờ hủy', 'Đã hết hạn'];
  const batches = [];
  for (let i = 1; i <= 500; i++) {
    const prodId = Math.floor(Math.random() * 100) + 1;
    const manDate = faker.date.past();
    const expDate = new Date(manDate);
    expDate.setFullYear(expDate.getFullYear() + Math.floor(Math.random() * 3) + 1); // 1-3 years
    batches.push({
      BatchID: i,
      ProductID: prodId,
      Quantity: Math.floor(Math.random() * 1000) + 1,
      ManufacturingDate: formatDate(manDate),
      ExpiryDate: formatDate(expDate),
      ImportDate: formatDate(faker.date.recent()),
      BatchStatus: statuses[Math.floor(Math.random() * statuses.length)]
    });
  }
  return batches;
}

// Generate Customers
function generateCustomers() {
  const levels = ['Đồng', 'Bạc', 'Vàng', 'Kim cương'];
  const customers = [];
  for (let i = 1; i <= 2000; i++) {
    customers.push({
      CustomerID: i,
      FullName: faker.person.fullName(),
      PhoneNumber: faker.phone.number(),
      MembershipLevel: levels[Math.floor(Math.random() * levels.length)],
      TotalPoints: Math.floor(Math.random() * 10000),
      MedicalHistory: Math.random() > 0.5 ? faker.lorem.sentences(2) : ''
    });
  }
  return customers;
}

// Generate Pharmacists
function generatePharmacists() {
  const shifts = ['Sáng', 'Chiều', 'Đêm'];
  const locations = ['Chi nhánh A', 'Chi nhánh B', 'Chi nhánh C', 'Chi nhánh D', 'Chi nhánh E'];
  const pharmacists = [];
  for (let i = 1; i <= 50; i++) {
    pharmacists.push({
      PharmacistID: i,
      FullName: faker.person.fullName(),
      LicenseNumber: faker.string.numeric(8),
      StoreLocation: locations[Math.floor(Math.random() * locations.length)],
      Shift: shifts[Math.floor(Math.random() * shifts.length)]
    });
  }
  return pharmacists;
}

// Generate Invoices
function generateInvoices() {
  const methods = ['Tiền mặt', 'Thẻ', 'Chuyển khoản'];
  const invoices = [];
  for (let i = 1; i <= 2000; i++) {
    invoices.push({
      InvoiceID: i,
      CustomerID: Math.floor(Math.random() * 2000) + 1,
      PharmacistID: Math.floor(Math.random() * 50) + 1,
      CreatedDate: formatDate(faker.date.recent()),
      TotalAmount: Math.floor(Math.random() * 500000) + 10000, // VND
      PaymentMethod: methods[Math.floor(Math.random() * methods.length)]
    });
  }
  return invoices;
}

// Generate InvoiceDetails
function generateInvoiceDetails() {
  const details = [];
  for (let i = 1; i <= 10000; i++) {
    const invId = Math.floor(Math.random() * 2000) + 1;
    const prodId = Math.floor(Math.random() * 100) + 1;
    // For batch, ideally filter by product, but for simplicity, random
    const batchId = Math.floor(Math.random() * 500) + 1;
    details.push({
      DetailID: i,
      InvoiceID: invId,
      ProductID: prodId,
      BatchID: batchId,
      QuantitySold: Math.floor(Math.random() * 10) + 1,
      UnitPrice: Math.floor(Math.random() * 50000) + 5000
    });
  }
  return details;
}

// Main
const products = generateProducts();
const batches = generateBatches();
const customers = generateCustomers();
const pharmacists = generatePharmacists();
const invoices = generateInvoices();
const invoiceDetails = generateInvoiceDetails();

// Create workbook
const wb = XLSX.utils.book_new();

// Add sheets
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(products), 'Products');
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(batches), 'Batches');
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(customers), 'Customers');
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pharmacists), 'Pharmacists');
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invoices), 'Invoices');
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invoiceDetails), 'InvoiceDetails');

// Write file
XLSX.writeFile(wb, 'pharmacy_data.xlsx');

console.log('Excel file generated: pharmacy_data.xlsx');