"""
Resume Strengths & Weaknesses Analyzer

This service produces deterministic, evidence-based resume insights.
It does not invent achievements or personal traits. Strengths come from
skills, experience, projects and certifications supplied by the parser.
Weaknesses describe resume/job-alignment gaps, not personal deficiencies.
"""

from __future__ import annotations

import re
from typing import Any, Iterable


def _text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _list(value: Any) -> list[Any]:
    if value is None:
        return []

    if isinstance(value, list):
        return value

    if isinstance(value, tuple):
        return list(value)

    if isinstance(value, str):
        return [
            item.strip()
            for item in re.split(r"[\n,;•|]+", value)
            if item.strip()
        ]

    return [value]


def _item_text(item: Any) -> str:
    if isinstance(item, str):
        return item.strip()

    if isinstance(item, dict):
        for key in (
            "name",
            "title",
            "skill",
            "text",
            "description",
            "reason",
            "role",
        ):
            value = _text(item.get(key))
            if value:
                return value

    return _text(item)


def _unique(items: Iterable[str]) -> list[str]:
    result = []
    seen = set()

    for item in items:
        item = _text(item)
        if not item:
            continue

        key = re.sub(r"\s+", " ", item).lower()

        if key in seen:
            continue

        seen.add(key)
        result.append(item)

    return result


def _skill_names(skills: Any) -> set[str]:
    names = set()

    for item in _list(skills):
        value = _item_text(item)

        if value:
            names.add(
                re.sub(r"\s+", " ", value).strip().lower()
            )

    return names


def _project_count(projects: Any) -> int:
    return len(
        [
            item
            for item in _list(projects)
            if _item_text(item)
        ]
    )


def _experience_count(experience: Any) -> int:
    return len(
        [
            item
            for item in _list(experience)
            if _item_text(item)
        ]
    )


def _certification_count(certifications: Any) -> int:
    return len(
        [
            item
            for item in _list(certifications)
            if _item_text(item)
        ]
    )


def _has_any(skills: set[str], names: Iterable[str]) -> bool:
    return any(
        name.lower() in skills
        for name in names
    )


def _job_match_score(job_match: Any) -> float:
    if not isinstance(job_match, dict):
        return 0.0

    for key in (
        "match_score",
        "score",
        "job_match_score",
    ):
        try:
            return float(job_match.get(key, 0) or 0)
        except (TypeError, ValueError):
            pass

    return 0.0


def _missing_job_skills(job_match: Any) -> list[str]:
    if not isinstance(job_match, dict):
        return []

    return _unique(
        _item_text(item)
        for item in _list(
            job_match.get("missing_skills", [])
        )
    )


def _ats_score(ats: Any) -> float:
    if not isinstance(ats, dict):
        return 0.0

    for key in (
        "score",
        "ats_score",
    ):
        try:
            return float(ats.get(key, 0) or 0)
        except (TypeError, ValueError):
            pass

    return 0.0


def _resume_score(resume_score: Any) -> float:
    if not isinstance(resume_score, dict):
        try:
            return float(resume_score or 0)
        except (TypeError, ValueError):
            return 0.0

    for key in (
        "score",
        "resume_score",
    ):
        try:
            return float(
                resume_score.get(key, 0) or 0
            )
        except (TypeError, ValueError):
            pass

    return 0.0


def _project_text(projects: Any) -> str:
    parts = []

    for project in _list(projects):
        if isinstance(project, dict):
            parts.extend(
                [
                    _item_text(project.get("title")),
                    _item_text(project.get("name")),
                    _item_text(project.get("description")),
                    _item_text(project.get("summary")),
                ]
            )
            parts.extend(
                _item_text(x)
                for x in _list(
                    project.get("technologies", [])
                )
            )
        else:
            parts.append(_item_text(project))

    return " ".join(
        part for part in parts if part
    ).lower()


def _experience_text(experience: Any) -> str:
    parts = []

    for item in _list(experience):
        if isinstance(item, dict):
            for key in (
                "role",
                "title",
                "position",
                "company",
                "description",
                "details",
                "summary",
            ):
                parts.append(
                    _item_text(item.get(key))
                )
        else:
            parts.append(_item_text(item))

    return " ".join(
        part for part in parts if part
    ).lower()


def analyze_strengths_weaknesses(
    skills=None,
    experience=None,
    projects=None,
    certifications=None,
    ats=None,
    resume_score=None,
    job_match=None,
):
    """
    Analyze the candidate profile from already extracted resume data.

    Returns:
        {
            "strengths": [...],
            "weaknesses": [...],
            "improvement_areas": [...],
            "summary": "...",
            "score": 0-100
        }
    """

    skills_set = _skill_names(skills)
    projects_list = _list(projects)
    experience_list = _list(experience)

    project_count = _project_count(projects)
    experience_count = _experience_count(experience)
    certification_count = _certification_count(certifications)

    project_text = _project_text(projects_list)
    experience_text = _experience_text(experience_list)

    missing_skills = _missing_job_skills(job_match)

    ats_value = _ats_score(ats)
    resume_value = _resume_score(resume_score)
    match_value = _job_match_score(job_match)

    strengths = []
    weaknesses = []
    improvement_areas = []

    # ---------------------------------------------------------
    # Technical strengths
    # ---------------------------------------------------------

    if "python" in skills_set:
        strengths.append(
            "Strong Python development foundation."
        )

    if _has_any(
        skills_set,
        (
            "machine learning",
            "deep learning",
            "tensorflow",
            "scikit-learn",
        ),
    ):
        strengths.append(
            "Hands-on Machine Learning and AI experience."
        )

    if _has_any(
        skills_set,
        (
            "flask",
            "django",
            "fastapi",
            "rest api",
            "rest apis",
            "restful api",
        ),
    ):
        strengths.append(
            "Backend and REST API development experience."
        )

    if _has_any(
        skills_set,
        (
            "react",
            "react.js",
            "javascript",
            "node.js",
            "express.js",
        ),
    ):
        strengths.append(
            "Full-stack web development exposure."
        )

    if _has_any(
        skills_set,
        (
            "pandas",
            "numpy",
            "power bi",
            "tableau",
            "data analytics",
        ),
    ):
        strengths.append(
            "Data analysis and data-processing skills."
        )

    if _has_any(
        skills_set,
        (
            "sql",
            "mysql",
            "postgresql",
            "sql server",
        ),
    ):
        strengths.append(
            "Practical SQL and database experience."
        )

    if _has_any(
        skills_set,
        (
            "git",
            "github",
        ),
    ):
        strengths.append(
            "Version-control and collaborative development experience."
        )

    # ---------------------------------------------------------
    # Evidence from experience/projects/certifications
    # ---------------------------------------------------------

    if experience_count > 0:
        strengths.append(
            "Practical experience is demonstrated through "
            f"{experience_count} resume-listed role(s)."
        )

    if project_count > 0:
        strengths.append(
            "Strong project portfolio with "
            f"{project_count} resume-listed project(s)."
        )

    if certification_count > 0:
        strengths.append(
            "Continuous learning is supported by "
            f"{certification_count} certification(s) or course credential(s)."
        )

    if "feature engineering" in experience_text:
        strengths.append(
            "Experience with feature engineering and model evaluation."
        )

    if (
        "hyperparameter" in experience_text
        or "hyperparameter tuning" in experience_text
    ):
        strengths.append(
            "Exposure to model optimization and hyperparameter tuning."
        )

    if "power bi" in experience_text:
        strengths.append(
            "Hands-on business-intelligence/dashboard experience."
        )

    if (
        "iot" in project_text
        or "arduino" in skills_set
        or "esp8266" in skills_set
    ):
        strengths.append(
            "Practical IoT and hardware-integrated application experience."
        )

    # ---------------------------------------------------------
    # Weaknesses = evidence-based resume/job gaps
    # ---------------------------------------------------------

    if missing_skills:
        weaknesses.append(
            "The current job description identifies missing skills: "
            + ", ".join(missing_skills[:8])
            + "."
        )

        improvement_areas.append(
            "Prioritize the missing job-relevant skills: "
            + ", ".join(missing_skills[:8])
            + "."
        )

    if not _has_any(
        skills_set,
        ("docker", "kubernetes"),
    ):
        weaknesses.append(
            "Containerization and orchestration are not clearly "
            "demonstrated in the extracted skills."
        )
        improvement_areas.append(
            "Add a Docker-based deployment project; learn Kubernetes "
            "after gaining Docker fundamentals."
        )

    if not _has_any(
        skills_set,
        ("aws", "azure", "gcp", "google cloud"),
    ):
        weaknesses.append(
            "Cloud-platform experience is not clearly demonstrated."
        )
        improvement_areas.append(
            "Add one deployable cloud project using AWS, Azure, or GCP."
        )

    # Check for measurable outcomes.
    combined_text = (
        project_text + " " + experience_text
    )

    has_measurement = bool(
        re.search(
            r"\b\d+(?:\.\d+)?\s*(?:%|percent|users?|projects?|"
            r"ms|seconds?|minutes?|hours?|days?)\b",
            combined_text,
            flags=re.IGNORECASE,
        )
    )

    if not has_measurement:
        weaknesses.append(
            "Project and experience descriptions contain limited "
            "quantified outcomes."
        )
        improvement_areas.append(
            "Quantify impact with metrics such as accuracy, latency, "
            "users, processing time, or percentage improvement."
        )

    # Check for deployment evidence.
    has_deployment = any(
        word in combined_text
        for word in (
            "deployed",
            "deployment",
            "aws",
            "azure",
            "gcp",
            "vercel",
            "render",
            "docker",
        )
    )

    if not has_deployment:
        weaknesses.append(
            "Production deployment evidence is limited in the "
            "extracted resume content."
        )
        improvement_areas.append(
            "Add deployment links and briefly describe the hosting "
            "or deployment stack for major projects."
        )

    # ---------------------------------------------------------
    # Score and quality signals
    # ---------------------------------------------------------

    evidence_score = 0

    if skills_set:
        evidence_score += 25

    if experience_count:
        evidence_score += 20

    if project_count:
        evidence_score += 20

    if certification_count:
        evidence_score += 10

    if ats_value >= 80:
        evidence_score += 10

    if resume_value >= 80:
        evidence_score += 10

    if match_value >= 70:
        evidence_score += 5

    score = min(
        100,
        max(0, evidence_score),
    )

    # If the resume has substantial evidence, never return an
    # empty strengths list.
    if not strengths:
        strengths.append(
            "The resume contains structured technical profile evidence."
        )

    if not weaknesses:
        weaknesses.append(
            "No major resume-quality gap was detected from the "
            "available structured analysis."
        )

    if not improvement_areas:
        improvement_areas.append(
            "Continue tailoring the resume to each target role "
            "and quantify project impact."
        )

    # Keep output concise and unique.
    strengths = _unique(strengths)[:8]
    weaknesses = _unique(weaknesses)[:8]
    improvement_areas = _unique(
        improvement_areas
    )[:8]

    summary = (
        f"Profile evidence indicates {len(strengths)} strength area(s) "
        f"and {len(weaknesses)} improvement gap(s), based on the "
        "latest extracted resume and job-match data."
    )

    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "improvement_areas": improvement_areas,
        "summary": summary,
        "score": score,
    }