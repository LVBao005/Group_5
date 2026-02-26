
import { faker } from 'https://esm.sh/@faker-js/faker@8.4.1';
import { 
  Branch, Category, Medicine, Pharmacist, Batch, 
  Inventory, Invoice, InvoiceDetail, Customer 
} from '../types';

const roundToStep = (num: number, step: number = 1000) => Math.round(num / step) * step;

export class PharmacyDataGenerator {
  branches: Branch[] = [];
  categories: Category[] = [];
  medicines: Medicine[] = [];
  pharmacists: Pharmacist[] = [];
  customers: Customer[] = [];
  batches: Batch[] = [];
  inventory: Inventory[] = [];
  invoices: Invoice[] = [];
  invoiceDetails: InvoiceDetail[] = [];

  generateAll(invoiceCount: number = 4000) {
    this.generateMasterData();
    this.generateOperationData(invoiceCount);
    return {
      branches: this.branches,
      categories: this.categories,
      medicines: this.medicines,
      pharmacists: this.pharmacists,
      customers: this.customers,
      batches: this.batches,
      inventory: this.inventory,
      invoices: this.invoices,
      invoiceDetails: this.invoiceDetails
    };
  }

  private generateMasterData() {
    this.branches = ['An Khang Q1', 'Long Châu BT', 'Pharmacity TD', 'Pharmacy++ GV', 'Số 5 TB'].map((name, i) => ({
      branch_id: i + 1,
      branch_name: `Nhà thuốc ${name}`,
      address: faker.location.streetAddress(),
      phone_number: '0' + faker.string.numeric(9)
    }));

    this.categories = ['Hạ sốt', 'Giảm đau', 'Kháng sinh', 'Tiêu hóa', 'Thực phẩm chức năng'].map((name, i) => ({
      category_id: i + 1,
      category_name: name
    }));

    const realMedicines = [
      { cat: 1, name: 'Hapacol 650mg', brand: 'Hậu Giang', conv: 50, price: 45000 },
      { cat: 1, name: 'Panadol Trẻ Em (Vỉ)', brand: 'GSK', conv: 12, price: 32000 },
      { cat: 1, name: 'Efferalgan 500mg', brand: 'UPSA', conv: 16, price: 65000 },
      { cat: 1, name: 'Tylenol 500mg', brand: 'J&J', conv: 100, price: 125000 },
      { cat: 1, name: 'Sotstop 250mg (Viên)', brand: 'Hậu Giang', conv: 24, price: 58000 },
      { cat: 1, name: 'Paracetamol HG 500mg', brand: 'Hậu Giang', conv: 100, price: 65000 },
      { cat: 1, name: 'Sara 500mg', brand: 'Thai Nakorn', conv: 100, price: 85000 },
      { cat: 1, name: 'Hapacol Sủi 150mg', brand: 'Hậu Giang', conv: 24, price: 48000 },
      { cat: 1, name: 'Panadol Extra', brand: 'GSK', conv: 120, price: 195000 },
      { cat: 1, name: 'Efferalgan Codeine', brand: 'UPSA', conv: 10, price: 85000 },
      { cat: 2, name: 'Alaxan Forte', brand: 'United Pharma', conv: 100, price: 115000 },
      { cat: 2, name: 'Mobic 7.5mg', brand: 'Boehringer', conv: 20, price: 185000 },
      { cat: 2, name: 'Diclofenac 50mg', brand: 'Pymepharco', conv: 100, price: 45000 },
      { cat: 2, name: 'Celecoxib 200mg', brand: 'Hậu Giang', conv: 30, price: 75000 },
      { cat: 2, name: 'Voltaren 50mg', brand: 'Novartis', conv: 30, price: 210000 },
      { cat: 2, name: 'Gofen 400', brand: 'Mega We Care', conv: 60, price: 225000 },
      { cat: 2, name: 'Aspirin 81mg', brand: 'Domesco', conv: 100, price: 35000 },
      { cat: 2, name: 'Meloxicam 15mg', brand: 'Stada', conv: 20, price: 65000 },
      { cat: 2, name: 'Ibuprofen 400mg', brand: 'Domesco', conv: 30, price: 55000 },
      { cat: 2, name: 'Naproxen 250mg', brand: 'Pymepharco', conv: 20, price: 48000 },
      { cat: 3, name: 'Augmentin 1g', brand: 'GSK', conv: 14, price: 285000 },
      { cat: 3, name: 'Zinnat 500mg', brand: 'GSK', conv: 10, price: 155000 },
      { cat: 3, name: 'Amoxicillin 500mg', brand: 'Imexpharm', conv: 100, price: 85000 },
      { cat: 3, name: 'Klacid 500mg', brand: 'Abbott', conv: 14, price: 420000 },
      { cat: 3, name: 'Cefixime 200mg', brand: 'Cửu Long', conv: 10, price: 75000 },
      { cat: 3, name: 'Azithromycin 500mg', brand: 'Domesco', conv: 30, price: 145000 },
      { cat: 3, name: 'Levofloxacin 500mg', brand: 'Stada', conv: 10, price: 110000 },
      { cat: 3, name: 'Clarithromycin 500mg', brand: 'Pymepharco', conv: 14, price: 165000 },
      { cat: 3, name: 'Ciprofloxacin 500mg', brand: 'Mekophar', conv: 100, price: 145000 },
      { cat: 3, name: 'Cephalexin 500mg', brand: 'Hậu Giang', conv: 100, price: 78000 },
      { cat: 4, name: 'Smecta 3g (Viên)', brand: 'Ipsen', conv: 30, price: 115000 },
      { cat: 4, name: 'Enterogermina Cap', brand: 'Sanofi', conv: 20, price: 175000 },
      { cat: 4, name: 'Maalox Plus', brand: 'Sanofi', conv: 40, price: 55000 },
      { cat: 4, name: 'Phosphalugel Tab', brand: 'Boehringer', conv: 26, price: 105000 },
      { cat: 4, name: 'Motilium-M 10mg', brand: 'Janssen', conv: 100, price: 215000 },
      { cat: 4, name: 'Berberin HG 100mg', brand: 'Mekophar', conv: 100, price: 25000 },
      { cat: 4, name: 'Bio-acimin Gold Cap', brand: 'Việt Đức', conv: 30, price: 155000 },
      { cat: 4, name: 'Lactéol 340mg Cap', brand: 'Hậu Giang', conv: 10, price: 65000 },
      { cat: 4, name: 'Kremil-S Tab', brand: 'United Pharma', conv: 100, price: 98000 },
      { cat: 4, name: 'Nexium 20mg Tab', brand: 'AstraZeneca', conv: 14, price: 320000 },
      { cat: 5, name: 'Enervon-C Tab', brand: 'United Pharma', conv: 30, price: 65000 },
      { cat: 5, name: 'Canxi Corbiere Cap', brand: 'Sanofi', conv: 30, price: 165000 },
      { cat: 5, name: 'Berocca Performance', brand: 'Bayer', conv: 10, price: 95000 },
      { cat: 5, name: 'Omega-3 Nature Made', brand: 'Nature Made', conv: 100, price: 350000 },
      { cat: 5, name: 'Vitamin C 500mg HG', brand: 'Hậu Giang', conv: 100, price: 45000 },
      { cat: 5, name: 'Ginkgo Biloba Mega', brand: 'Mega We Care', conv: 30, price: 115000 },
      { cat: 5, name: 'Biotin 5000mcg NB', brand: 'Nature Bounty', conv: 72, price: 280000 },
      { cat: 5, name: 'Glucosamine Blackmores', brand: 'Blackmores', conv: 180, price: 650000 },
      { cat: 5, name: 'Obimin Multi', brand: 'United Pharma', conv: 30, price: 75000 },
      { cat: 5, name: 'Zinc 15mg Domesco', brand: 'Domesco', conv: 100, price: 85000 }
    ];

    realMedicines.forEach((m, i) => {
      const conversion_rate = Math.max(m.conv, 2);
      const base_sell_price = roundToStep(m.price * 1.25, 1000);
      let sub_sell_price = roundToStep((base_sell_price * 1.35) / conversion_rate, 500);
      while (sub_sell_price * conversion_rate <= base_sell_price) sub_sell_price += 500;

      this.medicines.push({
        medicine_id: i + 1,
        category_id: m.cat,
        name: m.name,
        brand: m.brand,
        base_unit: 'Hộp',
        sub_unit: 'Viên',
        conversion_rate,
        base_sell_price,
        sub_sell_price,
        min_stock_level: 50,
        created_at: '2023-01-01 08:00:00'
      });
    });

    let pId = 1;
    this.branches.forEach(br => {
      for (let i = 1; i <= 2; i++) {
        this.pharmacists.push({
          pharmacist_id: pId++,
          branch_id: br.branch_id,
          username: `user_${br.branch_id}_${i}`,
          password: 'Password123',
          full_name: faker.person.fullName(),
          role: i === 1 ? 'ADMIN' : 'STAFF'
        });
      }
    });

    for (let i = 1; i <= 400; i++) {
      this.customers.push({
        customer_id: i,
        phone_number: '0' + faker.helpers.arrayElement(['9', '3', '7', '8']) + faker.string.numeric(8),
        customer_name: faker.person.fullName(),
        points: faker.number.int({ min: 0, max: 500 })
      });
    }
  }

  private generateOperationData(invoiceCount: number) {
    let bId = 1;
    let invId = 1;

    // Chọn 3 thuốc ngẫu nhiên để làm lô hàng gần hết hạn
    const nearExpiryMeds = faker.helpers.arrayElements(this.medicines, 3).map(m => m.medicine_id);

    this.medicines.forEach(med => {
      // RULE 1: Mỗi thuốc có 1 LÔ TRỐNG (Global Batch) chưa phân phối cho chi nhánh
      const globalMfg = faker.date.past({ years: 1 });
      const globalExp = new Date(globalMfg);
      globalExp.setFullYear(globalExp.getFullYear() + 2);
      const globalInitialQty = faker.number.int({ min: 100, max: 300 }) * med.conversion_rate;

      this.batches.push({
        batch_id: bId++,
        medicine_id: med.medicine_id,
        batch_number: `EMPTY-${med.medicine_id}-${faker.string.alphanumeric(4).toUpperCase()}`,
        manufacturing_date: globalMfg.toISOString().split('T')[0],
        expiry_date: globalExp.toISOString().split('T')[0],
        import_price_package: roundToStep(med.base_sell_price * 0.75, 1000),
        initial_quantity: globalInitialQty,
        current_total_quantity: globalInitialQty, // Chưa phân phối nên current = initial
        import_date: globalMfg.toISOString().slice(0, 19).replace('T', ' ')
      });

      // RULE 2: Mỗi thuốc có ít nhất 1 lô được phân phối cho TẤT CẢ các chi nhánh
      const standardMfg = faker.date.past({ years: 1 });
      const standardExp = new Date(standardMfg);
      standardExp.setFullYear(standardExp.getFullYear() + 2);
      const standardBatchId = bId++;
      const totalBranches = this.branches.length;
      const qtyPerBranch = faker.number.int({ min: 50, max: 100 }) * med.conversion_rate;
      const standardInitialQty = qtyPerBranch * totalBranches + faker.number.int({ min: 10, max: 50 });

      this.branches.forEach(br => {
        this.inventory.push({
          inventory_id: invId++,
          branch_id: br.branch_id,
          batch_id: standardBatchId,
          quantity_std: qtyPerBranch,
          last_updated: standardMfg.toISOString().slice(0, 19).replace('T', ' ')
        });
      });

      this.batches.push({
        batch_id: standardBatchId,
        medicine_id: med.medicine_id,
        batch_number: `STD-${med.medicine_id}-${faker.string.alphanumeric(4).toUpperCase()}`,
        manufacturing_date: standardMfg.toISOString().split('T')[0],
        expiry_date: standardExp.toISOString().split('T')[0],
        import_price_package: roundToStep(med.base_sell_price * 0.78, 1000),
        initial_quantity: standardInitialQty,
        current_total_quantity: standardInitialQty - (qtyPerBranch * totalBranches),
        import_date: standardMfg.toISOString().slice(0, 19).replace('T', ' ')
      });

      // RULE 3: Lô gần hết hạn cho 3 thuốc đặc biệt
      if (nearExpiryMeds.includes(med.medicine_id)) {
        const expiryBatchId = bId++;
        const nearExpiryDate = new Date();
        nearExpiryDate.setMonth(nearExpiryDate.getMonth() + faker.number.int({ min: 1, max: 3 }));
        
        const mfgDate = new Date(nearExpiryDate);
        mfgDate.setFullYear(mfgDate.getFullYear() - 2);

        const expiryInitialQty = 50 * med.conversion_rate;

        // Phân phối lô gần hết hạn này cho ít nhất 2 chi nhánh ngẫu nhiên
        const targetBranches = faker.helpers.arrayElements(this.branches, 2);
        targetBranches.forEach(br => {
            this.inventory.push({
                inventory_id: invId++,
                branch_id: br.branch_id,
                batch_id: expiryBatchId,
                quantity_std: 20 * med.conversion_rate,
                last_updated: mfgDate.toISOString().slice(0, 19).replace('T', ' ')
            });
        });

        this.batches.push({
            batch_id: expiryBatchId,
            medicine_id: med.medicine_id,
            batch_number: `EXP-${med.medicine_id}-${faker.string.alphanumeric(4).toUpperCase()}`,
            manufacturing_date: mfgDate.toISOString().split('T')[0],
            expiry_date: nearExpiryDate.toISOString().split('T')[0],
            import_price_package: roundToStep(med.base_sell_price * 0.70, 1000), // Giá rẻ hơn do sắp hết hạn
            initial_quantity: expiryInitialQty,
            current_total_quantity: expiryInitialQty - (20 * med.conversion_rate * targetBranches.length),
            import_date: mfgDate.toISOString().slice(0, 19).replace('T', ' ')
        });
      }
    });

    // 4000 Hóa đơn
    let detailId = 1;
    for (let i = 1; i <= invoiceCount; i++) {
      const branch = faker.helpers.arrayElement(this.branches);
      const pharmacist = faker.helpers.arrayElement(this.pharmacists.filter(p => p.branch_id === branch.branch_id));
      const customer = faker.datatype.boolean(0.8) ? faker.helpers.arrayElement(this.customers) : null;
      
      const invoiceDate = faker.date.between({ from: '2024-01-01', to: '2025-05-31' }).toISOString().slice(0, 19).replace('T', ' ');
      
      let invoiceTotal = 0;
      const itemsInInvoice = faker.number.int({ min: 1, max: 3 });
      const branchInventory = this.inventory.filter(inv => inv.branch_id === branch.branch_id);
      const chosenInvItems = faker.helpers.arrayElements(branchInventory, { min: Math.min(itemsInInvoice, branchInventory.length), max: Math.min(itemsInInvoice, branchInventory.length) });

      chosenInvItems.forEach(invItem => {
        const batch = this.batches.find(b => b.batch_id === invItem.batch_id)!;
        const med = this.medicines.find(m => m.medicine_id === batch.medicine_id)!;
        
        const sellSubUnit = faker.datatype.boolean(0.7);
        const qtySold = sellSubUnit ? faker.number.int({ min: 5, max: 20 }) : faker.number.int({ min: 1, max: 2 });
        const totalStd = sellSubUnit ? qtySold : (qtySold * med.conversion_rate);
        const unitPrice = sellSubUnit ? med.sub_sell_price : med.base_sell_price;

        this.invoiceDetails.push({
          detail_id: detailId++,
          invoice_id: i,
          batch_id: batch.batch_id,
          unit_sold: sellSubUnit ? 'Viên' : 'Hộp',
          quantity_sold: qtySold,
          unit_price: unitPrice,
          total_std_quantity: totalStd
        });
        invoiceTotal += (qtySold * unitPrice);
      });

      this.invoices.push({
        invoice_id: i,
        invoice_date: invoiceDate,
        branch_id: branch.branch_id,
        pharmacist_id: pharmacist.pharmacist_id,
        customer_id: customer ? customer.customer_id : null,
        total_amount: invoiceTotal,
        is_simulated: true
      });
    }
  }

  toSQL(): string {
    let sql = `-- PHARMACY POS FINAL DATASET - LAB211 SPECIALIZED V11.0\n`;
    sql += `CREATE DATABASE IF NOT EXISTS pmdb;\nUSE pmdb;\n\n`;
    sql += `SET FOREIGN_KEY_CHECKS = 0;\n`;
    sql += `DROP TABLE IF EXISTS \`invoice_details\`, \`invoices\`, \`inventory\`, \`pharmacists\`, \`customers\`, \`batches\`, \`medicines\`, \`categories\`, \`branches\`;\n`;
    sql += `SET FOREIGN_KEY_CHECKS = 1;\n\n`;

    sql += `-- 1. Categories\n`;
    sql += `CREATE TABLE \`categories\` (\n  \`category_id\` INT PRIMARY KEY AUTO_INCREMENT,\n  \`category_name\` VARCHAR(100) NOT NULL\n);\n\n`;

    sql += `-- 2. Medicines\n`;
    sql += `CREATE TABLE \`medicines\` (\n  \`medicine_id\` INT PRIMARY KEY AUTO_INCREMENT,\n  \`category_id\` INT NOT NULL,\n  \`name\` VARCHAR(255) NOT NULL,\n  \`brand\` VARCHAR(100),\n  \`base_unit\` VARCHAR(50) DEFAULT 'Hộp',\n  \`sub_unit\` VARCHAR(50) DEFAULT 'Viên',\n  \`conversion_rate\` INT NOT NULL DEFAULT 1,\n  \`base_sell_price\` DECIMAL(15,2) NOT NULL,\n  \`sub_sell_price\` DECIMAL(15,2) NOT NULL,\n  \`min_stock_level\` INT UNSIGNED DEFAULT 50,\n  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n  CONSTRAINT \`fk_med_cat\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`category_id\`)\n);\n\n`;

    sql += `-- 3. Batches\n`;
    sql += `CREATE TABLE \`batches\` (\n  \`batch_id\` INT PRIMARY KEY AUTO_INCREMENT,\n  \`medicine_id\` INT NOT NULL,\n  \`batch_number\` VARCHAR(50) NOT NULL,\n  \`manufacturing_date\` DATE,\n  \`expiry_date\` DATE NOT NULL,\n  \`import_price_package\` DECIMAL(15,2) NOT NULL,\n  \`initial_quantity\` INT UNSIGNED NOT NULL,\n  \`current_total_quantity\` INT UNSIGNED NOT NULL,\n  \`import_date\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n  CONSTRAINT \`fk_batch_med\` FOREIGN KEY (\`medicine_id\`) REFERENCES \`medicines\` (\`medicine_id\`)\n);\n\n`;

    sql += `-- 4. Branches\n`;
    sql += `CREATE TABLE \`branches\` (\n  \`branch_id\` INT PRIMARY KEY AUTO_INCREMENT,\n  \`branch_name\` VARCHAR(100) NOT NULL,\n  \`address\` VARCHAR(255),\n  \`phone_number\` VARCHAR(20)\n);\n\n`;

    sql += `-- 5. Inventory\n`;
    sql += `CREATE TABLE \`inventory\` (\n  \`inventory_id\` INT PRIMARY KEY AUTO_INCREMENT,\n  \`branch_id\` INT NOT NULL,\n  \`batch_id\` INT NOT NULL,\n  \`quantity_std\` INT UNSIGNED NOT NULL DEFAULT 0,\n  \`last_updated\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n  CONSTRAINT \`fk_inv_branch\` FOREIGN KEY (\`branch_id\`) REFERENCES \`branches\` (\`branch_id\`),\n  CONSTRAINT \`fk_inv_batch\` FOREIGN KEY (\`batch_id\`) REFERENCES \`batches\` (\`batch_id\`),\n  UNIQUE KEY \`uk_branch_batch\` (\`branch_id\`, \`batch_id\`)\n);\n\n`;

    sql += `-- 6. Pharmacists\n`;
    sql += `CREATE TABLE \`pharmacists\` (\n  \`pharmacist_id\` INT PRIMARY KEY AUTO_INCREMENT,\n  \`branch_id\` INT NOT NULL,\n  \`username\` VARCHAR(50) UNIQUE NOT NULL,\n  \`password\` VARCHAR(255) NOT NULL,\n  \`full_name\` VARCHAR(100),\n  \`role\` VARCHAR(50) DEFAULT 'STAFF',\n  CONSTRAINT \`fk_pharm_branch\` FOREIGN KEY (\`branch_id\`) REFERENCES \`branches\` (\`branch_id\`)\n);\n\n`;

    sql += `-- 7. Customers\n`;
    sql += `CREATE TABLE \`customers\` (\n  \`customer_id\` INT PRIMARY KEY AUTO_INCREMENT,\n  \`phone_number\` VARCHAR(20) UNIQUE,\n  \`customer_name\` VARCHAR(100),\n  \`points\` INT UNSIGNED DEFAULT 0\n);\n\n`;

    sql += `-- 8. Invoices\n`;
    sql += `CREATE TABLE \`invoices\` (\n  \`invoice_id\` INT PRIMARY KEY AUTO_INCREMENT,\n  \`invoice_date\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n  \`branch_id\` INT NOT NULL,\n  \`pharmacist_id\` INT NOT NULL,\n  \`customer_id\` INT NULL,\n  \`total_amount\` DECIMAL(15,2) NOT NULL,\n  \`is_simulated\` BOOLEAN DEFAULT FALSE,\n  CONSTRAINT \`fk_inv_br\` FOREIGN KEY (\`branch_id\`) REFERENCES \`branches\` (\`branch_id\`),\n  CONSTRAINT \`fk_inv_pharm\` FOREIGN KEY (\`pharmacist_id\`) REFERENCES \`pharmacists\` (\`pharmacist_id\`),\n  CONSTRAINT \`fk_inv_cust\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\` (\`customer_id\`)\n);\n\n`;

    sql += `-- 9. Invoice Details\n`;
    sql += `CREATE TABLE \`invoice_details\` (\n  \`detail_id\` INT PRIMARY KEY AUTO_INCREMENT,\n  \`invoice_id\` INT NOT NULL,\n  \`batch_id\` INT NOT NULL,\n  \`unit_sold\` ENUM('Hộp', 'Viên') NOT NULL,\n  \`quantity_sold\` INT UNSIGNED NOT NULL,\n  \`unit_price\` DECIMAL(15,2) NOT NULL,\n  \`total_std_quantity\` INT UNSIGNED NOT NULL,\n  CONSTRAINT \`fk_det_inv\` FOREIGN KEY (\`invoice_id\`) REFERENCES \`invoices\` (\`invoice_id\`),\n  CONSTRAINT \`fk_det_batch\` FOREIGN KEY (\`batch_id\`) REFERENCES \`batches\` (\`batch_id\`)\n);\n\n`;

    const writeData = (table: string, data: any[]) => {
      if (!data.length) return '';
      let out = `-- DATA FOR ${table}\n`;
      const keys = Object.keys(data[0]);
      const chunkSize = 500;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        out += `INSERT INTO \`${table}\` (\`${keys.join('`, `')}\`) VALUES\n`;
        out += chunk.map(row => `(${keys.map(k => {
          const v = row[k];
          if (v === null) return 'NULL';
          if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
          if (typeof v === 'boolean') return v ? '1' : '0';
          return v;
        }).join(', ')})`).join(',\n') + ';\n';
      }
      return out + '\n';
    };

    sql += writeData('branches', this.branches);
    sql += writeData('categories', this.categories);
    sql += writeData('medicines', this.medicines);
    sql += writeData('pharmacists', this.pharmacists);
    sql += writeData('customers', this.customers);
    sql += writeData('batches', this.batches);
    sql += writeData('inventory', this.inventory);
    sql += writeData('invoices', this.invoices);
    sql += writeData('invoice_details', this.invoiceDetails);

    return sql;
  }
}
