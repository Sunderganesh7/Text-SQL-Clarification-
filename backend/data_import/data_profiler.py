import pandas as pd
from backend.data_import.table_name_generator import clean_identifier

def profile_dataframe(df: pd.DataFrame, file_name: str, sheet_name: str = None) -> dict:
    """Profiles a dataframe to get metadata for preview and import."""
    
    # 1. Clean columns
    original_cols = list(df.columns)
    clean_cols = [clean_identifier(str(c)) for c in original_cols]
    
    # Ensure unique columns
    seen = set()
    unique_clean_cols = []
    for c in clean_cols:
        new_c = c
        count = 1
        while new_c in seen:
            new_c = f"{c}_{count}"
            count += 1
        seen.add(new_c)
        unique_clean_cols.append(new_c)
        
    df.columns = unique_clean_cols
    
    # 2. Get types
    types = {}
    mysql_types = {}
    for col in df.columns:
        pd_type = str(df[col].dtype)
        types[col] = pd_type
        mysql_types[col] = map_pandas_to_mysql_type(df[col])
        
    # 3. Missing values
    missing = df.isna().sum().to_dict()
    
    # 4. Preview
    # Fill NaN with None for JSON serialization
    preview = df.head(5).where(pd.notnull(df), None).to_dict(orient="records")
    
    return {
        "file_name": file_name,
        "sheet_name": sheet_name,
        "rows": len(df),
        "columns": len(df.columns),
        "column_names": unique_clean_cols,
        "original_column_names": original_cols,
        "detected_types": types,
        "mysql_types": mysql_types,
        "missing_values": missing,
        "preview": preview
    }

def map_pandas_to_mysql_type(series: pd.Series) -> str:
    """Maps a pandas series dtype to a safe MySQL type."""
    dtype = str(series.dtype)
    
    if 'int' in dtype:
        return 'BIGINT'
    elif 'float' in dtype:
        return 'DOUBLE'
    elif 'bool' in dtype:
        return 'BOOLEAN'
    elif 'datetime' in dtype:
        return 'DATETIME'
    else:
        # String type
        # Check max length to decide VARCHAR vs TEXT
        # Dropna to avoid errors on float NaN in strings
        max_len = series.dropna().astype(str).map(len).max()
        if pd.isna(max_len):
            return 'VARCHAR(255)' # Empty column
        if max_len > 255:
            return 'TEXT'
        else:
            return 'VARCHAR(255)'
