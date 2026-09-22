import pandas as pd
from backend.data_import.file_reader import read_file
from backend.data_import.data_profiler import profile_dataframe
from backend.data_import.table_name_generator import generate_table_name
from backend.data_import.mysql_importer import import_dataframe_to_mysql
from backend.data_import.schema_refresh import refresh_schema_and_rag
from sqlalchemy import text
from backend.database.connection import get_db_connection, engine
from sqlalchemy.orm import Session
from backend.database.models import UploadedDataset

# Limits
MAX_FILE_SIZE_MB = 50
MAX_ROWS_PER_SHEET = 100000

def validate_and_read(file_content: bytes, filename: str) -> dict:
    # 1. Size limit (bytes)
    if len(file_content) > MAX_FILE_SIZE_MB * 1024 * 1024:
        return {"status": "error", "message": f"File exceeds {MAX_FILE_SIZE_MB}MB limit."}
        
    if not file_content:
        return {"status": "error", "message": "The uploaded file is empty."}
        
    ext = filename.lower().split('.')[-1]
    if ext not in ['csv', 'xlsx']:
        return {"status": "error", "message": "Unsupported file type. Please upload a CSV or XLSX file."}
        
    try:
        data = read_file(file_content, filename)
    except Exception as e:
        return {"status": "error", "message": str(e)}
        
    return {"status": "success", "data": data}

def get_unique_table_name(base_name: str) -> str:
    """Ensure the table name doesn't collide with existing ones."""
    try:
        with get_db_connection() as conn:
            result = conn.execute(text("SHOW TABLES"))
            existing = {row[0] for row in result}
            
            name = base_name
            count = 2
            while name in existing:
                name = f"{base_name}_{count}"
                count += 1
            return name
    except:
        return base_name

def preview_file(file_content: bytes, filename: str) -> dict:
    """Returns a profile/preview of the dataset."""
    res = validate_and_read(file_content, filename)
    if res['status'] == 'error':
        return res
        
    data = res['data']
    profiles = []
    
    if isinstance(data, pd.DataFrame):
        df = data
        if df.empty or len(df.columns) == 0:
            return {"status": "error", "message": "The uploaded file has no data."}
        profiles.append(profile_dataframe(df, filename))
    elif isinstance(data, dict):
        for sheet_name, df in data.items():
            if not df.empty and len(df.columns) > 0:
                profiles.append(profile_dataframe(df, filename, sheet_name))
                
        if not profiles:
            return {"status": "error", "message": "The uploaded file has no data in any sheets."}
            
    return {
        "status": "success",
        "file_name": filename,
        "profiles": profiles
    }

def upload_and_import(file_content: bytes, filename: str) -> dict:
    """Full pipeline to import file data into MySQL and refresh schema/RAG."""
    res = validate_and_read(file_content, filename)
    if res['status'] == 'error':
        return res
        
    data = res['data']
    
    dfs_to_import = []
    
    if isinstance(data, pd.DataFrame):
        df = data
        if df.empty or len(df.columns) == 0:
            return {"status": "error", "message": "The uploaded file has no data."}
        dfs_to_import.append((None, df))
    elif isinstance(data, dict):
        for sheet_name, df in data.items():
            if not df.empty and len(df.columns) > 0:
                dfs_to_import.append((sheet_name, df))
        if not dfs_to_import:
            return {"status": "error", "message": "The uploaded file has no data in any sheets."}
            
    tables_created = []
    total_rows = 0
    total_cols = 0
    
    for sheet_name, df in dfs_to_import:
        if len(df) > MAX_ROWS_PER_SHEET:
            return {"status": "error", "message": f"Sheet '{sheet_name or filename}' exceeds maximum of {MAX_ROWS_PER_SHEET} rows."}
            
        profile = profile_dataframe(df, filename, sheet_name)
        base_table_name = generate_table_name(filename, sheet_name)
        safe_table_name = get_unique_table_name(base_table_name)
        
        # Make sure column names in df match the unique cleaned names before insert
        df.columns = profile['column_names']
        
        import_res = import_dataframe_to_mysql(df, safe_table_name, profile)
        if import_res['status'] == 'error':
            return import_res
            
        tables_created.append(import_res['table'])
        total_rows += import_res['rows_imported']
        total_cols += import_res['columns']
        
        # Save metadata to DB
        with Session(engine) as session:
            dataset_record = UploadedDataset(
                file_name=filename,
                table_name=safe_table_name,
                row_count=import_res['rows_imported'],
                column_count=import_res['columns']
            )
            session.add(dataset_record)
            session.commit()
        
    # Refresh RAG and Schema
    refresh_res = refresh_schema_and_rag()
    
    return {
        "status": "success",
        "file_name": filename,
        "tables_created": tables_created,
        "rows_imported": total_rows,
        "columns": total_cols,
        "schema_refreshed": refresh_res.get('schema_refreshed', False),
        "rag_refreshed": refresh_res.get('rag_refreshed', False)
    }
