from backend.text_to_sql.sql_validator import validate_sql

def run_security_tests():
    print("========================================")
    print("PHASE 9 SECURITY TESTS")
    print("========================================\n")
    
    tests = [
        ("Test 1 - Safe SELECT", "SELECT * FROM customers", True),
        ("Test 2 - INSERT", "INSERT INTO customers (name) VALUES ('Test')", False),
        ("Test 3 - UPDATE", "UPDATE customers SET city='Mumbai'", False),
        ("Test 4 - DELETE", "DELETE FROM customers", False),
        ("Test 5 - DROP", "DROP TABLE customers", False),
        ("Test 6 - ALTER", "ALTER TABLE customers ADD test INT", False),
        ("Test 7 - TRUNCATE", "TRUNCATE TABLE customers", False),
        ("Test 8 - Multiple statements", "SELECT * FROM customers; DROP TABLE customers;", False),
        ("Test 9 - Comment attempt", "SELECT * FROM customers; -- DROP TABLE customers", False),
        ("Test 10 - WITH SELECT", "WITH x AS (SELECT * FROM customers) SELECT * FROM x", True),
        ("Test 11 - Unknown Table", "SELECT * FROM unknown_table", False),
        ("Test 12 - Unknown Column", "SELECT fake_column FROM customers", False),
    ]
    
    for name, sql, expected_safe in tests:
        res = validate_sql(sql)
        is_safe = res.get("valid", False)
        
        status = "PASS - BLOCKED" if not expected_safe and not is_safe else "PASS - ALLOWED" if expected_safe and is_safe else "FAIL"
        
        print(f"{name}")
        print(f"SQL: {sql}")
        print(f"Valid: {res.get('valid')}, Reason: {res.get('reason')}")
        print(f"Result: {status}")
        print("-" * 40 + "\n")

if __name__ == "__main__":
    run_security_tests()
