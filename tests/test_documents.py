import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.document import DocumentRecord
from app.services.documents import (
    delete_document,
    find_duplicate_document,
    list_documents,
)


class DocumentManagementTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=self.engine)
        self.Session = sessionmaker(bind=self.engine)

    def tearDown(self):
        self.engine.dispose()

    def test_list_documents_returns_public_document_records(self):
        with self.Session() as db:
            db.add(
                DocumentRecord(
                    document_id="doc-1",
                    filename="hr_policy.pdf",
                    file_type="pdf",
                    file_path="uploads/doc-1.pdf",
                    file_hash="abc123",
                    file_size=1024,
                    chunks_count=47,
                )
            )
            db.commit()

            documents = list_documents(db)

        self.assertEqual(len(documents), 1)
        self.assertEqual(documents[0]["document_id"], "doc-1")
        self.assertEqual(documents[0]["filename"], "hr_policy.pdf")
        self.assertEqual(documents[0]["file_type"], "pdf")
        self.assertEqual(documents[0]["chunks_count"], 47)
        self.assertIn("uploaded_at", documents[0])

    @patch("app.services.documents.delete_chunks_by_document_id")
    def test_delete_document_removes_chunks_file_and_database_record(
        self,
        mock_delete_chunks_by_document_id,
    ):
        with tempfile.NamedTemporaryFile(delete=False) as uploaded_file:
            file_path = Path(uploaded_file.name)

        with self.Session() as db:
            db.add(
                DocumentRecord(
                    document_id="doc-1",
                    filename="policy.txt",
                    file_type="txt",
                    file_path=str(file_path),
                    file_hash="abc123",
                    file_size=1024,
                    chunks_count=2,
                )
            )
            db.commit()

            deleted = delete_document(db, "doc-1")

            self.assertTrue(deleted)
            self.assertIsNone(db.get(DocumentRecord, "doc-1"))

        self.assertFalse(file_path.exists())
        mock_delete_chunks_by_document_id.assert_called_once_with("doc-1")

    @patch("app.services.documents.delete_chunks_by_document_id")
    def test_delete_document_returns_false_when_record_is_missing(
        self,
        mock_delete_chunks_by_document_id,
    ):
        with self.Session() as db:
            deleted = delete_document(db, "missing-doc")

        self.assertFalse(deleted)
        mock_delete_chunks_by_document_id.assert_not_called()

    def test_find_duplicate_document_matches_file_hash(self):
        with self.Session() as db:
            db.add(
                DocumentRecord(
                    document_id="doc-1",
                    filename="policy.txt",
                    file_type="txt",
                    file_path="uploads/doc-1.txt",
                    file_hash="abc123",
                    file_size=1024,
                    chunks_count=2,
                )
            )
            db.commit()

            duplicate = find_duplicate_document(
                db=db,
                filename="renamed-policy.txt",
                file_hash="abc123",
                file_size=999,
            )

        self.assertIsNotNone(duplicate)
        self.assertEqual(duplicate.document_id, "doc-1")

    def test_find_duplicate_document_matches_filename_and_size(self):
        with self.Session() as db:
            db.add(
                DocumentRecord(
                    document_id="doc-1",
                    filename="policy.txt",
                    file_type="txt",
                    file_path="uploads/doc-1.txt",
                    file_hash="abc123",
                    file_size=1024,
                    chunks_count=2,
                )
            )
            db.commit()

            duplicate = find_duplicate_document(
                db=db,
                filename="policy.txt",
                file_hash="different-hash",
                file_size=1024,
            )

        self.assertIsNotNone(duplicate)
        self.assertEqual(duplicate.document_id, "doc-1")


if __name__ == "__main__":
    unittest.main()
