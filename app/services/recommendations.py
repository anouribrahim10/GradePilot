from __future__ import annotations

import json
import logging
import re

from google.api_core.exceptions import ResourceExhausted
from google import genai
from google.genai import types
from pydantic import ValidationError

from app.core.config import get_settings
from app.schemas import RecommendedResource, RecommendationsAI

logger = logging.getLogger("gradepilot.ai")


class RecommendationError(RuntimeError):
    pass


class RecommendationRateLimitError(RecommendationError):
    def __init__(self, message: str, *, retry_after_seconds: int | None = None):
        super().__init__(message)
        self.retry_after_seconds = retry_after_seconds


_RETRY_RE = re.compile(r"Please retry in\s+([0-9]+(?:\.[0-9]+)?)s", re.IGNORECASE)


def _parse_retry_after_seconds(msg: str) -> int | None:
    m = _RETRY_RE.search(msg or "")
    if not m:
        return None
    try:
        return max(1, int(float(m.group(1)) + 0.999))
    except Exception:
        return None


def _build_prompt(*, class_title: str, context_text: str) -> str:
    return f"""You are an expert academic advisor and study coach.

Based on the course title "{class_title}" and the following course content/notes:
\"\"\"
{context_text}
\"\"\"

Recommend 3 to 5 high-quality, FREE educational resources (videos, articles, or courses) that would help a student master this material.

Rules:
- Focus on well-known, reliable platforms: YouTube (give specific video links), Khan Academy, Coursera (free courses), MIT OpenCourseWare, or highly-rated educational blogs.
- Do NOT use placeholder links like "example.com". All links must be real and functional.
- For each resource, provide:
  1. A clear, descriptive title.
  2. A direct URL to the resource.
  3. A short explanation (1-2 sentences) of why it's helpful for this specific content.
- Return ONLY valid JSON, no markdown, no extra text.

Return JSON matching this exact schema:
{{
  "resources": [
    {{
      "title": "Resource Title",
      "url": "https://...",
      "explanation": "Why this is useful..."
    }},
    ...
  ]
}}
"""


def generate_recommendations(
    *, class_title: str, context_text: str
) -> list[RecommendedResource]:
    settings = get_settings()
    if not settings.google_api_key:
        raise RecommendationError("GOOGLE_API_KEY is not configured")

    client = genai.Client(api_key=settings.google_api_key)
    model_name = settings.google_model
    prompt = _build_prompt(class_title=class_title, context_text=context_text)

    raw = ""
    try:
        resp = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                response_mime_type="application/json",
            ),
        )
        raw = resp.text or ""
        logger.info(
            "recommendation_llm_response model=%s chars=%s preview=%r",
            model_name,
            len(raw),
            raw[:300],
        )
        data = json.loads(raw)
        if isinstance(data, list):
            data = {"resources": data}
        parsed = RecommendationsAI.model_validate(data)
        return parsed.resources
    except (json.JSONDecodeError, ValidationError) as e:
        preview = raw[:500]
        logger.warning(
            "recommendation_parse_failed err=%s preview=%r",
            e.__class__.__name__,
            preview,
        )
        raise RecommendationError(
            "Model did not return valid recommendations JSON"
        ) from e
    except ResourceExhausted as e:
        retry_after = _parse_retry_after_seconds(str(e))
        if retry_after is not None:
            raise RecommendationRateLimitError(
                f"Rate limited by Gemini API. Please retry in {retry_after}s.",
                retry_after_seconds=retry_after,
            ) from e
        raise RecommendationRateLimitError(
            "Rate limited by Gemini API. Please retry shortly.",
            retry_after_seconds=None,
        ) from e
    except Exception as e:
        logger.exception(
            "recommendation_generation_failed err=%s", e.__class__.__name__
        )
        raise RecommendationError(
            f"Recommendation generation failed ({e.__class__.__name__})"
        ) from e
