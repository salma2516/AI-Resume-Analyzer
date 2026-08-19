def generate_ai_suggestions(
    skills,
    experience,
    projects,
    education,
    certifications,
    job_match,
):
    """
    Generate AI suggestions based on resume analysis.
    """

    strengths = []
    improvements = []
    recommendations = []

    # -------------------------
    # Skills
    # -------------------------

    if len(skills) >= 15:
        strengths.append(
            "Excellent technical skill set."
        )
    elif len(skills) >= 8:
        strengths.append(
            "Good technical skills."
        )
    else:
        improvements.append(
            "Add more technical skills."
        )

    # -------------------------
    # Experience
    # -------------------------

    if len(experience) >= 8:
        strengths.append(
            "Strong internship experience."
        )
    elif experience:
        strengths.append(
            "Relevant internship experience."
        )
    else:
        improvements.append(
            "Add internship or work experience."
        )

    # -------------------------
    # Projects
    # -------------------------

    if len(projects) >= 8:
        strengths.append(
            "Excellent project portfolio."
        )
    else:
        improvements.append(
            "Include more real-world projects."
        )

    # -------------------------
    # Education
    # -------------------------

    if education:
        strengths.append(
            "Education section is complete."
        )
    else:
        improvements.append(
            "Education section is missing."
        )

    # -------------------------
    # Certifications
    # -------------------------

    if certifications:
        strengths.append(
            "Professional certifications strengthen your profile."
        )

    # -------------------------
    # Missing Skills
    # -------------------------

    missing = job_match.get("missing_skills", [])

    if missing:
        improvements.append(
            "Missing important job skills."
        )

        recommendations.append(
            "Learn: " + ", ".join(missing)
        )

    # -------------------------
    # General Recommendations
    # -------------------------

    recommendations.extend([
        "Quantify achievements using numbers.",
        "Keep GitHub repositories updated.",
        "Tailor your resume for every job application.",
        "Add more measurable project outcomes.",
        "Maintain a one-page ATS-friendly resume."
    ])

    return {
        "strengths": strengths,
        "improvements": improvements,
        "recommendations": recommendations,
    }