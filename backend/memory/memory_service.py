from backend.memory.conversation_store import get_session, add_message, create_session
from backend.memory.context_manager import interpret_question
from backend.clarification.clarification_service import clarify_question
from backend.text_to_sql.service import execute_text_to_sql

def handle_query_with_memory(question: str, session_id: str = None, bypass_clarification: bool = False, active_dataset: str = None) -> dict:
    # The active_dataset should NOT bypass clarification. Ambiguous questions can still be asked against a specific dataset.
    if not session_id:
        session_id = create_session()
        
    history = get_session(session_id)
    
    # 1. Interpret the question using history
    interpreted_q = interpret_question(session_id, question, history)
    
    # Add user's raw message to history
    add_message(session_id, "user", question)
    
    # 2. Run Clarification Engine on interpreted query if not bypassed
    if not bypass_clarification:
        clarify_result = clarify_question(interpreted_q, active_dataset=active_dataset)
        
        if clarify_result.get("status") == "clarification_required":
            # Add assistant's clarification to history
            add_message(session_id, "assistant", f"Clarification requested: {clarify_result.get('question')}")
            clarify_result["session_id"] = session_id
            clarify_result["interpreted_question"] = interpreted_q
            return clarify_result
        elif clarify_result.get("status") == "error":
            return clarify_result
            
    # 3. Question is clear (or bypassed), run SQL Generation on interpreted query
    sql_result = execute_text_to_sql(interpreted_q, active_dataset=active_dataset)
    
    if "error" not in sql_result:
        # Success, add summary to history
        row_count = sql_result.get("row_count", 0)
        sql = sql_result.get("sql", "")
        summary = f"Executed query: {interpreted_q}. SQL generated: {sql}. Rows returned: {row_count}."
        add_message(session_id, "assistant", summary)
    else:
        # Error, add error to history
        add_message(session_id, "assistant", f"Error: {sql_result['error']}")
        
    sql_result["session_id"] = session_id
    sql_result["interpreted_question"] = interpreted_q
    sql_result["status"] = "success" if "error" not in sql_result else "error"
    return sql_result
