def extract_deadline(text: str) -> str:
    """
    Extracts a mock deadline from the given text.
    Raises ValueError if the text is empty or invalid.
    """
    if not text or not text.strip():
        raise ValueError("Cannot extract deadline from empty text.")
    # Mock implementation for demonstration
    return "2026-04-10T23:59:59"
