import re
import fitz  # PyMuPDF

from app.services.skills import SKILLS


# =====================================================
# PDF TEXT EXTRACTION
# =====================================================
def extract_text_from_pdf(pdf_path: str) -> str:
    text = ""

    try:
        print("Opening:", pdf_path)

        document = fitz.open(pdf_path)

        print("Pages:", len(document))

        for i, page in enumerate(document):
            page_text = page.get_text("text")

            print(f"Page {i + 1} length:", len(page_text))

            text += page_text + "\n"

        document.close()

    except Exception as e:
        print("PDF Extraction Error:", repr(e))
        return ""

    return text.strip()


# =====================================================
# Candidate Information
# =====================================================

def extract_name(text):

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    ignore_words = [
        "linkedin",
        "github",
        "python",
        "developer",
        "engineer",
        "@",
        "resume",
        "curriculum",
        "vitae",
    ]

    for line in lines[:10]:

        lower = line.lower()

        if any(word in lower for word in ignore_words):
            continue

        if re.search(r"\d", line):
            continue

        if 1 <= len(line.split()) <= 4:
            return line.title()

    return ""


# =====================================================
# Email
# =====================================================

def extract_email(text):

    match = re.search(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        text,
    )

    return match.group(0) if match else ""


# =====================================================
# Phone
# =====================================================

def extract_phone(text):

    match = re.search(
        r"(\+\d{1,3}[- ]?)?[6-9]\d{9}",
        text,
    )

    return match.group(0) if match else ""


# =====================================================
# LinkedIn
# =====================================================

def extract_linkedin(text):

    match = re.search(
        r"(https?://)?(www\.)?linkedin\.com/[^\s|]+",
        text,
        re.IGNORECASE,
    )

    return match.group(0) if match else ""


# =====================================================
# GitHub
# =====================================================

def extract_github(text):

    match = re.search(
        r"(https?://)?(www\.)?github\.com/[^\s|]+",
        text,
        re.IGNORECASE,
    )

    return match.group(0) if match else ""


# =====================================================
# Skills
# =====================================================

def extract_skills(text):

    text_lower = text.lower()

    found = []

    sorted_skills = sorted(
        SKILLS,
        key=len,
        reverse=True,
    )

    for skill in sorted_skills:

        pattern = (
            r"(?<!\w)"
            + re.escape(skill.lower())
            + r"(?!\w)"
        )

        if re.search(pattern, text_lower):

            if skill == "C" and "C#" in found:
                continue

            found.append(skill)

    return sorted(set(found))