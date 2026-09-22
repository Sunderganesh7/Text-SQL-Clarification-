import time
import requests

url = "http://127.0.0.1:8000/query"

def test_query(question):
    print(f"\n--- Testing: {question} ---")
    payload = {"question": question, "session_id": "perf_test"}
    start = time.time()
    try:
        res = requests.post(url, json=payload, timeout=120)
        dur = time.time() - start
        print(f"Status: {res.status_code}")
        print(f"Time: {dur:.2f}s")
        if res.status_code == 200:
            data = res.json()
            if 'error' in data and data['error']:
                print("Error in response:", data['error'])
            else:
                print("Success. Results count:", len(data.get('results', [])))
        else:
            print(res.text)
    except Exception as e:
        print("Failed:", e)

test_query("What is the total sales amount?")
test_query("Show sales by city")
test_query("What is the total sales amount?")
test_query("Show sales by city")
