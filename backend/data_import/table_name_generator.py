import re

def generate_table_name(filename: str, sheet_name: str = None) -> str:
    """
    Generates a safe table name from the filename and optional sheet name.
    """
    # Remove extension
    base = filename.rsplit('.', 1)[0]
    
    if sheet_name:
        base = f"{base}_{sheet_name}"
        
    return clean_identifier(base)

def clean_identifier(name: str) -> str:
    """
    Converts arbitrary strings into safe MySQL identifiers.
    Rules: lowercase, spaces to _, remove unsafe chars, prevent SQL reserved words.
    """
    # lowercase
    name = name.lower()
    
    # spaces to underscore
    name = re.sub(r'\s+', '_', name)
    
    # remove anything that is not alphanumeric or underscore
    name = re.sub(r'[^a-z0-9_]', '', name)
    
    # collapse multiple underscores
    name = re.sub(r'_+', '_', name)
    
    # strip leading/trailing underscores
    name = name.strip('_')
    
    # if it starts with a number, prefix it
    if name and name[0].isdigit():
        name = "tbl_" + name
        
    # Prevent common reserved words (simple check)
    reserved = {"select", "insert", "update", "delete", "create", "drop", "table", "index", "from", "where", "group", "by"}
    if name in reserved:
        name = name + "_data"
        
    if not name:
        name = "dynamic_table"
        
    return name
