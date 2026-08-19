import re

STANDARD_HEADINGS = [
    "summary",
    "objective",
    "education",
    "experience",
    "skills",
    "projects",
    "certifications"
]


def calculate_ats_score(text: str):

    score = 100
    feedback = []

    lower = text.lower()

    # Resume length
    if len(text) < 1500:
        score -= 10
        feedback.append("Resume is too short.")

    # Email
    if not re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text):
        score -= 10
        feedback.append("Email address missing.")

    # Phone
    if not re.search(r"\+?\d[\d\s-]{8,}\d", text):
        score -= 10
        feedback.append("Phone number missing.")

    # Section headings
    for heading in STANDARD_HEADINGS:
        if heading not in lower:
            score -= 3

    # Action verbs
    action_words = [
        "developed",
        "designed",
        "implemented",
        "created",
        "built",
        "optimized",
        "improved",
        "managed",
        "engineered",
        "deployed"
    ]

    if not any(word in lower for word in action_words):
        score -= 8
        feedback.append("Use stronger action verbs.")

    score = max(score, 0)

    if score >= 90:
        feedback.append("Excellent ATS compatibility.")
    elif score >= 75:
        feedback.append("Good ATS compatibility. Minor improvements recommended.")
    else:
        feedback.append("Resume needs ATS improvements.")

    return {
        "ats_score": score,
        "feedback": feedback
    }