def build_sql_prompt(question: str, schema_context: dict, active_dataset: str = None) -> str:
    """Builds the prompt instructing the LLM to generate a MySQL query."""
    q_lower = question.lower()
    injections = ""
    if active_dataset:
        injections += f"\n[CRITICAL NOTE: The user has selected the dataset table `{active_dataset}`. You MUST prioritize querying this table and its columns! Ignore built-in tables unless explicitly needed.]\n"

    # Enforce strict metric handling
    if "total sales" in q_lower or "revenue" in q_lower:
        injections += "[CRITICAL NOTE: If asked for 'total sales' or 'revenue', you MUST calculate it using SUM(quantity * price) or SUM(units_sold * price_per_unit) based on the table's actual columns.]\n"
    if "units" in q_lower or "quantity" in q_lower:
        injections += "[CRITICAL NOTE: If asked for 'units' or 'quantity', you MUST calculate it using SUM(quantity) or SUM(units_sold). NEVER multiply by price.]\n"
    if "highest" in q_lower or "top" in q_lower or "lowest" in q_lower:
        injections += "[CRITICAL NOTE: Ensure you ORDER BY the exact metric requested (e.g. order by total_sales if highest sales is asked, not units).]\n"

    results = schema_context.get('results', [])
    context_str = "\n".join(
        f"- {doc.get('metadata', {}).get('type', 'document')}: {doc.get('content', '')}"
        for doc in results
    )
    
    prompt = f"""You are a MySQL expert generating SQL queries.
You must generate a valid MySQL SQL query to answer the user's question.

Schema Context:
{context_str}

User Question:
{question}

Instructions:
1. ONLY generate a read-only SELECT query.
2. Use ONLY the tables and columns explicitly present in the Schema Context. NEVER invent columns.
3. Double-check the table that owns every column. Never assume a derived business metric (like `total_amount`, `sales`, `revenue`) is stored as a physical database column unless it explicitly appears in the schema.
4. CRITICAL RULES FOR DERIVED METRICS (DYNAMIC):
   - 'total sales', 'sales amount', 'revenue' -> Multiply units by price inside the sum, e.g., `SUM(units_sold * price_per_unit)` or `SUM(quantity * unit_price)`.
   - 'quantity sold', 'total units', 'units' -> Sum the quantity only, e.g., `SUM(units_sold)` or `SUM(quantity)`.
   *** WARNING: NEVER multiply by price when calculating quantity or units! ***
5. CRITICAL RULE FOR METRIC INCLUSION: 
   - Identify EVERY metric requested by the user. If they ask for 5 things, your SELECT clause MUST return those 5 columns.
   - Do not silently omit any requested output.
6. CRITICAL RULE FOR NESTED GROUPING:
   - If the user asks for a nested relationship (e.g., "Show me the brand with the highest total sales, and the city where it generated the highest total sales"), you MUST use CTEs (WITH clause), subqueries, or Window Functions.
   - Do NOT just `GROUP BY brand, city`. That does not find the highest city for the highest brand. Calculate the top brand first, then filter/join to find the top city for that brand.
7. If you use aliases for tables, YOU MUST USE THAT ALIAS STRICTLY for all columns from that table.
8. Output ONLY the raw SQL query. Do NOT include any explanations, markdown formatting (like ```sql), or other text.
9. If the schema context is insufficient to answer the question, output an empty string.

{injections}

SQL Query:"""
    return prompt
