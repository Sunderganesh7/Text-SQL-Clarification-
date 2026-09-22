import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.rag.retriever import retrieve_schema_context

def test_retrieval(question: str):
    print(f"Question:\n{question}\n")
    print("Retrieved Documents:\n")
    
    results = retrieve_schema_context(question)
    
    if not results['results']:
        print("No documents retrieved.\n")
        return
        
    for i, res in enumerate(results['results'], 1):
        meta = res['metadata']
        dist = res['distance']
        doc_type = meta.get('type')
        
        if doc_type == 'table':
            title = meta.get('table')
        elif doc_type == 'relationship':
            title = f"{meta.get('source_table')} -> {meta.get('target_table')}"
        else:
            title = "Unknown"
            
        print(f"{i}. {title}")
        print(f"   Type: {doc_type}")
        print(f"   Distance: {dist:.4f}" if dist is not None else "   Distance: N/A")
        print("")
        
    print("-" * 40 + "\n")

def run_tests():
    print("RAG Retrieval Tests")
    print("===================\n")
    
    test_retrieval("Which customers are from Mumbai?")
    test_retrieval("What products are available?")
    test_retrieval("Which customers placed orders?")
    test_retrieval("Which products were sold in orders?")
    test_retrieval("Show sales by city.")

if __name__ == "__main__":
    run_tests()
