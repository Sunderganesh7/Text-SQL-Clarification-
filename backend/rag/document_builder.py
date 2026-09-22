from backend.database.schema_inspector import SchemaInfo
from typing import List, Dict, Any
from pydantic import BaseModel

class RAGDocument(BaseModel):
    id: str
    content: str
    metadata: Dict[str, Any]

def build_schema_documents(schema: SchemaInfo) -> List[RAGDocument]:
    documents = []
    
    # 1. Build Table Documents
    for table in schema.tables:
        doc_id = f"table_{table.name}"
        
        content_lines = [f"Table: {table.name}", ""]
        content_lines.append(f"This table contains {table.name} information.")
        content_lines.append("")
        content_lines.append("Columns:")
        for col in table.columns:
            props = [col.data_type]
            if col.primary_key:
                props.append("PRIMARY KEY")
            if not col.nullable:
                props.append("NOT NULL")
            content_lines.append(f"{col.name}: ({', '.join(props)})")
            
        content = "\n".join(content_lines)
        metadata = {
            "type": "table",
            "table": table.name
        }
        
        documents.append(RAGDocument(id=doc_id, content=content, metadata=metadata))
        
        # 2. Build Relationship Documents
        for fk in table.foreign_keys:
            rel_id = f"relationship_{table.name}_{fk.referred_table}_{fk.column}"
            
            rel_content = [
                "Table relationship:",
                "",
                f"{table.name}.{fk.column} references {fk.referred_table}.{fk.referred_column}"
            ]
            
            rel_metadata = {
                "type": "relationship",
                "source_table": table.name,
                "target_table": fk.referred_table
            }
            
            documents.append(RAGDocument(id=rel_id, content="\n".join(rel_content), metadata=rel_metadata))
            
    return documents
