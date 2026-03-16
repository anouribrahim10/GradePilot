from typing import Dict

from fastapi import FastAPI

app = FastAPI(title="GradePilot API")


@app.get("/health", tags=["system"])
async def health() -> Dict[str, str]:
    """Simple health check endpoint used by tests and monitoring."""
    return {"status": "ok"}


@app.get("/", tags=["system"])
async def root() -> Dict[str, str]:
    """Placeholder root endpoint."""
    return {"message": "GradePilot API"}
