from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class OnboardingResult:
    assistant_message: str
    state: dict[str, Any]
    tool_actions: list[dict[str, Any]]


# Shown when a new chat session is created (and as a retry hint).
MATERIALS_INTRO_MESSAGE = """Welcome to GradePilot.

To set up each course, I'll need your materials:

• **Syllabus PDF** — required for extracting deadlines and for answering questions from it
• **Notes** — lecture notes or your own summaries (PDF or paste as text in Workspace)
• **Readings / slides** — optional PDFs for search and Q&A
• **Assignments or rubrics** — optional, helps with expectations

**Next step:** Send your **class names** comma-separated (e.g. `CS101, Calculus II`) so each course has a workspace and you can upload files in the sidebar.

**Or**, if you prefer, send your **semester dates** first in this format:
`timezone=America/New_York; start=2026-09-01; end=2026-12-15`
Then I'll ask for your class names."""


def welcome_message() -> str:
    return MATERIALS_INTRO_MESSAGE


def initial_state() -> dict[str, Any]:
    return {"phase": "need_materials"}


def _normalise_class_titles(text: str) -> list[str]:
    parts = [p.strip() for p in (text or "").replace("\n", ",").split(",")]
    out: list[str] = []
    for p in parts:
        if not p:
            continue
        if len(p) > 200:
            p = p[:200].rstrip()
        out.append(p)
    seen: set[str] = set()
    deduped: list[str] = []
    for t in out:
        if t.lower() in seen:
            continue
        seen.add(t.lower())
        deduped.append(t)
    return deduped


def _is_semester_line(message: str) -> bool:
    m = message or ""
    return (
        "timezone=" in m
        and "start=" in m
        and "end=" in m
    )


def _parse_semester_fields(message: str) -> dict[str, str]:
    fields: dict[str, str] = {}
    for part in message.split(";"):
        if "=" not in part:
            continue
        k, v = part.split("=", 1)
        fields[k.strip().lower()] = v.strip()
    return fields


def _apply_semester_to_state(st: dict[str, Any], message: str) -> None:
    fields = _parse_semester_fields(message)
    st["timezone"] = fields.get("timezone", st.get("timezone"))
    st["semester_start"] = fields.get("start", st.get("semester_start"))
    st["semester_end"] = fields.get("end", st.get("semester_end"))


def run_onboarding_step(
    *,
    state: dict[str, Any],
    user_message: str,
) -> OnboardingResult:
    """Deterministic onboarding: materials first, then classes, uploads, then semester."""

    st = dict(state or {})
    tool_actions: list[dict[str, Any]] = []

    phase = str(st.get("phase") or "need_materials")
    # Legacy sessions that used need_semester as first step
    if phase == "need_semester":
        phase = "need_materials"
        st["phase"] = "need_materials"

    # --- Phase: introduce materials; accept class list OR semester line ---
    if phase == "need_materials":
        if _is_semester_line(user_message):
            _apply_semester_to_state(st, user_message)
            st["phase"] = "need_classes"
            return OnboardingResult(
                assistant_message=(
                    "Got your semester dates. Now send your **class names** "
                    "comma-separated (e.g. CS101, Calculus II, Psychology)."
                ),
                state=st,
                tool_actions=tool_actions,
            )

        titles = _normalise_class_titles(user_message)
        if titles:
            st["class_titles"] = titles
            st["phase"] = "need_syllabi"
            tool_actions.append({"type": "create_classes", "payload": {"titles": titles}})
            return OnboardingResult(
                assistant_message=(
                    "Your course workspaces are ready. In the sidebar, upload for each class:\n"
                    "• **Syllabus PDF** (we index it and import deadlines)\n"
                    "• **Notes or readings** PDFs if you have them\n\n"
                    "When you’re done uploading, send your semester for planning:\n"
                    "`timezone=America/New_York; start=YYYY-MM-DD; end=YYYY-MM-DD`"
                ),
                state=st,
                tool_actions=tool_actions,
            )

        return OnboardingResult(
            assistant_message=(
                "I still need either your **class names** (comma-separated) or your **semester** line "
                "(see the welcome message above). For example:\n"
                "• `CS101, Biology 101`\n"
                "• `timezone=America/New_York; start=2026-09-01; end=2026-12-15`"
            ),
            state=st,
            tool_actions=tool_actions,
        )

    # --- Phase: semester was sent first; now collect class names ---
    if phase == "need_classes":
        titles = _normalise_class_titles(user_message)
        if not titles:
            return OnboardingResult(
                assistant_message=(
                    "Please send at least one class name (comma-separated). "
                    "Example: CS101, Calculus II"
                ),
                state=st,
                tool_actions=tool_actions,
            )

        st["class_titles"] = titles
        st["phase"] = "need_syllabi"
        tool_actions.append({"type": "create_classes", "payload": {"titles": titles}})
        return OnboardingResult(
            assistant_message=(
                "Classes are set up. Use the sidebar to upload each course’s **syllabus PDF** "
                "and any **notes/readings** PDFs. Then send your semester line if you haven’t yet:\n"
                "`timezone=America/New_York; start=YYYY-MM-DD; end=YYYY-MM-DD`"
            ),
            state=st,
            tool_actions=tool_actions,
        )

    # --- Phase: uploads + optional semester capture ---
    if phase == "need_syllabi":
        if _is_semester_line(user_message):
            _apply_semester_to_state(st, user_message)
            st["phase"] = "ready"
            return OnboardingResult(
                assistant_message=(
                    "Semester saved. Open **Workspace** to generate a full-semester study plan, "
                    "practice questions, and (after Google is connected) sync deadlines to your calendar."
                ),
                state=st,
                tool_actions=tool_actions,
            )

        return OnboardingResult(
            assistant_message=(
                "Keep uploading **syllabus**, **notes**, or **readings** in the sidebar per class. "
                "When you’re ready, send:\n"
                "`timezone=America/New_York; start=YYYY-MM-DD; end=YYYY-MM-DD`"
            ),
            state=st,
            tool_actions=tool_actions,
        )

    return OnboardingResult(
        assistant_message=(
            "You’re set up. Use **Workspace** for notes, RAG Q&A, deadlines, and study plans — "
            "or keep chatting if you add another class (send new class names to start a fresh batch)."
        ),
        state=st,
        tool_actions=tool_actions,
    )
