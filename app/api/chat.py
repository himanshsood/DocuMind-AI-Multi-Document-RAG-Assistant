from fastapi import APIRouter, HTTPException

from app.models.schemas import AskRequest, AskResponse
from app.services.rag import answer_question


router = APIRouter(
    tags=["Chat"]
)


@router.post("/ask", response_model=AskResponse)
def ask(request: AskRequest):
    try:
        return answer_question(
            question=request.question,
            top_k=request.top_k,
            document_ids=request.document_ids,
            file_types=request.file_types,
            uploaded_after=request.uploaded_after,
            uploaded_before=request.uploaded_before
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Question answering failed: {str(error)}"
        )
