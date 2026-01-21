import pandas as pd
from faker import Faker
from datetime import datetime, timedelta
import random
import os

# Initialize Faker
fake = Faker()

# Set random seed for reproducibility
random.seed(42)
fake.seed_instance(42)

# Helper function to generate valid phone number
def generate_phone():
    return '0' + fake.numerify('#########')

# Helper function to generate invalid phone for junk data (5% chance)
def generate_phone_with_junk():
    if random.random() < 0.05:  # 5% junk data
        junk_types = random.choice(['short', 'letters', 'long'])
        if junk_types == 'short':
            return fake.numerify('#####')
        elif junk_types == 'letters':
            return fake.lexify('??????????')
        else:
            return '0' + fake.numerify('###########')
    else:
        return generate_phone()

# 1. Generate branches (5 branches)
branches_data = []
branch_names = ['Chi Nhánh Trung Tâm', 'Chi Nhánh Sài Gòn', 'Chi Nhánh Hà Nội', 'Chi Nhánh Đà Nẵng', 'Chi Nhánh Cần Thơ']
for i in range(5):
    branches_data.append({
        'branch_id': i+1,
        'branch_name': branch_names[i],
        'address': fake.address(),
        'phone_number': generate_phone_with_junk()
    })
branches_df = pd.DataFrame(branches_data)

# 2. Generate categories (10 categories)
categories_data = []
category_names = ['Thuốc giảm đau', 'Kháng sinh', 'Thuốc chống trầm cảm', 'Thuốc chống dị ứng', 'Thuốc chống loạn thần',
                  'Thuốc tim mạch', 'Thuốc da liễu', 'Thuốc nội tiết', 'Thuốc tiêu hóa', 'Thuốc hô hấp']
for i in range(10):
    categories_data.append({
        'category_id': i+1,
        'category_name': category_names[i],
        'description': fake.text(100)
    })
categories_df = pd.DataFrame(categories_data)

# 3. Generate medicines (500 medicines)
medicines_data = []
units = ['tablet', 'vial', 'bottle', 'box']
for i in range(500):
    category_id = random.randint(1, 10)
    name = fake.company() + ' ' + fake.word()  # Simple medicine name
    if random.random() < 0.05:  # Junk data
        name = '' if random.random() < 0.5 else name
    brand = fake.company()
    unit = random.choice(units)
    if random.random() < 0.05:  # Junk data
        unit = random.choice(['kg', 'ml', 'pack'])  # Invalid units
    description = fake.text(50)
    created_at = fake.date_time_between(start_date='-1y', end_date='now')
    medicines_data.append({
        'medicine_id': i+1,
        'category_id': category_id,
        'name': name,
        'brand': brand,
        'unit': unit,
        'description': description,
        'created_at': created_at
    })
medicines_df = pd.DataFrame(medicines_data)

# 4. Generate batches (2000 batches)
batches_data = []
batch_count_per_med = {}
for med_id in range(1, 501):
    batch_count_per_med[med_id] = random.randint(3, 5)

batch_med_ids = []
for med_id, count in batch_count_per_med.items():
    batch_med_ids.extend([med_id] * count)

random.shuffle(batch_med_ids)
batch_med_ids = batch_med_ids[:2000]  # Ensure exactly 2000

for i in range(2000):
    medicine_id = batch_med_ids[i]
    batch_number = fake.unique.numerify('BATCH-#####')
    manufacturing_date = fake.date_between(start_date='-2y', end_date='today')
    expiry_date = manufacturing_date + timedelta(days=random.randint(365, 1460))  # 1-4 years later
    import_price = round(random.uniform(10, 1000), 2)
    batches_data.append({
        'batch_id': i+1,
        'medicine_id': medicine_id,
        'batch_number': batch_number,
        'manufacturing_date': manufacturing_date,
        'expiry_date': expiry_date,
        'import_price': import_price
    })
batches_df = pd.DataFrame(batches_data)

# 5. Generate inventory (2000 batches * 5 branches = 10000 rows)
inventory_data = []
for batch_id in range(1, 2001):
    for branch_id in range(1, 6):
        quantity = random.randint(0, 1000)
        if random.random() < 0.05:  # Junk data
            quantity = -random.randint(1, 100)  # Negative quantity
        last_updated = fake.date_time_between(start_date='-1y', end_date='now')
        inventory_data.append({
            'inventory_id': len(inventory_data)+1,
            'branch_id': branch_id,
            'batch_id': batch_id,
            'quantity': quantity,
            'last_updated': last_updated
        })
inventory_df = pd.DataFrame(inventory_data)

# 6. Generate pharmacists (20 pharmacists, 4 per branch)
pharmacists_data = []
for branch_id in range(1, 6):
    for _ in range(4):
        full_name = fake.name()
        license_number = fake.unique.numerify('LIC-#####')
        username = fake.unique.user_name()
        password = fake.password(length=8)
        role = random.choice(['STAFF', 'ADMIN'])
        phone_number = generate_phone_with_junk()
        pharmacists_data.append({
            'pharmacist_id': len(pharmacists_data)+1,
            'branch_id': branch_id,
            'full_name': full_name,
            'license_number': license_number,
            'username': username,
            'password': password,
            'role': role
            # Note: phone_number not in schema, but perhaps add if needed, but schema doesn't have
        })
pharmacists_df = pd.DataFrame(pharmacists_data)

# 7. Generate customers (1000 customers)
customers_data = []
for i in range(1000):
    full_name = fake.name()
    phone_number = generate_phone_with_junk()
    loyalty_points = random.randint(0, 10000)
    customers_data.append({
        'customer_id': i+1,
        'full_name': full_name,
        'phone_number': phone_number,
        'loyalty_points': loyalty_points
    })
customers_df = pd.DataFrame(customers_data)

# 8. Generate invoices (7000 invoices)
invoices_data = []
for i in range(7000):
    branch_id = random.randint(1, 5)
    pharmacist_id = random.randint(1, 20)
    customer_id = random.randint(1, 1000) if random.random() > 0.2 else None  # 20% no customer
    total_amount = round(random.uniform(50, 5000), 2)
    sale_date = fake.date_time_between(start_date='-1y', end_date='now')
    invoices_data.append({
        'invoice_id': i+1,
        'branch_id': branch_id,
        'pharmacist_id': pharmacist_id,
        'customer_id': customer_id,
        'total_amount': total_amount,
        'sale_date': sale_date
    })
invoices_df = pd.DataFrame(invoices_data)

# 9. Generate invoice_details (for each invoice, 1-5 details)
invoice_details_data = []
for inv in invoices_df.itertuples():
    num_details = random.randint(1, 5)
    branch_id = inv.branch_id
    # Get available batches in this branch with quantity > 0
    available_batches = inventory_df[(inventory_df['branch_id'] == branch_id) & (inventory_df['quantity'] > 0)]['batch_id'].unique().tolist()
    if len(available_batches) < num_details:
        # If not enough, take all available
        selected_batches = available_batches
    else:
        selected_batches = random.sample(available_batches, num_details)
    for batch_id in selected_batches:
        quantity = random.randint(1, 10)
        # Get import_price from batches
        import_price = batches_df.loc[batches_df['batch_id'] == batch_id, 'import_price'].values[0]
        unit_price = round(import_price * 1.5, 2)  # Markup
        invoice_details_data.append({
            'detail_id': len(invoice_details_data)+1,
            'invoice_id': inv.invoice_id,
            'batch_id': batch_id,
            'quantity': quantity,
            'unit_price': unit_price
        })
invoice_details_df = pd.DataFrame(invoice_details_data)

# Export to CSV
dfs = {
    'branches': branches_df,
    'categories': categories_df,
    'medicines': medicines_df,
    'batches': batches_df,
    'inventory': inventory_df,
    'pharmacists': pharmacists_df,
    'customers': customers_df,
    'invoices': invoices_df,
    'invoice_details': invoice_details_df
}

for name, df in dfs.items():
    df.to_csv(f'{name}.csv', index=False, encoding='utf-8-sig')  # utf-8-sig for Vietnamese characters

print("Data generation complete. CSV files created.")