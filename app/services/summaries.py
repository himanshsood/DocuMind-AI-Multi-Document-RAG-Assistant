from sqlalchemy.orm import Session

from app.models.document import DocumentRecord
from app.services.rag import generate_answer
from app.services.vector_store import get_chunks_by_document_id


DIRECT_SUMMARY_CHARS = 6000
SUMMARY_GROUP_CHARS = 4500


def join_chunk_text(chunks: list[dict]) -> str:
    """Combine chunks in document order for summarization prompts."""

    return "\n\n".join(
        chunk["text"].strip()
        for chunk in chunks
        if chunk.get("text") and chunk["text"].strip()
    )


def group_chunks(
    chunks: list[dict],
    max_chars: int = SUMMARY_GROUP_CHARS
) -> list[str]:
    """Group chunks into prompt-sized text batches."""

    groups = []
    current = []
    current_size = 0

    for chunk in chunks:
        text = (chunk.get("text") or "").strip()

        if not text:
            continue

        next_size = current_size + len(text)

        if current and next_size > max_chars:
            groups.append("\n\n".join(current))
            current = []
            current_size = 0

        current.append(text)
        current_size += len(text)

    if current:
        groups.append("\n\n".join(current))

    return groups


def summarize_text(text: str) -> str:
    """Ask the local generation model for a concise grounded summary."""

    prompt = (
        "Summarize the document text below using only the provided text. "
        "Write a concise summary in 4 to 6 sentences.\n\n"
        f"Document text:\n{text}\n\n"
        "Summary:"
    )

    return generate_answer(prompt).strip()


def extract_key_points(text: str) -> list[str]:
    """Ask the local generation model for compact key points."""

    prompt = (
        "Extract up to 5 key points from the document text below. "
        "Use short bullet-style lines without numbering.\n\n"
        f"Document text:\n{text}\n\n"
        "Key points:"
    )

    raw_points = generate_answer(prompt).strip()
    points = []

    for line in raw_points.splitlines():
        point = line.strip().lstrip("-*0123456789. ").strip()

        if point:
            points.append(point)

    if points:
        return points[:5]

    return [
        sentence.strip()
        for sentence in raw_points.split(".")
        if sentence.strip()
    ][:5]


def summarize_document(
    db: Session,
    document_id: str
) -> dict | None:
    """Summarize one ingested document, using map-reduce for large inputs."""

    document = db.get(DocumentRecord, document_id)

    if document is None:
        return None

    chunks = get_chunks_by_document_id(document_id)

    if not chunks:
        raise ValueError("No chunks found for this document.")

    full_text = join_chunk_text(chunks)

    if not full_text:
        raise ValueError("No chunk text found for this document.")

    if len(full_text) <= DIRECT_SUMMARY_CHARS:
        source_text = full_text
    else:
        group_summaries = [
            summarize_text(group)
            for group in group_chunks(chunks)
        ]
        source_text = "\n\n".join(group_summaries)

    summary = summarize_text(source_text)
    key_points = extract_key_points(source_text)

    return {
        "document_id": document.document_id,
        "filename": document.filename,
        "summary": summary,
        "key_points": key_points
    }
