from backend.rag.vector_store import get_vector_store
from backend.config import settings

def retrieve_schema_context(question: str, top_k: int = None, active_dataset: str = None) -> dict:
    """Retrieves relevant schema documents for a given question.
    If `active_dataset` is provided, the result is filtered to that table.
    """
    if top_k is None:
        top_k = settings.RAG_TOP_K
        
    store = get_vector_store()
    results = store.search(question, top_k=top_k)
    
    formatted_results = []

    if results and results.get('documents') and len(results['documents']) > 0:
        # ChromaDB returns a list of lists for queries
        docs = results['documents'][0]
        metadatas = results['metadatas'][0]
        distances = results['distances'][0] if 'distances' in results and results['distances'] else [None] * len(docs)

        for doc, meta, dist in zip(docs, metadatas, distances):
            if active_dataset:
                meta_table = meta.get('table')
                # For relationships, check source_table and target_table
                if meta.get('type') == 'relationship':
                    if meta.get('source_table') != active_dataset and meta.get('target_table') != active_dataset:
                        continue
                elif meta_table and meta_table != active_dataset:
                    continue
            formatted_results.append({
                "content": doc,
                "metadata": meta,
                "distance": dist
            })

    # Ensure active dataset table and its relationships are present
    if active_dataset:
        # Check if the active dataset table doc is already in results
        has_table = any(item.get('metadata', {}).get('type') == 'table' and item.get('metadata', {}).get('table') == active_dataset for item in formatted_results)
        if not has_table:
            # Perform a direct search for the table document
            table_res = store.search(active_dataset, top_k=1)
            if table_res and table_res.get('documents') and len(table_res['documents']) > 0:
                doc = table_res['documents'][0][0]
                meta = table_res['metadatas'][0][0]
                dist = table_res['distances'][0][0] if 'distances' in table_res and table_res['distances'] else None
                formatted_results.append({"content": doc, "metadata": meta, "distance": dist})
        # Also include any relationship docs that involve the active dataset
        rel_res = store.search(active_dataset, top_k=10)
        if rel_res and rel_res.get('documents'):
            for doc, meta, dist in zip(rel_res['documents'][0], rel_res['metadatas'][0], rel_res['distances'][0] if 'distances' in rel_res else [None]*len(rel_res['documents'][0])):
                if meta.get('type') == 'relationship' and (meta.get('source_table') == active_dataset or meta.get('target_table') == active_dataset):
                    if not any(item['content'] == doc and item['metadata'] == meta for item in formatted_results):
                        formatted_results.append({"content": doc, "metadata": meta, "distance": dist})
    # Add column metadata for the active dataset table
    try:
        from backend.database.schema_inspector import get_schema
        schema = get_schema()
        table_info = next((t for t in schema.tables if t.name == active_dataset), None)
        if table_info:
            col_desc = ', '.join([f"{col.name} ({col.data_type})" for col in table_info.columns])
            col_doc = f"Columns of table `{active_dataset}`: {col_desc}"
            formatted_results.append({"content": col_doc, "metadata": {"type": "columns", "table": active_dataset}, "distance": None})
    except Exception:
        pass
    return {
        "question": question,
        "results": formatted_results
    }
