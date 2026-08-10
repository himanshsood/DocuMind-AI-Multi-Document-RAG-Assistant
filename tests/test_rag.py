import unittest
from unittest.mock import patch

from app.services.rag import (
    NOT_ENOUGH_INFORMATION,
    answer_question,
    keep_relevant_chunks,
)


class RagInsufficientContextTests(unittest.TestCase):
    def test_keep_relevant_chunks_filters_weak_distances(self):
        chunks = [
            {"text": "good match", "distance": 0.4},
            {"text": "weak match", "distance": 1.8},
            {"text": "missing score"},
        ]

        relevant_chunks = keep_relevant_chunks(chunks, max_distance=1.1)

        self.assertEqual(relevant_chunks, [{"text": "good match", "distance": 0.4}])

    @patch("app.services.rag.generate_answer")
    @patch("app.services.rag.search_documents")
    def test_no_chunks_returns_insufficient_context_without_llm(
        self,
        mock_search_documents,
        mock_generate_answer,
    ):
        mock_search_documents.return_value = []

        response = answer_question("What is the capital of France?")

        self.assertEqual(
            response,
            {
                "answer": NOT_ENOUGH_INFORMATION,
                "sources": [],
            },
        )
        mock_generate_answer.assert_not_called()

    @patch("app.services.rag.generate_answer")
    @patch("app.services.rag.search_documents")
    def test_weak_chunks_return_insufficient_context_without_llm(
        self,
        mock_search_documents,
        mock_generate_answer,
    ):
        mock_search_documents.return_value = [
            {
                "text": "Employees can request leave through HR.",
                "filename": "policy.txt",
                "page_number": 1,
                "distance": 2.0,
            }
        ]

        response = answer_question("What is the capital of France?")

        self.assertEqual(
            response,
            {
                "answer": NOT_ENOUGH_INFORMATION,
                "sources": [],
            },
        )
        mock_generate_answer.assert_not_called()


if __name__ == "__main__":
    unittest.main()
