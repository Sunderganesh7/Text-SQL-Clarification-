import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.schema_inspector import refresh_schema
from backend.rag.document_builder import build_schema_documents
from backend.rag.embeddings import get_embedding_model
from backend.rag.vector_store import get_vector_store

def index_schema():
    print("RAG Schema Indexing")
    print("-------------------\n")
    
    try:
        schema = refresh_schema()
        print("Schema loaded: PASS\n")
    except Exception as e:
        print(f"Schema loaded: FAIL ({e})\n")
        return

    try:
        docs = build_schema_documents(schema)
        print(f"Documents created: {len(docs)}\n")
    except Exception as e:
        print(f"Documents created: FAIL ({e})\n")
        return

    try:
        # Pre-load embedding model here to log when it's done
        model = get_embedding_model()
        print("Embedding model loaded: PASS\n")
    except Exception as e:
        print(f"Embedding model loaded: FAIL ({e})\n")
        return

    try:
        store = get_vector_store()
        print("ChromaDB initialized: PASS\n")
    except Exception as e:
        print(f"ChromaDB initialized: FAIL ({e})\n")
        return

    try:
        store.index_documents(docs)
        print(f"Documents indexed: {len(docs)}\n")
    except Exception as e:
        print(f"Documents indexed: FAIL ({e})\n")
        return

    print("RAG indexing completed successfully.")

if __name__ == "__main__":
    index_schema()
