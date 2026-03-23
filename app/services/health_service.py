from typing import Dict


class HealthServiceError(Exception):
    """Raised when the health dependency fails."""


def get_health_status() -> Dict[str, str]:
    """Return application health status."""
    return {"status": "ok"}

