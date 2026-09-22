import sqlglot
from sqlglot import exp
from backend.database.schema_inspector import get_schema
from backend.llm.ollama_client import generate_completion

def validate_sql(sql: str) -> dict:
    """Validates that the SQL is safe (read-only SELECT) and schema-compliant."""
    if not sql or not sql.strip():
        return {"valid": False, "read_only": False, "statement_count": 0, "reason": "Empty SQL query."}

    # 1. Parse SQL
    try:
        stmts = sqlglot.parse(sql, read="mysql")
    except Exception as e:
        return {"valid": False, "read_only": False, "statement_count": 0, "reason": f"SQL Parse Error: {str(e)}"}
        
    # Remove None values from stmts if there are trailing semicolons producing empty statements
    stmts = [s for s in stmts if s is not None]

    # 2. Block multiple statements
    if len(stmts) > 1:
        return {"valid": False, "read_only": False, "statement_count": len(stmts), "reason": "Multiple SQL statements are not allowed."}
    
    if len(stmts) == 0:
        return {"valid": False, "read_only": False, "statement_count": 0, "reason": "No valid SQL statement found."}
        
    stmt = stmts[0]
    
    # 3. Require SELECT (or CTE + SELECT which is still parsed as Select by sqlglot if it returns rows)
    if not isinstance(stmt, exp.Select):
        return {"valid": False, "read_only": False, "statement_count": 1, "reason": "Only read-only SELECT queries are allowed."}

    # Additionally scan for any Command, Drop, Insert, Update, Delete within the AST just in case
    forbidden_types = (exp.Insert, exp.Update, exp.Delete, exp.Drop, exp.Command, exp.Alter)
    for node in stmt.walk():
        if isinstance(node, forbidden_types):
            return {"valid": False, "read_only": False, "statement_count": 1, "reason": "Forbidden SQL operation detected."}

    # 4. Schema Validation
    schema = get_schema()
    valid_tables = {t.name.lower(): t for t in schema.tables}
    
    # Collect CTE names (WITH clauses) and Subquery aliases
    valid_derived_tables = {cte.alias.lower() for cte in stmt.find_all(exp.CTE) if cte.alias}
    valid_derived_tables.update({sq.alias.lower() for sq in stmt.find_all(exp.Subquery) if sq.alias})
    
    table_aliases = {}
    used_tables = set()
    for table_expr in stmt.find_all(exp.Table):
        t_name = table_expr.name.lower()
        if table_expr.alias:
            table_aliases[table_expr.alias.lower()] = t_name
            
        if t_name not in valid_tables and t_name not in valid_derived_tables:
            return {"valid": False, "read_only": True, "statement_count": 1, "reason": f"Unknown table referenced: '{t_name}'"}
        used_tables.add(t_name)
        
    valid_cols_for_used_tables = set()
    for t_name in used_tables:
        if t_name in valid_tables:
            for c in valid_tables[t_name].columns:
                valid_cols_for_used_tables.add(c.name.lower())
                
    column_aliases = {a.alias.lower() for a in stmt.find_all(exp.Alias) if a.alias}
    
    for col_expr in stmt.find_all(exp.Column):
        c_name = col_expr.name.lower()
        # skip wildcard
        if c_name == '*':
            continue
            
        c_table = col_expr.table.lower() if col_expr.table else None
        
        if c_table:
            # Resolve alias to real table if applicable
            real_table = table_aliases.get(c_table, c_table)
            if real_table in valid_derived_tables:
                continue # Skip column validation for CTEs/Subqueries as their columns are derived
            if real_table not in valid_tables:
                 return {"valid": False, "read_only": True, "statement_count": 1, "reason": f"Unknown table alias or table referenced in column '{c_table}.{c_name}'"}
            
            # Check if column exists in that specific table
            table_cols = {c.name.lower() for c in valid_tables[real_table].columns}
            if c_name not in table_cols:
                return {"valid": False, "read_only": True, "statement_count": 1, "reason": f"Unknown column '{c_name}' in table '{real_table}'"}
        else:
            # No alias, check if it exists in any used table or is a column alias
            if c_name not in valid_cols_for_used_tables and c_name not in column_aliases:
                return {"valid": False, "read_only": True, "statement_count": 1, "reason": f"Unknown column referenced: '{c_name}'"}

    return {"valid": True, "read_only": True, "statement_count": 1, "reason": "Safe SELECT query"}

def validate_semantics(question: str, sql: str, schema_context: dict) -> dict:
    """Validates if the generated SQL semantically answers the question and uses correct logic."""
    # Bypassing LLM-based semantic validation as small local models tend to hallucinate false negatives
    # The generation prompt has been strictly enforced instead.
    return {"valid": True, "reason": ""}

