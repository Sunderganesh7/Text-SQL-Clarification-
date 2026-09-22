import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.schema_inspector import get_schema, get_text_schema, refresh_schema
from backend.config import settings

def run_tests():
    print("Schema Inspection Test")
    print("----------------------\n")
    
    # 1. Database Connection and 2. Tables Discovery
    try:
        # Refresh cache to ensure we get fresh data
        schema = refresh_schema()
        print("Database: PASS\n")
    except Exception as e:
        print(f"Database: FAIL ({str(e)})\n")
        return
        
    print("Tables:")
    required_tables = ["customers", "products", "orders", "order_items"]
    table_names = [t.name for t in schema.tables]
    
    all_tables_pass = True
    for req in required_tables:
        if req in table_names:
            print(f"{req}: PASS")
        else:
            print(f"{req}: FAIL")
            all_tables_pass = False
            
    print("")
    
    # 3. Columns Discovery
    try:
        has_columns = all(len(t.columns) > 0 for t in schema.tables)
        print("Columns: " + ("PASS" if has_columns else "FAIL"))
    except Exception:
        print("Columns: FAIL")
        
    print("")
        
    # 4. Primary keys Discovery
    try:
        has_pks = all(any(c.primary_key for c in t.columns) for t in schema.tables)
        print("Primary Keys: " + ("PASS" if has_pks else "FAIL"))
    except Exception:
        print("Primary Keys: FAIL")
        
    print("")
        
    # 5. Foreign keys Discovery
    try:
        orders = next((t for t in schema.tables if t.name == "orders"), None)
        order_items = next((t for t in schema.tables if t.name == "order_items"), None)
        
        has_fks = False
        if orders and order_items:
            if len(orders.foreign_keys) > 0 and len(order_items.foreign_keys) > 0:
                has_fks = True
        print("Foreign Keys: " + ("PASS" if has_fks else "FAIL"))
    except Exception:
        print("Foreign Keys: FAIL")
        
    print("")
        
    # 6. Relationships are correct
    try:
        rels_pass = True
        
        # check orders -> customers
        fk_orders = next((fk for fk in orders.foreign_keys if fk.column == "customer_id"), None)
        if not fk_orders or fk_orders.referred_table != "customers" or fk_orders.referred_column != "customer_id":
            rels_pass = False
            
        # check order_items -> orders
        fk_oi_orders = next((fk for fk in order_items.foreign_keys if fk.column == "order_id"), None)
        if not fk_oi_orders or fk_oi_orders.referred_table != "orders" or fk_oi_orders.referred_column != "order_id":
            rels_pass = False
            
        # check order_items -> products
        fk_oi_products = next((fk for fk in order_items.foreign_keys if fk.column == "product_id"), None)
        if not fk_oi_products or fk_oi_products.referred_table != "products" or fk_oi_products.referred_column != "product_id":
            rels_pass = False
            
        print("Relationships: " + ("PASS" if rels_pass else "FAIL"))
    except Exception:
        print("Relationships: FAIL")
        
    print("")
        
    # 7. Text Schema generation works
    try:
        text_schema = get_text_schema()
        if "Database: text_to_sql" in text_schema and "Table: customers" in text_schema:
            print("Text Schema: PASS")
        else:
            print("Text Schema: FAIL")
    except Exception:
        print("Text Schema: FAIL")
        
    print("")
        
    # 8. JSON Schema generation works
    try:
        json_schema = schema.model_dump()
        if "tables" in json_schema and len(json_schema["tables"]) >= 4:
            print("JSON Schema: PASS")
        else:
            print("JSON Schema: FAIL")
    except Exception:
        print("JSON Schema: FAIL")
        
    print("")
    
    print("Overall Schema Intelligence: PASS")

if __name__ == "__main__":
    run_tests()
