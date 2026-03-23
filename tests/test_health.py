from http import HTTPStatus

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_ok() -> None:
    response = client.get("/health")
    assert response.status_code == HTTPStatus.OK
    assert response.json() == {"status": "ok"}


def test_root_ok() -> None:
    response = client.get("/")
    assert response.status_code == HTTPStatus.OK
    assert response.json() == {"message": "GradePilot API"}


def test_health_post_not_allowed() -> None:
    response = client.post("/health")
    assert response.status_code == HTTPStatus.METHOD_NOT_ALLOWED


def test_unknown_route_not_found() -> None:
    response = client.get("/this-route-does-not-exist")
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json() == {"detail": "Not Found"}
