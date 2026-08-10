# Multi-Document RAG Assistant

A small FastAPI RAG service for uploading PDF/TXT documents, storing page-aware
chunks in ChromaDB, and asking questions with document/page citations.

This version uses local/free Hugging Face models:

- Embeddings: `sentence-transformers/all-MiniLM-L6-v2`
- Answer generation: `google/flan-t5-base`

No OpenAI API key is required.

## Setup

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

The first embedding or answer request may download the Hugging Face models. After
the models are cached, the app can reuse them locally.

## Run

```bash
uvicorn app.main:app --reload
```

Open the API docs at `http://127.0.0.1:8000/docs`.

## Endpoints

- `GET /health` checks that the API is running.
- `POST /documents/upload` saves one or more PDF/TXT files without indexing them.
- `POST /documents/ingest` incrementally adds one PDF/TXT file. It saves the
  file, extracts text, chunks it, embeds only the new chunks, and appends them
  to the existing ChromaDB collection.
- `GET /documents` lists all ingested documents from the SQLite catalog.
- `DELETE /documents/{document_id}` deletes the Chroma chunks, uploaded file,
  and SQLite record for one document.
- `POST /ask` retrieves relevant chunks and answers from the uploaded documents.

Example ask request:

```json
{
  "question": "What is the leave policy?",
  "top_k": 5
}
```

Duplicate ingestion is checked by file hash, with filename plus size as a simple
fallback. Duplicate files are rejected by default. To replace an existing match,
call:

```text
POST /documents/ingest?replace=true
```

If no chunks are found or retrieved chunks are weakly related, the service does
not call the LLM. It returns:

```json
{
  "answer": "I could not find enough information in the uploaded documents to answer this.",
  "sources": []
}
```

The relevance cutoff is controlled by `MAX_RETRIEVAL_DISTANCE` in `.env`.
