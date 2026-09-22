import urllib.request
import json

def get_json(url):
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        return f"Error: {e}"

def post_json(url, data):
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        return f"Error: {e}"

def get_text(url):
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req) as response:
            return response.read().decode()
    except Exception as e:
        return f"Error: {e}"

def run_tests():
    base_url = "http://127.0.0.1:8000"
    
    print("Testing /health")
    print(get_json(f"{base_url}/health"))
    
    print("\nTesting /database/tables")
    print(get_json(f"{base_url}/database/tables"))
    
    print("\nTesting /database/schema")
    schema = get_json(f"{base_url}/database/schema")
    print(f"Schema returned: Database={schema.get('database')}, Tables={len(schema.get('tables', []))} tables")
    
    print("\nTesting /database/schema/text")
    text = get_text(f"{base_url}/database/schema/text")
    print(f"Text schema length: {len(text)} characters")
    
    print("\nTesting /rag/search")
    rag = post_json(f"{base_url}/rag/search", {"question": "Which customers are from Mumbai?"})
    print(f"RAG question: {rag.get('question')}")
    print(f"RAG returned {len(rag.get('results', []))} results")
    
    for idx, res in enumerate(rag.get('results', [])):
        print(f"  Result {idx+1}: type={res.get('metadata', {}).get('type')}, dist={res.get('distance')}")

    print("\nTesting /text-to-sql")
    t2s = post_json(f"{base_url}/text-to-sql", {"question": "Which customers are from Mumbai?"})
    print(f"Text-to-SQL error: {t2s.get('error')}")

if __name__ == "__main__":
    run_tests()
