import os
import chromadb
from backend.config import settings
from backend.rag.document_builder import RAGDocument
from backend.rag.embeddings import get_embedding_model
from typing import List

# Ensure chroma dir exists
os.makedirs(settings.CHROMA_DB_DIR, exist_ok=True)

class VectorStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=settings.CHROMA_DB_DIR)
        self.collection_name = "schema_knowledge"
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"} # Use cosine similarity
        )
        
    def index_documents(self, documents: List[RAGDocument]):
        """Indexes the documents. Replaces them if they already exist."""
        if not documents:
            return
            
        ids = [doc.id for doc in documents]
        texts = [doc.content for doc in documents]
        metadatas = [doc.metadata for doc in documents]
        
        # Generate embeddings
        model = get_embedding_model()
        embeddings = model.embed_documents(texts)
        
        # We must also delete any old documents that are no longer in the new schema.
        # The easiest way is to delete everything and re-insert, or get existing IDs and delete diff.
        # Since it's a small collection, we can just clear and recreate.
        try:
            # Drop the whole collection
            self.client.delete_collection(name=self.collection_name)
            # Recreate
            self.collection = self.client.create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
        except Exception:
            pass
            
        # Upsert into fresh ChromaDB collection
        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas
        )
        
    def search(self, query: str, top_k: int = settings.RAG_TOP_K):
        """Searches for relevant documents."""
        model = get_embedding_model()
        query_embedding = model.embed_text(query)
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        
        return results

# Singleton instance
_vector_store = None

def get_vector_store() -> VectorStore:
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store
