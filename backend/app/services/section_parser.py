import re

SECTION_HEADERS = {
    "summary": [
        "PROFESSIONAL SUMMARY",
        "SUMMARY",
        "PROFILE",
        "CAREER OBJECTIVE",
        "OBJECTIVE",
    ],

    "technical_skills": [
        "TECHNICAL SKILLS",
        "TECHNICAL EXPERTISE",
        "CORE SKILLS",
        "SKILLS",
    ],

    "experience": [
        "INTERNSHIP EXPERIENCE",
        "WORK EXPERIENCE",
        "PROFESSIONAL EXPERIENCE",
        "EXPERIENCE",
        "INTERNSHIPS",
        "EMPLOYMENT HISTORY",
        "ADDITIONAL EXPERIENCE",
    ],

    "projects": [
        "PROJECTS",
        "ACADEMIC PROJECTS",
        "PERSONAL PROJECTS",
    ],

    "education": [
        "EDUCATION",
        "ACADEMIC DETAILS",
        "ACADEMICS",
    ],

    "certifications": [
        "CERTIFICATIONS",
        "CERTIFICATES",
        "LICENSES & CERTIFICATIONS",
    ],

    "leadership": [
        "LEADERSHIP",
        "POSITIONS OF RESPONSIBILITY",
    ],

    "languages": [
        "LANGUAGES",
    ],

    "achievements": [
        "ACHIEVEMENTS",
        "HONORS",
        "AWARDS",
    ],

    "publications": [
        "PUBLICATIONS",
    ],
}


def normalize(text: str) -> str:
    """
    Normalize heading text for reliable comparison.
    """

    if not text:
        return ""

    text = text.upper()

    text = text.replace(":", " ")
    text = text.replace("-", " ")

    text = re.sub(r"[^A-Z0-9 ]", " ", text)

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def get_section_name(line: str):

    line = normalize(line)

    for section, headings in SECTION_HEADERS.items():

        for heading in headings:

            heading = normalize(heading)

            # Exact match
            if line == heading:
                return section

            # PDF extraction may append punctuation or spaces
            if line.startswith(heading):
                return section

    return None


def split_resume_sections(text: str):

    sections = {
        key: ""
        for key in SECTION_HEADERS
    }

    current_section = None

    for raw_line in text.splitlines():

        line = raw_line.strip()

        if not line:
            continue

        found = get_section_name(line)

        if found:
            current_section = found
            continue

        if current_section:

            sections[current_section] += line + "\n"

    # Trim trailing whitespace
    for key in sections:
        sections[key] = sections[key].strip()

    return sections