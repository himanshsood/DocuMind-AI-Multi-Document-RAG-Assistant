
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.services.extraction import extract_text
from app.services.chunking import chunk_pages
from app.services.documents import (
    create_document_record,
    delete_document,
    find_duplicate_document,
)
from app.services.embeddings import generate_embeddings
from app.services.vector_store import add_chunks
from app.utils.file_utils import (
    calculate_file_hash,
    read_upload,
    save_upload_contents,
    validate_upload,
)

# Upload, read file, validate, check duplicate, save file, extract text, split into chunks, generate embeddings, store chunks+embeddings in chroma, save document's metadata in sql db, return result
async def ingest_document(
    file: UploadFile,
    db: Session,
    replace: bool = False # Controls what happens if the same document was already uploaded. 
) -> dict:
    """
    Complete document ingestion pipeline:

    Upload
    -> Save
    -> Extract
    -> Chunk
    -> Embed
    -> Store in Chroma
    -> Save document details
    """

    # Get filename
    filename = file.filename or "uploaded-document" # get file name if it exists, otherwise use "uploaded-document"

    contents = await read_upload(file) # reads the actual file into memory as bytes

    validate_upload(filename, contents) # checks whether the file is accepatable (pdf/txt)

    file_hash = calculate_file_hash(contents) # This creates a unique fingerprint of the file's contents. same files will have same hash 
    file_size = len(contents) # Since contents is bytes, len() gives the number of bytes.

    # Check if the uploaded document already exists in the database.
    duplicate = find_duplicate_document(
        db=db,
        filename=filename,
        file_hash=file_hash,
        file_size=file_size
    )

    # If same document exists in the database, replace = False
    if duplicate and not replace:
        raise ValueError(
            "This file has already been ingested. "
            "Call this endpoint with replace=true to replace it."
        )
    # If document exists in the database but user explicitly says replace the old version with new 
    if duplicate and replace:
        delete_document(
            db=db,
            document_id=duplicate.document_id
        )

    # Save the uploaded file - saves the actual file to your storage (uploads/8f23a1c4-....pdf)
    document_id, file_path = save_upload_contents(
        filename=filename,
        contents=contents
    )

    # Keep extraction page-wise so every chunk can cite the source page.
    pages = extract_text(str(file_path))

    if not pages:
        raise ValueError(
            f"No extractable text found in {filename}."
        )

    # make chunks of the text
    chunks = chunk_pages(
        pages=pages,
        document_id=document_id,
        filename=filename
    )

    # suppose if 0 chunks, return
    if not chunks:
        raise ValueError(
            f"No chunks could be created from {filename}."
        )

    # store text with chunk
    texts = [
        chunk["text"]
        for chunk in chunks
    ]

    # for generating embeddings, we only need text
    embeddings = generate_embeddings(texts)

    # Store chunks in chroma 
    add_chunks(
        chunks=chunks,
        embeddings=embeddings
    )

    # Build document details (prepare details that your API will return)
    document_details = {
        "document_id": document_id,
        "filename": filename,
        "file_path": str(file_path),
        "pages_processed": len(pages),
        "chunks_created": len(chunks),
        "status": "ingested"
    }

    # Save document metadata to SQL database
    create_document_record(
        db=db,
        document_id=document_id,
        filename=filename,
        file_path=str(file_path),
        file_hash=file_hash,
        file_size=file_size,
        chunks_count=len(chunks)
    )

    return document_details
