from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class OnboardingResult:
    assistant_message: str
    state: dict[str, Any]
    tool_actions: list[dict[str, Any]]


WELCOME_MESSAGE = """Welcome to GradePilot.

We’ll set up one class at a time in 5 quick steps:
1) Class setup
2) Semester timeline
3) Deadlines
4) Materials
5) Study plan

First: **What class is this for?**
Send a class name (e.g. `CS 301 — Algorithms`)."""


def welcome_message() -> str:
    return WELCOME_MESSAGE


def initial_state() -> dict[str, Any]:
    return {"phase": 1}


def _parse_json_message(message: str) -> dict[str, Any] | None:
    m = (message or "").strip()
    if not (m.startswith("{") and m.endswith("}")):
        return None
    try:
        out = json.loads(m)
    except Exception:
        return None
    return out if isinstance(out, dict) else None


def _parse_semester_fields(message: str) -> dict[str, str]:
    msg_json = _parse_json_message(message)
    if msg_json is not None:
        out_json: dict[str, str] = {}
        for k in ("timezone", "semester_start", "semester_end"):
            v = msg_json.get(k)
            if isinstance(v, str) and v.strip():
                out_json[k] = v.strip()
        return out_json

    fields: dict[str, str] = {}
    for part in (message or "").split(";"):
        if "=" not in part:
            continue
        k, v = part.split("=", 1)
        fields[k.strip().lower()] = v.strip()

    # Accept both start/end and semester_start/semester_end
    result: dict[str, str] = {}
    if fields.get("timezone"):
        result["timezone"] = fields["timezone"]
    if fields.get("start"):
        result["semester_start"] = fields["start"]
    if fields.get("end"):
        result["semester_end"] = fields["end"]
    if fields.get("semester_start"):
        result["semester_start"] = fields["semester_start"]
    if fields.get("semester_end"):
        result["semester_end"] = fields["semester_end"]
    return result


def run_onboarding_step(
    *,
    state: dict[str, Any],
    user_message: str,
) -> OnboardingResult:
    """Deterministic 5-phase onboarding wizard for a single class."""

    st = dict(state or {})
    tool_actions: list[dict[str, Any]] = []

    phase_raw = st.get("phase", 1)
    try:
        phase = int(phase_raw)
    except Exception:
        phase = 1
        st["phase"] = 1

    msg = (user_message or "").strip()
    msg_json = _parse_json_message(msg) or {}

    # --- Phase 1: create one class ---
    if phase == 1:
        title = msg_json.get("class_title") if msg_json else None
        if not isinstance(title, str) or not title.strip():
            title = msg
        title = (title or "").strip()
        if not title:
            return OnboardingResult(
                assistant_message="What class is this for? Send a class name (e.g. `CS 301 — Algorithms`).",
                state=st,
                tool_actions=tool_actions,
            )
        if len(title) > 200:
            title = title[:200].rstrip()
        tool_actions.append({"type": "create_class", "payload": {"title": title}})
        st["phase"] = 2
        return OnboardingResult(
            assistant_message=(
                f"Got it: **{title}**.\n\n"
                "Next: send your semester timeline as either:\n"
                "- `timezone=America/New_York; start=YYYY-MM-DD; end=YYYY-MM-DD`, or\n"
                '- JSON: `{ "timezone": "...", "semester_start": "...", "semester_end": "..." }`'
            ),
            state=st,
            tool_actions=tool_actions,
        )

    # --- Phase 2: capture semester timeline (per class) ---
    if phase == 2:
        fields = _parse_semester_fields(msg)
        timezone_val = fields.get("timezone")
        sem_start = fields.get("semester_start")
        sem_end = fields.get("semester_end")
        availability = None
        if isinstance(msg_json.get("availability"), list):
            availability = msg_json.get("availability")

        if not (timezone_val and sem_start and sem_end):
            return OnboardingResult(
                assistant_message=(
                    "Please provide semester start/end + timezone.\n"
                    "Example: `timezone=America/New_York; start=2026-09-01; end=2026-12-15`"
                ),
                state=st,
                tool_actions=tool_actions,
            )

        st["timezone"] = timezone_val
        st["semester_start"] = sem_start
        st["semester_end"] = sem_end
        if availability is not None:
            st["availability"] = availability

        tool_actions.append(
            {
                "type": "set_class_timeline",
                "payload": {
                    "timezone": timezone_val,
                    "semester_start": sem_start,
                    "semester_end": sem_end,
                    "availability": availability,
                },
            }
        )
        st["phase"] = 3
        return OnboardingResult(
            assistant_message=(
                "Great. Next: deadlines.\n\n"
                "Upload your syllabus to import deadlines, or add deadlines manually.\n"
                'To signal you imported via the UI, send JSON: `{ "deadlines_imported": true }`.\n'
                'For manual entry, send JSON: `{ "deadline": { "title": "...", "due": "..." } }`.\n'
                "When finished, send `done`."
            ),
            state=st,
            tool_actions=tool_actions,
        )

    # --- Phase 3: deadlines ---
    if phase == 3:
        if msg.lower() == "done" or bool(msg_json.get("deadlines_done")):
            st["phase"] = 4
            return OnboardingResult(
                assistant_message=(
                    "Deadlines step complete.\n\n"
                    "Next: upload any readings, slides, or notes to index for Q&A.\n"
                    "When finished indexing materials, send `done`."
                ),
                state=st,
                tool_actions=tool_actions,
            )
        if bool(msg_json.get("deadlines_imported")):
            st["phase"] = 4
            return OnboardingResult(
                assistant_message=(
                    "Imported deadlines.\n\n"
                    "Next: upload any readings, slides, or notes to index for Q&A.\n"
                    "When finished indexing materials, send `done`."
                ),
                state=st,
                tool_actions=tool_actions,
            )

        deadline_obj = msg_json.get("deadline")
        if isinstance(deadline_obj, dict):
            title = deadline_obj.get("title")
            due = deadline_obj.get("due")
            if (
                isinstance(title, str)
                and title.strip()
                and isinstance(due, str)
                and due.strip()
            ):
                tool_actions.append(
                    {
                        "type": "create_deadline",
                        "payload": {
                            "title": title.strip()[:200],
                            "due_text": due.strip()[:500],
                        },
                    }
                )
                return OnboardingResult(
                    assistant_message="Added. Add another deadline or send `done`.",
                    state=st,
                    tool_actions=tool_actions,
                )

        return OnboardingResult(
            assistant_message=(
                "For deadlines, either import via syllabus upload, or add manually.\n"
                'Manual JSON example: `{ "deadline": { "title": "Midterm", "due": "2026-10-12" } }`.\n'
                "When finished, send `done`."
            ),
            state=st,
            tool_actions=tool_actions,
        )

    # --- Phase 4: materials ---
    if phase == 4:
        if msg.lower() != "done" and not bool(msg_json.get("materials_done")):
            return OnboardingResult(
                assistant_message=(
                    "Upload PDFs or paste text to index materials for Q&A. When you’re done, send `done`."
                ),
                state=st,
                tool_actions=tool_actions,
            )
        st["phase"] = 5
        tool_actions.append({"type": "generate_semester_plan", "payload": {}})
        return OnboardingResult(
            assistant_message="Generating your study plan…",
            state=st,
            tool_actions=tool_actions,
        )

    # --- Phase 5: done (idempotent) ---
    st["phase"] = 5
    tool_actions.append({"type": "complete", "payload": {}})
    return OnboardingResult(
        assistant_message="Setup complete.",
        state=st,
        tool_actions=tool_actions,
    )
