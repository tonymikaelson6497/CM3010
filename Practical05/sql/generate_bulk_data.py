import random
from datetime import datetime, timedelta

NUM_CUSTOMERS = 1000
NUM_PRODUCTS  = 2000
NUM_ORDERS    = 100000   # if too slow, try 20000 first

START_DATE = datetime(2022, 1, 1)
END_DATE   = datetime(2024, 12, 31)

OUTPUT_FILE = "sql/bulk_data.sql"

customer_names = ["Alice","Bob","Charlie","Diana","Eve","Frank","Grace","Henry","Ivy","Jack","Katie","Liam","Mia","Noah","Olivia","Paul","Quinn","Riley","Sophia","Thomas","Uma","Victor","Wendy","Xavier","Yara","Zoe"]
customer_surnames = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts"]
customer_cities = ["London","New York","Paris","Tokyo","Sydney","Berlin","Madrid","Rome","Amsterdam","Vienna","Dubai","Singapore","Toronto","Vancouver","Mexico City","Buenos Aires","São Paulo","Rio de Janeiro","Moscow","Seoul","Beijing","Shanghai","Hong Kong","Bangkok","Jakarta","Delhi","Mumbai","Kolkata","Chennai","Hyderabad"]
customer_countries = ["UK","USA","France","Japan","Australia","Germany","Spain","Italy","Netherlands","Austria","UAE","Singapore","Canada","Mexico","Argentina","Brazil","Russia","South Korea","China","Thailand","Indonesia","India"]

product_names = ["Laptop","Mouse","Keyboard","Monitor","Headphones","Tablet","Phone","Charger","Cable","Speaker","Camera","Lens","Tripod","Drone","Watch","Shoes","Shirt","Jeans","Jacket","Dress","Skirt","Coat","Hat","Gloves","Scarf","Backpack","Bag","Wallet","Sunglasses","Book","Magazine","Newspaper","Pen","Pencil","Eraser","Ruler","Notebook","Folder","Stapler","Chair","Desk","Lamp","Couch","Table","Bed","Mattress","Pillow","Blanket","Towel","Soap","Shampoo","Toothbrush","Toothpaste","Cereal","Milk","Bread","Butter","Cheese","Eggs","Chicken","Beef","Pork","Fish","Rice","Pasta","Sauce","Oil","Salt","Pepper","Sugar","Coffee","Tea","Juice","Water","Soda","Candy","Chocolate","Cake","Cookie","Ice Cream","Pizza","Hamburger","Sandwich","Soup","Salad"]
product_categories = ["Electronics","Clothing","Furniture","Home & Garden","Books","Food & Drink","Toys & Games","Sports","Beauty","Health"]

def random_date(start_date, end_date):
    delta = end_date - start_date
    return start_date + timedelta(days=random.randint(0, delta.days))

def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "''")

print("Generating bulk_data.sql ...")
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("USE cm3010_db_P05;\n")
    f.write("START TRANSACTION;\n")

    # Customers
    f.write("INSERT INTO customers (customer_id, customer_name, city, country, registration_date) VALUES\n")
    for i in range(1, NUM_CUSTOMERS + 1):
        name = f"{random.choice(customer_names)} {random.choice(customer_surnames)}"
        city = random.choice(customer_cities)
        country = random.choice(customer_countries)
        reg_date = random_date(START_DATE, END_DATE).strftime("%Y-%m-%d")
        line = f"({i}, '{esc(name)}', '{esc(city)}', '{esc(country)}', '{reg_date}')"
        f.write(line + (";\n" if i == NUM_CUSTOMERS else ",\n"))

    # Products
    f.write("INSERT INTO products (product_id, product_name, category, price, supplier_id) VALUES\n")
    for i in range(1, NUM_PRODUCTS + 1):
        name = f"{random.choice(product_names)} {i}"
        category = random.choice(product_categories)
        price = round(random.uniform(5.00, 1999.99), 2)
        supplier_id = random.randint(100, 599)
        line = f"({i}, '{esc(name)}', '{esc(category)}', {price:.2f}, {supplier_id})"
        f.write(line + (";\n" if i == NUM_PRODUCTS else ",\n"))

    # Orders + Order Items
    f.write("INSERT INTO orders (order_id, customer_id, order_date, total_amount) VALUES\n")

    order_values = []
    order_item_values = []

    for order_id in range(1, NUM_ORDERS + 1):
        customer_id = random.randint(1, NUM_CUSTOMERS)
        order_date = random_date(START_DATE, END_DATE).strftime("%Y-%m-%d")

        num_items = random.randint(1, 5)
        total_amount = 0.0

        for _ in range(num_items):
            product_id = random.randint(1, NUM_PRODUCTS)
            item_base = round(random.uniform(10.00, 510.00), 2)
            variance = item_base * (random.randint(-5, 10) / 100)
            unit_price = round(item_base + variance, 2)
            quantity = random.randint(1, 3)
            total_amount += unit_price * quantity
            order_item_values.append(f"({order_id}, {product_id}, {quantity}, {unit_price:.2f})")

        order_values.append(f"({order_id}, {customer_id}, '{order_date}', {total_amount:.2f})")

    f.write(",\n".join(order_values) + ";\n")

    f.write("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES\n")
    f.write(",\n".join(order_item_values) + ";\n")

    f.write("COMMIT;\n")

print(f"Done: {OUTPUT_FILE}")
print("Load with: mysql -u root -p < sql/bulk_data.sql")

