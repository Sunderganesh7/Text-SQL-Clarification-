import uuid
import time

# Simple in-memory store: { session_id: { "last_accessed": timestamp, "history": [...] } }
# History items: {"role": "user"|"assistant", "content": "..."}
_store = {}

def get_session(session_id: str) -> list:
    if session_id not in _store:
        return []
    _store[session_id]["last_accessed"] = time.time()
    return _store[session_id]["history"]

def add_message(session_id: str, role: str, content: str):
    if session_id not in _store:
        _store[session_id] = {"last_accessed": time.time(), "history": []}
    
    # Keep only last 10 messages
    _store[session_id]["history"].append({"role": role, "content": content})
    if len(_store[session_id]["history"]) > 10:
        _store[session_id]["history"] = _store[session_id]["history"][-10:]

def create_session() -> str:
    session_id = str(uuid.uuid4())
    _store[session_id] = {"last_accessed": time.time(), "history": []}
    return session_id
