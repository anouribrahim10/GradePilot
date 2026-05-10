from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import crud
from app.db.session import get_db
from app.deps.auth import CurrentUser, get_current_user
from app.schemas import RecommendationsOut
from app.services.recommendations import (
    RecommendationError,
    RecommendationRateLimitError,
    generate_recommendations,
)

router = APIRouter(prefix="/classes", tags=["classes"])

def _user_uuid(user: CurrentUser) -> uuid.UUID:
    try:
        return uuid.UUID(user.user_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid user id")

@router.get("/{class_id}/recommendations", response_model=RecommendationsOut)
def get_recommendations_endpoint(
    class_id: uuid.UUID,
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RecommendationsOut:
    user_id = _user_uuid(user)
    clazz = crud.get_class(db=db, user_id=user_id, class_id=class_id)
    if clazz is None:
        raise HTTPException(status_code=404, detail="Class not found")

    # Get context: notes or class title
    notes = crud.list_notes(db=db, user_id=user_id, class_id=class_id)
    context_text = "\n\n".join([n.notes_text for n in notes[:3]]) # Use last 3 notes for context
    if not context_text:
        context_text = f"General topics related to {clazz.title}"

    try:
        resources = generate_recommendations(
            class_title=clazz.title, context_text=context_text
        )
    except RecommendationRateLimitError as e:
        headers = {}
        if e.retry_after_seconds:
            headers["Retry-After"] = str(e.retry_after_seconds)
        raise HTTPException(status_code=429, detail=str(e), headers=headers)
    except RecommendationError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return RecommendationsOut(resources=resources)
