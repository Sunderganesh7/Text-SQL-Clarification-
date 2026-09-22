import logging
from sqlalchemy import text
from backend.database.connection import get_db_connection
from backend.rag.retriever import retrieve_schema_context
from backend.llm.ollama_client import generate_completion
from backend.text_to_sql.prompt_builder import build_sql_prompt
from backend.text_to_sql.sql_generator import extract_sql
from backend.text_to_sql.sql_validator import validate_sql, validate_semantics
from backend.config import settings
import sqlglot

def execute_text_to_sql(question: str, active_dataset: str = None) -> dict:
    """Executes the complete RAG-Enhanced Text-to-SQL pipeline with repair retry."""
    if not question or not question.strip():
        return {"error": "Question cannot be empty.", "stage": "input_validation"}

    try:
        # Step 1: Retrieve schema context
        retrieved_context = retrieve_schema_context(question, active_dataset=active_dataset)
        if not retrieved_context:
            return {"error": "Insufficient schema context found to answer the question.", "stage": "rag_error"}

        # Step 2: Build Prompt & Generate initial SQL
        prompt = build_sql_prompt(question, retrieved_context, active_dataset=active_dataset)
        llm_response = generate_completion(prompt)
        
        sql = extract_sql(llm_response)
        if not sql:
             return {"error": "Failed to generate SQL from the model response.", "stage": "sql_generation_error"}

        # Perform execution with max 1 repair
        return execute_with_repair(sql, question, retrieved_context, active_dataset=active_dataset)

    except Exception as e:
        # Generic fallback error
        logging.error(f"Outer exception in execute_text_to_sql: {str(e)}", exc_info=True)
        return {"error": f"The generated query could not be executed. {str(e)}", "stage": "unknown_error"}


def execute_with_repair(initial_sql: str, question: str, retrieved_context: dict, max_repairs: int = 1, active_dataset: str = None) -> dict:
    """Validates and executes SQL. If execution fails, attempts to repair it once."""
    current_sql = initial_sql
    
    for attempt in range(max_repairs + 1):
        # 1. Validate SQL
        validation = validate_sql(current_sql)
        if not validation["valid"]:
            if attempt == 0 and max_repairs > 0:
                # Try to repair validation error
                current_sql = attempt_repair(current_sql, question, retrieved_context, validation["reason"], active_dataset=active_dataset)
                continue
            else:
                return {"error": validation["reason"], "sql": current_sql, "stage": "sql_security_error"}

        # 1.5 Validate Semantics
        sem_validation = validate_semantics(question, current_sql, retrieved_context)
        if not sem_validation["valid"]:
            if attempt == 0 and max_repairs > 0:
                # Try to repair semantic error
                current_sql = attempt_repair(current_sql, question, retrieved_context, sem_validation["reason"], active_dataset=active_dataset)
                continue
            else:
                return {"error": sem_validation["reason"], "sql": current_sql, "stage": "sql_semantic_error"}

        # Apply LIMIT if configured
        try:
            parsed = sqlglot.parse_one(current_sql, read="mysql")
            # Only apply limit if there isn't one already or if it's larger
            if not parsed.args.get("limit"):
                # Strip trailing semicolon before appending LIMIT
                clean_sql = current_sql.strip()
                if clean_sql.endswith(';'):
                    clean_sql = clean_sql[:-1]
                current_sql = f"{clean_sql} LIMIT {settings.MAX_QUERY_ROWS}"
        except Exception:
            pass # fallback to original if parsing limit fails

        # 2. Execute SQL
        try:
            results = []
            with get_db_connection() as conn:
                # A very basic query timeout isn't easily supported in pure SQLAlchemy without
                # engine-specific configs, but for MySQL we can use a session variable.
                conn.execute(text("SET SESSION MAX_EXECUTION_TIME=5000")) # 5 seconds
                
                result_proxy = conn.execute(text(current_sql))
                keys = result_proxy.keys()
                for row in result_proxy.fetchall():
                    results.append(dict(zip(keys, row)))

            # Generate natural language summary
            message = generate_natural_language_summary(question, current_sql, results)

            return {
                "question": question,
                "sql": current_sql,
                "results": results,
                "row_count": len(results),
                "retrieved_context": retrieved_context,
                "repairs_attempted": attempt,
                "message": message
            }
        except Exception as db_error:
            # If execution fails, attempt repair
            if attempt < max_repairs:
                # Strip sensitive credentials from error just in case (though SQLAlchemy usually just shows the query and error code)
                safe_error = str(db_error.__class__.__name__) + ": " + str(db_error).split("[SQL:")[0].strip()
                current_sql = attempt_repair(current_sql, question, retrieved_context, safe_error, active_dataset=active_dataset)
            else:
                return {
                    "error": "The generated query could not be executed. The system attempted one safe correction.",
                    "sql": current_sql,
                    "stage": "sql_execution_error"
                }
                
    return {"error": "Maximum repair attempts exceeded.", "stage": "sql_execution_error"}


def attempt_repair(failed_sql: str, question: str, retrieved_context: dict, error_message: str, active_dataset: str = None) -> str:
    """Prompts the LLM to fix a broken SQL query."""
    q_lower = question.lower()
    injections = ""
    if "total sales" in q_lower or "revenue" in q_lower:
        injections += "[CRITICAL NOTE: If asked for 'total sales' or 'revenue', you MUST calculate it using SUM(quantity * price) or SUM(units_sold * price_per_unit) based on the table's actual columns.]\n"
    if "units" in q_lower or "quantity" in q_lower:
        injections += "[CRITICAL NOTE: If asked for 'units' or 'quantity', you MUST calculate it using SUM(quantity) or SUM(units_sold). NEVER multiply by price.]\n"
    if "highest" in q_lower or "top" in q_lower or "lowest" in q_lower:
        injections += "[CRITICAL NOTE: Ensure you ORDER BY the exact metric requested (e.g. order by total_sales if highest sales is asked, not units).]\n"

    results = retrieved_context.get('results', [])
    context_str = "\n".join(
        f"- {doc.get('metadata', {}).get('type', 'document')}: {doc.get('content', '')}"
        for doc in results
    )
    
    repair_prompt = f"""You are a MySQL expert. A previously generated SQL query failed.
Please fix the query based on the schema and the error message.

{f"CRITICAL REQUIREMENT: The user has selected the dataset table `{active_dataset}`. You MUST prioritize querying this table." if active_dataset else ""}
{injections}

Schema Context:
{context_str}

User Question:
{question}

Failed SQL Query:
{failed_sql}

Error Message:
{error_message}
Instructions:
1. Fix the error. Ensure all tables and columns exist in the schema.
2. NEVER invent columns. Double-check the table that owns every column.
3. Calculate derived metrics from actual available columns. Standard mappings:
   - 'total sales', 'sales amount', 'revenue' -> Multiply units by price inside the sum, e.g., `SUM(units_sold * price_per_unit)` or `SUM(quantity * unit_price)`.
   - 'quantity sold', 'total units', 'units' -> Sum the quantity only, e.g., `SUM(units_sold)` or `SUM(quantity)`.
   *** WARNING: NEVER multiply by price when calculating quantity or units! ***
4. CRITICAL RULE FOR METRIC INCLUSION: 
   - Identify EVERY metric requested by the user. If they ask for 5 things, your SELECT clause MUST return those 5 columns.
   - Do not silently omit any requested output.
5. CRITICAL RULE FOR NESTED GROUPING:
   - If solving nested aggregations (e.g., top city for the top brand), use subqueries or CTEs. Do not just blindly group by both.
6. Check aliases strictly! If you use 'JOIN table t', only use 't.col', not 'table.col'.
7. Output ONLY the raw SQL query. Do NOT include any explanations or formatting."""

    repair_response = generate_completion(repair_prompt)
    repaired_sql = extract_sql(repair_response)
    
    return repaired_sql or failed_sql

def generate_natural_language_summary(question: str, sql: str, results: list) -> str:
    """Generates a natural language summary of the SQL execution results."""
    import json
    preview = results[:5] if len(results) > 5 else results
    res_str = json.dumps(preview, default=str)
    
    prompt = f"""You are an AI Data Analyst. Provide a clear, natural-language answer to the user's question based strictly on the SQL results provided.

User Question: {question}
SQL Query Used: {sql}
Results (up to 5 rows): {res_str}

Instructions:
1. Provide a direct answer to the question using the data in the results.
2. If it's a multi-metric question, summarize the key values smoothly.
3. Never invent values or mention things not present in the results.
4. Do NOT explain the SQL query itself, just provide the business answer.
5. Keep the tone professional, helpful, and concise.
"""
    return generate_completion(prompt).strip()
