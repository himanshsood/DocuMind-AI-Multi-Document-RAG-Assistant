
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import CHUNK_OVERLAP, CHUNK_SIZE


text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
    separators=[
        "\n\n",
        "\n",
        ". ",
        " ",
        ""
    ]
)


def chunk_pages(
    pages: list[dict],
    document_id: str,
    filename: str
) -> list[dict]:
    """
    Split extracted pages into chunks while preserving
    document and page-level metadata.
    """

    chunks = []
    chunk_index = 0

    for page in pages:

        page_text = page["text"]
        page_number = page["page_number"]

        # Skip empty pages
        if not page_text.strip():
            continue

        page_chunks = text_splitter.split_text(page_text)

        for chunk_text in page_chunks:

            chunk_id = f"{document_id}_chunk_{chunk_index}"

            chunks.append(
                {
                    "text": chunk_text,
                    "metadata": {
                        "chunk_id": chunk_id,
                        "document_id": document_id,
                        "filename": filename,
                        "page_number": page_number,
                        "chunk_index": chunk_index
                    }
                }
            )

            chunk_index += 1

    return chunks

