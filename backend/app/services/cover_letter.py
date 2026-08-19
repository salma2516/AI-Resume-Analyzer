import re


def extract_company_name(job_description: str) -> str:
    """
    Try to extract company name from the job description.
    """

    patterns = [
        r"Company\s*:\s*(.+)",
        r"Organization\s*:\s*(.+)",
        r"Employer\s*:\s*(.+)",
        r"at\s+([A-Z][A-Za-z0-9 &.,-]+)",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            job_description,
            re.IGNORECASE,
        )

        if match:
            return match.group(1).strip()

    return "your organization"


def extract_job_title(job_description: str) -> str:
    """
    Try to identify the job title.
    """

    titles = [
        "Python Developer",
        "Software Engineer",
        "Software Developer",
        "Full Stack Developer",
        "Backend Developer",
        "Frontend Developer",
        "Data Scientist",
        "Machine Learning Engineer",
        "AI Engineer",
        "Data Analyst",
        "Business Analyst",
        "Java Developer",
        "DevOps Engineer",
        "Cloud Engineer",
        "Cyber Security Analyst",
        "QA Engineer",
        "Android Developer",
        "iOS Developer",
        "UI UX Designer",
        "Project Manager",
    ]

    jd = job_description.lower()

    for title in titles:

        if title.lower() in jd:
            return title

    return "the advertised position"


def generate_cover_letter(
    candidate: dict,
    skills: list,
    experience: list,
    projects: list,
    education: list,
    job_description: str,
):
    """
    Generate a professional cover letter.
    """

    name = candidate.get("name", "Candidate")

    company = extract_company_name(job_description)

    job_title = extract_job_title(job_description)

    # -------------------------
    # Skills
    # -------------------------

    skill_text = ", ".join(skills[:8]) if skills else "relevant technical skills"

    # -------------------------
    # Project
    # -------------------------

    project_name = "AI Resume Analyzer"

    if projects:

        if isinstance(projects[0], dict):

            project_name = projects[0].get(
                "title",
                "AI Resume Analyzer"
            )

        else:

            project_name = (
                projects[0]
                .split("|")[0]
                .split("-")[0]
                .strip()
            )

    # -------------------------
    # Education
    # -------------------------

    education_text = "Computer Science"

    if education:

        if isinstance(education[0], dict):

            degree = education[0].get("degree", "")

            college = education[0].get("college", "")

            education_text = f"{degree} from {college}".strip()

        else:

            education_text = education[0]

    # -------------------------
    # Experience Count
    # -------------------------

    experience_count = 0

    if experience:

        if isinstance(experience[0], dict):

            experience_count = len(experience)

        else:

            experience_count = len(
                [
                    item
                    for item in experience
                    if (
                        "Intern" in item
                        or "Engineer" in item
                        or "Developer" in item
                        or "Analyst" in item
                    )
                ]
            )

    experience_count = max(1, experience_count)

    # -------------------------
    # Cover Letter
    # -------------------------

    cover_letter = f"""
Dear Hiring Manager,

I am writing to express my interest in the {job_title} position at {company}.

I recently completed my academic journey in {education_text} and have gained practical experience through {experience_count} internship(s). During these opportunities, I worked on real-world software development, machine learning, and web application projects that strengthened both my technical and problem-solving abilities.

My technical expertise includes {skill_text}. I have built scalable applications, developed REST APIs, worked with databases, and implemented machine learning solutions while following clean coding practices and collaborative development workflows.

One of my key projects, "{project_name}", allowed me to apply these technologies to solve real-world problems. Through this project, I gained hands-on experience in designing, developing, testing, and deploying practical software solutions.

I am particularly excited about this opportunity because it aligns well with my technical background, passion for continuous learning, and enthusiasm for developing high-quality software solutions.

I believe my academic background, internship experience, technical skills, and dedication to continuous improvement would enable me to contribute effectively to your team.

Thank you for considering my application. I would welcome the opportunity to discuss how my knowledge and skills can contribute to {company}. I look forward to hearing from you.

Sincerely,

{name}
"""

    return {
        "company": company,
        "job_title": job_title,
        "cover_letter": cover_letter.strip(),
    }