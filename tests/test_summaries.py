import unittest
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.document import DocumentRecord
from app.services.summaries import group_chunks, summarize_document


class DocumentSummaryTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=self.engine)
        self.Session = sessionmaker(bind=self.engine)

    def tearDown(self):
        self.engine.dispose()

    def test_group_chunks_respects_max_chars(self):
        chunks = [
            {"text": "a" * 5},
            {"text": "b" * 5},
            {"text": "c" * 5},
        ]

        groups = group_chunks(chunks, max_chars=12)

        self.assertEqual(groups, ["aaaaa\n\nbbbbb", "ccccc"])

    @patch("app.services.summaries.generate_answer")
    @patch("app.services.summaries.get_chunks_by_document_id")
    def test_summarize_document_returns_summary_and_key_points(
        self,
        mock_get_chunks_by_document_id,
        mock_generate_answer,
    ):
        mock_get_chunks_by_document_id.return_value = [
            {"text": "Employees receive paid leave.", "metadata": {"chunk_index": 0}}
        ]
        mock_generate_answer.side_effect = [
            "Employees receive paid leave.",
            "- Paid leave is available",
        ]

        with self.Session() as db:
            db.add(
                DocumentRecord(
                    document_id="doc-1",
                    filename="policy.txt",
                    file_type="txt",
                    file_path="uploads/doc-1.txt",
                    file_hash="abc123",
                    file_size=100,
                    chunks_count=1,
                )
            )
            db.commit()

            response = summarize_document(db, "doc-1")

        self.assertEqual(response["document_id"], "doc-1")
        self.assertEqual(response["filename"], "policy.txt")
        self.assertEqual(response["summary"], "Employees receive paid leave.")
        self.assertEqual(response["key_points"], ["Paid leave is available"])

    def test_summarize_document_returns_none_for_missing_document(self):
        with self.Session() as db:
            response = summarize_document(db, "missing")

        self.assertIsNone(response)


if __name__ == "__main__":
    unittest.main()
