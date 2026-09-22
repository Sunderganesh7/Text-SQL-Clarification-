import re

def extract_sql(llm_response: str) -> str:
    """Extracts raw SQL from LLM response, removing markdown or extra text."""
    if not llm_response:
        return ""
        
    text = llm_response.strip()
    
    # Try to extract from markdown code blocks
    match = re.search(r"```(?:sql)?\s*(.*?)\s*```", text, re.IGNORECASE | re.DOTALL)
    if match:
        text = match.group(1).strip()
    
    # Sometimes models still return some trailing/leading text. 
    # Just return it stripped, the validator will catch issues.
    return text
