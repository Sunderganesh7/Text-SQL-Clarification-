import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from backend.database.connection import engine
from backend.config import settings

def test_database():
    print(f"Testing connection with DATABASE_URL...")
    
    # 1. Test Connection & 2. Database Exists
    try:
        with engine.connect() as conn:
            print("MySQL connection: PASS")
            # Extract database name from URL
            db_name = settings.DATABASE_URL.split("/")[-1]
            print(f"Database: {db_name}")
            
            # 3. Test Tables exist
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result]
            required_tables = ["customers", "products", "orders", "order_items"]
            
            missing = [t for t in required_tables if t not in tables]
            if not missing:
                print("Tables: PASS")
            else:
                print(f"Tables: FAIL - Missing tables: {missing}")
                
            # 4. Simple SELECT query works
            result = conn.execute(text("SELECT COUNT(*) FROM customers"))
            count = result.scalar()
            if count is not None and count >= 0:
                print("SELECT query: PASS")
            else:
                print("SELECT query: FAIL - Could not execute SELECT count(*)")
                
            # 5. Check sample data
            if count is not None and count >= 20:
                print("Sample data: PASS")
            else:
                print("Sample data: FAIL - Less than 20 customers found")
                
    except OperationalError as e:
        print("MySQL connection: FAIL")
        print(f"Error: {e}")

if __name__ == "__main__":
    test_database()
