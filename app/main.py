from typing import Dict

from fastapi import FastAPI, HTTPException

import app.services.health_service as health_service

app = FastAPI(title="GradePilot API")


@app.get("/health", tags=["system"])
async def health() -> Dict[str, str]:
    """Simple health check endpoint used by tests and monitoring."""
    try:
        return health_service.get_health_status()
    except health_service.HealthServiceError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/", tags=["system"])
async def root() -> Dict[str, str]:
    """Placeholder root endpoint."""
    return {"message": "GradePilot API"}
