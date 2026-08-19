import re


def extract_certifications(text):
    """
    Extract Certifications section from resume.
    """

    lines = [line.strip() for line in text.split("\n") if line.strip()]

    certifications = []
    inside = False

    start_sections = {
        "CERTIFICATIONS",
        "CERTIFICATES",
        "LICENSES",
        "LICENSES & CERTIFICATIONS",
        "PROFESSIONAL CERTIFICATIONS"
    }

    stop_sections = {
        "PROJECTS",
        "PROJECT",
        "EXPERIENCE",
        "WORK EXPERIENCE",
        "INTERNSHIPS",
        "INTERNSHIP",
        "EDUCATION",
        "TECHNICAL SKILLS",
        "SKILLS",
        "LEADERSHIP",
        "LANGUAGES",
        "ACHIEVEMENTS",
        "PUBLICATIONS",
        "REFERENCES"
    }

    # -------------------------
    # Primary Extraction
    # -------------------------

    for line in lines:

        upper = line.upper()

        if upper in start_sections:
            inside = True
            continue

        if inside:

            if upper in stop_sections:
                break

            if line:
                certifications.append(line)

    if certifications:
        return list(dict.fromkeys(certifications))

    # -------------------------
    # Smart Fallback
    # -------------------------

    cert_pattern = re.compile(
        r"(Microsoft|Azure|AWS|Google|IBM|Oracle|Cisco|Infosys|Forage|Coursera|Udemy|NPTEL|Be10x|Cognitive Class|DP-900|Certification|Certificate)",
        re.IGNORECASE,
    )

    ignore_pattern = re.compile(
        r"(Intern|Developer|Engineer|Project|Experience|Education|Leadership|Vice Chairperson|Language|Technical Skills|Programming|Framework|Tools|Databases|Web Technologies)",
        re.IGNORECASE,
    )

    year_pattern = re.compile(r"^\d{4}$")

    for line in lines:

        if not line:
            continue

        if year_pattern.match(line):
            continue

        if ignore_pattern.search(line):
            continue

        if cert_pattern.search(line):
            certifications.append(line)

    # Remove duplicates while preserving order

    result = []
    seen = set()

    for cert in certifications:

        cert = cert.strip()

        if cert and cert not in seen:
            seen.add(cert)
            result.append(cert)

    return result