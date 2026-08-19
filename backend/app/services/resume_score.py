import re


def calculate_resume_score(data):
    """
    Calculate overall resume score (0-100).
    """

    score = 0
    feedback = []

    candidate = data.get("candidate", {})
    skills = data.get("skills", [])
    education = data.get("education", [])
    experience = data.get("experience", [])
    projects = data.get("projects", [])
    certifications = data.get("certifications", [])

    # ---------------------------------------------------
    # Personal Details (20)
    # ---------------------------------------------------

    if candidate.get("name"):
        score += 5
    else:
        feedback.append("Add your full name.")

    if candidate.get("email"):
        score += 4
    else:
        feedback.append("Add your email address.")

    if candidate.get("phone"):
        score += 3
    else:
        feedback.append("Add your phone number.")

    if candidate.get("linkedin"):
        score += 4
    else:
        feedback.append("Add your LinkedIn profile.")

    if candidate.get("github"):
        score += 4
    else:
        feedback.append("Add your GitHub profile.")

    # ---------------------------------------------------
    # Skills (20)
    # ---------------------------------------------------

    skill_count = len(skills)

    if skill_count >= 20:
        score += 20
    elif skill_count >= 15:
        score += 18
    elif skill_count >= 10:
        score += 15
    elif skill_count >= 5:
        score += 10
    else:
        feedback.append("Add more technical skills.")

    # ---------------------------------------------------
    # Experience (20)
    # ---------------------------------------------------

    experience_count = len(experience)

    if experience_count >= 5:
        score += 20
    elif experience_count >= 3:
        score += 18
    elif experience_count >= 2:
        score += 15
    elif experience_count >= 1:
        score += 10
    else:
        feedback.append("Add internship or work experience.")

    # ---------------------------------------------------
    # Education (10)
    # ---------------------------------------------------

    if education:
        score += 10
    else:
        feedback.append("Education section is missing.")

    # ---------------------------------------------------
    # Projects (20)
    # ---------------------------------------------------

    project_count = len(projects)

    if project_count >= 5:
        score += 20
    elif project_count >= 4:
        score += 18
    elif project_count >= 3:
        score += 15
    elif project_count >= 2:
        score += 10
    else:
        feedback.append("Include more real-world projects.")

    # ---------------------------------------------------
    # Certifications (10)
    # ---------------------------------------------------

    cert_count = len(certifications)

    if cert_count >= 5:
        score += 10
    elif cert_count >= 3:
        score += 8
    elif cert_count >= 1:
        score += 5
    else:
        feedback.append("Add relevant certifications.")

    # ---------------------------------------------------
    # Resume Quality Bonus (20)
    # ---------------------------------------------------

    bonus = 0

    resume_text = " ".join(map(str, skills)).lower()

    keywords = [
        "python",
        "sql",
        "git",
        "github",
        "rest",
        "flask",
        "django",
        "react",
        "tensorflow",
        "scikit",
        "machine learning",
        "docker",
        "aws",
        "azure",
    ]

    matched = sum(
        1
        for keyword in keywords
        if keyword in resume_text
    )

    if matched >= 12:
        bonus = 20
    elif matched >= 10:
        bonus = 18
    elif matched >= 8:
        bonus = 15
    elif matched >= 6:
        bonus = 10
    elif matched >= 4:
        bonus = 5

    score += bonus

    # ---------------------------------------------------
    # Limit Score
    # ---------------------------------------------------

    score = min(score, 100)

    # ---------------------------------------------------
    # Grade
    # ---------------------------------------------------

    if score >= 90:
        grade = "A+"
    elif score >= 80:
        grade = "A"
    elif score >= 70:
        grade = "B"
    elif score >= 60:
        grade = "C"
    else:
        grade = "D"

    # ---------------------------------------------------
    # Positive Feedback
    # ---------------------------------------------------

    if score >= 90:
        feedback.insert(
            0,
            "Excellent resume with strong ATS compatibility."
        )

    elif score >= 80:
        feedback.insert(
            0,
            "Very good resume with minor improvements recommended."
        )

    else:
        feedback.insert(
            0,
            "Improve the highlighted sections to strengthen your resume."
        )

    return {
        "score": score,
        "grade": grade,
        "feedback": list(dict.fromkeys(feedback)),
    }