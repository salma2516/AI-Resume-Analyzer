import re
from typing import Dict, List, Set

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.services.skills import SKILLS


# =========================================================
# SKILL ALIASES
# =========================================================

ALIASES = {
    "react.js": "react",
    "reactjs": "react",

    "node.js": "nodejs",
    "node js": "nodejs",

    "rest api": "rest api",
    "rest apis": "rest api",
    "restful api": "rest api",
    "restful apis": "rest api",

    "html5": "html",
    "css3": "css",

    "amazon web services": "aws",
    "google cloud platform": "gcp",

    "scikit learn": "scikit-learn",
    "scikit-learn": "scikit-learn",

    "machine learning": "machine learning",
    "ml": "machine learning",

    "deep learning": "deep learning",

    "artificial intelligence": "artificial intelligence",
    "ai": "artificial intelligence",

    "natural language processing": "natural language processing",
    "nlp": "natural language processing",
}


# =========================================================
# NORMALIZE SKILL
# =========================================================

def normalize_skill(skill: str) -> str:
    """
    Convert skill names into a standard format.
    """

    if not skill:
        return ""

    skill = skill.strip().lower()

    return ALIASES.get(skill, skill)


# =========================================================
# EXTRACT SKILLS
# =========================================================

def extract_job_skills(text: str) -> List[str]:
    """
    Extract normalized skills from resume or job description.
    """

    if not text:
        return []

    text = text.lower()

    found: Set[str] = set()

    for skill in SKILLS:

        if not skill:
            continue

        skill_lower = skill.lower().strip()

        # Handle skills containing special characters
        pattern = r"(?<!\w)" + re.escape(skill_lower) + r"(?!\w)"

        if re.search(pattern, text):

            normalized = normalize_skill(skill)

            if normalized:
                found.add(normalized)

    return sorted(found)


# =========================================================
# SEMANTIC-LIKE TEXT SIMILARITY
# =========================================================

def calculate_text_similarity(
    resume_text: str,
    job_description: str,
) -> float:
    """
    Calculate text similarity using TF-IDF + cosine similarity.

    This is intentionally lightweight so that the API
    can run on low-memory cloud instances.
    """

    if not resume_text or not job_description:
        return 0.0

    try:

        vectorizer = TfidfVectorizer(
            stop_words="english",
            max_features=5000,
            ngram_range=(1, 2),
        )

        vectors = vectorizer.fit_transform(
            [
                resume_text,
                job_description,
            ]
        )

        similarity = cosine_similarity(
            vectors[0:1],
            vectors[1:2],
        )[0][0]

        score = float(similarity) * 100

        return round(
            max(0.0, min(100.0, score)),
            2,
        )

    except Exception as error:

        print(
            "TF-IDF similarity error:",
            type(error).__name__,
            str(error),
        )

        return 0.0


# =========================================================
# JOB MATCH
# =========================================================

def calculate_job_match(
    resume_text: str,
    job_description: str,
    debug: bool = False,
) -> Dict:
    """
    Calculate resume-to-job match score.

    Final score:

        60% text similarity
        40% skill matching
    """

    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # TEXT SIMILARITY
    # -----------------------------------------------------

    semantic_score = calculate_text_similarity(
        resume_text,
        job_description,
    )

    # -----------------------------------------------------
    # EXTRACT RESUME SKILLS
    # -----------------------------------------------------

    resume_skills = set(
        extract_job_skills(resume_text)
    )

    # -----------------------------------------------------
    # EXTRACT JOB SKILLS
    # -----------------------------------------------------

    job_skills = set(
        extract_job_skills(job_description)
    )

    # -----------------------------------------------------
    # MATCHED SKILLS
    # -----------------------------------------------------

    matched_skills = sorted(
        resume_skills & job_skills
    )

    # -----------------------------------------------------
    # MISSING SKILLS
    # -----------------------------------------------------

    missing_skills = sorted(
        job_skills - resume_skills
    )

    # -----------------------------------------------------
    # EXTRA SKILLS
    # -----------------------------------------------------

    extra_skills = sorted(
        resume_skills - job_skills
    )

    # -----------------------------------------------------
    # SKILL SCORE
    # -----------------------------------------------------

    if job_skills:

        skill_score = round(
            (
                len(matched_skills)
                / len(job_skills)
            )
            * 100,
            2,
        )

    else:

        skill_score = 100.0

    # -----------------------------------------------------
    # FINAL SCORE
    # -----------------------------------------------------

    final_score = round(
        (semantic_score * 0.60)
        + (skill_score * 0.40),
        2,
    )

    final_score = max(
        0.0,
        min(100.0, final_score),
    )

    # -----------------------------------------------------
    # DEBUG
    # -----------------------------------------------------

    if debug:

        print("\n")
        print("=" * 70)
        print("AI RESUME ANALYZER - JOB MATCH DEBUG")
        print("=" * 70)

        print(
            f"Resume characters : {len(resume_text)}"
        )

        print(
            f"JD characters     : {len(job_description)}"
        )

        print(
            f"Semantic score    : {semantic_score}"
        )

        print(
            f"Skill score       : {skill_score}"
        )

        print(
            f"Final score       : {final_score}"
        )

        print()

        print(
            f"Resume skills     : {len(resume_skills)}"
        )

        print(
            f"Job skills        : {len(job_skills)}"
        )

        print(
            f"Matched skills    : {len(matched_skills)}"
        )

        print(
            f"Missing skills    : {len(missing_skills)}"
        )

        print()

        print("MATCHED SKILLS")
        print("-" * 70)

        for skill in matched_skills:
            print(f"  + {skill}")

        print()

        print("MISSING SKILLS")
        print("-" * 70)

        for skill in missing_skills:
            print(f"  - {skill}")

        print()

        print("EXTRA RESUME SKILLS")
        print("-" * 70)

        for skill in extra_skills:
            print(f"  * {skill}")

        print("=" * 70)
        print()

    # -----------------------------------------------------
    # RETURN RESULT
    # -----------------------------------------------------

    return {
        "match_score": final_score,

        "semantic_score": semantic_score,

        "skill_score": skill_score,

        "matched_skills": matched_skills,

        "missing_skills": missing_skills,

        "extra_skills": extra_skills,

        "matched_skill_count": len(
            matched_skills
        ),

        "missing_skill_count": len(
            missing_skills
        ),

        "resume_skill_count": len(
            resume_skills
        ),

        "job_skill_count": len(
            job_skills
        ),
    }