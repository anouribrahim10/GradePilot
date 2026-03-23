import pytest
from app.utils import extract_deadline

def test_extract_deadline_success():
    """Test successful deadline extraction."""
    result = extract_deadline("Submit assignment by Friday")
    assert result == "2026-04-10T23:59:59"

def test_extract_deadline_empty_raises():
    """Test that empty text raises ValueError."""
    with pytest.raises(ValueError, match="Cannot extract deadline from empty text."):
        extract_deadline("")
    
    with pytest.raises(ValueError):
        extract_deadline("   ")
