import requests
import io

url = "http://127.0.0.1:8001/data/upload"
csv_content = """name,city,sales
Alice,Mumbai,1000
Bob,Pune,1500
Charlie,Thane,1200
"""

files = {'file': ('test.csv', io.StringIO(csv_content), 'text/csv')}
try:
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Exception: {e}")
