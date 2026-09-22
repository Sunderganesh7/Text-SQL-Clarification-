from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_check():
    """Simple health endpoint to verify the backend is running."""
    return {
        "status": "ok",
        "message": "Text-to-SQL backend is running"
    }

from sqlalchemy import text
from backend.database.connection import get_db_connection

@router.get("/database/tables")
def get_tables():
    """Returns a list of tables in the database."""
    try:
        with get_db_connection() as conn:
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result]
            return {"tables": tables}
    except Exception as e:
        return {"error": str(e)}

from fastapi import HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from backend.database.schema_inspector import get_schema, get_text_schema, refresh_schema

@router.get("/database/schema")
def api_get_schema():
    """Returns the complete structured database schema as JSON, always reflecting the current DB state."""
    try:
        # Force refresh to avoid stale cached schema after imports
        schema = refresh_schema()
        return schema.model_dump()
    except OperationalError as e:
        raise HTTPException(status_code=503, detail="Database connection failed. Please check the database status.")
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error occurred during schema extraction.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to extract schema due to an unexpected error.")

@router.get("/database/schema/text", response_class=PlainTextResponse)
def api_get_text_schema():
    """Returns a clean text representation of the schema."""
    try:
        text_schema = get_text_schema()
        return text_schema
    except OperationalError as e:
        raise HTTPException(status_code=503, detail="Database connection failed. Please check the database status.")
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Database error occurred during schema extraction.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to extract schema due to an unexpected error.")

from pydantic import BaseModel
from backend.rag.retriever import retrieve_schema_context

class RagSearchRequest(BaseModel):
    question: str

@router.post("/rag/search")
def api_rag_search(request: RagSearchRequest):
    """Searches the database schema context using RAG."""
    try:
        results = retrieve_schema_context(request.question)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG search failed: {str(e)}")

from backend.text_to_sql.service import execute_text_to_sql

class TextToSqlRequest(BaseModel):
    question: str

@router.post("/text-to-sql")
def api_text_to_sql(request: TextToSqlRequest):
    """Executes the full local Text-to-SQL pipeline."""
    result = execute_text_to_sql(request.question)
    
    if "error" in result:
        # Don't throw a 500 if it's a validation error or known issue, just return it
        return result
        
    return result

from backend.clarification.clarification_service import clarify_question
from backend.memory.memory_service import handle_query_with_memory
from typing import Optional

class ClarifyRequest(BaseModel):
    question: str

class QueryRequest(BaseModel):
    question: str
    session_id: Optional[str] = None
    clarification: Optional[str] = None
    active_dataset: Optional[str] = None

@router.post("/clarify")
def api_clarify(request: ClarifyRequest):
    """Detects ambiguity and asks for clarification if needed."""
    return clarify_question(request.question)

@router.post("/query")
def api_query(request: QueryRequest):
    """Full Phase 7 pipeline with Memory Integration."""
    q = request.question
    bypass_clarification = False
    
    if request.clarification:
        q = f"{q} - specifically: {request.clarification}"
        result = execute_text_to_sql(q, active_dataset=request.active_dataset)
        result["status"] = "success"
        return result
    # No clarification provided – proceed with normal flow
    bypass_clarification = False
    return handle_query_with_memory(q, request.session_id, bypass_clarification=bypass_clarification, active_dataset=request.active_dataset)

from fastapi import UploadFile, File
from backend.data_import.import_service import preview_file, upload_and_import

@router.post("/data/preview")
async def api_data_preview(file: UploadFile = File(...)):
    """Previews an uploaded file without importing it."""
    contents = await file.read()
    return preview_file(contents, file.filename)

@router.post("/data/upload")
async def api_data_upload(file: UploadFile = File(...)):
    """Uploads a file, creates dynamic tables, and refreshes RAG/schema."""
    contents = await file.read()
    return upload_and_import(contents, file.filename)

import json
from fastapi import Form
from backend.data_import.file_reader import read_file
from backend.data_import.data_cleaner import clean_dataset

@router.post("/data/clean")
async def api_data_clean(
    file: UploadFile = File(...),
    config: str = Form("{}")
):
    """Safely cleans an uploaded dataset based on config."""
    try:
        contents = await file.read()
        data = read_file(contents, file.filename)
        
        # If it's an excel file with multiple sheets, take the first one for cleaning
        import pandas as pd
        if isinstance(data, dict):
            if not data:
                raise ValueError("The uploaded Excel file has no sheets.")
            first_sheet = list(data.keys())[0]
            df = data[first_sheet]
        else:
            df = data
        
        clean_config = json.loads(config)
        res = clean_dataset(df, clean_config)
        
        cleaned_preview = res["cleaned_df"].head(5).replace({float('nan'): None}).to_dict(orient="records")
        raw_preview = res["raw_df"].head(5).replace({float('nan'): None}).to_dict(orient="records")
        
        return {
            "status": "success",
            "report": res["report"],
            "issues": res["issues"],
            "audit_log": res["audit_log"],
            "cleaned_preview": cleaned_preview,
            "raw_preview": raw_preview
        }
    except Exception as e:
        return {"error": str(e)}

from backend.database.connection import engine
from sqlalchemy.orm import Session
from backend.database.models import UploadedDataset

@router.get("/data/datasets")
def api_get_datasets():
    """Returns a list of all dynamically uploaded datasets."""
    try:
        with Session(engine) as session:
            datasets = session.query(UploadedDataset).order_by(UploadedDataset.upload_time.desc()).all()
            return {
                "datasets": [
                    {
                        "id": d.id,
                        "file_name": d.file_name,
                        "table_name": d.table_name,
                        "row_count": d.row_count,
                        "column_count": d.column_count,
                        "upload_time": d.upload_time.isoformat(),
                        "status": "Imported"
                    }
                    for d in datasets
                ]
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/data/datasets/{dataset_id}")
def api_delete_dataset(dataset_id: int):
    """Deletes an uploaded dataset, drops its table, and refreshes the schema."""
    try:
        with Session(engine) as session:
            dataset = session.query(UploadedDataset).filter(UploadedDataset.id == dataset_id).first()
            if not dataset:
                raise HTTPException(status_code=404, detail="Dataset not found")
            
            table_name = dataset.table_name
            
            # 1. Drop the table
            session.execute(text(f"DROP TABLE IF EXISTS `{table_name}`"))
            
            # 2. Delete metadata
            session.delete(dataset)
            session.commit()
            
        # 3. Refresh RAG and Schema
        from backend.data_import.schema_refresh import refresh_schema_and_rag
        refresh_schema_and_rag()
        
        return {"status": "success", "message": f"Dataset {table_name} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))