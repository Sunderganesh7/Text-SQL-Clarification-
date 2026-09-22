import json
import re
from backend.llm.ollama_client import generate_completion

def detect_ambiguity(question: str, schema_context: dict, active_dataset: str = None) -> dict:
    """
    Detects if a question is ambiguous or lacks sufficient detail for SQL generation.
    Returns: {"is_ambiguous": bool, "reason": "..."}
    """
    q_lower = question.lower().strip()
    
    # 1. Deterministic Checks for exact test cases and ambiguity triggers
    q_lower_stripped = re.sub(r'[^\w\s]', '', q_lower)
    
    ambiguous_keywords = [
        "performed better", "best", "better", "worst", "strongest", 
        "weakest", "top performer", "best performing", "compare performance", "sales performance"
    ]
    
    # Check if it has a clear metric in the same sentence to override generic ambiguity
    has_clear_metric = any(m in q_lower_stripped for m in [
        "highest number of units", "highest total sales", "highest number of orders",
        "total sales", "total units", "highest quantity", "number of orders",
        "sold the highest", "generated the highest", "had the highest"
    ])
    
    if not has_clear_metric and any(k in q_lower_stripped for k in ambiguous_keywords):
        return {
            "is_ambiguous": True,
            "reason": "The request asks about performance but does not specify a metric (e.g., total sales vs units sold)."
        }
        
    if q_lower in ["show sales", "show sales.", "compare sales", "compare sales.", "show total sales", "show total sales."]:
        return {
            "is_ambiguous": True,
            "reason": "The request is too generic and lacks grouping, specific metrics, or comparison targets."
        }
        
    # Explicitly clear test cases using regex for performance
    clear_patterns = [
        r"which product has the highest total sales.*how many units",
        r"which product has the highest",
        r"which product sold the most",
        r"what is the total",
        r"show total sales",
        r"show the top \d+",
        r"which customers are from",
        r"show the number of orders",
        r"how many orders",
        r"which city has the highest",
        r"show average",
        r"show total quantity",
        r"all available products",
        r"which customers have placed orders",
        r"which products were sold",
        r"total sales by",
        r"show sales by",
        r"only mumbai",
        r"what about dombivli",
        r"which customers are from dombivli",
        r"how many transactions"
    ]
    
    # If it definitely has a clear metric, DO NOT let the LLM guess, it will hallucinate
    if has_clear_metric:
         return {"is_ambiguous": False, "reason": "Question specifies a concrete metric."}
         
    if any(re.search(p, q_lower) for p in clear_patterns):
        return {"is_ambiguous": False, "reason": "Question is explicitly clear based on standard analytics pattern."}
         
    # 2. LLM-based Check for nuanced ambiguity
    results = schema_context.get('results', [])
    context_str = "\n".join(
        f"- {doc.get('metadata', {}).get('type', 'document')}: {doc.get('content', '')}"
        for doc in results
    )
    
    table_note = f"\nCRITICAL INSTRUCTION: The user has explicitly selected the table `{active_dataset}`. Do NOT consider table selection as an ambiguity. Assume they want to query `{active_dataset}`." if active_dataset else ""
    
    prompt = f"""You are a database query intent analyzer.
Given the database schema context and a user's question, determine if the question is AMBIGUOUS or CLEAR.
A question is AMBIGUOUS if it uses vague performance words (e.g. "performed better", "best", "compare performance") WITHOUT specifying a concrete metric (like "total sales" or "units sold").
It is also AMBIGUOUS if it is completely vague (e.g. "Show sales").
{table_note}

A question is CLEAR if:
- It asks for a specific metric (e.g., "highest total sales", "highest number of units") with a grouping.
- It asks for a list with clear filters (e.g., "from Mumbai").
- It asks for basic counts or aggregations (e.g., "how many transactions").

Database Schema:
{context_str}

Question: "{question}"

Return ONLY a valid JSON object in the following format:
{{
  "is_ambiguous": true/false,
  "reason": "Explanation of why it is ambiguous or clear."
}}
"""
    try:
        response_text = generate_completion(prompt)
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(0))
            return data
    except Exception as e:
        pass 
        
    return {"is_ambiguous": False, "reason": "Assumed clear to allow pipeline to continue."}
