from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import crud
from app.db.session import get_db
from app.deps.auth import CurrentUser, get_current_user
from app.schemas import (
    ChatMessageIn,
    ChatMessageOut,
    ChatReplyOut,
    ChatSessionOut,
    ChatToolAction,
)
from app.services.chat.onboarding import run_onboarding_step

router = APIRouter(prefix="/chat", tags=["chat"])


def _user_uuid(user: CurrentUser) -> uuid.UUID:
    try:
        return uuid.UUID(user.user_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid user id")


@router.post("/sessions", response_model=ChatSessionOut)
def create_or_get_session(
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChatSessionOut:
    user_id = _user_uuid(user)
    existing = crud.get_active_chat_session(db=db, user_id=user_id)
    if existing is not None:
        return ChatSessionOut.model_validate(existing)
    created = crud.create_chat_session(db=db, user_id=user_id)
    return ChatSessionOut.model_validate(created)


@router.get("/sessions/{session_id}", response_model=ChatReplyOut)
def get_session(
    session_id: uuid.UUID,
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChatReplyOut:
    user_id = _user_uuid(user)
    sess = crud.get_chat_session(db=db, user_id=user_id, session_id=session_id)
    if sess is None:
        raise HTTPException(status_code=404, detail="Chat session not found")
    msgs = crud.list_chat_messages(db=db, user_id=user_id, session_id=session_id)
    st = crud.get_chat_state(db=db, user_id=user_id, session_id=session_id)
    state_json: dict[str, Any] = st.state_json if st is not None else {}
    return ChatReplyOut(
        session=ChatSessionOut.model_validate(sess),
        messages=[ChatMessageOut.model_validate(m) for m in msgs],
        state=state_json,
        tool_actions=[],
    )


@router.post("/sessions/{session_id}/messages", response_model=ChatReplyOut)
def post_message(
    session_id: uuid.UUID,
    payload: ChatMessageIn,
    user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChatReplyOut:
    user_id = _user_uuid(user)
    sess = crud.get_chat_session(db=db, user_id=user_id, session_id=session_id)
    if sess is None:
        raise HTTPException(status_code=404, detail="Chat session not found")

    st = crud.get_chat_state(db=db, user_id=user_id, session_id=session_id)
    state_json: dict[str, Any] = st.state_json if st is not None else {}

    # Persist user message
    crud.add_chat_message(
        db=db,
        user_id=user_id,
        session_id=session_id,
        role="user",
        content=payload.content,
    )

    onboarding = run_onboarding_step(state=state_json, user_message=payload.content)
    state_json = onboarding.state

    # Execute tool actions (MVP: create class records).
    for action in onboarding.tool_actions:
        if action.get("type") == "create_classes":
            titles = action.get("payload", {}).get("titles", [])
            if isinstance(titles, list):
                for t in titles:
                    if isinstance(t, str) and t.strip():
                        crud.create_class(db=db, user_id=user_id, title=t.strip())

    crud.update_chat_state(
        db=db, user_id=user_id, session_id=session_id, state_json=state_json
    )

    # Persist assistant message
    crud.add_chat_message(
        db=db,
        user_id=user_id,
        session_id=session_id,
        role="assistant",
        content=onboarding.assistant_message,
    )

    msgs = crud.list_chat_messages(db=db, user_id=user_id, session_id=session_id)

    return ChatReplyOut(
        session=ChatSessionOut.model_validate(sess),
        messages=[ChatMessageOut.model_validate(m) for m in msgs],
        state=state_json,
        tool_actions=[
            ChatToolAction(
                type=str(a.get("type", "unknown")),
                payload=dict(a.get("payload", {}) or {}),
            )
            for a in onboarding.tool_actions
        ],
    )
