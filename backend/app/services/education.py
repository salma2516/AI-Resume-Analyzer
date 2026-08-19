import re


def extract_education(text):
    """
    Extract the Education section from a resume.
    """

    lines = [line.strip() for line in text.split("\n") if line.strip()]

    education = []
    inside = False

    start_sections = {
        "EDUCATION",
        "ACADEMIC DETAILS",
        "ACADEMICS",
        "EDUCATIONAL QUALIFICATION"
    }

    stop_sections = {
        "EXPERIENCE",
        "WORK EXPERIENCE",
        "INTERNSHIPS",
        "PROJECTS",
        "CERTIFICATIONS",
        "TECHNICAL SKILLS",
        "SKILLS",
        "LEADERSHIP",
        "LANGUAGES",
        "ACHIEVEMENTS",
        "PUBLICATIONS",
        "REFERENCES",
        "ADDITIONAL EXPERIENCE"
    }

    # -----------------------------
    # Primary Extraction
    # -----------------------------
    for line in lines:

        upper = line.upper()

        if upper in start_sections:
            inside = True
            continue

        if inside:

            if upper in stop_sections:
                break

            if line:
                education.append(line)

    if education:
        return list(dict.fromkeys(education))

    # -----------------------------
    # Smart Fallback
    # -----------------------------

    degree_pattern = re.compile(
        r"(B\.?\s?TECH|B\.?\s?E|BACHELOR|M\.?\s?TECH|MASTER|BCA|MCA|BSC|MSC)",
        re.IGNORECASE
    )

    cgpa_pattern = re.compile(
        r"(CGPA|GPA|PERCENTAGE|[0-9]\.[0-9]{1,2}/10)",
        re.IGNORECASE
    )

    institute_pattern = re.compile(
        r"(UNIVERSITY|COLLEGE|INSTITUTE)",
        re.IGNORECASE
    )

    ignore_pattern = re.compile(
        r"(PROJECT|INTERNSHIP|EXPERIENCE|DEVELOPER|ENGINEER|CERTIFICATION|WORKSHOP|LEADERSHIP|VICE CHAIRPERSON|LANGUAGE|TECHNICAL SKILLS|PROGRAMMING|FRAMEWORK|TOOLS|WEB TECHNOLOGIES|DATABASES|CONCEPTS)",
        re.IGNORECASE
    )

    for line in lines:

        if ignore_pattern.search(line):
            continue

        if (
            degree_pattern.search(line)
            or cgpa_pattern.search(line)
        ):
            education.append(line)
            continue

        # Only keep institute lines if they look like education,
        # not leadership or experience.
        if institute_pattern.search(line):

            previous = lines[max(0, lines.index(line) - 1)]

            if degree_pattern.search(previous) or cgpa_pattern.search(previous):
                education.append(previous)

            education.append(line)

    return list(dict.fromkeys(education))