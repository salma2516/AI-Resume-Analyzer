from typing import List


def generate_resume_feedback(
    ats_score: float,
    resume_score: float,
    job_match: float,
    missing_skills: List[str],
):
    """
    Generate personalized resume feedback.
    """

    feedback = []

    # ----------------------------------------
    # ATS Feedback
    # ----------------------------------------

    if ats_score >= 90:
        feedback.append(
            "Your resume is ATS-friendly."
        )

    elif ats_score >= 75:
        feedback.append(
            "Your resume has good ATS compatibility. Minor formatting improvements are recommended."
        )

    else:
        feedback.append(
            "Improve ATS compatibility by using standard section headings and avoiding complex formatting."
        )

    # ----------------------------------------
    # Resume Feedback
    # ----------------------------------------

    if resume_score >= 90:
        feedback.append(
            "Your resume has a strong overall structure."
        )

    elif resume_score >= 75:
        feedback.append(
            "Strengthen your resume by adding measurable achievements and project outcomes."
        )

    else:
        feedback.append(
            "Your resume requires improvements in structure, content, and project descriptions."
        )

    # ----------------------------------------
    # Job Match Feedback
    # ----------------------------------------

    if job_match >= 85:
        feedback.append(
            "Your resume aligns very well with the target job."
        )

    elif job_match >= 60:
        feedback.append(
            "Tailor your resume more closely to the job description by including relevant skills and keywords."
        )

    else:
        feedback.append(
            "Your resume requires additional job-specific skills and stronger alignment with the job description."
        )

    # ----------------------------------------
    # Missing Skills
    # ----------------------------------------

    if missing_skills:

        feedback.append(
            "Consider learning or highlighting these skills: "
            + ", ".join(sorted(set(missing_skills)))
        )

    # ----------------------------------------
    # General Suggestions
    # ----------------------------------------

    suggestions = [
        "Quantify achievements using numbers wherever possible.",
        "Keep your GitHub and LinkedIn profiles updated.",
        "Include deployment links for your major projects.",
        "Use strong action verbs in your experience section.",
        "Customize your resume for each job application.",
        "Highlight technologies that directly match the job description.",
        "Keep your resume concise and ATS-friendly.",
    ]

    feedback.extend(suggestions)

    # ----------------------------------------
    # Remove Duplicate Feedback
    # ----------------------------------------

    feedback = list(dict.fromkeys(feedback))

    # ----------------------------------------
    # Return
    # ----------------------------------------

    return {
        "feedback": feedback
    }