import pandas as pd
from sqlalchemy import text
from backend.database.connection import get_db_connection
from backend.data_import.data_profiler import profile_dataframe

def import_dataframe_to_mysql(df: pd.DataFrame, table_name: str, profile_metadata: dict) -> dict:
    """
    Creates a table in MySQL and imports the DataFrame using SQLAlchemy.
    Uses transaction rollback if it fails.
    """
    cols = profile_metadata['column_names']
    mysql_types = profile_metadata['mysql_types']
    
    create_stmt = f"CREATE TABLE IF NOT EXISTS {table_name} (\n"
    col_defs = []
    
    # We will just create columns, no primary key to keep it simple, 
    # unless we want an auto-increment ID. Let's add an auto-increment ID to make it robust.
    col_defs.append(f"id INT AUTO_INCREMENT PRIMARY KEY")
    
    for c in cols:
        col_defs.append(f"{c} {mysql_types[c]}")
        
    create_stmt += ",\n".join(col_defs)
    create_stmt += "\n);"
    
    try:
        with get_db_connection() as conn:
            # First create the table. We do NOT drop if it exists to be safe,
            # but table_name_generator should have given us a unique name.
            conn.execute(text(create_stmt))
            
            # Now insert data using to_sql (SQLAlchemy handles transactions)
            # We use 'append' because we just created it.
            # We don't include the 'id' column in the DataFrame, MySQL will auto-increment it.
            df.to_sql(name=table_name, con=conn, if_exists='append', index=False)
            
            # Verify rows
            res = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}")).fetchone()
            db_row_count = res[0]
            
            # Commit the transaction
            conn.commit()
            
            return {
                "status": "success",
                "table": table_name,
                "rows_imported": db_row_count,
                "columns": len(cols)
            }
    except Exception as e:
        return {
            "status": "error",
            "message": f"MySQL import failed: {str(e)}"
        }
