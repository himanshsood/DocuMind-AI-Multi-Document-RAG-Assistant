from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schemas import (
    DocumentDeleteResponse,
    DocumentListItem,
    DocumentSummaryResponse,
)
from app.services.documents import delete_document, list_documents
from app.services.ingestion import ingest_document
from app.services.summaries import summarize_document
from app.utils.file_utils import save_upload


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

# Take one uploaded document, process/ingest it into the system, and return the result
@router.post("/ingest")
async def ingest(
    file: UploadFile = File(...), # file is uploaded file, UploadFile is fast API's object e.g. company_policy.pdf
    replace: bool = Query(default=False), # this is a query parameter e.g. /ingest?replace=true. purpose-If this document already exists, should we replace/re-ingest it?
    db: Session = Depends(get_db) # FastAPI should call get_db() and give me a database session.
):
    try:

        # Ingest the document into chroma database (text -> chunks -> embeddings -> vectors -> save metadata to db)
        # We are sending 3 parameters in the function : uploaded document (file), database session, whether existing document should be replaced. 
        result = await ingest_document(
            file=file,
            db=db,
            replace=replace
        )

        return result

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Ingestion failed: {str(error)}"
        )



# This function takes the uploaded file & saves the file in uploads/  
@router.post("/upload")
async def upload_documents(
    files: list[UploadFile] = File(...)   # File(...) -> This parameter should come from a file upload in the HTTP request, not from JSON, means required
):
    try:
        uploaded = [] # This will store information about every successfully uploaded file.

        for file in files:
            document_id, _ = await save_upload(file) # Take the first returned value and store it in document_id. Ignore the second value

            uploaded.append(
                {
                    "document_id": document_id,
                    "filename": file.filename, # same file name that was uploaded
                    "status": "uploaded"
                }
            )

        return {
            "documents": uploaded
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.get("", response_model=list[DocumentListItem])
def get_documents(
    db: Session = Depends(get_db)
):
    return list_documents(db)


@router.post("/{document_id}/summary", response_model=DocumentSummaryResponse)
def summarize(
    document_id: str,
    db: Session = Depends(get_db)
):
    try:
        summary = summarize_document(
            db=db,
            document_id=document_id
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    if summary is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    return summary


@router.delete("/{document_id}", response_model=DocumentDeleteResponse)
def remove_document(
    document_id: str,
    db: Session = Depends(get_db)
):
    deleted = delete_document(
        db=db,
        document_id=document_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    return {
        "document_id": document_id,
        "status": "deleted"
    }
