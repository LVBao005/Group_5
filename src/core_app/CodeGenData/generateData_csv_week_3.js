const { faker } = require('@faker-js/faker');
const ExcelJS = require('exceljs');

const units = ['tablet', 'vial', 'bottle', 'box'];

let categories = [];
let medicines = [];
let branches = [];
let batches = [];
let inventory = [];
let invoices = [];
let details = [];

// Generate Categories (10)
for (let i = 1; i <= 10; i++) {
  categories.push({
    id: i,
    name: faker.commerce.department()
  });
}

// Generate Medicines (500)
for (let i = 1; i <= 500; i++) {
  const category_id = faker.number.int({ min: 1, max: 10 });
  const name = faker.commerce.productName();
  const unit = faker.helpers.arrayElement(units);
  medicines.push({
    id: i,
    category_id,
    name,
    unit
  });
}

// Generate Branches (5)
for (let i = 1; i <= 5; i++) {
  branches.push({
    id: i,
    name: `Branch ${i}`,
    address: faker.location.streetAddress()
  });
}

// Generate Batches (2000) - multiple per medicine for FIFO
let batchId = 1;
for (let med of medicines) {
  const numBatches = faker.number.int({ min: 2, max: 5 });
  for (let j = 0; j < numBatches && batchId <= 2000; j++) {
    const expiry_date = faker.date.between({ from: '2024-01-01', to: '2027-12-31' }).toISOString().split('T')[0];
    batches.push({
      id: batchId++,
      medicine_id: med.id,
      batch_number: faker.string.alphanumeric(10),
      expiry_date
    });
  }
  if (batchId > 2000) break;
}

// Generate Inventory (each batch for 5 branches) - 10000 entries
for (let batch of batches) {
  for (let branch of branches) {
    inventory.push({
      id: inventory.length + 1,
      batch_id: batch.id,
      branch_id: branch.id,
      quantity: faker.number.int({ min: 10, max: 1000 })
    });
  }
}

// Generate Invoices (7000)
for (let i = 1; i <= 7000; i++) {
  const customer_phone = '0' + faker.string.numeric(9);
  const invoice_date = faker.date.past({ years: 2 }).toISOString().split('T')[0];
  invoices.push({
    id: i,
    customer_phone,
    invoice_date,
    total_amount: 0
  });
}

// Generate InvoiceDetails - each invoice 1-5 products
let detailId = 1;
for (let inv of invoices) {
  const numDetails = faker.number.int({ min: 1, max: 5 });
  let total = 0;
  for (let k = 0; k < numDetails; k++) {
    const batch = faker.helpers.arrayElement(batches);
    const quantity = faker.number.int({ min: 1, max: 10 });
    const unit_price = faker.number.float({ min: 10, max: 500, precision: 0.01 });
    details.push({
      id: detailId++,
      invoice_id: inv.id,
      batch_id: batch.id,
      quantity,
      unit_price
    });
    total += quantity * unit_price;
  }
  inv.total_amount = total;
}

// Add 5% garbage data
// For medicines: 5% empty names
const numMedErrors = Math.floor(medicines.length * 0.05);
for (let i = 0; i < numMedErrors; i++) {
  const idx = faker.number.int({ min: 0, max: medicines.length - 1 });
  medicines[idx].name = '';
}

// For inventory: 5% negative quantities
const numInvErrors = Math.floor(inventory.length * 0.05);
for (let i = 0; i < numInvErrors; i++) {
  const idx = faker.number.int({ min: 0, max: inventory.length - 1 });
  inventory[idx].quantity = -faker.number.int({ min: 1, max: 100 });
}

// For medicines: 5% invalid units
const invalidUnits = ['pill', 'capsule', 'sachet'];
for (let i = 0; i < numMedErrors; i++) {
  const idx = faker.number.int({ min: 0, max: medicines.length - 1 });
  medicines[idx].unit = faker.helpers.arrayElement(invalidUnits);
}

// For invoices: 5% invalid phones
const numInvPhoneErrors = Math.floor(invoices.length * 0.05);
for (let i = 0; i < numInvPhoneErrors; i++) {
  const idx = faker.number.int({ min: 0, max: invoices.length - 1 });
  const type = faker.helpers.arrayElement(['short', 'long', 'wrong_start']);
  if (type === 'short') invoices[idx].customer_phone = faker.string.numeric(9);
  else if (type === 'long') invoices[idx].customer_phone = faker.string.numeric(11);
  else invoices[idx].customer_phone = '1' + faker.string.numeric(9);
}

// For details: 5% negative quantities
const numDetailErrors = Math.floor(details.length * 0.05);
for (let i = 0; i < numDetailErrors; i++) {
  const idx = faker.number.int({ min: 0, max: details.length - 1 });
  details[idx].quantity = -faker.number.int({ min: 1, max: 10 });
}

// Export to Excel
const workbook = new ExcelJS.Workbook();

// Categories
const catSheet = workbook.addWorksheet('Categories');
catSheet.addRow(['id', 'name']);
categories.forEach(cat => catSheet.addRow([cat.id, cat.name]));

// Medicines
const medSheet = workbook.addWorksheet('Medicines');
medSheet.addRow(['id', 'category_id', 'name', 'unit']);
medicines.forEach(med => medSheet.addRow([med.id, med.category_id, med.name, med.unit]));

// Branches
const branchSheet = workbook.addWorksheet('Branches');
branchSheet.addRow(['id', 'name', 'address']);
branches.forEach(br => branchSheet.addRow([br.id, br.name, br.address]));

// Batches
const batchSheet = workbook.addWorksheet('Batches');
batchSheet.addRow(['id', 'medicine_id', 'batch_number', 'expiry_date']);
batches.forEach(bat => batchSheet.addRow([bat.id, bat.medicine_id, bat.batch_number, bat.expiry_date]));

// Inventory
const invSheet = workbook.addWorksheet('Inventory');
invSheet.addRow(['id', 'batch_id', 'branch_id', 'quantity']);
inventory.forEach(inv => invSheet.addRow([inv.id, inv.batch_id, inv.branch_id, inv.quantity]));

// Invoices
const invcSheet = workbook.addWorksheet('Invoices');
invcSheet.addRow(['id', 'customer_phone', 'invoice_date', 'total_amount']);
invoices.forEach(inv => invcSheet.addRow([inv.id, inv.customer_phone, inv.invoice_date, inv.total_amount]));

// InvoiceDetails
const detailSheet = workbook.addWorksheet('InvoiceDetails');
detailSheet.addRow(['id', 'invoice_id', 'batch_id', 'quantity', 'unit_price']);
details.forEach(det => detailSheet.addRow([det.id, det.invoice_id, det.batch_id, det.quantity, det.unit_price]));

// Save
workbook.xlsx.writeFile('PharmacyData_Full.xlsx').then(() => {
  console.log('Data exported to PharmacyData_Full.xlsx');
}).catch(err => {
  console.error('Error writing file:', err);
});