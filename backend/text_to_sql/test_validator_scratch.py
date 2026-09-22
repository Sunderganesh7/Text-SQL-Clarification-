import sqlglot
from sqlglot import exp

class MockTable:
    def __init__(self, name, cols):
        self.name = name
        self.columns = [MockCol(c) for c in cols]
        
class MockCol:
    def __init__(self, name):
        self.name = name

valid_tables = {
    "customers": MockTable("customers", ["customer_id", "name", "city"]),
    "orders": MockTable("orders", ["order_id", "customer_id", "amount"])
}

def validate_sql(sql: str) -> dict:
    stmt = sqlglot.parse(sql, read="mysql")[0]
    
    valid_derived_tables = {cte.alias.lower() for cte in stmt.find_all(exp.CTE) if cte.alias}
    valid_derived_tables.update({sq.alias.lower() for sq in stmt.find_all(exp.Subquery) if sq.alias})
    
    table_aliases = {}
    used_tables = set()
    for table_expr in stmt.find_all(exp.Table):
        t_name = table_expr.name.lower()
        if table_expr.alias:
            table_aliases[table_expr.alias.lower()] = t_name
        
        if t_name not in valid_tables and t_name not in valid_derived_tables:
            return {"valid": False, "reason": f"Unknown table referenced: '{t_name}'"}
        used_tables.add(t_name)

    valid_cols_for_used_tables = set()
    for t_name in used_tables:
        if t_name in valid_tables:
            for c in valid_tables[t_name].columns:
                valid_cols_for_used_tables.add(c.name.lower())

    column_aliases = {a.alias.lower() for a in stmt.find_all(exp.Alias) if a.alias}
    
    for col_expr in stmt.find_all(exp.Column):
        c_name = col_expr.name.lower()
        if c_name == '*':
            continue
            
        c_table = col_expr.table.lower() if col_expr.table else None
        
        if c_table:
            real_table = table_aliases.get(c_table, c_table)
            if real_table in valid_derived_tables:
                continue 
            if real_table not in valid_tables:
                 return {"valid": False, "reason": f"Unknown table alias or table referenced in column '{c_table}.{c_name}'"}
            
            table_cols = {c.name.lower() for c in valid_tables[real_table].columns}
            if c_name not in table_cols:
                return {"valid": False, "reason": f"Unknown column '{c_name}' in table '{real_table}'"}
        else:
            if c_name not in valid_cols_for_used_tables and c_name not in column_aliases:
                return {"valid": False, "reason": f"Unknown column referenced: '{c_name}'"}

    return {"valid": True, "reason": "Safe"}

queries = [
    "SELECT customer_id, name FROM customers WHERE city = 'Mumbai';",
    "SELECT c.customer_id, c.name FROM customers AS c WHERE c.city = 'Mumbai';",
    "SELECT c.city, COUNT(*) AS customer_count FROM customers AS c GROUP BY c.city;",
    "SELECT o.order_id, c.name FROM orders AS o JOIN customers AS c ON o.customer_id = c.customer_id;",
    "WITH cte AS (SELECT customer_id FROM customers) SELECT customer_id FROM cte;",
    "SELECT * FROM nonexistent_table;",
    "SELECT nonexistent_column FROM customers;",
    "SELECT * FROM (SELECT customer_id FROM customers) AS subq;"
]

for q in queries:
    print(f"Query: {q}")
    print(validate_sql(q))
    print()
