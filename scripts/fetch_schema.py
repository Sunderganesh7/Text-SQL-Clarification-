import os
import sys
import json
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.database.schema_inspector import get_schema, get_text_schema, get_rag_documents

with open("schema_output.txt", "w", encoding="utf-8") as f:
    f.write("=== JSON SCHEMA ===\n")
    f.write(json.dumps(get_schema().model_dump(), indent=2))
    f.write("\n\n=== TEXT SCHEMA ===\n")
    f.write(get_text_schema())
    f.write("\n\n=== RAG DOCUMENTS ===\n")
    for doc in get_rag_documents():
        f.write(doc + "\n---\n")
