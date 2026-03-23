from http import HTTPStatus

from fastapi.testclient import TestClient
import pytest

from app.main import app
import app.services.health_service as health_service
from app.services.health_service import HealthServiceError

client = TestClient(app)


def test_health_integration_calls_service_success(monkeypatch: pytest.MonkeyPatch) -> None:
    called = {"value": False}

    def fake_get_health_status() -> dict[str, str]:
        called["value"] = True
        return {"status": "ok"}

    monkeypatch.setattr(health_service, "get_health_status", fake_get_health_status)

    response = client.get("/health")
    assert response.status_code == HTTPStatus.OK
    assert response.json() == {"status": "ok"}
    assert called["value"] is True


def test_health_integration_handles_service_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def fake_get_health_status() -> dict[str, str]:
        raise HealthServiceError("dependency failed")

    monkeypatch.setattr(health_service, "get_health_status", fake_get_health_status)

    response = client.get("/health")
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json() == {"detail": "dependency failed"}

