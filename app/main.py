from typing import Dict
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.utils import extract_deadline

app = FastAPI(title="GradePilot API")

class ExtractRequest(BaseModel):
    text: str

@app.get("/health", tags=["system"])
async def health() -> Dict[str, str]:
    """Simple health check endpoint used by tests and monitoring."""
    return {"status": "ok"}

@app.get("/", tags=["system"])
async def root() -> Dict[str, str]:
    """Placeholder root endpoint."""
    return {"message": "GradePilot API"}

@app.post("/extract", tags=["system"])
async def extract(request: ExtractRequest) -> Dict[str, str]:
    """Extracts a deadline from the provided text."""
    try:
        deadline = extract_deadline(request.text)
        return {"deadline": deadline}
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})
