# Text-to-SQL with RAG and Clarification Engine

This project will eventually be a Text-to-SQL system that integrates Retrieval-Augmented Generation (RAG) and a Clarification Engine using an LLM.

## Current Status: Phase 1 Setup
Phase 1 focuses on the initial project setup, including the basic folder structure, virtual environment, dependency management, and a simple FastAPI backend with a database connection skeleton.

## How to setup and run

### 1. Create the virtual environment
```bash
python -m venv .venv
```

### 2. Activate the virtual environment
- **Windows**: `.\.venv\Scripts\activate`
- **Mac/Linux**: `source .venv/bin/activate`

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Start the FastAPI backend
```bash
uvicorn backend.main:app --reload
```

### 5. Test the `/health` endpoint
Navigate to http://127.0.0.1:8000/health in your browser or run:
```bash
curl http://127.0.0.1:8000/health
```
