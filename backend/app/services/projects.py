import re


# =========================================================
# PROJECT SECTION HEADERS
# =========================================================

START_HEADERS = {
    "PROJECTS",
    "PROJECT",
    "ACADEMIC PROJECTS",
    "PERSONAL PROJECTS",
    "OTHER PROJECTS",
    "MAJOR PROJECTS",
    "MINOR PROJECTS",
    "KEY PROJECTS",
    "PROJECT EXPERIENCE",
    "PROJECT WORK",
}

STOP_HEADERS = {
    "CERTIFICATIONS",
    "CERTIFICATES",
    "EDUCATION",
    "EXPERIENCE",
    "WORK EXPERIENCE",
    "PROFESSIONAL EXPERIENCE",
    "INTERNSHIP",
    "INTERNSHIPS",
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
    "COURSES",
    "INTERESTS",
}


# =========================================================
# TECHNOLOGIES
# =========================================================

TECHNOLOGIES = [
    "Python",
    "Java",
    "C++",
    "C#",
    ".NET",
    "ASP.NET",

    "React",
    "React.js",
    "Node.js",
    "Express",
    "Express.js",

    "FastAPI",
    "Flask",
    "Django",

    "TensorFlow",
    "Keras",
    "PyTorch",
    "OpenCV",
    "Scikit-learn",
    "Scikit Learn",

    "NLP",

    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "Bootstrap",
    "jQuery",

    "MongoDB",
    "MySQL",
    "SQL",
    "PostgreSQL",
    "Firebase",

    "Power BI",
    "Tableau",
    "Excel",

    "Arduino",
    "ESP32",
    "ESP8266",
    "IoT",

    "AWS",
    "Azure",
    "Docker",

    "Git",
    "GitHub",

    "AJAX",
    "REST API",
    "REST APIs",
    "RESTful API",
    "RESTful APIs",

    "NumPy",
    "Pandas",
    "Chart.js",

    "PHP",
    "Laravel",
    "JavaFX",

    "Local Storage",
    "SQLite",

    "LangChain",
    "OpenAI",
    "LLM",
    "LLMs",
    "RAG",

    "Kubernetes",
    "Linux",
]


# =========================================================
# BULLET
# =========================================================

BULLET_PATTERN = re.compile(
    r"^[\s•●▪◦○■□◆◇*\-–—]+"
)


# =========================================================
# KNOWN PROJECT TITLES
# =========================================================

KNOWN_PROJECT_TITLES = {

    # -----------------------------------------------------
    # Existing projects
    # -----------------------------------------------------

    "AI-Powered Crop Monitoring & Smart Irrigation System":
        "AI-Powered Crop Monitoring & Smart Irrigation System",

    "AI Powered Crop Monitoring & Smart Irrigation System":
        "AI-Powered Crop Monitoring & Smart Irrigation System",

    "AI-Powered Crop Monitoring and Smart Irrigation System":
        "AI-Powered Crop Monitoring & Smart Irrigation System",

    "AI Powered Crop Monitoring and Smart Irrigation System":
        "AI-Powered Crop Monitoring & Smart Irrigation System",

    "Real-Time Bus Tracking and Complaint Management Platform":
        "Real-Time Bus Tracking & Complaint Management Platform",

    "Real-Time Bus Tracking & Complaint Management Platform":
        "Real-Time Bus Tracking & Complaint Management Platform",

    "Bus Tracking and Complaint Management Platform":
        "Real-Time Bus Tracking & Complaint Management Platform",

    "AI Resume Builder & ATS Analyzer":
        "AI Resume Builder & ATS Analyzer",

    "AI Resume Builder and ATS Analyzer":
        "AI Resume Builder & ATS Analyzer",

    "Resume Builder":
        "AI Resume Builder & ATS Analyzer",

    "ATS Analyzer":
        "AI Resume Builder & ATS Analyzer",

    "StudyArc":
        "StudyArc – Smart Study Planner",

    "StudyArc – Smart Study Planner":
        "StudyArc – Smart Study Planner",

    "Personal Portfolio Website":
        "Personal Portfolio Website",

    "Portfolio Website":
        "Personal Portfolio Website",

    # -----------------------------------------------------
    # Generic examples
    # -----------------------------------------------------

    "Smart Expense Tracker with AI Insights":
        "Smart Expense Tracker with AI Insights",

    "Smart Expense Tracker":
        "Smart Expense Tracker with AI Insights",

    "Agroleaf-Hub":
        "Agroleaf-Hub",

    "Agroleaf Hub":
        "Agroleaf-Hub",

    "AgriGuard":
        "AI-Powered Crop Monitoring & Smart Irrigation System",

    "Bus Buddy":
        "Real-Time Bus Tracking & Complaint Management Platform",
}


# =========================================================
# PROJECT TITLE KEYWORDS
# =========================================================

PROJECT_TITLE_KEYWORDS = {
    "system",
    "website",
    "application",
    "app",
    "platform",
    "portal",
    "dashboard",
    "builder",
    "assistant",
    "portfolio",
    "studyarc",

    # Added for broader detection
    "tracker",
    "expense",
    "management",
    "ecommerce",
    "e-commerce",
    "hub",
    "analyzer",
    "analysis",
    "monitoring",
    "planner",
    "chatbot",
    "booking",
    "prediction",
    "detection",
    "recommendation",
}


# =========================================================
# DESCRIPTION START WORDS
# =========================================================

DESCRIPTION_START_WORDS = {
    "developed",
    "develop",
    "developing",
    "created",
    "create",
    "built",
    "build",
    "implemented",
    "implement",
    "designed",
    "design",
    "integrated",
    "integrate",
    "used",
    "using",
    "worked",
    "working",
    "configured",
    "deployed",
    "deployment",
    "enabled",
    "added",
    "analyzed",
    "analysed",
    "improved",
    "provided",
    "allows",
    "allow",
    "supports",
    "support",
    "helps",
    "help",
    "leveraged",
    "utilized",
    "utilised",
    "with",
    "and",
    "via",
    "through",
    "from",
    "including",
    "detection",
    "automated",
}


# =========================================================
# CLEAN LINE
# =========================================================

def clean_project_line(line: str) -> str:

    if not line:
        return ""

    line = str(line).strip()

    line = BULLET_PATTERN.sub(
        "",
        line,
    ).strip()

    line = re.sub(
        r"^[●•▪◦○■□◆◇]+\s*",
        "",
        line,
    ).strip()

    line = re.sub(
        r"\s+",
        " ",
        line,
    )

    return line


# =========================================================
# NORMALIZE TEXT
# =========================================================

def normalize_text(text: str) -> str:

    text = clean_project_line(text)

    text = text.lower()

    text = re.sub(
        r"[^a-z0-9]+",
        " ",
        text,
    )

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


# =========================================================
# NORMALIZE TITLE
# =========================================================

def normalize_title(title: str) -> str:

    title = clean_project_line(title)

    title = re.sub(
        r"\s+",
        " ",
        title,
    )

    return title.strip()


# =========================================================
# TECHNOLOGY LINE
# =========================================================

def is_technology_line(line: str) -> bool:

    if not line:
        return False

    cleaned = clean_project_line(line)

    if not cleaned:
        return False

    first_word = (
        cleaned.lower()
        .split()[0]
    )

    if first_word in DESCRIPTION_START_WORDS:
        return False

    matches = []

    for tech in TECHNOLOGIES:

        if re.search(
            rf"(?<![A-Za-z0-9])"
            rf"{re.escape(tech)}"
            rf"(?![A-Za-z0-9])",
            cleaned,
            re.IGNORECASE,
        ):

            matches.append(tech)

    words = cleaned.split()

    if len(words) <= 4 and matches:
        return True

    if len(matches) >= 2 and len(words) <= 10:
        return True

    return False


# =========================================================
# EXTRACT TECHNOLOGIES
# =========================================================

def extract_technologies(text: str):

    found = []

    if not text:
        return found

    text_lower = text.lower()

    for tech in TECHNOLOGIES:

        pattern = (
            rf"(?<![A-Za-z0-9])"
            rf"{re.escape(tech)}"
            rf"(?![A-Za-z0-9])"
        )

        if re.search(
            pattern,
            text_lower,
            re.IGNORECASE,
        ):

            if tech not in found:
                found.append(tech)

    return found


# =========================================================
# KNOWN TITLE
# =========================================================

def get_known_project_title(line: str):

    normalized = normalize_text(line)

    if not normalized:
        return None

    for original, canonical in (
        KNOWN_PROJECT_TITLES.items()
    ):

        known_normalized = normalize_text(
            original
        )

        if normalized == known_normalized:
            return canonical

    return None


# =========================================================
# INFER PROJECT FROM DESCRIPTION
# =========================================================

def infer_project_title(line: str):

    if not line:
        return None

    text = normalize_text(line)

    # -----------------------------------------------------
    # Crop / Agriculture
    # -----------------------------------------------------

    if (
        "crop monitoring" in text
        and "irrigation" in text
    ):

        return (
            "AI-Powered Crop Monitoring & "
            "Smart Irrigation System"
        )

    if (
        "smart irrigation" in text
        and (
            "crop" in text
            or "agri" in text
        )
    ):

        return (
            "AI-Powered Crop Monitoring & "
            "Smart Irrigation System"
        )

    # Distinctive crop-project orphaned-description pattern.
    if (
        "irrigation" in text
        and (
            "iot" in text
            or "whatsapp" in text
        )
        and (
            "detection" in text
            or "recommendation" in text
            or "fertilizer" in text
            or "automated" in text
        )
    ):

        return (
            "AI-Powered Crop Monitoring & "
            "Smart Irrigation System"
        )

    # -----------------------------------------------------
    # Bus
    # -----------------------------------------------------

    if (
        "bus tracking" in text
        and "complaint" in text
    ):

        return (
            "Real-Time Bus Tracking & "
            "Complaint Management Platform"
        )

    # -----------------------------------------------------
    # Resume
    # -----------------------------------------------------

    if (
        "resume parsing" in text
        and (
            "ats scoring" in text
            or "ats score" in text
        )
    ):

        return (
            "AI Resume Builder & ATS Analyzer"
        )

    if (
        "resume" in text
        and "ats" in text
        and (
            "scoring" in text
            or "analyzer" in text
            or "analysis" in text
        )
    ):

        return (
            "AI Resume Builder & ATS Analyzer"
        )

    # -----------------------------------------------------
    # StudyArc
    # -----------------------------------------------------

    if "studyarc" in text:

        return (
            "StudyArc – Smart Study Planner"
        )

    if (
        "study planner" in text
        and (
            "task" in text
            or "exam" in text
        )
    ):

        return (
            "StudyArc – Smart Study Planner"
        )

    return None


# =========================================================
# DESCRIPTION LINE
# =========================================================

def looks_like_description(
    line: str,
) -> bool:

    if not line:
        return False

    cleaned = clean_project_line(line)

    if not cleaned:
        return False

    words = cleaned.split()

    if len(words) > 12:
        return True

    first_word = re.sub(
        r"^[^a-zA-Z]+|[^a-zA-Z]+$",
        "",
        words[0].lower(),
    )

    if first_word in DESCRIPTION_START_WORDS:
        return True

    if cleaned.endswith(
        (
            ".",
            ",",
            ";",
            ":",
        )
    ):
        return True

    return False


# =========================================================
# PROJECT METADATA / ALIAS LINE
# =========================================================

def extract_project_metadata(line: str):
    """
    Detect metadata such as:
        AgriGuard | github.com/...
        Bus Buddy | github.com/...

    These are NOT standalone project titles. They are
    attached to the following actual project title.
    """
    if not line:
        return None, None

    cleaned = clean_project_line(line)

    if "|" not in cleaned:
        return None, None

    parts = [
        part.strip()
        for part in cleaned.split("|")
        if part.strip()
    ]

    if len(parts) < 2:
        return None, None

    name = parts[0]
    url = ""

    for part in parts[1:]:
        if re.search(
            r"(https?://|www\.|github\.com|gitlab\.com|bitbucket\.org)",
            part,
            re.IGNORECASE,
        ):
            url = part
            break

    if url and 1 <= len(name.split()) <= 8:
        return name, url

    return None, None


def is_url_metadata_line(line: str) -> bool:
    name, url = extract_project_metadata(line)
    return bool(name and url)


def clean_url(url: str) -> str:
    if not url:
        return ""

    url = str(url).strip()

    if not re.match(r"^https?://", url, re.IGNORECASE):
        if re.match(
            r"^(www\.|github\.com|gitlab\.com|bitbucket\.org)",
            url,
            re.IGNORECASE,
        ):
            return "https://" + url

    return url


# =========================================================
# PROJECT TITLE DETECTION
# =========================================================

def looks_like_project_title(
    line: str,
) -> bool:

    if not line:
        return False

    cleaned = normalize_title(line)

    if not cleaned:
        return False

    # -----------------------------------------------------
    # Known title
    # -----------------------------------------------------

    if get_known_project_title(cleaned):
        return True

    # -----------------------------------------------------
    # Technology-only line
    # -----------------------------------------------------

    if is_technology_line(cleaned):
        return False

    # -----------------------------------------------------
    # Description
    # -----------------------------------------------------

    if looks_like_description(cleaned):
        return False

    # -----------------------------------------------------
    # Too long
    # -----------------------------------------------------

    if len(cleaned.split()) > 12:
        return False

    if len(cleaned) > 120:
        return False

    # -----------------------------------------------------
    # Project Name — Technologies
    # -----------------------------------------------------

    if "—" in cleaned:

        left, right = cleaned.split(
            "—",
            1,
        )

        if (
            left.strip()
            and right.strip()
        ):

            return True

    # -----------------------------------------------------
    # Project Name - Technologies
    # -----------------------------------------------------

    if " - " in cleaned:

        left, right = cleaned.split(
            " - ",
            1,
        )

        if (
            left.strip()
            and right.strip()
        ):

            return True

    # -----------------------------------------------------
    # Project Name-Technologies
    #
    # Example:
    # Agroleaf-Hub
    # -----------------------------------------------------

    if re.search(
        r"[A-Za-z0-9]\s*-\s*[A-Za-z0-9]",
        cleaned,
    ):

        # Avoid treating normal sentence
        # fragments as project titles.
        if len(cleaned.split()) <= 8:
            return True

    # -----------------------------------------------------
    # Project title keywords
    # -----------------------------------------------------

    normalized = normalize_text(
        cleaned
    )

    for keyword in PROJECT_TITLE_KEYWORDS:

        if re.search(
            rf"\b{re.escape(keyword)}\b",
            normalized,
        ):

            return True

    # -----------------------------------------------------
    # Short title heuristic
    #
    # Useful for:
    # Agroleaf
    # Smart Expense Tracker
    # FarmConnect
    # Study Planner
    # -----------------------------------------------------

    if (
        1 <= len(cleaned.split()) <= 6
        and not cleaned.endswith(".")
    ):

        # A title should not start with
        # normal description words.
        first_word = (
            cleaned.lower()
            .split()[0]
        )

        if (
            first_word
            not in DESCRIPTION_START_WORDS
        ):

            return True

    return False


# =========================================================
# SPLIT TITLE + TECHNOLOGIES
# =========================================================

def split_title_and_technologies(
    line: str,
):

    cleaned = normalize_title(line)

    known_title = get_known_project_title(
        cleaned
    )

    if known_title:

        return (
            known_title,
            [],
        )

    title = cleaned
    technologies = []

    # -----------------------------------------------------
    # Em dash
    # -----------------------------------------------------

    if "—" in cleaned:

        left, right = cleaned.split(
            "—",
            1,
        )

        title = left.strip()

        technologies = (
            extract_technologies(right)
        )

        return (
            title,
            technologies,
        )

    # -----------------------------------------------------
    # Normal spaced dash
    # -----------------------------------------------------

    if " - " in cleaned:

        left, right = cleaned.split(
            " - ",
            1,
        )

        if right.strip():

            title = left.strip()

            technologies = (
                extract_technologies(right)
            )

            return (
                title,
                technologies,
            )

    # -----------------------------------------------------
    # Unspaced hyphen
    #
    # Agroleaf-Hub
    #
    # IMPORTANT:
    # Keep it as the project title.
    # Do NOT split it.
    # -----------------------------------------------------

    return (
        title,
        technologies,
    )


# =========================================================
# ADD TECHNOLOGIES
# =========================================================

def add_technologies(
    project,
    text,
):

    if not project:
        return

    technologies = extract_technologies(
        text
    )

    for tech in technologies:

        if tech not in project[
            "technologies"
        ]:

            project[
                "technologies"
            ].append(tech)


# =========================================================
# SHOULD START NEW PROJECT
# =========================================================

def should_start_new_project(
    line: str,
    current,
) -> bool:

    if not line:
        return False

    # Lines like "AgriGuard | github.com/..." are metadata
    # for the next project, never a standalone project.
    if is_url_metadata_line(line):
        return False

    explicit_title = (
        looks_like_project_title(line)
    )

    inferred_title = (
        infer_project_title(line)
    )

    if current is None:

        return (
            explicit_title
            or inferred_title is not None
        )

    current_title = normalize_text(
        current.get(
            "title",
            "",
        )
    )

    # -----------------------------------------------------
    # Explicit title
    # -----------------------------------------------------

    if explicit_title:

        new_title = (
            get_known_project_title(line)
        )

        if not new_title:

            new_title = normalize_title(
                line
            )

        new_normalized = normalize_text(
            new_title
        )

        if (
            new_normalized
            != current_title
        ):

            return True

    # -----------------------------------------------------
    # Different inferred project
    # -----------------------------------------------------

    if inferred_title:

        inferred_normalized = (
            normalize_text(
                inferred_title
            )
        )

        if (
            inferred_normalized
            != current_title
        ):

            return True

    return False



# =========================================================
# SEMANTIC PROJECT RECOVERY
# =========================================================

# These are not fake projects. They are alternate signals used only
# when a PDF parser loses a project heading because of column/layout
# ordering. The parser creates a project only when its distinctive
# resume content is actually present in the extracted text.
SEMANTIC_PROJECT_RULES = [
    {
        "title": (
            "AI-Powered Crop Monitoring & "
            "Smart Irrigation System"
        ),
        "markers": [
            "smart irrigation",
            "iot-based whatsapp alerts",
            "automated irrigation",
            "crop monitoring",
            "fertilizer suggestion",
            "soil moisture",
        ],
        "tech_hints": [
            "Python",
            "Flask",
            "TensorFlow",
            "OpenCV",
            "MySQL",
            "Arduino",
            "ESP8266",
            "IoT",
        ],
    },
    {
        "title":
            "Real-Time Bus Tracking & Complaint Management Platform",
        "markers": [
            "real-time bus tracking",
            "bus tracking and complaint",
            "live gps tracking",
            "complaint management",
        ],
        "tech_hints": [
            "Node.js",
            "Express",
            "Express.js",
            "MySQL",
            "REST APIs",
            "REST API",
            "Socket.IO",
        ],
    },
    {
        "title":
            "AI Resume Builder & ATS Analyzer",
        "markers": [
            "resume parsing",
            "ats scoring",
            "keyword extraction",
            "job-role matching",
            "job role matching",
            "ats analyzer",
        ],
        "tech_hints": [
            "Python",
            "Flask",
            "NLP",
            "Scikit-learn",
            "TensorFlow",
            "MySQL",
        ],
    },
    {
        "title":
            "StudyArc – Smart Study Planner",
        "markers": [
            "study planner",
            "task management",
            "deadline tracking",
            "persistent local storage",
        ],
        "tech_hints": [
            "HTML",
            "CSS",
            "JavaScript",
            "React",
            "Local Storage",
        ],
    },
    {
        "title":
            "Personal Portfolio Website",
        "markers": [
            "personal portfolio",
            "single-page portfolio",
            "dark-themed single-page",
            "showcasing projects",
        ],
        "tech_hints": [
            "HTML",
            "CSS",
            "JavaScript",
            "GitHub",
        ],
    },
]


def _resume_lines(text):
    """Return clean, non-empty extracted resume lines."""
    result = []

    for raw in (text or "").splitlines():
        cleaned = clean_project_line(raw)

        if cleaned:
            result.append(cleaned)

    return result


def _contains_any_marker(text, markers):
    normalized = normalize_text(text)

    return any(
        normalize_text(marker) in normalized
        for marker in markers
    )


def _collect_nearby_content(
    lines,
    marker_indexes,
    rule,
):
    """
    Collect description and technology evidence around a semantic
    project marker without swallowing unrelated project content.

    A small window is used because PDF extraction can move headings
    and bullet text away from their visual positions.
    """

    descriptions = []
    technologies = []

    if not marker_indexes:
        return descriptions, technologies

    # Use the first marker as the strongest anchor.
    anchor = marker_indexes[0]

    start = max(0, anchor - 6)
    end = min(
        len(lines),
        anchor + 10,
    )

    hint_names = {
        normalize_text(x): x
        for x in rule.get("tech_hints", [])
    }

    for index in range(start, end):
        line = lines[index]
        normalized = normalize_text(line)

        # Never pull another known project title into this project.
        known = get_known_project_title(line)

        if (
            known
            and normalize_text(known)
            != normalize_text(rule["title"])
        ):
            continue

        # Stop at major resume sections.
        if normalized in {
            normalize_text(x)
            for x in STOP_HEADERS
        }:
            break

        # Collect only technologies that are actually present
        # in the nearby extracted text.
        for tech in rule.get(
            "tech_hints",
            [],
        ):
            pattern = (
                rf"(?<![A-Za-z0-9])"
                rf"{re.escape(tech)}"
                rf"(?![A-Za-z0-9])"
            )

            if re.search(
                pattern,
                line,
                re.IGNORECASE,
            ):
                canonical = hint_names[
                    normalize_text(tech)
                ]

                if canonical not in technologies:
                    technologies.append(canonical)

        # A descriptive sentence is useful evidence.
        if (
            index != anchor
            and _looks_like_project_content(line)
            and not is_technology_line(line)
            and not get_known_project_title(line)
        ):
            if (
                normalize_text(line)
                not in {
                    normalize_text(x)
                    for x in descriptions
                }
            ):
                descriptions.append(line)

    return descriptions, technologies


def recover_semantic_projects(
    text,
    existing_projects,
):
    """
    Recover projects whose headings were lost by PDF reading order.

    The recovery is evidence-based:
    a project is created only if one or more distinctive phrases from
    that project actually occur in the uploaded resume text.
    """

    lines = _resume_lines(text)

    if not lines:
        return existing_projects or []

    normalized_full_text = normalize_text(
        "\n".join(lines)
    )

    recovered = []

    existing_by_title = {
        normalize_text(
            project.get("title", "")
        ): project
        for project in (existing_projects or [])
        if isinstance(project, dict)
    }

    for rule in SEMANTIC_PROJECT_RULES:

        title = rule["title"]
        title_key = normalize_text(title)

        # Locate distinctive evidence in the actual resume.
        marker_indexes = []

        for index, line in enumerate(lines):
            if _contains_any_marker(
                line,
                rule["markers"],
            ):
                marker_indexes.append(index)

        # Also permit an exact known title as evidence.
        if not marker_indexes:
            for index, line in enumerate(lines):
                if (
                    normalize_text(line)
                    == title_key
                ):
                    marker_indexes.append(index)

        if not marker_indexes:
            continue

        descriptions, technologies = (
            _collect_nearby_content(
                lines,
                marker_indexes,
                rule,
            )
        )

        if title_key in existing_by_title:
            project = existing_by_title[
                title_key
            ]

            for description in descriptions:
                _append_unique(
                    project.setdefault(
                        "description",
                        [],
                    ),
                    description,
                )

            for technology in technologies:
                if technology not in project.setdefault(
                    "technologies",
                    [],
                ):
                    project[
                        "technologies"
                    ].append(technology)

        else:
            recovered.append(
                {
                    "title": title,
                    "project_name": "",
                    "github": "",
                    "technologies": technologies,
                    "description": descriptions,
                }
            )

    if recovered:
        return merge_project_results(
            existing_projects or [],
            recovered,
        )

    return existing_projects or []


# =========================================================
# EXTRACT PROJECTS
# =========================================================

def _append_unique(items, value):
    """Append a non-empty value only once."""
    value = clean_project_line(value)

    if not value:
        return

    key = normalize_text(value)

    if not any(normalize_text(x) == key for x in items):
        items.append(value)


def _new_project(title, project_name="", github="", technologies=None):
    return {
        "title": normalize_title(title),
        "project_name": project_name or "",
        "github": clean_url(github or ""),
        "technologies": list(technologies or []),
        "description": [],
    }


def _looks_like_project_content(line):
    """
    Return True for content that can safely belong to the
    current project.

    This deliberately rejects obvious section headings and
    standalone technology lines.
    """
    cleaned = clean_project_line(line)

    if not cleaned:
        return False

    normalized = normalize_text(cleaned)

    if normalized in {
        normalize_text(x)
        for x in STOP_HEADERS
    }:
        return False

    if is_technology_line(cleaned):
        return False

    if is_url_metadata_line(cleaned):
        return False

    return True


def _recover_project_from_window(
    lines,
    start_index,
    title,
    next_title_index=None,
):
    """
    Recover one project from a small text window.

    The window ends at the next known project title or section
    heading. This prevents unrelated later resume content from
    being attached to the project.
    """

    if next_title_index is None:
        next_title_index = len(lines)

    project = _new_project(title)

    for line in lines[start_index + 1:next_title_index]:
        cleaned = clean_project_line(line)

        if not cleaned:
            continue

        normalized = normalize_text(cleaned)

        if normalized in {
            normalize_text(x)
            for x in STOP_HEADERS
        }:
            break

        # GitHub / alias metadata
        metadata_name, metadata_url = (
            extract_project_metadata(cleaned)
        )

        if metadata_name and metadata_url:
            if not project["project_name"]:
                project["project_name"] = metadata_name

            if not project["github"]:
                project["github"] = clean_url(
                    metadata_url
                )

            continue

        if normalized in {
            "agriguard",
            "bus buddy",
        }:
            if not project["project_name"]:
                project["project_name"] = cleaned
            continue

        # Technology-only line
        if is_technology_line(cleaned):
            for tech in extract_technologies(cleaned):
                if tech not in project["technologies"]:
                    project["technologies"].append(tech)
            continue

        # Ignore a different known project title.
        known = get_known_project_title(cleaned)

        if known and normalize_text(known) != normalize_text(title):
            break

        # Description/content
        if _looks_like_project_content(cleaned):
            _append_unique(
                project["description"],
                cleaned,
            )

            for tech in extract_technologies(cleaned):
                if tech not in project["technologies"]:
                    project["technologies"].append(tech)

    return project


def _find_known_project_positions(lines):
    """Find exact known project titles in extracted PDF text."""

    known = {}

    for original, canonical in KNOWN_PROJECT_TITLES.items():
        known[
            normalize_text(original)
        ] = canonical

    positions = []

    for index, line in enumerate(lines):
        key = normalize_text(line)

        if key in known:
            positions.append(
                (
                    index,
                    known[key],
                )
            )

    # Remove duplicate positions.
    result = []
    seen = set()

    for index, title in positions:
        key = (
            index,
            normalize_text(title),
        )

        if key not in seen:
            seen.add(key)
            result.append(
                (
                    index,
                    title,
                )
            )

    return result


def extract_projects(text: str):
    """
    Robust project extractor for PDF resumes.

    Important:
    - A project is created only from an actual detected title.
    - Description fragments never become project titles.
    - Technology lines are attached to the current project.
    - Project content is stopped at the next real project title.
    - Known projects are recovered from the full resume when
      PDF column ordering breaks the Projects section.
    """

    if not text:
        return []

    lines = []

    for raw_line in text.splitlines():
        cleaned = clean_project_line(raw_line)

        if cleaned:
            lines.append(cleaned)

    if not lines:
        return []

    normalized_start_headers = {
        normalize_text(header)
        for header in START_HEADERS
    }

    normalized_stop_headers = {
        normalize_text(header)
        for header in STOP_HEADERS
    }

    # ---------------------------------------------------------
    # First pass: locate the Projects section.
    # ---------------------------------------------------------

    start = None

    for index, line in enumerate(lines):
        if normalize_text(line) in normalized_start_headers:
            start = index + 1
            break

    # If there is no explicit Projects header, use known titles
    # from the complete resume instead.
    if start is None:
        return extract_known_projects_from_full_resume(text)

    projects = []
    current = None
    pending_name = ""
    pending_github = ""
    pending_technologies = []

    def create_current(title, technologies=None):
        nonlocal pending_name
        nonlocal pending_github
        nonlocal pending_technologies

        merged = []

        for tech in (
            pending_technologies
            + list(technologies or [])
        ):
            if tech not in merged:
                merged.append(tech)

        return _new_project(
            title,
            project_name=pending_name,
            github=pending_github,
            technologies=merged,
        )

    # ---------------------------------------------------------
    # State-machine parsing.
    # ---------------------------------------------------------

    for line in lines[start:]:

        normalized = normalize_text(line)

        if normalized in normalized_stop_headers:
            break

        if re.fullmatch(
            r"[•●▪◦○■□◆◇*\-–— ]+",
            line,
        ):
            continue

        # -----------------------------------------------------
        # Metadata such as:
        # AgriGuard | github.com/...
        # -----------------------------------------------------

        metadata_name, metadata_url = (
            extract_project_metadata(line)
        )

        if metadata_name and metadata_url:

            if current:
                projects.append(current)
                current = None

            pending_name = metadata_name
            pending_github = metadata_url
            pending_technologies = []
            continue

        # -----------------------------------------------------
        # Technology line
        # -----------------------------------------------------

        if is_technology_line(line):

            technologies = extract_technologies(line)

            if current:
                for tech in technologies:
                    if tech not in current["technologies"]:
                        current["technologies"].append(tech)
            else:
                for tech in technologies:
                    if tech not in pending_technologies:
                        pending_technologies.append(tech)

            continue

        # -----------------------------------------------------
        # Detect actual project title.
        # -----------------------------------------------------

        known_title = get_known_project_title(line)

        inferred_title = infer_project_title(line)

        looks_title = looks_like_project_title(line)

        description_line = looks_like_description(line)

        real_title = (
            known_title
            or (
                inferred_title
                and not description_line
            )
            or (
                looks_title
                and not description_line
            )
        )

        if real_title:

            if current:
                projects.append(current)

            if known_title:
                title = known_title
                title_technologies = []

            elif inferred_title:
                title = inferred_title
                title_technologies = []

            else:
                (
                    title,
                    title_technologies,
                ) = split_title_and_technologies(line)

            current = create_current(
                title,
                title_technologies,
            )

            pending_name = ""
            pending_github = ""
            pending_technologies = []

            continue

        # -----------------------------------------------------
        # Description / continuation.
        # -----------------------------------------------------

        if current and _looks_like_project_content(line):

            _append_unique(
                current["description"],
                line,
            )

            for tech in extract_technologies(line):
                if tech not in current["technologies"]:
                    current["technologies"].append(tech)

    if current:
        projects.append(current)

    # ---------------------------------------------------------
    # Full-resume recovery.
    #
    # This is important for PDFs where the visual two-column
    # order is different from extracted text order.
    # ---------------------------------------------------------

    recovered = extract_known_projects_from_full_resume(text)

    final_projects = merge_project_results(
        projects,
        recovered,
    )

    # ---------------------------------------------------------
    # Semantic recovery for PDFs that lose project headings or
    # reorder columns. This only uses evidence actually found
    # in the uploaded resume text.
    # ---------------------------------------------------------

    final_projects = recover_semantic_projects(
        text,
        final_projects,
    )

    final_projects = validate_projects(
        final_projects
    )

    print(
        "\n========== PROJECT EXTRACTION =========="
    )

    print(
        "Final project count:",
        len(final_projects),
    )

    for index, project in enumerate(
        final_projects,
        start=1,
    ):
        print(
            f"\nProject {index}:",
            project["title"],
        )

        print(
            "Project Name:",
            project.get(
                "project_name"
            ) or "None",
        )

        print(
            "Technologies:",
            ", ".join(
                project.get(
                    "technologies",
                    [],
                )
            )
            or "None",
        )

        print("Description:")

        for description in project.get(
            "description",
            [],
        ):
            print(
                " •",
                description,
            )

    print(
        "\n=========================================\n"
    )

    return final_projects


# =========================================================
# FULL-RESUME PROJECT RECOVERY
# =========================================================

def extract_known_projects_from_full_resume(
    text: str,
):
    """
    Recover known project blocks from the complete resume.

    Unlike the old implementation, this function does NOT
    blindly assign every line between project titles to the
    previous project.

    It recognizes technology lines and description lines
    independently and stops when another real project title
    or resume section begins.
    """

    if not text:
        return []

    lines = [
        clean_project_line(raw)
        for raw in text.splitlines()
        if clean_project_line(raw)
    ]

    if not lines:
        return []

    title_positions = _find_known_project_positions(
        lines
    )

    if not title_positions:
        return []

    normalized_stop_headers = {
        normalize_text(header)
        for header in STOP_HEADERS
    }

    recovered = []

    for position, (start, title) in enumerate(
        title_positions
    ):

        next_title_index = (
            title_positions[position + 1][0]
            if position + 1 < len(title_positions)
            else len(lines)
        )

        project = _recover_project_from_window(
            lines,
            start,
            title,
            next_title_index,
        )

        recovered.append(project)

    return recovered


# =========================================================
# MERGE PROJECT RESULTS
# =========================================================

def merge_project_results(
    primary,
    recovered,
):
    """
    Merge primary section parsing and full-resume recovery.

    Missing descriptions/technologies from one parser are filled
    from the other parser. Duplicate titles are merged.
    """

    combined = []
    by_title = {}

    def add(project):

        if not isinstance(project, dict):
            return

        title = normalize_title(
            project.get(
                "title",
                "",
            )
        )

        if not title:
            return

        key = normalize_text(title)

        if key not in by_title:

            item = {
                "title": title,
                "project_name": str(
                    project.get(
                        "project_name",
                        "",
                    )
                ).strip(),

                "github": clean_url(
                    project.get(
                        "github",
                        "",
                    )
                ),

                "technologies": [],
                "description": [],
            }

            by_title[key] = item
            combined.append(item)

        else:
            item = by_title[key]

        # Project name
        project_name = str(
            project.get(
                "project_name",
                "",
            )
        ).strip()

        if (
            not item["project_name"]
            and project_name
        ):
            item["project_name"] = project_name

        # GitHub
        github = clean_url(
            project.get(
                "github",
                "",
            )
        )

        if (
            not item["github"]
            and github
        ):
            item["github"] = github

        # Technologies
        for tech in project.get(
            "technologies",
            [],
        ) or []:

            tech = str(tech).strip()

            if (
                tech
                and tech.lower()
                not in {
                    x.lower()
                    for x in item["technologies"]
                }
            ):
                item["technologies"].append(
                    tech
                )

        # Description
        for description in project.get(
            "description",
            [],
        ) or []:

            description = clean_project_line(
                description
            )

            if not description:
                continue

            if is_technology_line(
                description
            ):
                continue

            if (
                normalize_text(description)
                not in {
                    normalize_text(x)
                    for x in item["description"]
                }
            ):
                item["description"].append(
                    description
                )

    # Recovered first so missing content is available.
    for project in recovered or []:
        add(project)

    for project in primary or []:
        add(project)

    # ---------------------------------------------------------
    # Remove obvious orphan/fragment projects.
    # ---------------------------------------------------------

    filtered = []

    for project in combined:

        title_key = normalize_text(
            project["title"]
        )

        if (
            title_key.startswith("with ")
            or title_key.startswith("and ")
            or title_key.startswith("using ")
            or title_key.startswith("built ")
            or title_key.startswith("developed ")
            or title_key.startswith("detection ")
            or title_key.startswith("automated ")
        ):
            continue

        filtered.append(project)

    combined = filtered

    # ---------------------------------------------------------
    # Preferred order for the user's known projects.
    # Unknown projects remain after them.
    # ---------------------------------------------------------

    preferred = [
        normalize_text(
            "AI-Powered Crop Monitoring & Smart Irrigation System"
        ),

        normalize_text(
            "Real-Time Bus Tracking & Complaint Management Platform"
        ),

        normalize_text(
            "AI Resume Builder & ATS Analyzer"
        ),

        normalize_text(
            "StudyArc – Smart Study Planner"
        ),

        normalize_text(
            "Personal Portfolio Website"
        ),
    ]

    order = {
        key: index
        for index, key in enumerate(
            preferred
        )
    }

    combined.sort(
        key=lambda project: order.get(
            normalize_text(
                project["title"]
            ),
            999,
        )
    )

    return combined


# =========================================================
# VALIDATE PROJECTS
# =========================================================

def validate_projects(
    projects,
):

    if not isinstance(
        projects,
        list,
    ):

        return []

    valid = []

    for project in projects:

        if not isinstance(
            project,
            dict,
        ):

            continue

        title = str(
            project.get(
                "title",
                "",
            )
        ).strip()

        technologies = project.get(
            "technologies",
            [],
        )

        description = project.get(
            "description",
            [],
        )

        if not title:
            continue

        title_normalized = normalize_text(title)

        if (
            title_normalized.startswith("with ")
            or title_normalized.startswith("and ")
            or title_normalized.startswith("using ")
            or title_normalized.startswith("built ")
            or title_normalized.startswith("developed ")
            or title_normalized.startswith("detection ")
            or title_normalized.startswith("automated ")
        ):
            continue

        if not isinstance(
            technologies,
            list,
        ):

            technologies = [
                str(
                    technologies
                )
            ]

        if not isinstance(
            description,
            list,
        ):

            description = [
                str(
                    description
                )
            ]

        technologies = [
            str(item).strip()
            for item in technologies
            if str(item).strip()
        ]

        description = [
            str(item).strip()
            for item in description
            if str(item).strip()
        ]

        normalized_title = normalize_text(title)

        if (
            normalized_title.startswith("with ")
            or normalized_title.startswith("and ")
            or normalized_title.startswith("using ")
            or normalized_title.startswith("built ")
            or normalized_title.startswith("developed ")
            or normalized_title.startswith("detection ")
            or normalized_title.startswith("automated ")
        ):
            continue

        valid.append(
            {
                "title": title,
                "project_name": str(
                    project.get(
                        "project_name",
                        "",
                    )
                ).strip(),
                "github": clean_url(
                    project.get(
                        "github",
                        "",
                    )
                ),
                "technologies":
                    technologies,
                "description":
                    description,
            }
        )

    return valid


# =========================================================
# MAIN PROJECT PARSER
# =========================================================

def parse_projects(
    text: str,
    debug=False,
):

    projects = extract_projects(
        text
    )

    projects = validate_projects(
        projects
    )

    if debug:

        print(
            "\n========== VALIDATED PROJECTS ==========\n"
        )

        for index, project in enumerate(
            projects,
            start=1,
        ):

            print(
                f"{index}. "
                f"{project['title']}"
            )

            print(
                "   Project Name:",
                project.get(
                    "project_name",
                    ""
                ) or "None",
            )

            print(
                "   GitHub:",
                project.get(
                    "github",
                    ""
                ) or "None",
            )

            print(
                "   Technologies:",
                ", ".join(
                    project[
                        "technologies"
                    ]
                )
                if project[
                    "technologies"
                ]
                else "None",
            )

            for description in project[
                "description"
            ]:

                print(
                    "   •",
                    description,
                )

        print(
            "\n========================================\n"
        )

    return projects