from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import DocumentRecord
from app.services.vector_store import delete_chunks_by_document_id


def format_document_record(document: DocumentRecord) -> dict:
    """Return the public document shape used by GET /documents."""

    return {
        "document_id": document.document_id,
        "filename": document.filename,
        "file_type": document.file_type,
        "file_size": document.file_size,
        "chunks_count": document.chunks_count,
        "uploaded_at": document.uploaded_at.isoformat()
    }


def create_document_record(
    db: Session,
    document_id: str,
    filename: str,
    file_path: str,
    file_hash: str,
    file_size: int,
    chunks_count: int
) -> DocumentRecord:
    """Persist document-level metadata outside Chroma."""

    document = DocumentRecord(
        document_id=document_id,
        filename=filename,
        file_type=Path(filename).suffix.lower().lstrip("."),
        file_path=file_path,
        file_hash=file_hash,
        file_size=file_size,
        chunks_count=chunks_count
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


def find_duplicate_document(
    db: Session,
    filename: str,
    file_hash: str,
    file_size: int
) -> DocumentRecord | None:
    """Find an existing upload by content hash or filename plus size."""

    return db.scalars(
        select(DocumentRecord).where(
            (DocumentRecord.file_hash == file_hash)
            | (
                (DocumentRecord.filename == filename)
                & (DocumentRecord.file_size == file_size)
            )
        )
    ).first()


def list_documents(db: Session) -> list[dict]:
    """Return all ingested documents ordered by newest first."""

    documents = db.scalars(
        select(DocumentRecord).order_by(DocumentRecord.uploaded_at.desc())
    ).all()

    return [
        format_document_record(document)
        for document in documents
    ]


def delete_document(db: Session, document_id: str) -> bool:
    """Remove one document from Chroma, uploads, and SQLite."""

    document = db.get(DocumentRecord, document_id)

    if document is None:
        return False

    delete_chunks_by_document_id(document_id)

    file_path = Path(document.file_path)

    if file_path.exists():
        file_path.unlink()

    db.delete(document)
    db.commit()

    return True
