from sqlalchemy import create_engine
from backend.config import settings

# Create SQLAlchemy engine with connection health check and recycle
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600
)

def get_db_connection():
    """Returns a new database connection."""
    return engine.connect()
