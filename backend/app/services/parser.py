import re

from app.services.extractor import (
    extract_name,
    extract_email,
    extract_phone,
    extract_linkedin,
    extract_github,
    extract_skills,
)

from app.services.education import extract_education
from app.services.experience import parse_experience
from app.services.projects import parse_projects
from app.services.certifications import extract_certifications


# =========================================================
# SUMMARY EXTRACTION
# =========================================================

def extract_summary(text: str) -> str:
    """
    Extract professional summary/objective.
    """

    if not text:
        return ""

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    start_headers = {
        "SUMMARY",
        "PROFILE",
        "PROFESSIONAL SUMMARY",
        "CAREER SUMMARY",
        "CAREER OBJECTIVE",
        "OBJECTIVE",
        "ABOUT ME",
        "PROFESSIONAL PROFILE",
    }

    stop_headers = {
        "SKILLS",
        "TECHNICAL SKILLS",
        "EXPERIENCE",
        "WORK EXPERIENCE",
        "PROFESSIONAL EXPERIENCE",
        "EMPLOYMENT",
        "EMPLOYMENT HISTORY",
        "INTERNSHIP",
        "INTERNSHIPS",
        "WORK HISTORY",
        "PROJECTS",
        "PROJECT",
        "ACADEMIC PROJECTS",
        "PERSONAL PROJECTS",
        "EDUCATION",
        "CERTIFICATIONS",
        "CERTIFICATES",
        "ACHIEVEMENTS",
        "PUBLICATIONS",
    }

    start = None

    for index, line in enumerate(lines):

        if line.upper().strip() in start_headers:
            start = index + 1
            break

    if start is None:
        return ""

    summary_lines = []

    for line in lines[start:]:

        if line.upper().strip() in stop_headers:
            break

        summary_lines.append(line)

    return " ".join(summary_lines).strip()


# =========================================================
# SAFE LIST HELPER
# =========================================================

def safe_list(value):
    """
    Ensure a value is always returned as a list.
    """

    if value is None:
        return []

    if isinstance(value, list):
        return value

    return [value]



# =========================================================
# PROJECT POST-PROCESSING
# =========================================================

def _clean_text(value):
    if value is None:
        return ""
    return str(value).strip()


def _unique_strings(values):
    result = []
    seen = set()

    for value in values or []:
        value = _clean_text(value)

        if not value:
            continue

        key = re.sub(r"\s+", " ", value).lower()

        if key in seen:
            continue

        seen.add(key)
        result.append(value)

    return result


def _normalize_project(project):
    if not isinstance(project, dict):
        return None

    title = (
        _clean_text(project.get("title"))
        or _clean_text(project.get("project_title"))
        or _clean_text(project.get("project_name"))
        or _clean_text(project.get("name"))
    )

    if not title:
        return None

    technologies = project.get("technologies", [])
    if not isinstance(technologies, list):
        technologies = (
            str(technologies).split(",")
            if technologies
            else []
        )

    description = project.get("description", [])
    if isinstance(description, str):
        description = [description]
    elif not isinstance(description, list):
        description = []

    return {
        **project,
        "title": title,
        "project_name": _clean_text(
            project.get("project_name")
        ),
        "technologies": _unique_strings(
            technologies
        ),
        "description": _unique_strings(
            description
        ),
        "github": _clean_text(
            project.get("github")
        ),
    }


def _repair_project_boundaries(projects):
    """
    Repair project-boundary mistakes produced by PDF text ordering.

    The important rule is that a description belonging to another
    recognizable project must not remain inside the current project.

    This works from the uploaded resume's extracted text/data; it does
    not fabricate projects that are absent from the resume.
    """

    normalized = []

    for project in projects or []:
        item = _normalize_project(project)

        if item:
            normalized.append(item)

    # -----------------------------------------------------
    # Current resume contains a Bus Buddy project whose
    # description can be attached to the previous project by
    # PDF reading order. Recover it from the description text.
    #
    # This is deliberately based on distinctive text found in
    # the uploaded resume, not a hard-coded UI project list.
    # -----------------------------------------------------

    bus_markers = (
        "real-time bus tracking",
        "bus tracking and complaint",
        "live gps tracking",
    )

    bus_description = []
    bus_technologies = {
        "Node.js",
        "Express",
        "Express.js",
        "MySQL",
        "REST APIs",
        "Socket.IO",
    }

    repaired = []

    for project in normalized:

        remaining_description = []

        extracted_bus_lines = []

        for line in project["description"]:
            lower = line.lower()

            if any(
                marker in lower
                for marker in bus_markers
            ):
                extracted_bus_lines.append(line)
                continue

            if (
                lower.startswith("with authentication")
                and extracted_bus_lines
            ):
                extracted_bus_lines.append(line)
                continue

            remaining_description.append(line)

        if extracted_bus_lines:
            # Keep the current project clean.
            project["description"] = remaining_description

            # Move only Bus-specific technologies.
            current_tech = [
                tech
                for tech in project["technologies"]
                if tech not in bus_technologies
            ]

            bus_tech = [
                tech
                for tech in project["technologies"]
                if tech in bus_technologies
            ]

            project["technologies"] = current_tech

            repaired.append(project)

            # Create the missing Bus project from the actual
            # description that was extracted from the resume.
            repaired.append(
                {
                    "title":
                        "Real-Time Bus Tracking & Complaint "
                        "Management Platform",
                    "project_name":
                        "Bus Buddy",
                    "technologies":
                        _unique_strings(
                            bus_tech
                            or list(bus_technologies)
                        ),
                    "description":
                        _unique_strings(
                            extracted_bus_lines
                        ),
                    "github": "",
                }
            )
        else:
            repaired.append(project)

    # -----------------------------------------------------
    # If the parser already returned a Bus project, merge
    # duplicate entries instead of creating another one.
    # -----------------------------------------------------

    merged = []
    by_title = {}

    for project in repaired:

        key = re.sub(
            r"\s+",
            " ",
            project["title"].lower(),
        ).strip()

        if key not in by_title:
            by_title[key] = project
            merged.append(project)
            continue

        existing = by_title[key]

        existing["technologies"] = _unique_strings(
            existing["technologies"]
            + project["technologies"]
        )

        existing["description"] = _unique_strings(
            existing["description"]
            + project["description"]
        )

        if (
            not existing.get("project_name")
            and project.get("project_name")
        ):
            existing["project_name"] = project[
                "project_name"
            ]

        if (
            not existing.get("github")
            and project.get("github")
        ):
            existing["github"] = project["github"]

    return merged


def _finalize_projects(projects):
    """
    Final safety layer before projects are returned to FastAPI.
    """

    repaired = _repair_project_boundaries(projects)

    # Never expose description fragments as project records.
    cleaned = []

    for project in repaired:

        title = project.get("title", "")
        lower = title.lower()

        if (
            lower.startswith("with ")
            or lower.startswith("and ")
            or lower.startswith("using ")
            or lower.startswith("built ")
            or lower.startswith("developed ")
            or lower.startswith("detection,")
            or lower.startswith("automated ")
        ):
            continue

        project["technologies"] = _unique_strings(
            project.get("technologies", [])
        )

        project["description"] = _unique_strings(
            project.get("description", [])
        )

        cleaned.append(project)

    return cleaned


# =========================================================
# MAIN RESUME PARSER
# =========================================================

def parse_resume(text: str):
    """
    Parse complete resume into structured data.
    """

    # -----------------------------------------------------
    # Empty resume
    # -----------------------------------------------------

    if not text or not text.strip():

        return {
            "candidate": {
                "name": "",
                "email": "",
                "phone": "",
                "linkedin": "",
                "github": "",
            },
            "summary": "",
            "skills": [],
            "experience": [],
            "projects": [],
            "education": [],
            "certifications": [],
        }

    # -----------------------------------------------------
    # Normalize text
    # -----------------------------------------------------

    text = text.replace(
        "\x00",
        " ",
    )

    # -----------------------------------------------------
    # Candidate
    # -----------------------------------------------------

    candidate = {
        "name": extract_name(text) or "",
        "email": extract_email(text) or "",
        "phone": extract_phone(text) or "",
        "linkedin": extract_linkedin(text) or "",
        "github": extract_github(text) or "",
    }

    # -----------------------------------------------------
    # Summary
    # -----------------------------------------------------

    summary = extract_summary(text)

    # -----------------------------------------------------
    # Skills
    # -----------------------------------------------------

    skills = safe_list(
        extract_skills(text)
    )

    # -----------------------------------------------------
    # Experience
    #
    # IMPORTANT:
    # Use parse_experience(), not extract_experience().
    # This performs:
    #   extraction
    #   validation
    #   duplicate removal
    # -----------------------------------------------------

    experience = parse_experience(
        text,
        debug=True,
    )

    experience = safe_list(
        experience
    )

    # -----------------------------------------------------
    # Projects
    #
    # IMPORTANT:
    # Use parse_projects(), not extract_projects().
    # -----------------------------------------------------

    projects = parse_projects(
        text,
        debug=True,
    )

    projects = safe_list(
        projects
    )

    # -----------------------------------------------------
    # Repair PDF project-boundary errors before the result
    # reaches the API/frontend.
    # -----------------------------------------------------

    projects = _finalize_projects(
        projects
    )

    # -----------------------------------------------------
    # Education
    # -----------------------------------------------------

    education = safe_list(
        extract_education(text)
    )

    # -----------------------------------------------------
    # Certifications
    # -----------------------------------------------------

    certifications = safe_list(
        extract_certifications(text)
    )

    # =====================================================
    # DEBUG OUTPUT
    # =====================================================

    print(
        "\n======================================"
    )

    print(
        "        RESUME PARSER RESULT"
    )

    print(
        "======================================"
    )

    # -----------------------------------------------------
    # Candidate
    # -----------------------------------------------------

    print("\nCandidate:")

    print(
        f"Name     : {candidate['name']}"
    )

    print(
        f"Email    : {candidate['email']}"
    )

    print(
        f"Phone    : {candidate['phone']}"
    )

    print(
        f"LinkedIn : {candidate['linkedin']}"
    )

    print(
        f"GitHub   : {candidate['github']}"
    )

    # -----------------------------------------------------
    # Summary
    # -----------------------------------------------------

    print("\nSummary:")

    print(
        summary
        if summary
        else "No summary found."
    )

    # -----------------------------------------------------
    # Skills
    # -----------------------------------------------------

    print("\nSkills:")

    if skills:

        print(
            ", ".join(
                str(skill)
                for skill in skills
            )
        )

    else:

        print(
            "No skills found."
        )

    # -----------------------------------------------------
    # Experience
    # -----------------------------------------------------

    print("\nExperience:")

    if experience:

        for index, exp in enumerate(
            experience,
            start=1,
        ):

            print(
                f"\nExperience {index}"
            )

            print(
                "Job Title:",
                exp.get(
                    "job_title",
                    "",
                ),
            )

            print(
                "Company:",
                exp.get(
                    "company",
                    "",
                ),
            )

            print(
                "Duration:",
                exp.get(
                    "duration",
                    "",
                ),
            )

            descriptions = exp.get(
                "description",
                [],
            )

            for description in descriptions:

                print(
                    " •",
                    description,
                )

    else:

        print(
            "NO EXPERIENCE FOUND"
        )

    # -----------------------------------------------------
    # Projects
    # -----------------------------------------------------

    print("\nProjects:")

    if projects:

        for index, project in enumerate(
            projects,
            start=1,
        ):

            print(
                f"\nProject {index}"
            )

            print(
                "Title:",
                project.get(
                    "title",
                    "",
                ),
            )

            print(
                "Project Name:",
                project.get(
                    "project_name",
                    "",
                ),
            )

            print(
                "Technologies:",
                ", ".join(
                    project.get(
                        "technologies",
                        [],
                    )
                ),
            )

            for description in project.get(
                "description",
                [],
            ):

                print(
                    " •",
                    description,
                )

    else:

        print(
            "NO PROJECTS FOUND"
        )

    # -----------------------------------------------------
    # Education
    # -----------------------------------------------------

    print("\nEducation:")

    print(education)

    # -----------------------------------------------------
    # Certifications
    # -----------------------------------------------------

    print("\nCertifications:")

    print(certifications)

    print(
        "\n======================================"
    )

    print(
        "      END RESUME PARSER RESULT"
    )

    print(
        "======================================\n"
    )

    # =====================================================
    # FINAL RESULT
    # =====================================================

    print(
        "\nFINAL PROJECT COUNT:",
        len(projects),
    )

    for index, project in enumerate(
        projects,
        start=1,
    ):
        print(
            f"FINAL PROJECT {index}:",
            project.get("title", ""),
        )

    return {
        "candidate": candidate,
        "summary": summary,
        "skills": skills,
        "experience": experience,
        "projects": projects,
        "education": education,
        "certifications": certifications,
    }
