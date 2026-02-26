
export interface Branch {
  branch_id: number;
  branch_name: string;
  address: string;
  phone_number: string;
}

export interface Category {
  category_id: number;
  category_name: string;
}

export interface Medicine {
  medicine_id: number;
  category_id: number;
  name: string;
  brand: string;
  base_unit: string;
  sub_unit: string;
  conversion_rate: number;
  base_sell_price: number;
  sub_sell_price: number;
  min_stock_level: number;
  created_at: string;
}

export interface Batch {
  batch_id: number;
  medicine_id: number;
  batch_number: string;
  manufacturing_date: string;
  expiry_date: string;
  import_price_package: number;
  initial_quantity: number;
  current_total_quantity: number;
  import_date: string;
}

export interface Inventory {
  inventory_id: number;
  branch_id: number;
  batch_id: number;
  quantity_std: number;
  last_updated: string;
}

export interface Pharmacist {
  pharmacist_id: number;
  branch_id: number;
  username: string;
  password: string;
  full_name: string;
  role: string;
}

export interface Customer {
  customer_id: number;
  phone_number: string;
  customer_name: string;
  points: number;
}

export interface Invoice {
  invoice_id: number;
  invoice_date: string;
  branch_id: number;
  pharmacist_id: number;
  customer_id: number | null;
  total_amount: number;
  is_simulated: boolean;
}

export interface InvoiceDetail {
  detail_id: number;
  invoice_id: number;
  batch_id: number;
  unit_sold: 'Hộp' | 'Viên';
  quantity_sold: number;
  unit_price: number;
  total_std_quantity: number;
}
