from sentence_transformers import SentenceTransformer

from app.config import EMBEDDING_MODEL_NAME


_model: SentenceTransformer | None = None


def get_embedding_model() -> SentenceTransformer:
    """Load the local embedding model once and reuse it across requests."""

    global _model

    if _model is None:
        _model = SentenceTransformer(EMBEDDING_MODEL_NAME)

    return _model


def generate_embedding(text: str) -> list[float]:
    """
    Generate an embedding vector for a single text.
    """

    embedding = get_embedding_model().encode(text, normalize_embeddings=True)

    return embedding.tolist()


def generate_embeddings(
    texts: list[str]
) -> list[list[float]]:
    """
    Generate embedding vectors for multiple texts.
    """

    embeddings = get_embedding_model().encode(texts, normalize_embeddings=True)

    return embeddings.tolist()
