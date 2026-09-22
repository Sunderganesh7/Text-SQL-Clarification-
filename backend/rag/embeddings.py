from sentence_transformers import SentenceTransformer
from backend.config import settings
from typing import List

class EmbeddingModel:
    def __init__(self):
        # This will download the model the first time it is run
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)
        
    def embed_text(self, text: str) -> List[float]:
        return self.model.encode(text).tolist()
        
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self.model.encode(texts).tolist()

# Singleton instance
_embedding_model = None

def get_embedding_model() -> EmbeddingModel:
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = EmbeddingModel()
    return _embedding_model
