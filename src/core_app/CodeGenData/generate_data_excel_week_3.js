const { faker } = require('@faker-js/faker');
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
      address: faker.location.streetAddress(),
      phone_number: '0' + faker.string.numeric(9)
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
    const unit = isBad && Math.random() < 0.5 ? faker.lorem.word() : faker.helpers.arrayElement(UNITS);
    const name = isBad && Math.random() < 0.5 ? '' : faker.commerce.productName();
    medicines.push({
      medicine_id: i + 1,
      category_id: faker.number.int({ min: 1, max: NUM_CATEGORIES }),
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
      const expiryYear = faker.number.int({ min: 2024, max: 2027 });
      const manufacturingDate = faker.date.between({ from: new Date('2020-01-01'), to: new Date('2023-12-31') });
      const expiryDate = faker.date.between({ from: new Date(`${expiryYear}-01-01`), to: new Date(`${expiryYear}-12-31`) });
      batches.push({
        batch_id: batchId++,
        medicine_id: medId,
        batch_number: faker.string.alphanumeric(10).toUpperCase(),
        manufacturing_date: manufacturingDate.toISOString().split('T')[0],
        expiry_date: expiryDate.toISOString().split('T')[0],
        import_price: faker.number.float({ min: 1, max: 100, precision: 0.01 })
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
      const quantity = isBad && Math.random() < 0.5 ? faker.number.int({ min: -100, max: -1 }) : faker.number.int({ min: 0, max: 1000 });
      inventory.push({
        inventory_id: invId++,
        branch_id: branchId,
        batch_id: batch.batch_id,
        quantity: quantity,
        last_updated: faker.date.recent({ days: 1 }).toISOString().slice(0, 19).replace('T', ' ')
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
      full_name: faker.person.fullName(),
      license_number: faker.string.alphanumeric(10),
      username: faker.internet.username(),
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
    const phone = isBad && Math.random() < 0.5 ? faker.phone.number() : '0' + faker.string.numeric(9);
    customers.push({
      customer_id: i + 1,
      full_name: faker.person.fullName(),
      phone_number: phone,
      loyalty_points: faker.number.int({ min: 0, max: 1000 })
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
    const branchId = faker.number.int({ min: 1, max: NUM_BRANCHES });
    const pharmacist = pharmacists.find(p => p.branch_id === branchId);
    const customerId = faker.number.int({ min: 1, max: NUM_CUSTOMERS });
    const saleDate = faker.date.recent({ days: 365 }).toISOString().slice(0, 19).replace('T', ' ');
    invoices.push({
      invoice_id: invId,
      branch_id: branchId,
      pharmacist_id: pharmacist.pharmacist_id,
      customer_id: customerId,
      total_amount: 0, // will calculate
      sale_date: saleDate
    });

    let total = 0;
    const numDetails = faker.number.int({ min: 1, max: 5 });
    for (let d = 0; d < numDetails; d++) {
      const batch = faker.helpers.arrayElement(batches);
      const quantity = faker.number.int({ min: 1, max: 10 });
      const unitPrice = batch.import_price * faker.number.float({ min: 1.1, max: 2.0, precision: 0.01 }); // markup
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