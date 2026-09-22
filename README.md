
# Text-to-SQL Clarification & RAG System

An AI-powered Text-to-SQL system that converts natural language questions into SQL queries while using schema-aware clarification, retrieval-augmented generation (RAG), query validation, and safety controls to improve SQL reliability.

## 📌 Overview

Text-to-SQL Clarification is designed to help users interact with databases using natural language instead of writing SQL manually.

The system:

- Understands natural language questions
- Analyzes the available database schema
- Detects ambiguous or incomplete queries
- Asks clarification questions when required
- Generates SQL queries
- Validates generated SQL
- Prevents destructive SQL operations
- Retrieves relevant information using RAG
- Executes safe queries and returns results

## 🧠 Core Workflow

```text
User Question
      ↓
Query Understanding
      ↓
Schema Analysis
      ↓
Ambiguity Detection
      ↓
Clarification (if required)
      ↓
RAG / Relevant Context Retrieval
      ↓
Text-to-SQL Generation
      ↓
SQL Validation & Safety Check
      ↓
Query Execution
      ↓
Results
````

## 🚀 Key Features

### 1. Natural Language to SQL

Users can ask questions in simple natural language, and the system converts them into SQL queries.

Example:

```text
"Show the total sales for each city."
```

The system generates an appropriate SQL query based on the available database schema.

### 2. Schema-Aware Query Understanding

The system analyzes database tables, columns, and relationships before generating SQL.

This helps the model understand the actual database structure instead of generating SQL blindly.

### 3. Query Clarification

When a question is ambiguous, the system can identify missing information and request clarification before generating the final SQL query.

Example:

```text
User:
"Show the highest sales."

System:
"Do you want the highest individual sale or the highest
total sales by customer?"
```

### 4. RAG-Based Context Retrieval

Relevant database and domain information can be retrieved using a Retrieval-Augmented Generation pipeline.

The project uses:

* Sentence Transformers
* ChromaDB
* Semantic similarity search
* Retrieved contextual information

### 5. SQL Safety

The system includes validation to prevent unsafe or destructive SQL operations.

Destructive statements such as:

```text
DROP
DELETE
TRUNCATE
ALTER
```

are blocked according to the project's safety rules.

### 6. Query Result Limiting

The system applies a maximum result-row limit to prevent unnecessarily large database responses.

Current configured limit:

```text
MAX_QUERY_ROWS = 1000
```

### 7. Database Schema Explorer

The system provides schema information that helps the Text-to-SQL pipeline understand available tables and columns.

### 8. Testing & Reliability

The project includes multiple test scripts covering areas such as:

* Text-to-SQL generation
* SQL reliability
* SQL security
* Schema handling
* API verification
* Performance testing
* File upload testing

## 🏗️ Project Structure

```text
text-to-sql-clarification/
│
├── backend/
│   ├── API services
│   ├── Text-to-SQL logic
│   ├── RAG components
│   └── database functionality
│
├── frontend/
│   ├── UI components
│   ├── pages
│   └── frontend services
│
├── data/
│   └── project data
│
├── scripts/
│   ├── test_schema.py
│   ├── test_sql_reliability.py
│   ├── test_sql_security.py
│   ├── test_text_to_sql.py
│   └── verify_api.py
│
├── tests/
│
├── scratch/
│
├── requirements.txt
├── .env.example
├── README.md
└── schema_output.txt
```

## 🛠️ Technology Stack

### Backend

* Python
* FastAPI
* Pydantic

### AI / NLP

* Large Language Model
* Sentence Transformers
* Retrieval-Augmented Generation (RAG)
* ChromaDB

### Database

* SQL databases
* SQLite/database schema handling

### Frontend

* React
* JavaScript/TypeScript
* Modern web UI

### Testing

* Python testing scripts
* API testing
* SQL security testing
* Performance testing

## 🔐 Security

The system includes several safety mechanisms:

* SQL query validation
* Destructive SQL statement blocking
* Result-row limits
* Input validation
* Error handling
* Environment variables for sensitive configuration

API keys and secrets should be stored in `.env` and should never be committed to GitHub.

## 📊 Example Use Cases

The system can be used for:

* Business data analysis
* Database exploration
* Natural language analytics
* SQL learning
* Automated reporting
* Data querying without manually writing SQL

## 🧪 Testing

The repository contains dedicated scripts for testing different parts of the system.

Examples:

```text
scripts/test_schema.py
scripts/test_sql_reliability.py
scripts/test_sql_security.py
scripts/test_text_to_sql.py
scripts/verify_api.py
test_mumbai.py
test_perf.py
test_upload.py
```

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/Sunderganesh7/Text-SQL-Clarification-.git
```

Move into the project:

```bash
cd text-to-sql-clarification
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your environment file:

```text
.env
```

Use `.env.example` as the reference for required configuration.

## ▶️ Running the Project

Start the backend using the project's configured FastAPI entry point.

Example:

```bash
uvicorn backend.main:app --reload
```

> The exact startup command may vary depending on the current backend entry file.

Start the frontend using its configured development command.

## 🔮 Future Improvements

Potential future improvements include:

* Support for more database systems
* Improved clarification reasoning
* Better schema relationship detection
* Advanced SQL optimization
* Multi-turn conversational querying
* User authentication
* Query history
* Advanced analytics and visualization
* Production-grade database scaling



