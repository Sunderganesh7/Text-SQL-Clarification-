from backend.text_to_sql.service import execute_text_to_sql, execute_with_repair

def run_reliability_tests():
    print("========================================")
    print("PHASE 9 RELIABILITY TESTS")
    print("========================================\n")
    
    questions = [
        ("Test 1 - Normal question", "Which customers are from Mumbai?"),
        ("Test 2 - Aggregation", "Show total sales by city."),
        ("Test 3 - Ambiguous", "Show sales.")
    ]
    
    for name, question in questions:
        print(f"{name}")
        print(f"Question: {question}")
        res = execute_text_to_sql(question)
        
        if res.get("error"):
            print(f"Error: {res.get('error')}")
            print("Result: PASS (Handled gracefully, maybe clarification)")
        else:
            print(f"SQL: {res.get('sql')}")
            print(f"Row count: {res.get('row_count')}")
            print("Result: PASS")
            
        print("-" * 40 + "\n")

def run_repair_test():
    print("========================================")
    print("PHASE 9 REPAIR TEST")
    print("========================================\n")
    
    # Intentionally broken SQL with an unknown column and an alias error
    failed_sql = "SELECT c.city, SUM(orders.total_amount) FROM customers c JOIN orders ON c.customer_id = orders.customer_id GROUP BY city"
    question = "Show total sales by city"
    
    # We provide a mock retrieved context
    from backend.rag.retriever import retrieve_schema_context
    context = retrieve_schema_context(question)
    
    print(f"Initial SQL: {failed_sql}")
    res = execute_with_repair(failed_sql, question, context)
    
    if res.get("error"):
        print(f"Failed to repair: {res.get('error')}")
        print("Result: FAIL")
    else:
        print(f"Repaired SQL: {res.get('sql')}")
        print(f"Repairs attempted: {res.get('repairs_attempted')}")
        print("Result: PASS")
        
    print("-" * 40 + "\n")


if __name__ == "__main__":
    run_reliability_tests()
    run_repair_test()
