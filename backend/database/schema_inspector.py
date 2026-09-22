from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import inspect
from backend.database.connection import engine
from backend.config import settings

# --- Pydantic Models for Schema Representation ---

class ColumnInfo(BaseModel):
    name: str
    data_type: str
    nullable: bool
    primary_key: bool
    default: Optional[str] = None

class ForeignKeyInfo(BaseModel):
    column: str
    referred_table: str
    referred_column: str

class TableInfo(BaseModel):
    name: str
    columns: List[ColumnInfo]
    foreign_keys: List[ForeignKeyInfo]

class SchemaInfo(BaseModel):
    database: str
    tables: List[TableInfo]

# --- Schema Caching ---

_cached_schema: Optional[SchemaInfo] = None

def refresh_schema() -> SchemaInfo:
    """Forces a refresh of the schema by re-inspecting the database."""
    global _cached_schema
    _cached_schema = inspect_schema()
    return _cached_schema

def get_schema() -> SchemaInfo:
    """Returns the cached schema or inspects if not yet cached."""
    global _cached_schema
    if _cached_schema is None:
        _cached_schema = inspect_schema()
    return _cached_schema

# --- Schema Inspection Logic ---

def inspect_schema() -> SchemaInfo:
    """Dynamically inspects the MySQL database and builds a structured schema representation."""
    db_name = settings.DATABASE_URL.split("/")[-1]
    
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    
    tables_info = []
    
    for table_name in table_names:
        # Inspect columns
        columns = inspector.get_columns(table_name)
        pk_constraint = inspector.get_pk_constraint(table_name)
        pk_columns = pk_constraint.get('constrained_columns', [])
        
        cols_info = []
        for col in columns:
            col_info = ColumnInfo(
                name=col['name'],
                data_type=str(col['type']),
                nullable=col.get('nullable', True),
                primary_key=(col['name'] in pk_columns),
                default=str(col['default']) if col.get('default') is not None else None
            )
            cols_info.append(col_info)
            
        # Inspect foreign keys
        fks = inspector.get_foreign_keys(table_name)
        fks_info = []
        for fk in fks:
            # fk mapping format depending on sqlalchemy inspector
            for i, constrained_col in enumerate(fk['constrained_columns']):
                fk_info = ForeignKeyInfo(
                    column=constrained_col,
                    referred_table=fk['referred_table'],
                    referred_column=fk['referred_columns'][i]
                )
                fks_info.append(fk_info)
                
        table_info = TableInfo(
            name=table_name,
            columns=cols_info,
            foreign_keys=fks_info
        )
        tables_info.append(table_info)
        
    return SchemaInfo(database=db_name, tables=tables_info)

# --- Text & RAG Conversion Logic ---

def get_text_schema() -> str:
    """Converts the structured schema into a clean, human-readable text format."""
    schema = get_schema()
    
    lines = [f"Database: {schema.database}\n"]
    
    for table in schema.tables:
        lines.append(f"Table: {table.name}")
        lines.append("Columns:")
        for col in table.columns:
            props = [col.data_type]
            if col.primary_key:
                props.append("PRIMARY KEY")
            if not col.nullable:
                props.append("NOT NULL")
            
            # Check if this column is a foreign key
            fk = next((f for f in table.foreign_keys if f.column == col.name), None)
            if fk:
                props.append(f"FOREIGN KEY \u2192 {fk.referred_table}.{fk.referred_column}")
                
            props_str = ", ".join(props)
            lines.append(f"- {col.name} ({props_str})")
        lines.append("") # Empty line between tables
        
    return "\n".join(lines).strip()

def get_rag_documents() -> List[str]:
    """Prepares schema information as textual documents for future RAG ingestion."""
    schema = get_schema()
    docs = []
    
    for i, table in enumerate(schema.tables, 1):
        doc_lines = [f"Document {i}:", f"Table: {table.name}"]
        
        # Simple heuristic description generator based on table name and columns
        col_names = [col.name for col in table.columns]
        desc = f"Description:\nContains information about {table.name}, including "
        if len(col_names) > 1:
            desc += ", ".join(col_names[:-1]) + " and " + col_names[-1] + "."
        elif col_names:
            desc += col_names[0] + "."
        else:
            desc += "various attributes."
        
        doc_lines.append(desc)
        
        if table.foreign_keys:
            doc_lines.append("\nRelationship:")
            for fk in table.foreign_keys:
                doc_lines.append(f"{table.name}.{fk.column} \u2192 {fk.referred_table}.{fk.referred_column}")
                
        docs.append("\n".join(doc_lines))
        
    return docs
