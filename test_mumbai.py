import requests
import json

url = "http://127.0.0.1:8000/query"
payload = {
  "question": "Which customers are from Mumbai?",
  "session_id": "test"
}
try:
    response = requests.post(url, json=payload)
    print("Status:", response.status_code)
    print("Response:", json.dumps(response.json(), indent=2))
except Exception as e:
    print("Error:", e)
