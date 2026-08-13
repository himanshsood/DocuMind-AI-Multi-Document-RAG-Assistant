from datetime import datetime

from pydantic import BaseModel, Field


class DocumentUploadResult(BaseModel):
    document_id: str
    filename: str
    status: str


class DocumentIngestionResult(BaseModel):
    document_id: str
    filename: str
    file_path: str
    pages_processed: int
    chunks_created: int
    status: str


class DocumentListItem(BaseModel):
    document_id: str
    filename: str
    file_type: str
    file_size: int
    chunks_count: int
    uploaded_at: str


class DocumentDeleteResponse(BaseModel):
    document_id: str
    status: str


class Source(BaseModel):
    filename: str
    page_number: int


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=20)
    document_ids: list[str] | None = None
    file_types: list[str] | None = None
    uploaded_after: datetime | None = None
    uploaded_before: datetime | None = None


class AskResponse(BaseModel):
    answer: str
    sources: list[Source]


class DocumentSummaryResponse(BaseModel):
    document_id: str
    filename: str
    summary: str
    key_points: list[str]
