from datetime import datetime

# You can expand this list
FESTIVALS_2026 = [
    "2026-01-26",  # Republic day
    "2026-03-08",  # Holi approx (example)
    "2026-08-29",  # Ganesh Chaturthi approx
    "2026-10-20",  # Diwali approx
]

def is_festival(date_str: str) -> int:
    return 1 if date_str in FESTIVALS_2026 else 0
