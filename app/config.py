import os
from pathlib import Path

from dotenv import load_dotenv


load_dotenv()


BASE_DIR = Path(__file__).resolve().parent.parent

UPLOAD_DIR = BASE_DIR / "uploads"
CHROMA_DIR = BASE_DIR / "chroma_db"
SQLITE_DB_PATH = BASE_DIR / "documents.db"
DATABASE_URL = f"sqlite:///{SQLITE_DB_PATH}"

ALLOWED_EXTENSIONS = {".pdf", ".txt"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024

CHUNK_SIZE = 800
CHUNK_OVERLAP = 150

EMBEDDING_MODEL_NAME = os.getenv(
    "EMBEDDING_MODEL_NAME",
    "sentence-transformers/all-MiniLM-L6-v2"
)
LLM_MODEL_NAME = os.getenv("LLM_MODEL_NAME", "google/flan-t5-base")

CHROMA_COLLECTION_NAME = "document_chunks"
DEFAULT_TOP_K = 5

# Chroma distance is lower for more similar chunks. Tune this with your own
# documents if valid answers are rejected or unrelated questions slip through.
MAX_RETRIEVAL_DISTANCE = float(os.getenv("MAX_RETRIEVAL_DISTANCE", "1.1"))
