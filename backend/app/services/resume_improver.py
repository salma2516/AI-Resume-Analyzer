from typing import List, Dict, Union
import re


# ---------------------------------------------------------
# Utility Function
# ---------------------------------------------------------

def calculate_section_score(
    items: List,
    minimum: int = 1,
    maximum: int = 10,
) -> int:
    """
    Calculate score for a resume section.
    """

    if not items:
        return 0

    return min(
        maximum,
        max(
            minimum,
            len(items) * 2,
        ),
    )


# ---------------------------------------------------------
# Summary
# ---------------------------------------------------------

def improve_summary(summary: str) -> Dict:
    """
    Analyze professional summary.
    """

    if not summary:
        return {
            "score": 0,
            "feedback": [
                "Professional summary is missing."
            ],
        }

    feedback = []

    score = 10

    if len(summary.split()) < 40:

        feedback.append(
            "Expand your professional summary with more achievements."
        )

        score -= 2

    if (
        "%" not in summary
        and not re.search(r"\d", summary)
    ):

        feedback.append(
            "Include measurable achievements wherever possible."
        )

        score -= 1

    if "python" not in summary.lower():

        feedback.append(
            "Mention your primary programming language."
        )

        score -= 1

    return {
        "score": max(score, 0),
        "feedback": feedback,
    }


# ---------------------------------------------------------
# Skills
# ---------------------------------------------------------

def improve_skills(
    skills: List[str],
    job_match: Dict,
) -> Dict:
    """
    Analyze technical skills.
    """

    feedback = []

    if not skills:

        return {
            "score": 0,
            "feedback": [
                "Technical skills section is missing."
            ],
        }

    count = len(skills)

    if count >= 20:
        score = 10

    elif count >= 15:
        score = 9

    elif count >= 10:
        score = 8

    elif count >= 7:
        score = 7

    elif count >= 5:
        score = 6

    else:
        score = 4

    missing = job_match.get(
        "missing_skills",
        [],
    )

    if missing:

        feedback.append(
            f"Consider learning or highlighting: {', '.join(missing)}."
        )

    return {
        "score": score,
        "feedback": feedback,
    }

# ---------------------------------------------------------
# Experience
# ---------------------------------------------------------

def improve_experience(
    experience: List[Union[str, Dict]]
) -> Dict:
    """
    Analyze work experience.
    Supports both string and dictionary formats.
    """

    feedback = []

    if not experience:
        return {
            "score": 0,
            "feedback": [
                "No work experience found."
            ],
        }

    score = 10

    if len(experience) < 2:
        feedback.append(
            "Add more internship or work experience."
        )
        score -= 2

    parts = []

    internship_count = 0

    if isinstance(experience[0], dict):

        for exp in experience:

            job_title = str(
                exp.get("job_title", "")
            )

            company = str(
                exp.get("company", "")
            )

            duration = str(
                exp.get("duration", "")
            )

            parts.append(job_title)
            parts.append(company)
            parts.append(duration)

            if re.search(
                r"(intern|developer|engineer|analyst)",
                job_title,
                re.IGNORECASE,
            ):
                internship_count += 1

            description = exp.get(
                "description",
                [],
            )

            if isinstance(description, list):
                parts.extend(description)
            else:
                parts.append(str(description))

    else:

        parts.extend(
            map(str, experience)
        )

        internship_count = len(experience)

    text = " ".join(parts)

    lower = text.lower()

    # ----------------------------------
    # Achievement Check
    # ----------------------------------

    if not re.search(r"\d", text):

        feedback.append(
            "Include measurable achievements using numbers or percentages."
        )

        score -= 1

    # ----------------------------------
    # Git
    # ----------------------------------

    if "git" not in lower:

        feedback.append(
            "Mention collaboration tools like Git or GitHub."
        )

    # ----------------------------------
    # REST APIs
    # ----------------------------------

    if (
        "rest" not in lower
        and "api" not in lower
    ):

        feedback.append(
            "Mention REST API development if applicable."
        )

    # ----------------------------------
    # SQL
    # ----------------------------------

    if (
        "sql" not in lower
        and "mysql" not in lower
        and "postgresql" not in lower
    ):

        feedback.append(
            "Highlight database experience."
        )

    # ----------------------------------
    # Deployment
    # ----------------------------------

    deployment_keywords = [
        "deploy",
        "deployment",
        "docker",
        "aws",
        "azure",
        "render",
        "vercel",
        "netlify",
    ]

    if not any(
        keyword in lower
        for keyword in deployment_keywords
    ):

        feedback.append(
            "Mention deployment or cloud experience if applicable."
        )

    # ----------------------------------
    # Experience Strength
    # ----------------------------------

    if internship_count >= 4:
        score += 1

    score = min(score, 10)

    return {
        "score": max(score, 0),
        "feedback": feedback,
    }

# ---------------------------------------------------------
# Projects
# ---------------------------------------------------------

def improve_projects(
    projects: List[Union[str, Dict]]
) -> Dict:
    """
    Analyze projects section.
    Supports both string and dictionary formats.
    """

    feedback = []

    if not projects:
        return {
            "score": 0,
            "feedback": [
                "No projects found."
            ],
        }

    score = 10

    if len(projects) < 2:
        feedback.append(
            "Include more projects to showcase your practical experience."
        )
        score -= 2

    parts = []

    project_count = len(projects)

    if isinstance(projects[0], dict):

        for project in projects:

            # -----------------------------
            # Title
            # -----------------------------

            title = str(
                project.get("title", "")
            )

            parts.append(title)

            # -----------------------------
            # Technologies
            # -----------------------------

            technologies = project.get(
                "technologies",
                [],
            )

            if isinstance(technologies, list):
                parts.extend(
                    map(str, technologies)
                )
            else:
                parts.append(
                    str(technologies)
                )

            # -----------------------------
            # Description
            # -----------------------------

            description = project.get(
                "description",
                [],
            )

            if isinstance(description, list):
                parts.extend(
                    map(str, description)
                )
            else:
                parts.append(
                    str(description)
                )

    else:

        parts.extend(
            map(str, projects)
        )

    text = " ".join(parts)

    lower = text.lower()

    # ---------------------------------------
    # GitHub
    # ---------------------------------------

    if (
        "github" not in lower
        and "git" not in lower
    ):
        feedback.append(
            "Include GitHub repository links for your projects."
        )

    # ---------------------------------------
    # Deployment
    # ---------------------------------------

    deployment_keywords = [

        "deploy",
        "deployment",
        "docker",
        "render",
        "vercel",
        "netlify",
        "azure",
        "aws",
        "cloud",
        "github pages",

    ]

    if not any(
        keyword in lower
        for keyword in deployment_keywords
    ):

        feedback.append(
            "Mention deployment details or live project links."
        )

    # ---------------------------------------
    # Quantification
    # ---------------------------------------

    if not re.search(r"\d", text):

        feedback.append(
            "Quantify project impact using numbers wherever possible."
        )

    # ---------------------------------------
    # Project Diversity
    # ---------------------------------------

    domains = [

        "ai",
        "machine learning",
        "web",
        "iot",
        "nlp",
        "react",
        "flask",
        "django",
        "android",
        "cloud",

    ]

    matched_domains = sum(
        1
        for domain in domains
        if domain in lower
    )

    if matched_domains >= 4:
        score += 1

    score = min(score, 10)

    return {

        "score": max(score, 0),

        "feedback": feedback,

    }

# ---------------------------------------------------------
# Education
# ---------------------------------------------------------

def improve_education(
    education: List[Union[str, Dict]]
) -> Dict:
    """
    Analyze education section.
    Supports both string and dictionary formats.
    """

    feedback = []

    if not education:
        return {
            "score": 0,
            "feedback": [
                "Education section is missing."
            ],
        }

    score = 10

    parts = []

    if isinstance(education[0], dict):

        for edu in education:

            degree = str(
                edu.get("degree", "")
            )

            college = str(
                edu.get("college", "")
            )

            cgpa = str(
                edu.get("cgpa", "")
            )

            parts.append(degree)
            parts.append(college)
            parts.append(cgpa)

    else:

        parts.extend(
            map(str, education)
        )

    text = " ".join(parts)

    lower = text.lower()

    # -----------------------------------------
    # Degree
    # -----------------------------------------

    degree_keywords = [

        "b.tech",
        "b.e",
        "bachelor",
        "master",
        "m.tech",
        "phd",
        "computer science",
        "artificial intelligence",
        "information technology",

    ]

    if not any(
        keyword in lower
        for keyword in degree_keywords
    ):

        feedback.append(
            "Mention your degree and specialization clearly."
        )

    # -----------------------------------------
    # CGPA / Percentage
    # -----------------------------------------

    if not re.search(
        r"(cgpa|\d+\.\d+|\d+%)",
        lower,
    ):

        feedback.append(
            "Mention your CGPA or academic percentage."
        )

    # -----------------------------------------
    # College Name
    # -----------------------------------------

    if len(text.split()) < 5:

        feedback.append(
            "Mention your college or university name."
        )

    return {

        "score": score,

        "feedback": feedback,

    }


# ---------------------------------------------------------
# Certifications
# ---------------------------------------------------------

def improve_certifications(
    certifications: List[str]
) -> Dict:
    """
    Analyze certifications section.
    """

    feedback = []

    if not certifications:

        return {

            "score": 0,

            "feedback": [

                "No certifications found."

            ],

        }

    count = len(certifications)

    if count >= 6:

        score = 10

    elif count >= 4:

        score = 9

    elif count >= 3:

        score = 8

    elif count >= 2:

        score = 7

    else:

        score = 5

    text = " ".join(certifications).lower()

    preferred = [

        "aws",
        "azure",
        "google",
        "ibm",
        "oracle",
        "tensorflow",
        "python",
        "machine learning",
        "data science",
        "docker",

    ]

    matched = sum(

        1

        for cert in preferred

        if cert in text

    )

    if matched < 2:

        feedback.append(

            "Add more industry-recognized certifications."

        )

    if count < 3:

        feedback.append(

            "Include additional certifications related to your career goals."

        )

    return {

        "score": score,

        "feedback": feedback,

    }

# ---------------------------------------------------------
# Generate Resume Improvements
# ---------------------------------------------------------

def generate_resume_improvements(
    summary: str,
    skills: List[str],
    experience: List[Union[str, Dict]],
    projects: List[Union[str, Dict]],
    education: List[Union[str, Dict]],
    certifications: List[str],
    job_match: Dict,
):
    """
    Generate complete resume analysis and improvement suggestions.
    """

    # -------------------------------------
    # Analyze Individual Sections
    # -------------------------------------

    summary_result = improve_summary(summary)

    skills_result = improve_skills(
        skills,
        job_match,
    )

    experience_result = improve_experience(
        experience,
    )

    project_result = improve_projects(
        projects,
    )

    education_result = improve_education(
        education,
    )

    certification_result = improve_certifications(
        certifications,
    )

    # -------------------------------------
    # Calculate Overall Score
    # -------------------------------------

    section_scores = [

        summary_result["score"],
        skills_result["score"],
        experience_result["score"],
        project_result["score"],
        education_result["score"],
        certification_result["score"],

    ]

    overall_score = round(

        sum(section_scores)

        / len(section_scores)

        * 10

    )

    overall_score = max(
        0,
        min(100, overall_score),
    )

    # -------------------------------------
    # Grade
    # -------------------------------------

    if overall_score >= 90:

        grade = "A+"

    elif overall_score >= 80:

        grade = "A"

    elif overall_score >= 70:

        grade = "B"

    elif overall_score >= 60:

        grade = "C"

    else:

        grade = "D"

    # -------------------------------------
    # Overall Feedback
    # -------------------------------------

    feedback = []

    feedback.extend(summary_result["feedback"])

    feedback.extend(skills_result["feedback"])

    feedback.extend(experience_result["feedback"])

    feedback.extend(project_result["feedback"])

    feedback.extend(education_result["feedback"])

    feedback.extend(certification_result["feedback"])

    # -------------------------------------
    # Positive Suggestions
    # -------------------------------------

    if overall_score >= 90:

        feedback.insert(
            0,
            "Your resume is ATS-friendly."
        )

        feedback.insert(
            1,
            "Your resume has a strong overall structure."
        )

    elif overall_score >= 80:

        feedback.insert(
            0,
            "Your resume is well-structured with minor improvements recommended."
        )

    else:

        feedback.insert(
            0,
            "Strengthen your resume by improving the highlighted sections."
        )

    # -------------------------------------
    # Job Match Suggestions
    # -------------------------------------

    missing_skills = job_match.get(
        "missing_skills",
        [],
    )

    if missing_skills:

        feedback.append(

            "Tailor your resume more closely to the job description."

        )

        feedback.append(

            "Consider learning or highlighting these skills: "
            + ", ".join(missing_skills)

        )

    # -------------------------------------
    # General Suggestions
    # -------------------------------------

    general_feedback = [

        "Quantify achievements using numbers wherever possible.",

        "Keep your GitHub and LinkedIn profiles updated.",

        "Include deployment links for your major projects.",

    ]

    feedback.extend(general_feedback)

    # -------------------------------------
    # Remove Duplicate Feedback
    # -------------------------------------

    feedback = list(dict.fromkeys(feedback))

    # -------------------------------------
    # Return Result
    # -------------------------------------

    return {

        "summary": summary_result,

        "skills": skills_result,

        "experience": experience_result,

        "projects": project_result,

        "education": education_result,

        "certifications": certification_result,

        "overall": {

            "score": overall_score,

            "grade": grade,

            "feedback": feedback,

        },

    }