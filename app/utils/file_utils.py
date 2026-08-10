import hashlib
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.config import ALLOWED_EXTENSIONS, MAX_UPLOAD_BYTES, UPLOAD_DIR


def get_file_extension(filename: str | None) -> str:
    """Return a lowercase suffix after confirming the upload has a name."""

    if not filename:
        raise ValueError("Uploaded file must have a filename.")

    return Path(filename).suffix.lower()


def validate_upload(filename: str | None, contents: bytes) -> str:
    """Validate upload type, size, and content before touching disk."""

    extension = get_file_extension(filename)

    if extension not in ALLOWED_EXTENSIONS:
        allowed = ", ".join(sorted(ALLOWED_EXTENSIONS))
        raise ValueError(f"Unsupported file type. Allowed types: {allowed}.")

    if not contents:
        raise ValueError("Uploaded file is empty.")

    if len(contents) > MAX_UPLOAD_BYTES:
        max_mb = MAX_UPLOAD_BYTES // (1024 * 1024)
        raise ValueError(f"Uploaded file is too large. Maximum size is {max_mb} MB.")

    return extension

def save_upload_contents(
    filename: str | None,
    contents: bytes,
    document_id: str | None = None
) -> tuple[str, Path]:

    extension = validate_upload(filename, contents)

    document_id = document_id or str(uuid4())

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    file_path = UPLOAD_DIR / f"{document_id}{extension}"

    file_path.write_bytes(contents)

    return document_id, file_path
def calculate_file_hash(contents: bytes) -> str:
    """Use a stable content hash to detect duplicate uploads."""

    return hashlib.sha256(contents).hexdigest()
async def read_upload(file: UploadFile) -> bytes:
    return await file.read()
async def save_upload(
    file: UploadFile,
    document_id: str | None = None
) -> tuple[str, Path]:
    """Read, validate, and save an uploaded file."""

    contents = await file.read()

    extension = validate_upload(
        file.filename,
        contents
    )

    document_id = document_id or str(uuid4()) # If document_id already has a value, keep it. Otherwise, generate a new UUID.

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True) # created a folder uploads, exist_ok=true is dont give error if already exists

    file_path = UPLOAD_DIR / f"{document_id}{extension}" # create a file path

    file_path.write_bytes(contents) # take the content of input file and save in this uploads/filename. 

    return document_id, file_path   