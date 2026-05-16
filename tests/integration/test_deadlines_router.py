from __future__ import annotations

import uuid
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import crud
from app.db.models import Base
from app.db.session import get_db
from app.deps.auth import CurrentUser, get_current_user
from app.main import app


@pytest.fixture()
def client_and_db() -> Generator[tuple[TestClient, sessionmaker], None, None]:
    engine = create_engine(
        "sqlite+pysqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    user_id = uuid.uuid4()

    def _override_get_db() -> Generator[Session, None, None]:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    def _override_get_current_user() -> CurrentUser:
        return CurrentUser(user_id=str(user_id), claims={"sub": str(user_id)})

    app.dependency_overrides[get_db] = _override_get_db
    app.dependency_overrides[get_current_user] = _override_get_current_user

    with TestClient(app) as c:
        yield c, SessionLocal

    app.dependency_overrides.clear()


def test_create_deadline_persists_parsed_due_at(
    client_and_db: tuple[TestClient, sessionmaker],
) -> None:
    client, SessionLocal = client_and_db

    r = client.post("/classes", json={"title": "CS101"})
    assert r.status_code == 200
    class_id = r.json()["id"]

    r = client.post(
        f"/classes/{class_id}/deadlines",
        json={"title": "HW1", "due": "2026-10-05T23:59:00+00:00"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["title"] == "HW1"
    assert body["due_text"] == "2026-10-05T23:59:00+00:00"

    db = SessionLocal()
    try:
        deadlines = crud.list_deadlines(
            db=db, user_id=uuid.UUID(body["user_id"]), class_id=uuid.UUID(class_id)
        )
        assert len(deadlines) == 1
        stored = deadlines[0]
        assert stored.due_at is not None
        assert stored.due_at.year == 2026 and stored.due_at.month == 10
    finally:
        db.close()


def test_create_deadline_with_invalid_due_persists_with_null_due_at(
    client_and_db: tuple[TestClient, sessionmaker],
) -> None:
    client, SessionLocal = client_and_db

    r = client.post("/classes", json={"title": "CS101"})
    class_id = r.json()["id"]

    r = client.post(
        f"/classes/{class_id}/deadlines",
        json={"title": "HW1", "due": "not-a-real-date"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["due_text"] == "not-a-real-date"
    assert body.get("due_at") is None
