from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

from app.config import DEFAULT_TOP_K, LLM_MODEL_NAME, MAX_RETRIEVAL_DISTANCE
from app.services.vector_store import search_documents


NOT_ENOUGH_INFORMATION = (
    "I could not find enough information in the uploaded documents to answer this."
)

_model = None
_tokenizer = None


def get_answer_model() -> tuple[AutoTokenizer, AutoModelForSeq2SeqLM]:
    """Load the local FLAN-T5 model lazily so startup stays lightweight."""

    global _model, _tokenizer

    if _tokenizer is None or _model is None:
        _tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_NAME)
        _model = AutoModelForSeq2SeqLM.from_pretrained(LLM_MODEL_NAME)

    return _tokenizer, _model


def generate_answer(prompt: str) -> str:
    """Generate an answer with FLAN-T5 without relying on pipeline tasks."""

    tokenizer, model = get_answer_model()
    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        max_length=1024
    )
    output_ids = model.generate(
        **inputs,
        max_new_tokens=160,
        do_sample=False
    )

    return tokenizer.decode(
        output_ids[0],
        skip_special_tokens=True
    ).strip()


def build_context(retrieved_chunks: list[dict]) -> str:
    """Create compact, citation-friendly context blocks for the LLM."""

    context_blocks = []

    for index, chunk in enumerate(retrieved_chunks, start=1):
        source = f"{chunk['filename']} page {chunk['page_number']}"
        context_blocks.append(
            f"Source {index}: {source}\n{chunk['text']}"
        )

    return "\n\n".join(context_blocks)


def build_prompt(question: str, context: str) -> str:
    """Keep the prompt strict so answers stay grounded in retrieved text."""

    return (
        "Answer the question using only the context below. Do not use outside "
        "knowledge. Do not guess or invent facts. If the context does not "
        f"directly answer the question, say exactly: {NOT_ENOUGH_INFORMATION}\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {question}\n"
        "Answer:"
    )


def keep_relevant_chunks(
    retrieved_chunks: list[dict],
    max_distance: float = MAX_RETRIEVAL_DISTANCE
) -> list[dict]:
    """Drop weak matches so unrelated questions never reach the LLM."""

    return [
        chunk
        for chunk in retrieved_chunks
        if chunk.get("distance") is not None and chunk["distance"] <= max_distance
    ]


def get_unique_sources(retrieved_chunks: list[dict]) -> list[dict]:
    """Return each filename/page pair once, preserving retrieval order."""

    seen = set()
    sources = []

    for chunk in retrieved_chunks:
        source_key = (chunk["filename"], chunk["page_number"])

        if source_key in seen:
            continue

        seen.add(source_key)
        sources.append(
            {
                "filename": chunk["filename"],
                "page_number": chunk["page_number"]
            }
        )

    return sources


def answer_question(
    question: str,
    top_k: int = DEFAULT_TOP_K,
    document_ids: list[str] | None = None
) -> dict:
    """Retrieve relevant chunks and generate a cited answer with FLAN-T5."""

    retrieved_chunks = search_documents(
        query=question,
        top_k=top_k,
        document_ids=document_ids
    )

    relevant_chunks = keep_relevant_chunks(retrieved_chunks)

    if not relevant_chunks:
        return {
            "answer": NOT_ENOUGH_INFORMATION,
            "sources": []
        }

    context = build_context(relevant_chunks)
    prompt = build_prompt(question=question, context=context)

    answer = generate_answer(prompt)

    if not answer:
        answer = NOT_ENOUGH_INFORMATION

    return {
        "answer": answer,
        "sources": get_unique_sources(relevant_chunks)
    }
