import urllib.request
import urllib.parse
import urllib.error
import json
data = urllib.parse.urlencode({"username": "testuser2", "password": "testpassword2"}).encode("ascii")
req = urllib.request.Request("http://127.0.0.1:8000/login", data=data)
try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    body = e.read().decode('utf-8')
    print(f"Error {e.code}: {body}")
