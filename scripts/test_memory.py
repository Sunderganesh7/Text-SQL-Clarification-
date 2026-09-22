import json
from backend.memory.memory_service import handle_query_with_memory
from backend.memory.conversation_store import create_session

def run_tests():
    print("========================================")
    print("MEMORY ENGINE TESTS")
    print("========================================\n")

    # TEST 1 - Basic session
    print("Test 1: Basic session")
    session_id = create_session()
    res1 = handle_query_with_memory("Show sales by city.", session_id)
    # the LLM should pass this through to RAG and text-to-sql, since it's clear
    print("Expected: Successful query.")
    print("Actual status:", res1.get('status'))
    print("Interpreted Question:", res1.get('interpreted_question'))
    print("PASS / FAIL:", "PASS" if res1.get('status') == 'success' else "FAIL")
    print("----------------------------------------\n")

    # TEST 2 - Follow-up filter
    print("Test 2: Follow-up filter")
    res2 = handle_query_with_memory("Only Mumbai.", session_id)
    expected_q = "Show sales by city for Mumbai."
    actual_q = res2.get('interpreted_question')
    print(f"Previous: Show sales by city.")
    print(f"Follow-up: Only Mumbai.")
    print(f"Expected interpretation: {expected_q}")
    print(f"Actual interpretation: {actual_q}")
    print("PASS / FAIL:", "PASS" if actual_q == expected_q else "FAIL")
    print("----------------------------------------\n")

    # TEST 3 - Follow-up location change
    print("Test 3: Follow-up location change")
    session3 = create_session()
    handle_query_with_memory("Which customers are from Mumbai?", session3)
    res3 = handle_query_with_memory("What about Dombivli?", session3)
    expected_q3 = "Which customers are from Dombivli?"
    actual_q3 = res3.get('interpreted_question')
    print(f"Previous: Which customers are from Mumbai?")
    print(f"Follow-up: What about Dombivli?")
    print(f"Expected interpretation: {expected_q3}")
    print(f"Actual interpretation: {actual_q3}")
    print("PASS / FAIL:", "PASS" if actual_q3 == expected_q3 else "FAIL")
    print("----------------------------------------\n")

    # TEST 4 - Follow-up grouping
    print("Test 4: Follow-up grouping")
    session4 = create_session()
    handle_query_with_memory("Show sales by city.", session4)
    res4 = handle_query_with_memory("Now show it by customer.", session4)
    expected_q4 = "Show sales by customer."
    actual_q4 = res4.get('interpreted_question')
    print(f"Previous: Show sales by city.")
    print(f"Follow-up: Now show it by customer.")
    print(f"Expected interpretation: {expected_q4}")
    print(f"Actual interpretation: {actual_q4}")
    print("PASS / FAIL:", "PASS" if actual_q4 == expected_q4 else "FAIL")
    print("----------------------------------------\n")

    # TEST 5 - Sorting follow-up
    print("Test 5: Sorting follow-up")
    session5 = create_session()
    handle_query_with_memory("Show total sales by city.", session5)
    res5 = handle_query_with_memory("Sort highest first.", session5)
    expected_q5 = "Show total sales by city sorted in descending order."
    actual_q5 = res5.get('interpreted_question')
    print(f"Previous: Show total sales by city.")
    print(f"Follow-up: Sort highest first.")
    print(f"Expected interpretation: {expected_q5}")
    print(f"Actual interpretation: {actual_q5}")
    print("PASS / FAIL:", "PASS" if actual_q5 == expected_q5 else "FAIL")
    print("----------------------------------------\n")

    # TEST 6 - Clarification + memory
    print("Test 6: Clarification + memory")
    session6 = create_session()
    res6_1 = handle_query_with_memory("Show sales.", session6)
    print("Expected: clarification_required")
    print("Actual:", res6_1.get('status'))
    
    res6_2 = handle_query_with_memory("By city.", session6)
    print("Expected: Show sales by city.")
    print("Actual:", res6_2.get('interpreted_question'))
    
    res6_3 = handle_query_with_memory("Only Mumbai.", session6)
    print("Expected: Show sales by city for Mumbai.")
    print("Actual:", res6_3.get('interpreted_question'))
    
    is_pass = res6_1.get('status') == 'clarification_required' and res6_2.get('interpreted_question') == "Show sales by city." and res6_3.get('interpreted_question') == "Show sales by city for Mumbai."
    print("PASS / FAIL:", "PASS" if is_pass else "FAIL")
    print("----------------------------------------\n")

    # TEST 7 - New independent question
    print("Test 7: New independent question")
    session7 = create_session()
    handle_query_with_memory("Show sales by city.", session7)
    res7 = handle_query_with_memory("Show all products.", session7)
    expected_q7 = "Show all available products."
    actual_q7 = res7.get('interpreted_question')
    print("Expected interpretation: Show all available products.")
    print("Actual interpretation:", actual_q7)
    print("PASS / FAIL:", "PASS" if actual_q7 == expected_q7 else "FAIL")
    print("----------------------------------------\n")

if __name__ == "__main__":
    run_tests()
