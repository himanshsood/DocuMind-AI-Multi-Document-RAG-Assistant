from collections.abc import Generator

from sqlalchemy import inspect, text
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import DATABASE_URL


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)


class Base(DeclarativeBase):
    pass


def init_db() -> None:
    """Create database tables for the lightweight document catalog."""

    from app.models import document  # noqa: F401

    Base.metadata.create_all(bind=engine)
    migrate_documents_table()


def migrate_documents_table() -> None:
    """Add document columns needed by newer app versions."""

    inspector = inspect(engine)

    if "documents" not in inspector.get_table_names():
        return

    column_names = {
        column["name"]
        for column in inspector.get_columns("documents")
    }

    statements = []

    if "file_hash" not in column_names:
        statements.append(
            "ALTER TABLE documents ADD COLUMN file_hash VARCHAR NOT NULL DEFAULT ''"
        )

    if "file_size" not in column_names:
        statements.append(
            "ALTER TABLE documents ADD COLUMN file_size INTEGER NOT NULL DEFAULT 0"
        )

    if not statements:
        return

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
