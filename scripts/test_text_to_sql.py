import json
from backend.text_to_sql.service import execute_text_to_sql

def run_tests():
    tests = [
        "Which product has the highest total sales, and how many units of it were sold?",
        "Show the top 5 cities by total sales, highest first.",
        "How many orders were placed by customers from Mumbai?",
        "Show the top 3 products by quantity sold, highest first.",
        "Show sales."
    ]
    
    print("========================================")
    print("TEXT-TO-SQL PIPELINE TESTS")
    print("========================================\n")
    
    for i, q in enumerate(tests, 1):
        print(f"Test {i}:")
        print(f"Question: {q}")
        
        result = execute_text_to_sql(q)
        
        if "error" in result:
            print(f"Error: {result['error']}")
            if "sql" in result:
                print(f"Generated SQL: {result['sql']}")
            print("Result: FAIL\n")
        else:
            print(f"Retrieved RAG Context Documents: {len(result.get('retrieved_context', []))}")
            print(f"Generated SQL:\n{result.get('sql')}")
            print(f"Validation: PASS")
            print(f"MySQL Result (first 3 rows): {result.get('results', [])[:3]}")
            print(f"Row Count: {result.get('row_count')}")
            print("Result: PASS\n")
            
        print("----------------------------------------\n")

if __name__ == "__main__":
    run_tests()
