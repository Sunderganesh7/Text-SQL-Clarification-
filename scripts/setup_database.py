import os
import sys
from datetime import datetime, timedelta
import random

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from backend.config import settings
from backend.database.models import Base, Customer, Product, Order, OrderItem

def setup_database():
    print(f"Connecting to MySQL using DATABASE_URL from .env...")
    
    # Extract the base URL without the database name to connect and create the database if it doesn't exist
    base_url = settings.DATABASE_URL.rsplit('/', 1)[0]
    db_name = settings.DATABASE_URL.rsplit('/', 1)[1]
    
    base_engine = create_engine(base_url)
    with base_engine.connect() as conn:
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name}"))
        print(f"Ensured database '{db_name}' exists.")
        
    engine = create_engine(settings.DATABASE_URL)
    
    print("Creating tables...")
    Base.metadata.create_all(engine)
    print("Tables created:")
    for table_name in Base.metadata.tables.keys():
        print(f" * {table_name}")
        
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Check if data already exists
    if session.query(Customer).first():
        print("Sample data already exists. Skipping insertion.")
        session.close()
        return

    print("Inserting sample data...")
    
    cities_states = [
        ("Mumbai", "Maharashtra"), ("Thane", "Maharashtra"), 
        ("Dombivli", "Maharashtra"), ("Pune", "Maharashtra"),
        ("Nashik", "Maharashtra"), ("Nagpur", "Maharashtra"),
        ("Aurangabad", "Maharashtra"), ("Surat", "Gujarat"),
        ("Ahmedabad", "Gujarat"), ("Bangalore", "Karnataka")
    ]
    
    # Insert Customers (20)
    customers = []
    for i in range(1, 21):
        city, state = random.choice(cities_states)
        signup_date = datetime(random.randint(2024, 2026), random.randint(1, 12), random.randint(1, 28))
        c = Customer(
            name=f"Customer {i}",
            email=f"customer{i}@example.com",
            city=city,
            state=state,
            signup_date=signup_date.date()
        )
        customers.append(c)
    session.add_all(customers)
    session.commit()
    
    # Insert Products (15)
    categories = ["Electronics", "Clothing", "Home", "Books", "Toys"]
    products = []
    for i in range(1, 16):
        category = random.choice(categories)
        price = round(random.uniform(10.0, 500.0), 2)
        p = Product(
            product_name=f"Product {category} {i}",
            category=category,
            price=price
        )
        products.append(p)
    session.add_all(products)
    session.commit()
    
    # Insert Orders (50) and Order Items (100+)
    statuses = ["Pending", "Shipped", "Delivered", "Cancelled"]
    payment_methods = ["Credit Card", "UPI", "Debit Card", "Cash on Delivery"]
    
    for _ in range(50):
        customer = random.choice(customers)
        order_date = datetime(random.randint(2024, 2026), random.randint(1, 12), random.randint(1, 28))
        
        o = Order(
            customer_id=customer.customer_id,
            order_date=order_date,
            payment_method=random.choice(payment_methods),
            status=random.choice(statuses)
        )
        session.add(o)
        session.flush() # To get the order_id
        
        # Add 1 to 4 items per order
        num_items = random.randint(1, 4)
        order_products = random.sample(products, num_items)
        for product in order_products:
            quantity = random.randint(1, 3)
            oi = OrderItem(
                order_id=o.order_id,
                product_id=product.product_id,
                quantity=quantity,
                unit_price=product.price
            )
            session.add(oi)
            
    session.commit()
    session.close()
    
    print("Database setup completed successfully.")
    print("Sample records inserted successfully.")

if __name__ == "__main__":
    setup_database()
