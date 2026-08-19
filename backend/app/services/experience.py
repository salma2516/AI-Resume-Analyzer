import re


# =========================================================
# SECTION HEADERS
# =========================================================

START_HEADERS = {
    "EXPERIENCE",
    "WORK EXPERIENCE",
    "PROFESSIONAL EXPERIENCE",
    "EMPLOYMENT",
    "EMPLOYMENT HISTORY",
    "WORK HISTORY",
    "INTERNSHIP EXPERIENCE",
    "INTERNSHIP EXPERIENCES",
    "INTERNSHIP",
    "INTERNSHIPS",
    "ADDITIONAL EXPERIENCE",
}

STOP_HEADERS = {
    "PROJECT",
    "PROJECTS",
    "OTHER PROJECTS",
    "ACADEMIC PROJECTS",
    "PERSONAL PROJECTS",
    "MAJOR PROJECTS",
    "MINOR PROJECTS",
    "CERTIFICATIONS",
    "CERTIFICATES",
    "EDUCATION",
    "ACADEMIC QUALIFICATIONS",
    "TECHNICAL SKILLS",
    "SKILLS",
    "LANGUAGES",
    "LEADERSHIP",
    "ACHIEVEMENTS",
    "PUBLICATIONS",
    "REFERENCES",
    "SUMMARY",
    "PROFILE",
    "OBJECTIVE",
}


# =========================================================
# JOB ROLES
# =========================================================

ROLE_KEYWORDS = [
    "intern",
    "internship",
    "developer",
    "engineer",
    "analyst",
    "scientist",
    "consultant",
    "programmer",
    "trainee",
    "associate",
    "researcher",
    "research assistant",

    "software engineer",
    "software developer",

    "machine learning engineer",
    "machine learning intern",
    "ml engineer",
    "ml intern",

    "ai engineer",
    "ai intern",
    "ai/ml engineer",
    "ai/ml intern",

    "full stack developer",
    "full-stack developer",
    "full stack intern",
    "full-stack intern",

    "backend developer",
    "back-end developer",
    "backend intern",
    "back-end intern",

    "frontend developer",
    "front-end developer",
    "frontend intern",
    "front-end intern",

    "data scientist",
    "data scientist intern",

    "data analyst",
    "data analyst intern",

    "data engineer",
    "data engineer intern",

    "python developer",
    "python intern",

    "web developer",
    "web development intern",

    "technical intern",
    "student intern",
    "software intern",
    "engineering intern",
    "developer intern",
    "project intern",
    "research intern",
    "data science intern",

    "data analytics trainee",
]


# =========================================================
# INVALID GENERIC PHRASES
# =========================================================

INVALID_ROLE_PHRASES = [
    "engineer, full stack developer, or software engineer",
    "full stack developer, or software engineer",
    "engineer or software engineer",
    "developer or software engineer",
]


# =========================================================
# DATE PATTERNS
# =========================================================

MONTH = (
    r"(?:Jan(?:uary)?|"
    r"Feb(?:ruary)?|"
    r"Mar(?:ch)?|"
    r"Apr(?:il)?|"
    r"May|"
    r"Jun(?:e)?|"
    r"Jul(?:y)?|"
    r"Aug(?:ust)?|"
    r"Sep(?:tember)?|"
    r"Oct(?:ober)?|"
    r"Nov(?:ember)?|"
    r"Dec(?:ember)?)"
)

DATE_RANGE = re.compile(
    rf"("
    rf"{MONTH}\s+\d{{4}}"
    rf"|{MONTH}\s+\d{{1,2}},?\s+\d{{4}}"
    rf"|\d{{1,2}}/\d{{4}}"
    rf"|\d{{1,2}}/\d{{1,2}}/\d{{4}}"
    rf"|\d{{4}}"
    rf")"
    rf"\s*(?:-|–|—|to)\s*"
    rf"("
    rf"{MONTH}\s+\d{{4}}"
    rf"|{MONTH}\s+\d{{1,2}},?\s+\d{{4}}"
    rf"|\d{{1,2}}/\d{{4}}"
    rf"|\d{{1,2}}/\d{{1,2}}/\d{{4}}"
    rf"|\d{{4}}"
    rf"|Present|Current|Now"
    rf")",
    re.IGNORECASE,
)

SINGLE_YEAR_RANGE = re.compile(
    r"\b(?:19|20)\d{2}\s*(?:-|–|—|to)\s*"
    r"(?:(?:19|20)\d{2}|Present|Current|Now)\b",
    re.IGNORECASE,
)


# =========================================================
# TEXT CLEANING
# =========================================================

def clean_line(line):
    if line is None:
        return ""

    line = str(line)

    line = line.replace("\x00", " ")
    line = line.replace("\u00a0", " ")
    line = line.replace("\t", " ")

    # IMPORTANT:
    # PDF extraction in your resume produces:
    #
    # "- • Full Stack Developer Intern | ..."
    #
    # Remove those artificial bullets before parsing.
    line = re.sub(
        r"^\s*(?:[-*•●▪◦]+)\s*",
        "",
        line,
    )

    line = re.sub(
        r"\s+",
        " ",
        line,
    )

    return line.strip()


def clean_description(line):
    return clean_line(line)


def normalize(line):
    return clean_line(line).upper().strip()


# =========================================================
# HEADER CHECKS
# =========================================================

def is_start_header(line):

    header = normalize(line)

    return header in START_HEADERS


def is_stop_header(line):

    header = normalize(line)

    if header in STOP_HEADERS:
        return True

    if header.startswith("PROJECT"):
        return True

    if header.startswith("CERTIFICATION"):
        return True

    if header.startswith("EDUCATION"):
        return True

    if header in {
        "SKILLS",
        "TECHNICAL SKILLS",
        "LANGUAGES",
    }:
        return True

    return False


# =========================================================
# DATE
# =========================================================

def is_date(line):

    line = clean_line(line)

    if not line:
        return False

    if DATE_RANGE.search(line):
        return True

    if SINGLE_YEAR_RANGE.search(line):
        return True

    return False


def extract_date(line):

    line = clean_line(line)

    match = DATE_RANGE.search(line)

    if match:
        return match.group(0).strip()

    match = SINGLE_YEAR_RANGE.search(line)

    if match:
        return match.group(0).strip()

    return ""


# =========================================================
# ROLE
# =========================================================

def contains_role_keyword(line):

    lower = clean_line(line).lower()

    return any(
        re.search(
            rf"\b{re.escape(keyword)}\b",
            lower,
        )
        for keyword in ROLE_KEYWORDS
    )


def is_role(line):

    line = clean_line(line)

    if not line:
        return False

    if is_start_header(line):
        return False

    if is_stop_header(line):
        return False

    if is_date(line):
        return False

    lower = line.lower()

    # Reject generic career-summary sentences.
    for phrase in INVALID_ROLE_PHRASES:
        if phrase in lower:
            return False

    if lower.startswith(
        (
            "seeking ",
            "looking for ",
            "interested in ",
            "passionate about ",
            "available for ",
            "aspiring ",
        )
    ):
        return False

    if not contains_role_keyword(line):
        return False

    # A real title should be reasonably short.
    if len(line.split()) > 9:
        return False

    # Reject sentence-like text.
    if line.endswith(
        (
            ".",
            ":",
            ";",
        )
    ):
        return False

    return True


# =========================================================
# COMPANY
# =========================================================

def is_company(line):

    line = clean_line(line)

    if not line:
        return False

    if is_date(line):
        return False

    if is_role(line):
        return False

    if is_start_header(line):
        return False

    if is_stop_header(line):
        return False

    if len(line.split()) > 10:
        return False

    return True


# =========================================================
# INLINE EXPERIENCE
# =========================================================

def parse_inline(line):

    line = clean_line(line)

    if not line:
        return None

    # -----------------------------------------------------
    # Format:
    #
    # Full Stack Developer Intern |
    # Acaders Software Development, Bangalore
    # -----------------------------------------------------

    if "|" in line:

        parts = [
            clean_line(x)
            for x in line.split("|")
            if clean_line(x)
        ]

        role = ""
        company = ""
        duration = ""

        for part in parts:

            if is_date(part):
                duration = extract_date(part)

            elif is_role(part):
                role = part

            elif not company:
                company = part

        if role:

            return {
                "job_title": role,
                "company": company,
                "duration": duration,
                "description": [],
            }

    return None


# =========================================================
# FIND EXPERIENCE
# =========================================================

def find_experience_start(lines):

    for i, line in enumerate(lines):

        if is_start_header(line):

            return i + 1

    return None


# =========================================================
# PARSE EXPERIENCE SECTION
# =========================================================

def parse_section(lines):

    experiences = []

    current = None

    i = 0

    while i < len(lines):

        line = clean_line(lines[i])

        if not line:
            i += 1
            continue

        # -------------------------------------------------
        # Stop
        # -------------------------------------------------

        if is_stop_header(line):
            break

        # -------------------------------------------------
        # Ignore labels
        # -------------------------------------------------

        if normalize(line) in {
            "RESPONSIBILITIES",
            "RESPONSIBILITY",
        }:
            i += 1
            continue

        # -------------------------------------------------
        # Inline entry
        # -------------------------------------------------

        inline = parse_inline(line)

        if inline:

            if current:
                experiences.append(current)

            current = inline

            i += 1
            continue

        # -------------------------------------------------
        # New role
        # -------------------------------------------------

        if is_role(line):

            if current:
                experiences.append(current)

            role = line

            company = ""

            duration = ""

            j = i + 1

            # ---------------------------------------------
            # Look at next few lines.
            # ---------------------------------------------

            while j < len(lines) and j <= i + 3:

                next_line = clean_line(
                    lines[j]
                )

                if not next_line:
                    j += 1
                    continue

                if is_stop_header(
                    next_line
                ):
                    break

                # Date
                if is_date(next_line):

                    duration = extract_date(
                        next_line
                    )

                    j += 1
                    continue

                # Company
                if not company and is_company(
                    next_line
                ):

                    company = next_line

                    j += 1
                    continue

                break

            current = {
                "job_title": role,
                "company": company,
                "duration": duration,
                "description": [],
            }

            i = j

            continue

        # -------------------------------------------------
        # Date
        # -------------------------------------------------

        if current and is_date(line):

            if not current["duration"]:
                current["duration"] = extract_date(
                    line
                )

            i += 1
            continue

        # -------------------------------------------------
        # Description
        # -------------------------------------------------

        if current:

            description = clean_description(
                line
            )

            if description:

                current[
                    "description"
                ].append(description)

        i += 1

    if current:
        experiences.append(current)

    return experiences


# =========================================================
# CLEAN RESULTS
# =========================================================

def clean_results(experiences):

    cleaned = []

    seen = set()

    for exp in experiences:

        if not isinstance(exp, dict):
            continue

        job_title = clean_line(
            exp.get(
                "job_title",
                "",
            )
        )

        company = clean_line(
            exp.get(
                "company",
                "",
            )
        )

        duration = clean_line(
            exp.get(
                "duration",
                "",
            )
        )

        description = exp.get(
            "description",
            [],
        )

        if not isinstance(
            description,
            list,
        ):
            description = [
                str(description)
            ]

        descriptions = []

        desc_seen = set()

        for item in description:

            item = clean_description(
                item
            )

            if not item:
                continue

            key = item.lower()

            if key in desc_seen:
                continue

            desc_seen.add(key)

            descriptions.append(item)

        # Validate title.
        if not is_role(job_title):
            continue

        key = (
            job_title.lower(),
            company.lower(),
            duration.lower(),
        )

        if key in seen:
            continue

        seen.add(key)

        cleaned.append(
            {
                "job_title": job_title,
                "company": company,
                "duration": duration,
                "description": descriptions,
            }
        )

    return cleaned


# =========================================================
# MAIN EXTRACTOR
# =========================================================

def extract_experience(text):

    if not text:
        return []

    # -----------------------------------------------------
    # Prepare lines
    # -----------------------------------------------------

    lines = []

    for raw_line in text.splitlines():

        line = clean_line(raw_line)

        if line:
            lines.append(line)

    if not lines:
        return []

    # -----------------------------------------------------
    # Find section
    # -----------------------------------------------------

    start = find_experience_start(
        lines
    )

    print(
        "\n========== EXPERIENCE DEBUG =========="
    )

    print(
        "Total lines:",
        len(lines)
    )

    print(
        "Experience start:",
        start
    )

    # -----------------------------------------------------
    # Normal section
    # -----------------------------------------------------

    if start is not None:

        end = len(lines)

        for i in range(
            start,
            len(lines),
        ):

            if is_stop_header(
                lines[i]
            ):

                end = i
                break

        section = lines[
            start:end
        ]

    else:

        # -------------------------------------------------
        # Fallback:
        # Your PDF sometimes places EXPERIENCE after
        # PROJECT content.
        # Search for the actual internship header.
        # -------------------------------------------------

        section_start = None

        for i, line in enumerate(lines):

            if normalize(line) in {
                "INTERNSHIP EXPERIENCE",
                "INTERNSHIPS",
                "ADDITIONAL EXPERIENCE",
            }:

                section_start = i + 1
                break

        if section_start is None:

            print(
                "Experience section not found."
            )

            print(
                "====================================\n"
            )

            return []

        end = len(lines)

        for i in range(
            section_start,
            len(lines),
        ):

            if normalize(lines[i]) in {
                "CERTIFICATIONS",
                "CERTIFICATES",
                "EDUCATION",
            }:

                end = i
                break

        section = lines[
            section_start:end
        ]

    # -----------------------------------------------------
    # DEBUG RAW SECTION
    # -----------------------------------------------------

    print(
        "\n---------- EXPERIENCE TEXT ----------"
    )

    for i, line in enumerate(section):

        print(
            f"{i}: {line}"
        )

    print(
        "---------- END EXPERIENCE TEXT ----------"
    )

    # -----------------------------------------------------
    # Parse
    # -----------------------------------------------------

    experiences = parse_section(
        section
    )

    # -----------------------------------------------------
    # Clean
    # -----------------------------------------------------

    experiences = clean_results(
        experiences
    )

    # -----------------------------------------------------
    # Debug
    # -----------------------------------------------------

    print(
        "\n========== EXPERIENCE RESULT =========="
    )

    print(
        "Detected experiences:",
        len(experiences)
    )

    for index, exp in enumerate(
        experiences,
        start=1,
    ):

        print(
            f"\nExperience {index}"
        )

        print(
            "Job Title:",
            exp["job_title"]
        )

        print(
            "Company:",
            exp["company"]
        )

        print(
            "Duration:",
            exp["duration"]
        )

        for description in exp[
            "description"
        ]:

            print(
                " •",
                description
            )

    print(
        "\n========================================\n"
    )

    return experiences


# =========================================================
# VALIDATION
# =========================================================

def validate_experience(
    experiences
):

    if not isinstance(
        experiences,
        list,
    ):
        return []

    valid = []

    for exp in experiences:

        if not isinstance(
            exp,
            dict,
        ):
            continue

        job_title = clean_line(
            exp.get(
                "job_title",
                "",
            )
        )

        company = clean_line(
            exp.get(
                "company",
                "",
            )
        )

        duration = clean_line(
            exp.get(
                "duration",
                "",
            )
        )

        description = exp.get(
            "description",
            [],
        )

        if not isinstance(
            description,
            list,
        ):

            description = [
                str(description)
            ]

        if not is_role(
            job_title
        ):
            continue

        valid.append(
            {
                "job_title": job_title,
                "company": company,
                "duration": duration,
                "description": [
                    clean_description(x)
                    for x in description
                    if clean_description(x)
                ],
            }
        )

    return valid


# =========================================================
# MAIN WRAPPER
# =========================================================

def parse_experience(
    text,
    debug=False,
):

    experiences = extract_experience(
        text
    )

    experiences = validate_experience(
        experiences
    )

    if debug:

        print(
            "\n========== VALIDATED EXPERIENCE =========="
        )

        print(
            "Total:",
            len(experiences)
        )

        for i, exp in enumerate(
            experiences,
            start=1,
        ):

            print(
                f"\n{i}. {exp['job_title']}"
            )

            print(
                "Company:",
                exp["company"]
            )

            print(
                "Duration:",
                exp["duration"]
            )

            for description in exp[
                "description"
            ]:

                print(
                    " •",
                    description
                )

        print(
            "\n==========================================\n"
        )

    return experiences


# =========================================================
# PRETTY PRINT
# =========================================================

def print_experience(
    experiences
):

    print(
        "\n========== EXPERIENCE =========="
    )

    if not experiences:

        print(
            "No experience found."
        )

        return

    for i, exp in enumerate(
        experiences,
        start=1,
    ):

        print(
            f"\nExperience {i}"
        )

        print(
            "Job Title:",
            exp.get(
                "job_title",
                ""
            )
        )

        print(
            "Company:",
            exp.get(
                "company",
                ""
            )
        )

        print(
            "Duration:",
            exp.get(
                "duration",
                ""
            )
        )

        for description in exp.get(
            "description",
            []
        ):

            print(
                " •",
                description
            )

    print(
        "\n================================\n"
    )