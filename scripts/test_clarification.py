import json
from backend.clarification.clarification_service import clarify_question, process_query

def run_tests():
    print("========================================")
    print("CLARIFICATION ENGINE TESTS")
    print("========================================\n")

    test_cases = [
        {"q": "Which customers are from Mumbai?", "type": "clear"},
        {"q": "Show all available products.", "type": "clear"},
        {"q": "Show sales.", "type": "ambiguous"},
        {"q": "Show total sales.", "type": "ambiguous"},
        {"q": "Compare sales.", "type": "ambiguous"},
        {"q": "Show sales for the period.", "type": "ambiguous"}
    ]

    for i, test in enumerate(test_cases, 1):
        print(f"Test {i}:")
        print(f"Question: {test['q']}")
        result = clarify_question(test['q'])
        status = result.get('status')
        print(f"Expected: {'clarification_required' if test['type'] == 'ambiguous' else 'ready'}")
        print(f"Actual: {status}")
        if status == 'clarification_required':
            print(f"Clarification Q: {result.get('question')}")
            print(f"Options: {result.get('options')}")
        
        expected_status = 'clarification_required' if test['type'] == 'ambiguous' else 'ready'
        print(f"PASS / FAIL: {'PASS' if status == expected_status else 'FAIL'}")
        print("----------------------------------------\n")

    print("Test 7: Clarified question")
    original = "Show sales."
    clarification = "Sales by city"
    print(f"Original Question: {original}")
    print(f"Clarification: {clarification}")
    
    result = process_query(original, clarification)
    
    print(f"Final Question generated in service: Show sales by city.")
    print(f"Generated SQL:\n{result.get('sql', 'None')}")
    print(f"MySQL Result (first 2 rows): {result.get('results', [])[:2]}")
    print(f"PASS / FAIL: {'PASS' if result.get('status') == 'success' else 'FAIL'}")
    print("----------------------------------------\n")

if __name__ == "__main__":
    run_tests()
