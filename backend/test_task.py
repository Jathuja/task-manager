import requests

payload = {
    "id": 1692731872891,
    "title": "Test Task",
    "status": "todo",
    "priority": "high",
    "due_date": "2026-08-24"
}

# we need a valid token to test, but we can just see if it's a 422 or 401
r = requests.post("http://127.0.0.1:8000/tasks", json=payload)
print(r.status_code, r.text)
