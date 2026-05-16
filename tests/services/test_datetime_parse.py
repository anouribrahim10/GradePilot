from __future__ import annotations

from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from app.services.datetime_parse import parse_user_due_to_datetime


def test_parses_iso_datetime_with_offset() -> None:
    result = parse_user_due_to_datetime(
        due="2026-10-05T23:59:00-04:00", timezone="America/New_York"
    )
    assert result == datetime(
        2026, 10, 5, 23, 59, 0, tzinfo=ZoneInfo("America/New_York")
    )


def test_parses_iso_datetime_with_z_suffix() -> None:
    result = parse_user_due_to_datetime(due="2026-10-05T23:59:00Z", timezone=None)
    assert result == datetime(2026, 10, 5, 23, 59, 0, tzinfo=timezone.utc)


def test_parses_date_only_via_fromisoformat() -> None:
    result = parse_user_due_to_datetime(due="2026-10-05", timezone="America/New_York")
    assert result == datetime(2026, 10, 5, 0, 0, 0)
    assert result is not None and result.tzinfo is None


def test_iso_datetime_with_whitespace_is_trimmed() -> None:
    result = parse_user_due_to_datetime(
        due="  2026-10-05T23:59:00+00:00  ", timezone=None
    )
    assert result == datetime(2026, 10, 5, 23, 59, 0, tzinfo=timezone.utc)


def test_returns_none_for_empty_string() -> None:
    assert parse_user_due_to_datetime(due="", timezone="America/New_York") is None


def test_returns_none_for_whitespace_only_string() -> None:
    assert parse_user_due_to_datetime(due="   ", timezone=None) is None


def test_returns_none_for_garbage_input() -> None:
    assert parse_user_due_to_datetime(due="not-a-date", timezone="UTC") is None


def test_returns_none_for_non_date_string_that_isoformat_rejects() -> None:
    assert parse_user_due_to_datetime(due="2026/10/05", timezone=None) is None
