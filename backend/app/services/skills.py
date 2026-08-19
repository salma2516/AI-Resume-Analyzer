import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

SKILL_FILE = BASE_DIR / "data" / "skills.json"


with open(SKILL_FILE, "r", encoding="utf-8") as f:
    SKILLS = json.load(f)


SKILLS = sorted(set(SKILLS), key=len, reverse=True)


def extract_skills(text: str):

    found = []

    text_lower = text.lower()

    for skill in SKILLS:

        pattern = r"\b" + re.escape(skill.lower()) + r"\b"

        if re.search(pattern, text_lower):

            found.append(skill)

    return sorted(set(found))