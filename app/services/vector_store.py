import chromadb

from app.config import CHROMA_COLLECTION_NAME, CHROMA_DIR
from app.services.embeddings import generate_embedding


client = chromadb.PersistentClient(
    path=str(CHROMA_DIR)
)


collection = client.get_or_create_collection(
    name=CHROMA_COLLECTION_NAME
)


def add_chunks(
    chunks: list[dict],
    embeddings: list[list[float]]
) -> None:
    """
    Store chunks, embeddings, and metadata in ChromaDB.
    """

    if len(chunks) != len(embeddings):
        raise ValueError(
            "Number of chunks must match number of embeddings."
        )

    ids = [
        chunk["metadata"]["chunk_id"]
        for chunk in chunks
    ]

    documents = [
        chunk["text"]
        for chunk in chunks
    ]

    metadatas = [
        chunk["metadata"]
        for chunk in chunks
    ]

    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings
    )


def get_collection_count() -> int:
    """
    Return the number of chunks currently stored.
    """

    return collection.count()


def get_all_chunks() -> dict:
    """
    Retrieve all stored chunks from ChromaDB.
    """

    return collection.get()


def delete_chunks_by_document_id(document_id: str) -> None:
    """
    Delete every vector-store chunk that belongs to one ingested document.
    """

    collection.delete(
        where={
            "document_id": document_id
        }
    )


def search_documents(
    query: str,
    top_k: int = 5,
    document_ids: list[str] | None = None
) -> list[dict]:
    """
    Search ChromaDB for chunks semantically related
    to the user's query.
    """

    query_embedding = generate_embedding(query)
    where_filter = None

    if document_ids:
        where_filter = {
            "document_id": {
                "$in": document_ids
            }
        }

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where=where_filter
    )

    search_results = []

    ids = results.get("ids", [[]])[0]
    documents = results.get("documents", [[]])[0]
    distances = results.get("distances", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    for chunk_id, text, distance, metadata in zip(
        ids,
        documents,
        distances,
        metadatas
    ):

        search_results.append(
            {
                "chunk_id": chunk_id,
                "text": text,
                "filename": metadata.get("filename"),
                "page_number": metadata.get("page_number"),
                "document_id": metadata.get("document_id"),
                "distance": distance
            }
        )

    return search_results
