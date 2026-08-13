import unittest
from datetime import datetime, timezone

from app.services.vector_store import build_metadata_filter


class VectorStoreFilterTests(unittest.TestCase):
    def test_build_metadata_filter_combines_supported_filters(self):
        where_filter = build_metadata_filter(
            document_ids=["doc-1", "doc-2"],
            file_types=[".PDF"],
            uploaded_after=datetime(2026, 8, 1, tzinfo=timezone.utc),
            uploaded_before=datetime(2026, 8, 10, tzinfo=timezone.utc),
        )

        self.assertEqual(
            where_filter,
            {
                "$and": [
                    {"document_id": {"$in": ["doc-1", "doc-2"]}},
                    {"file_type": "pdf"},
                    {"uploaded_at_timestamp": {"$gte": 1785542400}},
                    {"uploaded_at_timestamp": {"$lte": 1786320000}},
                ]
            },
        )

    def test_build_metadata_filter_returns_none_without_filters(self):
        self.assertIsNone(build_metadata_filter())


if __name__ == "__main__":
    unittest.main()
