from __future__ import annotations
import uuid
from typing import Any, Generator
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.models import Base
from app.db.session import get_db
from app.deps.auth import CurrentUser, get_current_user
from app.main import app
import app.routers.recommendations as recommendations_router

@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
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
        yield c

    app.dependency_overrides.clear()

def test_get_recommendations_endpoint(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    # 1. Create a class
    r = client.post("/classes", json={"title": "Computer Science 101"})
    assert r.status_code == 200
    class_id = r.json()["id"]

    # 2. Mock the recommendation service
    def _fake_generate_recommendations(*args: Any, **kwargs: Any) -> list[dict[str, str]]:
        return [
            {
                "title": "Introduction to Computer Science",
                "url": "https://www.youtube.com/watch?v=123",
                "explanation": "Great intro video."
            }
        ]
    
    monkeypatch.setattr(recommendations_router, "generate_recommendations", _fake_generate_recommendations)

    # 3. Call the endpoint
    r = client.get(f"/classes/{class_id}/recommendations")
    assert r.status_code == 200
    body = r.json()
    assert "resources" in body
    assert len(body["resources"]) == 1
    assert body["resources"][0]["title"] == "Introduction to Computer Science"

def test_get_recommendations_not_found(client: TestClient) -> None:
    fake_id = uuid.uuid4()
    r = client.get(f"/classes/{fake_id}/recommendations")
    assert r.status_code == 404
