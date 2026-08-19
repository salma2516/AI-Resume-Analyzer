import re
from sentence_transformers import SentenceTransformer, util
from app.services.skills import SKILLS

# ---------------------------------------------------------
# Load Sentence Transformer Model
# ---------------------------------------------------------

model = SentenceTransformer("all-MiniLM-L6-v2")

# ---------------------------------------------------------
# Normalize Skill Names
# ---------------------------------------------------------

ALIASES = {
    "react.js": "react",
    "node.js": "nodejs",
    "rest api": "rest api",
    "rest apis": "rest api",
    "restful api": "rest api",
    "html5": "html",
    "css3": "css",
    "amazon web services": "aws",
    "google cloud platform": "gcp",
    "scikit learn": "scikit-learn",
    "machine learning": "machine learning",
    "deep learning": "deep learning",
    "artificial intelligence": "artificial intelligence",
    "ai": "artificial intelligence",
    "ml": "machine learning",
    "nlp": "natural language processing",
}


def normalize_skill(skill: str) -> str:
    skill = skill.strip().lower()
    return ALIASES.get(skill, skill)


# ---------------------------------------------------------
# Extract Skills
# ---------------------------------------------------------

def extract_job_skills(text: str):
    """
    Extract normalized skills from text.
    """

    if not text:
        return []

    text = text.lower()

    found = set()

    for skill in SKILLS:

        pattern = r"\b" + re.escape(skill.lower()) + r"\b"

        if re.search(pattern, text):
            found.add(normalize_skill(skill))

    return sorted(found)


# ---------------------------------------------------------
# Calculate Job Match
# ---------------------------------------------------------

def calculate_job_match(
    resume_text: str,
    job_description: str,
    debug: bool = False,
):
    """
    Calculate semantic similarity and skill match.
    """

    if not resume_text or not job_description:

        return {
            "match_score": 0,
            "semantic_score": 0,
            "skill_score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "extra_skills": [],
            "matched_skill_count": 0,
            "missing_skill_count": 0,
            "resume_skill_count": 0,
            "job_skill_count": 0,
        }

    # -------------------------------------------------
    # Semantic Similarity
    # -------------------------------------------------

    resume_embedding = model.encode(
        resume_text,
        convert_to_tensor=True,
    )

    jd_embedding = model.encode(
        job_description,
        convert_to_tensor=True,
    )

    similarity = util.cos_sim(
        resume_embedding,
        jd_embedding,
    )

    semantic_score = round(
        max(0, min(100, float(similarity[0][0]) * 100)),
        2,
    )

    # -------------------------------------------------
    # Skills
    # -------------------------------------------------

    resume_skills = set(
        extract_job_skills(resume_text)
    )

    job_skills = set(
        extract_job_skills(job_description)
    )

    matched_skills = sorted(
        resume_skills & job_skills
    )

    missing_skills = sorted(
        job_skills - resume_skills
    )

    extra_skills = sorted(
        resume_skills - job_skills
    )

    # -------------------------------------------------
    # Skill Score
    # -------------------------------------------------

    if job_skills:

        skill_score = round(
            len(matched_skills)
            / len(job_skills)
            * 100,
            2,
        )

    else:

        skill_score = 100

    # -------------------------------------------------
    # Final Score
    # -------------------------------------------------

    final_score = round(
        (semantic_score * 0.60)
        + (skill_score * 0.40),
        2,
    )

    final_score = max(0, min(100, final_score))

    # -------------------------------------------------
    # Debug
    # -------------------------------------------------

    if debug:

        print("\n========== JOB MATCH ==========")

        print(f"Semantic Score : {semantic_score}")
        print(f"Skill Score    : {skill_score}")
        print(f"Final Score    : {final_score}")

        print("\nMatched Skills")
        print(matched_skills)

        print("\nMissing Skills")
        print(missing_skills)

        print("\nExtra Skills")
        print(extra_skills)

        print("===============================\n")

    # -------------------------------------------------
    # Return
    # -------------------------------------------------

    return {

        "match_score": final_score,

        "semantic_score": semantic_score,

        "skill_score": skill_score,

        "matched_skills": matched_skills,

        "missing_skills": missing_skills,

        "extra_skills": extra_skills,

        "matched_skill_count": len(matched_skills),

        "missing_skill_count": len(missing_skills),

        "resume_skill_count": len(resume_skills),

        "job_skill_count": len(job_skills),

    }