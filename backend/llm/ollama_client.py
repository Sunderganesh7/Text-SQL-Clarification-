import httpx
from backend.config import settings

def generate_completion(prompt: str) -> str:
    """Sends a prompt to the local Ollama LLM and returns the generated text."""
    url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False
    }
    
    try:
        with httpx.Client(timeout=120.0) as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")
    except httpx.ConnectError:
        raise Exception("Local Ollama service is unavailable. Please start Ollama.")
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise Exception("Configured Ollama model is not available.")
        raise Exception(f"Ollama API error: {e.response.status_code}")
    except Exception as e:
        raise Exception(f"Failed to communicate with Ollama: {str(e)}")
