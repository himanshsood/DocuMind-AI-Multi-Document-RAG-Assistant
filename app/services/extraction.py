
from pathlib import Path

from pypdf import PdfReader


def extract_text_from_txt(file_path: str) -> list[dict]:
    """
    Extract text from a TXT file.

    TXT files do not have real PDF-style pages,
    so the entire file is treated as page 1.
    """

    path = Path(file_path)

    text = path.read_text(encoding="utf-8", errors="ignore")

    if not text.strip():
        return []

    return [
        {
            "text": text,
            "page_number": 1
        }
    ]


def extract_text_from_pdf(file_path: str) -> list[dict]:
    """
    Extract text from a PDF page by page.

    Pages with no extractable text are skipped.
    """

    reader = PdfReader(file_path)

    extracted_pages = []

    for page_number, page in enumerate(reader.pages, start=1):

        text = page.extract_text() or ""

        if not text or not text.strip():
            continue

        extracted_pages.append(
            {
                "text": text,
                "page_number": page_number
            }
        )

    return extracted_pages


def extract_text(file_path: str) -> list[dict]:
    """
    Determine the file type and extract its text.
    """

    extension = Path(file_path).suffix.lower()

    if extension == ".txt":
        return extract_text_from_txt(file_path)

    if extension == ".pdf":
        return extract_text_from_pdf(file_path)

    raise ValueError(
        f"Unsupported file type: {extension}"
    )
