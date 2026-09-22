import pandas as pd
import os
import json
from backend.data_import.import_service import preview_file, upload_and_import
from backend.text_to_sql.service import execute_text_to_sql

def create_test_files():
    # 1. test_sales.csv
    sales_df = pd.DataFrame({
        "date": ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05"],
        "customer": ["Alice", "Bob", "Charlie", "Alice", "Bob"],
        "city": ["Mumbai", "Delhi", "Mumbai", "Pune", "Delhi"],
        "product": ["Widget A", "Widget B", "Widget A", "Widget C", "Widget B"],
        "quantity": [10, 5, 2, 1, 8],
        "amount": [100.0, 50.0, 20.0, 30.0, 80.0]
    })
    sales_df.to_csv("test_sales.csv", index=False)
    
    # 2. test_employees.xlsx
    emp_df = pd.DataFrame({
        "Employee Name": ["John Doe", "Jane Smith", "Mike Johnson"],
        "Department": ["IT", "HR", "IT"],
        "Salary": [70000, 65000, 72000],
        "Hire Date": ["2024-01-15", "2023-11-01", "2025-02-20"]
    })
    emp_df.to_excel("test_employees.xlsx", sheet_name="Employees", index=False)

def run_tests():
    print("========================================")
    print("PHASE 8 DYNAMIC IMPORT TESTS")
    print("========================================\n")
    
    create_test_files()
    
    # TEST 1: Preview CSV
    with open("test_sales.csv", "rb") as f:
        csv_bytes = f.read()
    
    print("Test: Preview CSV")
    preview_res = preview_file(csv_bytes, "test_sales.csv")
    print(f"Status: {preview_res.get('status')}")
    print(f"Rows detected: {preview_res.get('profiles', [{}])[0].get('rows')}")
    print(f"PASS / FAIL: {'PASS' if preview_res.get('status') == 'success' else 'FAIL'}")
    print("----------------------------------------\n")
    
    # TEST 2: Upload CSV
    print("Test: Upload CSV")
    upload_res1 = upload_and_import(csv_bytes, "test_sales.csv")
    print(f"Status: {upload_res1.get('status')}")
    print(f"Tables Created: {upload_res1.get('tables_created')}")
    print(f"Rows Imported: {upload_res1.get('rows_imported')}")
    print(f"Schema Refreshed: {upload_res1.get('schema_refreshed')}")
    print(f"RAG Refreshed: {upload_res1.get('rag_refreshed')}")
    print(f"PASS / FAIL: {'PASS' if upload_res1.get('status') == 'success' else 'FAIL'}")
    print("----------------------------------------\n")
    
    # TEST 3: Upload XLSX
    with open("test_employees.xlsx", "rb") as f:
        xlsx_bytes = f.read()
        
    print("Test: Upload XLSX")
    upload_res2 = upload_and_import(xlsx_bytes, "test_employees.xlsx")
    print(f"Status: {upload_res2.get('status')}")
    print(f"Tables Created: {upload_res2.get('tables_created')}")
    print(f"Rows Imported: {upload_res2.get('rows_imported')}")
    print(f"PASS / FAIL: {'PASS' if upload_res2.get('status') == 'success' else 'FAIL'}")
    print("----------------------------------------\n")
    
    # TEST 4: Dynamic Queries on Uploaded Data
    print("Test: Dynamic Queries")
    
    queries = [
        ("Show total sales from test sales.", "sales"), # explicit table to help the prompt
        ("Show sales by city from test sales.", "sales"),
        ("Which customer has the highest sales in test sales?", "sales"),
        ("How many products were sold in test sales?", "sales"),
        ("Show sales for Mumbai in test sales.", "sales"),
        ("How many employees are in the IT department?", "employees")
    ]
    
    for q, context_hint in queries:
        print(f"\nQuestion: {q}")
        res = execute_text_to_sql(q)
        print(f"Status: {res.get('status', 'success' if 'error' not in res else 'error')}")
        print(f"Generated SQL: {res.get('sql')}")
        print(f"Result Preview: {res.get('results', [])[:2]}")
        print(f"PASS / FAIL: {'PASS' if 'error' not in res else 'FAIL'}")
        
    # Cleanup
    if os.path.exists("test_sales.csv"):
        os.remove("test_sales.csv")
    if os.path.exists("test_employees.xlsx"):
        os.remove("test_employees.xlsx")
        
    print("\nCleaning up MySQL tables...")
    from sqlalchemy import text
    from backend.database.connection import get_db_connection
    with get_db_connection() as conn:
        for t in upload_res1.get('tables_created', []) + upload_res2.get('tables_created', []):
            conn.execute(text(f"DROP TABLE IF EXISTS {t}"))
        conn.commit()
    print("Cleanup complete.\n")

if __name__ == "__main__":
    run_tests()
