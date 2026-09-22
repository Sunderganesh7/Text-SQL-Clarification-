import urllib.request
import json

tests = [
    "Which product has the highest total sales, and how many units of it were sold?",
    "Show the top 5 cities by total sales, highest first.",
    "How many orders were placed by customers from Mumbai?",
    "Show the top 3 products by quantity sold, highest first.",
    "Show sales."
]

for i, t in enumerate(tests, 1):
    print(f"\n--- API TEST {i} ---")
    print(f"Q: {t}")
    data = json.dumps({"question": t}).encode()
    req = urllib.request.Request("http://127.0.0.1:8000/query", data=data, headers={"Content-Type": "application/json"})
    try:
        res = urllib.request.urlopen(req)
        body = json.loads(res.read().decode())
        print(f"STATUS: {body.get('status')}")
        if body.get('status') == 'success':
            print(f"SQL:\n{body.get('sql')}")
            print(f"Result row 1: {body.get('results')[0] if body.get('results') else 'None'}")
        elif body.get('status') == 'clarification_required':
            print(f"Clarification asked: {body.get('question')}")
    except Exception as e:
        print(f"Error: {e}")
