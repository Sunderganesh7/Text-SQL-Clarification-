import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # Use environment variables, with a fallback for local development if needed
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mysql+pymysql://USERNAME:PASSWORD@localhost:3306/text_to_sql")
    
    # RAG Settings
    CHROMA_DB_DIR: str = os.getenv("CHROMA_DB_DIR", "./data/chroma")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    RAG_TOP_K: int = int(os.getenv("RAG_TOP_K", "15"))
    
    # LLM Settings
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
    
    # Query Settings
    MAX_QUERY_ROWS: int = int(os.getenv("MAX_QUERY_ROWS", "1000"))

settings = Settings()
