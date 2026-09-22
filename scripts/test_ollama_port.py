import urllib.request

try:
    with urllib.request.urlopen("http://localhost:11434") as response:
        print("Response:", response.read().decode())
except Exception as e:
    print("Error:", e)
