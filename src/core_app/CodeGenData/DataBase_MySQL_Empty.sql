CREATE TABLE `branches` (
  `branch_id` INT PRIMARY KEY AUTO_INCREMENT,
  `branch_name` VARCHAR(100) NOT NULL,
  `address` VARCHAR(255),
  `phone_number` VARCHAR(20)
);

CREATE TABLE `categories` (
  `category_id` INT PRIMARY KEY AUTO_INCREMENT,
  `category_name` VARCHAR(100) NOT NULL
);

CREATE TABLE `medicines` (
  `medicine_id` INT PRIMARY KEY AUTO_INCREMENT,
  `category_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(100),
  `base_unit` VARCHAR(50) NOT NULL,
  `sub_unit` VARCHAR(50) NOT NULL,
  `conversion_rate` INT NOT NULL DEFAULT 1,
  `base_sell_price` DECIMAL(15,2) NOT NULL,
  `sub_sell_price` DECIMAL(15,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `batches` (
  `batch_id` INT PRIMARY KEY AUTO_INCREMENT,
  `medicine_id` INT NOT NULL,
  `batch_number` VARCHAR(50) NOT NULL,
  `manufacturing_date` DATE,
  `expiry_date` DATE NOT NULL,
  `import_price_package` DECIMAL(15,2) NOT NULL
);

CREATE TABLE `inventory` (
  `inventory_id` INT PRIMARY KEY AUTO_INCREMENT,
  `branch_id` INT NOT NULL,
  `batch_id` INT NOT NULL,
  `quantity_std` INT NOT NULL DEFAULT 0,
  `last_updated` TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `pharmacists` (
  `pharmacist_id` INT PRIMARY KEY AUTO_INCREMENT,
  `branch_id` INT NOT NULL,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100)
);

CREATE TABLE `customers` (
  `customer_id` INT PRIMARY KEY AUTO_INCREMENT,
  `phone_number` VARCHAR(20) UNIQUE,
  `customer_name` VARCHAR(100)
);

CREATE TABLE `invoices` (
  `invoice_id` INT PRIMARY KEY AUTO_INCREMENT,
  `branch_id` INT NOT NULL,
  `pharmacist_id` INT NOT NULL,
  `customer_id` INT,
  `total_amount` DECIMAL(15,2) NOT NULL,
  `sale_date` TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  `source_type` ENUM ('MANUAL', 'SIMULATED') DEFAULT 'MANUAL'
);

CREATE TABLE `invoice_details` (
  `detail_id` INT PRIMARY KEY AUTO_INCREMENT,
  `invoice_id` INT NOT NULL,
  `batch_id` INT NOT NULL,
  `unit_sold` VARCHAR(50) NOT NULL,
  `quantity_sold` INT NOT NULL,
  `unit_price` DECIMAL(15,2) NOT NULL,
  `total_std_quantity` INT NOT NULL
);

CREATE INDEX `idx_batches_expiry` ON `batches` (`expiry_date`);

CREATE UNIQUE INDEX `uk_branch_batch` ON `inventory` (`branch_id`, `batch_id`);

CREATE INDEX `idx_invoices_date` ON `invoices` (`sale_date`);

ALTER TABLE `medicines` ADD CONSTRAINT `fk_med_cat` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);

ALTER TABLE `batches` ADD CONSTRAINT `fk_batch_med` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`medicine_id`);

ALTER TABLE `inventory` ADD CONSTRAINT `fk_inv_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`);

ALTER TABLE `inventory` ADD CONSTRAINT `fk_inv_batch` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`batch_id`);

ALTER TABLE `pharmacists` ADD CONSTRAINT `fk_pharm_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`);

ALTER TABLE `invoices` ADD CONSTRAINT `fk_inv_br` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`);

ALTER TABLE `invoices` ADD CONSTRAINT `fk_inv_pharm` FOREIGN KEY (`pharmacist_id`) REFERENCES `pharmacists` (`pharmacist_id`);

ALTER TABLE `invoices` ADD CONSTRAINT `fk_inv_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`);

ALTER TABLE `invoice_details` ADD CONSTRAINT `fk_det_inv` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`);

ALTER TABLE `invoice_details` ADD CONSTRAINT `fk_det_batch` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`batch_id`);
