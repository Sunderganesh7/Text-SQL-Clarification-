import pandas as pd
from typing import Dict, Any, Union
import io

def read_file(file_content: bytes, filename: str) -> Union[pd.DataFrame, Dict[str, pd.DataFrame]]:
    """
    Reads a CSV or XLSX file and returns a DataFrame or a dict of DataFrames (for multiple sheets).
    Throws ValueError on failure.
    """
    ext = filename.lower().split('.')[-1]
    
    try:
        if ext == 'csv':
            # Attempt to read CSV
            df = pd.read_csv(io.BytesIO(file_content))
            return df
        elif ext == 'xlsx':
            # Attempt to read Excel
            dfs = pd.read_excel(io.BytesIO(file_content), sheet_name=None)
            return dfs
        else:
            raise ValueError(f"Unsupported file type: {ext}")
    except Exception as e:
        raise ValueError(f"Failed to read file: {str(e)}")
