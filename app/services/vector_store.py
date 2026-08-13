import chromadb
from datetime import datetime

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


def get_chunks_by_document_id(document_id: str) -> list[dict]:
    """
    Retrieve every stored chunk for one document, ordered by chunk index.
    """

    results = collection.get(
        where={
            "document_id": document_id
        },
        include=[
            "documents",
            "metadatas"
        ]
    )

    chunks = []

    for chunk_id, text, metadata in zip(
        results.get("ids", []),
        results.get("documents", []),
        results.get("metadatas", [])
    ):
        chunks.append(
            {
                "chunk_id": chunk_id,
                "text": text,
                "metadata": metadata or {}
            }
        )

    return sorted(
        chunks,
        key=lambda chunk: chunk["metadata"].get("chunk_index", 0)
    )


def delete_chunks_by_document_id(document_id: str) -> None:
    """
    Delete every vector-store chunk that belongs to one ingested document.
    """

    collection.delete(
        where={
            "document_id": document_id
        }
    )


def normalize_file_types(file_types: list[str] | None) -> list[str] | None:
    """Normalize file type filters to match stored metadata."""

    if not file_types:
        return None

    normalized = [
        file_type.lower().lstrip(".")
        for file_type in file_types
        if file_type
    ]

    return normalized or None


def timestamp_filter(
    field: str,
    operator: str,
    value: datetime | None
) -> dict | None:
    """Build one timestamp comparison clause for Chroma metadata."""

    if value is None:
        return None

    return {
        field: {
            operator: int(value.timestamp())
        }
    }


def build_metadata_filter(
    document_ids: list[str] | None = None,
    file_types: list[str] | None = None,
    uploaded_after: datetime | None = None,
    uploaded_before: datetime | None = None
) -> dict | None:
    """Build a Chroma-compatible metadata filter from ask request options."""

    clauses = []

    if document_ids:
        if len(document_ids) == 1:
            clauses.append(
                {
                    "document_id": document_ids[0]
                }
            )
        else:
            clauses.append(
                {
                    "document_id": {
                        "$in": document_ids
                    }
                }
            )

    normalized_file_types = normalize_file_types(file_types)

    if normalized_file_types:
        if len(normalized_file_types) == 1:
            clauses.append(
                {
                    "file_type": normalized_file_types[0]
                }
            )
        else:
            clauses.append(
                {
                    "file_type": {
                        "$in": normalized_file_types
                    }
                }
            )

    for clause in [
        timestamp_filter("uploaded_at_timestamp", "$gte", uploaded_after),
        timestamp_filter("uploaded_at_timestamp", "$lte", uploaded_before)
    ]:
        if clause:
            clauses.append(clause)

    if not clauses:
        return None

    if len(clauses) == 1:
        return clauses[0]

    return {
        "$and": clauses
    }


def search_documents(
    query: str,
    top_k: int = 5,
    document_ids: list[str] | None = None,
    file_types: list[str] | None = None,
    uploaded_after: datetime | None = None,
    uploaded_before: datetime | None = None
) -> list[dict]:
    """
    Search ChromaDB for chunks semantically related
    to the user's query.
    """

    query_embedding = generate_embedding(query)
    where_filter = build_metadata_filter(
        document_ids=document_ids,
        file_types=file_types,
        uploaded_after=uploaded_after,
        uploaded_before=uploaded_before
    )

    # Actual Vector search 
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where=where_filter
    )
    # Sample search result 
        #     {
        #     "ids": [
        #         ["chunk_1", "chunk_2"]
        #     ],
    
        #     "documents": [
        #         [
        #             "Employees receive 20 days of annual leave.",
        #             "Leave requests must be approved by the manager."
        #         ]
        #     ],
    
        #     "distances": [
        #         [0.12, 0.28]
        #     ],
    
        #     "metadatas": [
        #         [
        #             {
        #                 "document_id": "abc123",
        #                 "filename": "company_policy.pdf",
        #                 "page_number": 4
        #             },
        #             {
        #                 "document_id": "abc123",
        #                 "filename": "company_policy.pdf",
        #                 "page_number": 5
        #             }
        #         ]
        #     ]
        # }

    # Prepare empty search result list
    search_results = []

    ids = results.get("ids", [[]])[0] # extract IDs
    documents = results.get("documents", [[]])[0] # Extract document text
    distances = results.get("distances", [[]])[0] # Extract distance/ similarity measure between query search & retreived chunk
    metadatas = results.get("metadatas", [[]])[0] # Extract metadata 

    # Combine everything using zip()
    for chunk_id, text, distance, metadata in zip(
        ids,
        documents,
        distances,
        metadatas
    ):
        # Create your own result dictionary
        search_results.append(
            {
                "chunk_id": chunk_id,
                "text": text,
                "filename": metadata.get("filename"),
                "page_number": metadata.get("page_number"),
                "document_id": metadata.get("document_id"),
                "file_type": metadata.get("file_type"),
                "distance": distance
            }
        )

    return search_results
