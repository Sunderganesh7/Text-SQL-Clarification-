from backend.database.schema_inspector import refresh_schema
from backend.rag.document_builder import build_schema_documents
from backend.rag.vector_store import get_vector_store

def refresh_schema_and_rag() -> dict:
    """
    Refreshes the dynamic schema and updates ChromaDB.
    """
    try:
        # 1. Refresh schema
        schema = refresh_schema()
        
        # 2. Rebuild docs
        docs = build_schema_documents(schema)
        
        # 3. Store in RAG (this will overwrite/update as needed since IDs should match)
        get_vector_store().index_documents(docs)
        
        return {
            "status": "success",
            "schema_refreshed": True,
            "rag_refreshed": True
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "schema_refreshed": False,
            "rag_refreshed": False
        }
