import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode, quote_plus, urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.request import Request, urlopen


# =========================================================
# PATHS
# =========================================================

DATA_DIR = Path("app/services/data")
JOBS_FILE = DATA_DIR / "jobs.json"


# =========================================================
# TEXT NORMALIZATION
# =========================================================

def normalize_text(value):
    """
    Normalize text for reliable matching.

    Example:
        "React.js" -> "react js"
        "Machine-Learning" -> "machine learning"
        "REST APIs" -> "rest apis"
    """

    if value is None:
        return ""

    if isinstance(value, list):
        value = " ".join(
            normalize_text(item)
            for item in value
        )

    elif isinstance(value, dict):
        value = " ".join(
            normalize_text(item)
            for item in value.values()
        )

    else:
        value = str(value)

    value = value.lower()

    # Normalize common technology variations
    replacements = {
        "react.js": "react",
        "node.js": "node",
        "express.js": "express",
        "restful api": "rest api",
        "restful apis": "rest apis",
        "machine-learning": "machine learning",
        "deep-learning": "deep learning",
        "scikit learn": "scikit-learn",
        "sklearn": "scikit-learn",
        "powerbi": "power bi",
        "ms sql": "sql",
        "microsoft sql server": "sql server",
    }

    for old, new in replacements.items():
        value = value.replace(old, new)

    # Remove special characters
    value = re.sub(r"[^a-z0-9+#.\s-]", " ", value)

    # Normalize whitespace
    value = re.sub(r"\s+", " ", value).strip()

    return value


# =========================================================
# CONVERT ANY VALUE TO TEXT
# =========================================================

def value_to_text(value):
    """
    Safely convert strings, lists and dictionaries to text.
    """

    if value is None:
        return ""

    if isinstance(value, str):
        return value

    if isinstance(value, list):
        return " ".join(
            value_to_text(item)
            for item in value
        )

    if isinstance(value, dict):
        return " ".join(
            value_to_text(item)
            for item in value.values()
        )

    return str(value)



# =========================================================
# LIVE JOB SOURCE
# =========================================================

LIVE_JOBS_ENABLED = os.getenv(
    "LIVE_JOBS_ENABLED", "true"
).lower() in {"1", "true", "yes", "on"}

ADZUNA_APP_ID = os.getenv(
    "ADZUNA_APP_ID", ""
).strip()

ADZUNA_APP_KEY = os.getenv(
    "ADZUNA_APP_KEY", ""
).strip()

ADZUNA_COUNTRY = os.getenv(
    "ADZUNA_COUNTRY", "in"
).strip() or "in"

# Dynamic live-job search configuration.
LIVE_JOB_LIMIT = max(1, int(os.getenv("LIVE_JOB_LIMIT", "20")))
LIVE_JOB_MAX_DAYS = max(1, int(os.getenv("LIVE_JOB_MAX_DAYS", "15")))
LIVE_JOB_CACHE_SECONDS = max(
    60,
    int(os.getenv("LIVE_JOB_CACHE_SECONDS", "900")),
)
LIVE_JOB_LOCATION = os.getenv("LIVE_JOB_LOCATION", "ALL INDIA").strip()

# ALL / ALL INDIA / INDIA / empty => search the whole Adzuna country, not a city.
ALL_INDIA_LOCATIONS = {"", "all", "all india", "india", "pan india", "anywhere"}

LIVE_JOB_VERIFY_URLS = (
    os.getenv("LIVE_JOB_VERIFY_URLS", "true").lower()
    in {"1", "true", "yes", "on"}
)
LIVE_JOB_URL_TIMEOUT = max(2, int(os.getenv("LIVE_JOB_URL_TIMEOUT", "5")))
LIVE_JOB_VERIFY_LIMIT = max(0, int(os.getenv("LIVE_JOB_VERIFY_LIMIT", "60")))
LIVE_JOB_RESULTS_PER_QUERY = min(
    20,
    max(5, int(os.getenv("LIVE_JOB_RESULTS_PER_QUERY", "20"))),
)

# Salary is a ranking signal by default. It is not a hard filter unless
# JOB_REQUIRE_SALARY=true or JOB_MIN_SALARY_INR is explicitly configured.
JOB_MIN_SALARY_INR = max(
    0,
    float(os.getenv("JOB_MIN_SALARY_INR", "0")),
)
JOB_REQUIRE_SALARY = (
    os.getenv("JOB_REQUIRE_SALARY", "false").lower()
    in {"1", "true", "yes", "on"}
)

# Use jobs.json only when the live source cannot return jobs.
ALLOW_LOCAL_FALLBACK = (
    os.getenv("ALLOW_LOCAL_FALLBACK", "true").lower()
    in {"1", "true", "yes", "on"}
)


_LIVE_JOB_CACHE = {
    "timestamp": 0.0,
    "jobs": [],
}


def parse_job_created_date(value):
    if not value:
        return None

    try:
        text = str(value).strip()

        if text.endswith("Z"):
            text = text[:-1] + "+00:00"

        parsed = datetime.fromisoformat(text)

        if parsed.tzinfo is None:
            parsed = parsed.replace(
                tzinfo=timezone.utc
            )

        return parsed.astimezone(
            timezone.utc
        )

    except (TypeError, ValueError):
        return None


# =========================================================
# EXPERIENCE LEVEL MATCHING
# =========================================================

EXPERIENCE_RANGE_RE = re.compile(
    r"(?P<min>\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*"
    r"(?P<max>\d+(?:\.\d+)?)\s*(?:years?|yrs?)",
    re.IGNORECASE,
)

EXPERIENCE_SINGLE_RE = re.compile(
    r"(?P<years>\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)",
    re.IGNORECASE,
)


def parse_years_from_text(value):
    """
    Return the MINIMUM years required.

    4-6 years -> 4
    3 to 5 years -> 3
    2+ years -> 2
    """
    text = normalize_text(value)
    if not text:
        return None

    match = EXPERIENCE_RANGE_RE.search(text)
    if match:
        return float(match.group("min"))

    match = EXPERIENCE_SINGLE_RE.search(text)
    if match:
        return float(match.group("years"))

    return None


def extract_experience_range(value):
    text = normalize_text(value)
    if not text:
        return None, None

    match = EXPERIENCE_RANGE_RE.search(text)
    if match:
        return (
            float(match.group("min")),
            float(match.group("max")),
        )

    match = re.search(
        r"(\d+(?:\.\d+)?)\s*\+\s*(?:years?|yrs?)",
        text,
        re.IGNORECASE,
    )
    if match:
        return float(match.group(1)), None

    match = EXPERIENCE_SINGLE_RE.search(text)
    if match:
        years = float(match.group("years"))
        return years, years

    return None, None


def extract_candidate_experience_years(experience):
    if not experience:
        return 0.0

    text = normalize_text(value_to_text(experience))

    months = re.findall(
        r"(\d+(?:\.\d+)?)\s*months?",
        text,
    )
    years = re.findall(
        r"(\d+(?:\.\d+)?)\s*(?:years?|yrs?)",
        text,
    )

    total = 0.0

    if years:
        total = max(float(x) for x in years)

    if months:
        total = max(
            total,
            max(float(x) for x in months) / 12.0,
        )

    if total == 0 and any(
        marker in text
        for marker in (
            "intern",
            "internship",
            "trainee",
            "fresher",
            "graduate",
        )
    ):
        return 0.0

    return round(total, 2)


def candidate_experience_level(experience):
    years = extract_candidate_experience_years(experience)

    if years <= 1:
        return "Entry Level"

    if years <= 2:
        return "Junior / Early Career"

    if years <= 4:
        return "Mid Level"

    if years <= 7:
        return "Senior / Experienced"

    if years <= 10:
        return "Lead / Staff"

    return "Principal / Leadership"


def _experience_band(minimum, maximum=None):
    minimum = float(minimum)

    if minimum <= 1:
        return "0-1 Years"
    if minimum <= 2:
        return "1-2 Years"
    if minimum <= 4:
        return "2-4 Years"
    if minimum <= 6:
        return "4-6 Years"
    if minimum <= 8:
        return "6-8 Years"
    return "8+ Years"


def infer_job_experience_level(
    title,
    description="",
    declared="",
):
    """
    Infer the required experience from the declared field, title signals,
    then description. This prevents unrelated years in a description from
    becoming the experience requirement.
    """
    declared_text = normalize_text(declared)
    title_text = normalize_text(title)
    description_text = normalize_text(description)

    minimum, maximum = extract_experience_range(declared_text)
    if minimum is not None:
        return _experience_band(minimum, maximum)

    minimum, maximum = extract_experience_range(title_text)
    if minimum is not None:
        return _experience_band(minimum, maximum)

    combined_title = f"{title_text} {declared_text}"

    if any(
        marker in combined_title
        for marker in (
            "principal",
            "staff engineer",
            "staff software",
            "lead engineer",
            "lead software",
            "engineering manager",
            "director",
            "head of",
            "vice president",
        )
    ):
        return "8+ Years"

    if any(
        marker in combined_title
        for marker in ("senior", "sr ", "sr.")
    ):
        return "4-8 Years"

    if any(
        marker in combined_title
        for marker in (
            "engineer ii",
            "software engineer ii",
            "developer ii",
        )
    ):
        return "2-4 Years"

    if any(
        marker in combined_title
        for marker in (
            "engineer iii",
            "software engineer iii",
            "developer iii",
        )
    ):
        return "4-8 Years"

    if any(
        marker in combined_title
        for marker in (
            "intern",
            "internship",
            "graduate",
            "fresher",
            "trainee",
            "entry level",
            "entry-level",
            "junior",
            "associate",
        )
    ):
        return "0-2 Years"

    minimum, maximum = extract_experience_range(description_text)
    if minimum is not None:
        return _experience_band(minimum, maximum)

    return "Not Specified"


def experience_fit(candidate_years, job_experience):
    """
    Experience is an eligibility gate.

    A materially higher experience requirement is rejected instead of being
    allowed through because of a high skill score.
    """
    text = normalize_text(job_experience)
    required_min, required_max = extract_experience_range(text)

    if required_min is None:
        for marker, value in (
            ("8+", 8),
            ("6+", 6),
            ("4-8", 4),
            ("4-6", 4),
            ("2-4", 2),
            ("1-2", 1),
            ("0-2", 0),
            ("0-1", 0),
        ):
            if marker in text:
                required_min = float(value)
                break

    if required_min is None:
        return True, "Experience requirement not specified", 0

    if candidate_years >= required_min:
        if required_max is not None and candidate_years <= required_max:
            return True, "Experience level matches", 0
        return True, "Meets minimum experience", 0

    gap = required_min - candidate_years

    # A small stretch is only allowed when the title/listing is explicitly
    # junior/entry/graduate friendly.
    if (
        required_min <= 2
        and gap <= 1
        and any(
            marker in text
            for marker in (
                "entry",
                "junior",
                "associate",
                "graduate",
                "trainee",
                "fresher",
            )
        )
    ):
        return True, "Entry-level stretch", 3

    return False, "Requires more experience", 100


def is_recent_job(
    created,
    max_days=LIVE_JOB_MAX_DAYS,
):
    parsed = parse_job_created_date(
        created
    )

    if parsed is None:
        return False

    age_days = (
        datetime.now(timezone.utc) - parsed
    ).total_seconds() / 86400

    return 0 <= age_days <= max_days


def job_age_text(created):
    parsed = parse_job_created_date(
        created
    )

    if parsed is None:
        return "Date not available"

    age_days = max(
        0,
        int(
            (
                datetime.now(timezone.utc)
                - parsed
            ).total_seconds() / 86400
        ),
    )

    if age_days == 0:
        return "Posted today"

    if age_days == 1:
        return "Posted 1 day ago"

    if age_days < 7:
        return f"Posted {age_days} days ago"

    weeks = age_days // 7

    if weeks == 1:
        return "Posted 1 week ago"

    return f"Posted {weeks} weeks ago"


LIVE_SKILL_DICTIONARY = [
    "Python",
    "Machine Learning",
    "Deep Learning",
    "Artificial Intelligence",
    "TensorFlow",
    "PyTorch",
    "Scikit-learn",
    "FastAPI",
    "Flask",
    "Django",
    "REST APIs",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "Docker",
    "AWS",
    "Azure",
    "Git",
    "GitHub",
    "Pandas",
    "NumPy",
    "OpenCV",
    "NLP",
    "Generative AI",
    "LLM",
    "LangChain",
    "RAG",
    "Kubernetes",
    "Linux",
    "React",
    "Node.js",
    "Express.js",
    "JavaScript",
    "Data Structures",
    "Algorithms",
    "Power BI",
    "Tableau",
    "MongoDB",
    "CI/CD",
    "OOP",
]


def infer_job_skills(
    title,
    description,
):
    combined = normalize_text(
        f"{title} {description}"
    )

    skills = []

    for skill in LIVE_SKILL_DICTIONARY:
        normalized = normalize_text(
            skill
        )

        if (
            normalized
            and normalized in combined
        ):
            skills.append(skill)

    if (
        "python" in normalize_text(title)
        and "Python" not in skills
    ):
        skills.append("Python")

    return list(
        dict.fromkeys(skills)
    )


def build_search_queries(
    skills=None,
    summary="",
    experience=None,
    projects=None,
    candidate=None,
):
    """
    Build live searches from the resume instead of using fixed fresher
    queries. The seniority terms adapt to the candidate's experience.
    """
    profile = build_profile_text(
        candidate=candidate,
        summary=summary,
        skills=skills,
        experience=experience,
        projects=projects,
    )

    candidate_years = extract_candidate_experience_years(
        experience
    )

    role_signal_map = [
        ("machine learning engineer", (
            "machine learning", "deep learning", "tensorflow",
            "pytorch", "scikit-learn", "ml"
        )),
        ("ai engineer", (
            "artificial intelligence", "ai", "generative ai",
            "llm", "nlp", "computer vision"
        )),
        ("python developer", (
            "python", "django", "flask", "fastapi"
        )),
        ("backend engineer", (
            "backend", "fastapi", "flask", "django",
            "rest api", "postgresql", "sql"
        )),
        ("software engineer", (
            "software engineer", "software developer",
            "programming", "oop", "data structures", "algorithms"
        )),
        ("full stack developer", (
            "react", "node", "javascript", "full stack",
            "frontend", "backend"
        )),
        ("data scientist", (
            "data science", "data scientist", "statistics",
            "pandas", "scikit-learn", "machine learning"
        )),
        ("data analyst", (
            "data analyst", "data analysis", "power bi",
            "tableau", "sql", "pandas"
        )),
        ("data engineer", (
            "data engineer", "data pipeline", "etl",
            "spark", "sql", "cloud"
        )),
    ]

    role_scores = []

    for role, signals in role_signal_map:
        score = sum(
            1
            for signal in signals
            if normalize_text(signal) in profile
        )
        if score:
            role_scores.append((score, role))

    role_scores.sort(reverse=True)

    if not role_scores:
        roles = [
            "software engineer",
            "python developer",
        ]
    else:
        roles = [
            role
            for _, role in role_scores[:5]
        ]

    if candidate_years <= 1:
        level_terms = [
            "entry level",
            "junior",
            "graduate",
            "associate",
        ]
    elif candidate_years <= 2:
        level_terms = [
            "junior",
            "associate",
            "software engineer",
        ]
    elif candidate_years <= 4:
        level_terms = [
            "software engineer",
            "engineer ii",
            "mid level",
        ]
    elif candidate_years <= 7:
        level_terms = [
            "senior",
            "senior engineer",
            "software engineer ii",
            "software engineer iii",
        ]
    elif candidate_years <= 10:
        level_terms = [
            "senior",
            "staff",
            "lead",
            "principal",
        ]
    else:
        level_terms = [
            "staff",
            "principal",
            "lead",
            "manager",
        ]

    queries = []

    for role in roles:
        for level in level_terms[:2]:
            queries.append(f"{level} {role}")

    for role in roles[:2]:
        queries.append(role)

    result = []
    seen = set()

    for query in queries:
        query = " ".join(query.split()).strip()
        if not query:
            continue

        key = query.lower()
        if key in seen:
            continue

        seen.add(key)
        result.append(query)

    return result[:6]


def _salary_number(value):
    try:
        if value is None:
            return None
        number = float(value)
        return number if number > 0 else None
    except (TypeError, ValueError):
        return None


def _salary_text(salary_min, salary_max):
    low = _salary_number(salary_min)
    high = _salary_number(salary_max)

    if low is not None and high is not None:
        return f"₹{low:,.0f} - ₹{high:,.0f}"
    if low is not None:
        return f"₹{low:,.0f}+"
    if high is not None:
        return f"Up to ₹{high:,.0f}"

    return "Salary not disclosed"


def _salary_rank(salary_min, salary_max):
    low = _salary_number(salary_min)
    high = _salary_number(salary_max)

    if low is not None:
        return low
    return high or 0


def provider_search_links(job_title, company="", location=""):
    """Return provider search links without pretending they are exact listings.

    LinkedIn/Indeed/Naukri do not expose a general public job-search API that
    this application can safely scrape. These links let the candidate verify
    the same role on the major job boards.
    """
    query = " ".join(x for x in [job_title, company] if x).strip()
    location_text = "" if str(location).strip().lower() in ALL_INDIA_LOCATIONS else str(location).strip()
    q = quote_plus(query)
    loc = quote_plus(location_text)
    return {
        "linkedin": f"https://www.linkedin.com/jobs/search/?keywords={q}" + (f"&location={loc}" if loc else ""),
        "indeed": f"https://in.indeed.com/jobs?q={q}" + (f"&l={loc}" if loc else ""),
        "naukri": f"https://www.google.com/search?q={quote_plus(f'site:naukri.com {query} {location_text}'.strip())}",
    }


def verify_application_url(url):
    """Reject only URLs that are clearly dead (404/410).

    Some job boards block HEAD/automated requests with 403/429, so those are
    treated as unknown rather than incorrectly removing a real listing.
    """
    if not url or not str(url).startswith(("http://", "https://")):
        return False

    request = Request(
        str(url),
        headers={
            "User-Agent": "Mozilla/5.0 AI-Resume-Analyzer/1.0",
            "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        },
        method="HEAD",
    )

    try:
        with urlopen(request, timeout=LIVE_JOB_URL_TIMEOUT) as response:
            code = getattr(response, "status", 200)
            return code not in {404, 410}
    except Exception as error:
        code = getattr(error, "code", None)
        if code in {404, 410}:
            return False
        # 403/429/timeouts are not proof that a listing is dead.
        return True


def filter_dead_application_urls(jobs):
    if not LIVE_JOB_VERIFY_URLS or not jobs:
        return jobs

    candidates = jobs[:LIVE_JOB_VERIFY_LIMIT] if LIVE_JOB_VERIFY_LIMIT else jobs
    remainder = jobs[len(candidates):]

    results = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        future_map = {
            executor.submit(verify_application_url, job.get("apply_url", "")): job
            for job in candidates
        }
        for future in as_completed(future_map):
            job = future_map[future]
            try:
                if future.result():
                    results.append(job)
            except Exception:
                results.append(job)

    return results + remainder


def fetch_live_jobs(
    skills=None,
    summary="",
    experience=None,
    projects=None,
    candidate=None,
):
    """
    Fetch recent Adzuna listings for the candidate's dynamic role queries.

    Adzuna's search response supplies created date, salary, company,
    location and redirect URL. We filter on created date and sort by
    recency. We do not invent an "actively hiring" flag when the source
    does not provide one.
    """
    global _LIVE_JOB_CACHE

    if not LIVE_JOBS_ENABLED:
        return []

    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        print(
            "[Job Recommender] Live jobs are not configured."
        )
        return []

    now = datetime.now(
        timezone.utc
    ).timestamp()

    profile_key = normalize_text(
        " ".join(
            [
                value_to_text(skills),
                value_to_text(summary),
                value_to_text(experience),
                value_to_text(projects),
                value_to_text(candidate),
            ]
        )
    )[:500]

    if (
        _LIVE_JOB_CACHE.get("jobs")
        and _LIVE_JOB_CACHE.get("profile_key") == profile_key
        and now - _LIVE_JOB_CACHE.get("timestamp", 0)
        < LIVE_JOB_CACHE_SECONDS
    ):
        return list(_LIVE_JOB_CACHE["jobs"])

    queries = build_search_queries(
        skills=skills,
        summary=summary,
        experience=experience,
        projects=projects,
        candidate=candidate,
    )

    all_jobs = []
    seen_ids = set()

    for query in queries:
        try:
            params = {
                "app_id": ADZUNA_APP_ID,
                "app_key": ADZUNA_APP_KEY,
                "results_per_page": LIVE_JOB_RESULTS_PER_QUERY,
                "what": query,
                "sort_by": "date",
                "full_time": 1,
                "content-type": "application/json",
            }

            # Omit `where` for ALL INDIA so Adzuna searches the full country.
            if normalize_text(LIVE_JOB_LOCATION) not in {
                normalize_text(value) for value in ALL_INDIA_LOCATIONS
            }:
                params["where"] = LIVE_JOB_LOCATION

            url = (
                "https://api.adzuna.com/v1/api/jobs/"
                f"{ADZUNA_COUNTRY}/search/1?"
                f"{urlencode(params)}"
            )

            request = Request(
                url,
                headers={
                    "Accept": "application/json",
                    "User-Agent": "AI-Resume-Analyzer/1.0",
                },
            )

            with urlopen(
                request,
                timeout=12,
            ) as response:
                payload = json.loads(
                    response.read().decode("utf-8")
                )

            results = payload.get("results", [])

            if not isinstance(results, list):
                continue

            for item in results:
                if not isinstance(item, dict):
                    continue

                job_id = str(
                    item.get("id", "")
                ).strip()

                if not job_id or job_id in seen_ids:
                    continue

                created = item.get("created")

                if not is_recent_job(created):
                    continue

                redirect_url = str(
                    item.get("redirect_url", "")
                ).strip()

                company_data = (
                    item.get("company", {})
                    or {}
                )
                location_data = (
                    item.get("location", {})
                    or {}
                )

                company = str(
                    company_data.get(
                        "display_name",
                        "",
                    )
                ).strip()

                location = str(
                    location_data.get(
                        "display_name",
                        "India",
                    )
                ).strip()

                title = str(
                    item.get(
                        "title",
                        "Software Engineer",
                    )
                ).strip()

                description = str(
                    item.get(
                        "description",
                        "",
                    )
                ).strip()

                if not company or not redirect_url:
                    continue

                stale_phrases = (
                    "no longer accepting applications",
                    "applications are closed",
                    "job has been filled",
                    "position has been filled",
                    "listing has expired",
                    "job is no longer available",
                )
                description_lower = normalize_text(description)
                if any(phrase in description_lower for phrase in stale_phrases):
                    continue

                inferred_skills = infer_job_skills(
                    title,
                    description,
                )

                if not inferred_skills:
                    continue

                salary_min = item.get("salary_min")
                salary_max = item.get("salary_max")
                salary_rank = _salary_rank(
                    salary_min,
                    salary_max,
                )

                if (
                    JOB_REQUIRE_SALARY
                    and salary_rank <= 0
                ):
                    continue

                if (
                    JOB_MIN_SALARY_INR > 0
                    and salary_rank > 0
                    and salary_rank < JOB_MIN_SALARY_INR
                ):
                    continue

                job_experience = infer_job_experience_level(
                    title,
                    description,
                    item.get("experience", ""),
                )

                contract_time = item.get(
                    "contract_time"
                )

                employment_type = (
                    "Full Time"
                    if contract_time == "full_time"
                    else (
                        str(contract_time)
                        .replace("_", " ")
                        .title()
                        if contract_time
                        else "Full Time"
                    )
                )

                all_jobs.append({
                    "id": f"adzuna-{job_id}",
                    "role": title,
                    "title": title,
                    "skills": inferred_skills,
                    "salary": _salary_text(
                        salary_min,
                        salary_max,
                    ),
                    "salary_min": salary_min,
                    "salary_max": salary_max,
                    "salary_rank": salary_rank,
                    "experience": job_experience,
                    "experience_source": "inferred from listing",
                    "category": (
                        (
                            item.get("category", {})
                            or {}
                        ).get(
                            "label",
                            "Technology",
                        )
                    ),
                    "description": description,
                    "companies": [company],
                    "company": company,
                    "location": location,
                    "employment_type": employment_type,
                    "apply_url": redirect_url,
                    "apply_link": redirect_url,
                    "source": "Adzuna",
                    "source_url": redirect_url,
                    "posted_date": created,
                    "posted_age": job_age_text(created),
                    "status": "live_listing",
                    "is_active": True,
                    "live": True,
                    "search_query": query,
                    "provider_search_links": provider_search_links(
                        title,
                        company,
                        location,
                    ),
                })

                seen_ids.add(job_id)

        except Exception as error:
            print(
                "[Job Recommender] Live query "
                f"'{query}' failed: {error}"
            )

    # Remove listings that are definitely dead before ranking them.
    all_jobs = filter_dead_application_urls(all_jobs)

    all_jobs.sort(
        key=lambda job: (
            parse_job_created_date(
                job.get("posted_date")
            )
            or datetime.min.replace(
                tzinfo=timezone.utc
            )
        ),
        reverse=True,
    )

    _LIVE_JOB_CACHE = {
        "timestamp": now,
        "profile_key": profile_key,
        "jobs": all_jobs,
    }

    print(
        "[Job Recommender] Dynamic live queries:",
        queries,
    )
    print(
        "[Job Recommender] Live recent jobs:",
        len(all_jobs),
    )

    return list(all_jobs)


# =========================================================
# LOAD JOB DATABASE
# =========================================================

def load_jobs_database(
    skills=None,
    summary="",
    experience=None,
    projects=None,
    candidate=None,
):
    """
    Live listings are the primary source. Local jobs.json is only a fallback
    if the live source returns no jobs.
    """
    live_jobs = fetch_live_jobs(
        skills=skills,
        summary=summary,
        experience=experience,
        projects=projects,
        candidate=candidate,
    )

    if live_jobs:
        return live_jobs

    if not ALLOW_LOCAL_FALLBACK:
        return []

    if not JOBS_FILE.exists():
        return []

    try:
        with open(
            JOBS_FILE,
            "r",
            encoding="utf-8",
        ) as file:
            data = json.load(file)

        if not isinstance(data, list):
            return []

        local_jobs = []

        for job in data:
            if not isinstance(job, dict):
                continue

            copy = dict(job)
            copy["live"] = False
            copy["is_active"] = False
            copy["status"] = "local_fallback"
            copy.setdefault(
                "source",
                "Local database",
            )
            local_jobs.append(copy)

        print(
            "[Job Recommender] Using local fallback jobs:",
            len(local_jobs),
        )

        return local_jobs

    except Exception as error:
        print(
            "[Job Recommender] Local jobs fallback failed:",
            error,
        )
        return []


# =========================================================
# NORMALIZE SKILLS
# =========================================================

def normalize_skills(skills):
    """
    Convert candidate skills into a normalized set.
    """

    if not skills:
        return set()

    if isinstance(skills, str):
        skills = [skills]

    normalized = set()

    for skill in skills:

        if not skill:
            continue

        normalized_skill = normalize_text(skill)

        if normalized_skill:
            normalized.add(normalized_skill)

    return normalized


# =========================================================
# SKILL ALIAS GROUPS
# =========================================================

SKILL_ALIASES = {
    "python": {
        "python",
        "python 3",
    },

    "machine learning": {
        "machine learning",
        "ml",
    },

    "deep learning": {
        "deep learning",
        "dl",
    },

    "tensorflow": {
        "tensorflow",
        "keras",
    },

    "scikit-learn": {
        "scikit-learn",
        "sklearn",
    },

    "react": {
        "react",
        "react js",
        "react.js",
    },

    "node": {
        "node",
        "node js",
        "node.js",
    },

    "express": {
        "express",
        "express js",
        "express.js",
    },

    "rest api": {
        "rest api",
        "rest apis",
        "restful api",
        "restful apis",
    },

    "sql": {
        "sql",
        "mysql",
        "postgresql",
        "postgres",
        "sql server",
    },

    "nlp": {
        "nlp",
        "natural language processing",
    },

    "computer vision": {
        "computer vision",
        "opencv",
    },

    "data analysis": {
        "data analysis",
        "data analytics",
        "data analyst",
    },

    "power bi": {
        "power bi",
        "powerbi",
    },
}


# =========================================================
# CHECK SKILL MATCH
# =========================================================

def skill_matches(
    candidate_skills,
    required_skill
):
    """
    Check whether a candidate has a required skill,
    including supported aliases.
    """

    candidate_skills = {
        normalize_text(skill)
        for skill in candidate_skills
    }

    required = normalize_text(
        required_skill
    )

    # Direct match
    if required in candidate_skills:
        return True

    # Alias match
    for canonical, aliases in SKILL_ALIASES.items():

        normalized_aliases = {
            normalize_text(alias)
            for alias in aliases
        }

        if required == canonical:

            if candidate_skills & normalized_aliases:
                return True

        if required in normalized_aliases:

            if candidate_skills & normalized_aliases:
                return True

    return False


# =========================================================
# FIND MATCHED SKILLS
# =========================================================

def find_matched_skills(
    candidate_skills,
    required_skills
):
    """
    Return required skills that the candidate possesses.
    """

    matched = []

    for required_skill in required_skills:

        if skill_matches(
            candidate_skills,
            required_skill
        ):
            matched.append(required_skill)

    return sorted(
        set(matched),
        key=lambda value: value.lower()
    )


# =========================================================
# PROFILE TEXT
# =========================================================

def build_profile_text(
    candidate=None,
    summary="",
    skills=None,
    education=None,
    experience=None,
    projects=None,
    certifications=None,
):
    """
    Build one searchable text representation
    of the candidate profile.
    """

    parts = [
        candidate,
        summary,
        skills,
        education,
        experience,
        projects,
        certifications,
    ]

    text_parts = []

    for part in parts:

        converted = value_to_text(part)

        if converted:
            text_parts.append(converted)

    return normalize_text(
        " ".join(text_parts)
    )


# =========================================================
# ROLE RELEVANCE
# =========================================================

def calculate_role_relevance(
    role,
    profile_text
):
    """
    Give a small bonus when the candidate's actual
    profile/experience clearly relates to the role.
    """

    role_text = normalize_text(role)

    bonus = 0

    role_keywords = {

        "machine learning engineer": [
            "machine learning",
            "ml engineer",
            "machine learning engineer",
            "tensorflow",
            "scikit-learn",
            "deep learning",
        ],

        "ai engineer": [
            "artificial intelligence",
            "ai engineer",
            "machine learning",
            "deep learning",
            "tensorflow",
            "nlp",
            "computer vision",
        ],

        "python developer": [
            "python developer",
            "python",
            "flask",
            "django",
            "fastapi",
        ],

        "full stack developer": [
            "full stack",
            "react",
            "node",
            "javascript",
            "django",
            "flask",
        ],

        "backend developer": [
            "backend",
            "backend developer",
            "flask",
            "django",
            "fastapi",
            "node",
            "rest api",
        ],

        "data analyst": [
            "data analyst",
            "data analysis",
            "data analytics",
            "power bi",
            "pandas",
            "sql",
        ],

        "data scientist": [
            "data scientist",
            "data science",
            "machine learning",
            "statistics",
            "pandas",
            "scikit-learn",
        ],

        "data engineer": [
            "data engineer",
            "data engineering",
            "etl",
            "data pipeline",
            "sql",
            "cloud",
        ],

        "software engineer": [
            "software engineer",
            "software developer",
            "programming",
            "oop",
            "algorithms",
        ],
    }

    for key, keywords in role_keywords.items():

        if key in role_text:

            matches = sum(
                1
                for keyword in keywords
                if normalize_text(keyword)
                in profile_text
            )

            if matches >= 4:
                bonus = 8

            elif matches >= 2:
                bonus = 5

            elif matches >= 1:
                bonus = 2

            break

    return bonus


# =========================================================
# EXPERIENCE RELEVANCE
# =========================================================

def calculate_experience_bonus(
    role,
    experience
):
    """
    Give additional weight when the candidate's
    previous experience matches the recommended role.
    """

    if not experience:
        return 0

    experience_text = normalize_text(
        value_to_text(experience)
    )

    role_text = normalize_text(role)

    role_experience_keywords = {

        "machine learning engineer": [
            "machine learning",
            "deep learning",
            "tensorflow",
            "scikit-learn",
            "ml intern",
            "ai",
        ],

        "ai engineer": [
            "artificial intelligence",
            "machine learning",
            "deep learning",
            "tensorflow",
            "ai",
        ],

        "python developer": [
            "python",
            "flask",
            "django",
            "fastapi",
            "backend",
        ],

        "full stack developer": [
            "full stack",
            "react",
            "node",
            "javascript",
            "django",
            "flask",
        ],

        "backend developer": [
            "backend",
            "flask",
            "django",
            "fastapi",
            "rest api",
            "node",
        ],

        "data analyst": [
            "data analyst",
            "data analytics",
            "power bi",
            "data analysis",
            "sql",
        ],

        "data scientist": [
            "data scientist",
            "machine learning",
            "data science",
            "statistics",
            "pandas",
        ],

        "data engineer": [
            "data engineer",
            "etl",
            "data pipeline",
            "sql",
            "database",
        ],

        "software engineer": [
            "software engineer",
            "software developer",
            "developer",
            "programming",
            "software",
        ],
    }

    for key, keywords in role_experience_keywords.items():

        if key in role_text:

            matches = sum(
                1
                for keyword in keywords
                if normalize_text(keyword)
                in experience_text
            )

            if matches >= 3:
                return 7

            if matches >= 2:
                return 5

            if matches >= 1:
                return 3

            break

    return 0


# =========================================================
# RECOMMEND JOBS
# =========================================================

def recommend_jobs(
    skills,
    candidate=None,
    summary="",
    education=None,
    experience=None,
    projects=None,
    certifications=None,
):
    """
    Recommend jobs using:

    1. Skills
    2. Candidate profile
    3. Summary
    4. Education
    5. Experience
    6. Projects
    7. Certifications

    Returns the top 10 recommendations.
    """

    jobs_database = load_jobs_database(
        skills=skills,
        summary=summary,
        experience=experience,
        projects=projects,
        candidate=candidate,
    )

    if not jobs_database:
        return []

    candidate_skills = normalize_skills(
        skills
    )

    candidate_years = extract_candidate_experience_years(experience)
    candidate_level = candidate_experience_level(experience)

    profile_text = build_profile_text(
        candidate=candidate,
        summary=summary,
        skills=skills,
        education=education,
        experience=experience,
        projects=projects,
        certifications=certifications,
    )

    recommendations = []

    for job in jobs_database:

        role = job.get(
            "role",
            "Software Engineer"
        )

        required_skills = job.get(
            "skills",
            []
        )

        if not isinstance(
            required_skills,
            list
        ):
            required_skills = [
                required_skills
            ]

        required_skills = [
            skill
            for skill in required_skills
            if skill
        ]

        job_experience = infer_job_experience_level(
            role, job.get("description", ""), job.get("experience", "")
        )
        exp_ok, exp_fit_label, exp_penalty = experience_fit(
            candidate_years,
            job_experience,
        )

        # Experience mismatch is a hard eligibility failure.
        if not exp_ok:
            continue

        # -------------------------------------------------
        # MATCH SKILLS
        # -------------------------------------------------

        matched = find_matched_skills(
            candidate_skills,
            required_skills
        )

        missing = sorted(
            [
                skill
                for skill in required_skills
                if skill not in matched
            ],
            key=lambda value: value.lower()
        )

        # -------------------------------------------------
        # SKILL SCORE
        # -------------------------------------------------

        if required_skills:

            skill_score = (
                len(matched)
                / len(required_skills)
            ) * 100

        else:

            skill_score = 0

        # -------------------------------------------------
        # PROFILE BONUS
        # -------------------------------------------------

        role_bonus = calculate_role_relevance(
            role,
            profile_text
        )

        # -------------------------------------------------
        # EXPERIENCE BONUS
        # -------------------------------------------------

        experience_bonus = (
            calculate_experience_bonus(
                role,
                experience
            )
        )

        # -------------------------------------------------
        # PROJECT BONUS
        # -------------------------------------------------

        project_text = normalize_text(
            value_to_text(projects)
        )

        project_bonus = 0

        if project_text:

            role_lower = normalize_text(
                role
            )

            project_keywords = {

                "machine learning engineer": [
                    "machine learning",
                    "tensorflow",
                    "deep learning",
                    "computer vision",
                    "opencv",
                ],

                "ai engineer": [
                    "ai",
                    "artificial intelligence",
                    "tensorflow",
                    "machine learning",
                ],

                "python developer": [
                    "python",
                    "flask",
                    "django",
                    "api",
                ],

                "full stack developer": [
                    "react",
                    "node",
                    "javascript",
                    "full stack",
                ],

                "backend developer": [
                    "flask",
                    "django",
                    "api",
                    "backend",
                ],

                "data analyst": [
                    "pandas",
                    "power bi",
                    "data analysis",
                    "sql",
                ],

                "data scientist": [
                    "machine learning",
                    "pandas",
                    "scikit-learn",
                    "data science",
                ],
            }

            for key, keywords in project_keywords.items():

                if key in role_lower:

                    project_matches = sum(
                        1
                        for keyword in keywords
                        if normalize_text(keyword)
                        in project_text
                    )

                    if project_matches >= 3:
                        project_bonus = 5

                    elif project_matches >= 2:
                        project_bonus = 3

                    elif project_matches >= 1:
                        project_bonus = 1

                    break

        # -------------------------------------------------
        # FRESHNESS + LIVE SOURCE
        # -------------------------------------------------

        live_bonus = 8 if job.get("live") else 0
        freshness_bonus = 0

        posted_date = parse_job_created_date(
            job.get("posted_date")
        )

        if posted_date:
            age_hours = max(
                0,
                (
                    datetime.now(timezone.utc)
                    - posted_date
                ).total_seconds() / 3600,
            )

            if age_hours <= 24:
                freshness_bonus = 10
            elif age_hours <= 72:
                freshness_bonus = 7
            elif age_hours <= 168:
                freshness_bonus = 4
            else:
                freshness_bonus = 1

        # -------------------------------------------------
        # SALARY SIGNAL
        # -------------------------------------------------

        salary_rank = _salary_number(
            job.get("salary_rank")
        )

        salary_bonus = 0

        if salary_rank:
            if salary_rank >= 2500000:
                salary_bonus = 10
            elif salary_rank >= 1800000:
                salary_bonus = 8
            elif salary_rank >= 1200000:
                salary_bonus = 6
            elif salary_rank >= 800000:
                salary_bonus = 4
            elif salary_rank >= 500000:
                salary_bonus = 2

        # -------------------------------------------------
        # TITLE / DESCRIPTION RELEVANCE
        # -------------------------------------------------

        job_text = normalize_text(
            f"{role} {job.get('description', '')} {value_to_text(required_skills)}"
        )
        title_tokens = [
            token for token in normalize_text(role).split()
            if len(token) >= 3
        ]
        title_overlap = (
            sum(1 for token in title_tokens if token in profile_text)
            / max(1, len(title_tokens))
        ) * 100

        # -------------------------------------------------
        # FINAL MATCH SCORE
        # -------------------------------------------------

        score = (
            (skill_score * 0.50)
            + (title_overlap * 0.15)
            + (role_bonus * 1.35)
            + (experience_bonus * 1.5)
            + (project_bonus * 1.25)
            + live_bonus
            + freshness_bonus
            + salary_bonus
        )

        score = min(
            99,
            max(
                0,
                round(score, 2)
            )
        )

        recommendations.append({

            "id": job.get("id", ""),

            "job_role": role,

            "match_score": score,

            "matched_skills": matched,

            "missing_skills": missing,

            "salary": job.get(
                "salary",
                "Salary not disclosed"
            ),
            "salary_min": job.get(
                "salary_min"
            ),
            "salary_max": job.get(
                "salary_max"
            ),
            "salary_disclosed": bool(
                _salary_number(
                    job.get("salary_rank")
                )
            ),

            "experience": job_experience,
            "candidate_experience_years": candidate_years,
            "candidate_experience_level": candidate_level,
            "experience_fit": exp_fit_label,
            "experience_eligible": exp_ok,

            "category": job.get(
                "category",
                "Software"
            ),

            "description": job.get(
                "description",
                ""
            ),

            "companies": job.get(
                "companies",
                []
            ),

            "company": job.get(
                "company",
                (
                    job.get(
                        "companies",
                        []
                    )[0]
                    if isinstance(
                        job.get(
                            "companies",
                            []
                        ),
                        list
                    )
                    and job.get(
                        "companies",
                        []
                    )
                    else ""
                )
            ),

            "location": job.get(
                "location",
                "Bengaluru, India"
            ),

            "employment_type": job.get(
                "employment_type",
                "Full Time"
            ),

            "apply_url": job.get(
                "apply_url",
                job.get(
                    "apply_link",
                    ""
                )
            ),

            "apply_link": job.get(
                "apply_link",
                job.get(
                    "apply_url",
                    ""
                )
            ),

            "source": job.get(
                "source",
                ""
            ),

            "source_url": job.get(
                "source_url",
                job.get(
                    "apply_url",
                    ""
                )
            ),

            "posted_date": job.get(
                "posted_date",
                ""
            ),

            "posted_age": job.get(
                "posted_age",
                ""
            ),

            "status": job.get(
                "status",
                "active"
            ),

            "is_active": job.get(
                "is_active",
                False
            ),
            "live": bool(
                job.get("live", False)
            ),
            "listing_status": job.get(
                "status",
                "unknown"
            ),

            "provider_search_links": job.get(
                "provider_search_links",
                provider_search_links(
                    role,
                    job.get("company", ""),
                    job.get("location", ""),
                ),
            ),

            "match_breakdown": {
                "skill_score": round(
                    skill_score,
                    2
                ),
                "title_overlap": round(
                    title_overlap,
                    2
                ),
                "profile_bonus": role_bonus,
                "experience_bonus":
                    experience_bonus,
                "experience_penalty":
                    exp_penalty,
                "project_bonus":
                    project_bonus,
                "freshness_bonus":
                    freshness_bonus,
                "live_bonus":
                    live_bonus,
                "salary_bonus":
                    salary_bonus,
            },

        })

    # -----------------------------------------------------
    # SORT
    # -----------------------------------------------------

    recommendations.sort(
        key=lambda job: (
            bool(job.get("live", False)),
            job.get("match_breakdown", {}).get(
                "freshness_bonus",
                0,
            ),
            job["match_score"],
            job.get("salary_min") or 0,
            len(job["matched_skills"]),
        ),
        reverse=True,
    )

    return recommendations[:LIVE_JOB_LIMIT]


# =========================================================
# LEARNING PATH
# =========================================================

def recommend_learning_path(
    recommendations
):
    """
    Generate a learning path using the
    highest-matching job.
    """

    if not recommendations:

        return {
            "learning_path": [],
            "recommended_certifications": [],
            "learning_resources": [],
        }

    top_job = recommendations[0]

    learning_path = []

    for skill in top_job.get(
        "missing_skills",
        []
    ):

        learning_path.append(
            f"Learn {skill.title()}"
        )

    # -----------------------------------------------------
    # CERTIFICATION MAP
    # -----------------------------------------------------

    skill_map = {

        "python":
            "Python Institute PCAP",

        "aws":
            "AWS Certified Cloud Practitioner",

        "azure":
            "Microsoft Azure AI Fundamentals",

        "docker":
            "Docker Certified Associate",

        "kubernetes":
            "Certified Kubernetes Application Developer",

        "tensorflow":
            "TensorFlow Developer Certificate",

        "pytorch":
            "PyTorch Fundamentals",

        "sql":
            "Oracle SQL Certification",

        "react":
            "Meta React Professional Certificate",

        "machine learning":
            "Google Machine Learning Crash Course",

        "deep learning":
            "DeepLearning.AI Deep Learning Specialization",

        "nlp":
            "Natural Language Processing Specialization",

        "power bi":
            "Microsoft Power BI Data Analyst",

    }

    certifications = []

    for skill in top_job.get(
        "missing_skills",
        []
    ):

        key = normalize_text(skill)

        if key in skill_map:

            certifications.append(
                skill_map[key]
            )

    # Remove duplicates
    certifications = list(
        dict.fromkeys(
            certifications
        )
    )

    # -----------------------------------------------------
    # LEARNING RESOURCES
    # -----------------------------------------------------

    resources = [

        "LeetCode",
        "HackerRank",
        "GeeksforGeeks",
        "Coursera",
        "Udemy",
        "Kaggle",
        "freeCodeCamp",
        "GitHub",

    ]

    return {

        "learning_path":
            learning_path,

        "recommended_certifications":
            certifications,

        "learning_resources":
            resources,

    }


# =========================================================
# CAREER LEVEL
# =========================================================

def recommend_level(
    match_score,
    candidate_experience_years=0,
):
    """
    Label the candidate's actual experience level plus match strength.
    """
    try:
        score = float(match_score)
    except (
        TypeError,
        ValueError,
    ):
        score = 0

    years = float(
        candidate_experience_years or 0
    )

    if years <= 1:
        level = "Entry Level"
    elif years <= 2:
        level = "Junior"
    elif years <= 4:
        level = "Mid Level"
    elif years <= 7:
        level = "Senior"
    elif years <= 10:
        level = "Lead / Staff"
    else:
        level = "Principal / Leadership"

    if score >= 90:
        strength = "Excellent Match"
    elif score >= 80:
        strength = "Strong Match"
    elif score >= 70:
        strength = "Good Match"
    elif score >= 60:
        strength = "Potential Match"
    else:
        strength = "Lower Match"

    return f"{level} • {strength}"


# =========================================================
# GENERATE COMPLETE RECOMMENDATIONS
# =========================================================

def generate_job_recommendations(
    skills,
    candidate=None,
    summary="",
    education=None,
    experience=None,
    projects=None,
    certifications=None,
):
    """
    Generate complete job recommendations.

    Backward compatible:

        generate_job_recommendations(
            skills
        )

    Enhanced usage:

        generate_job_recommendations(
            skills=skills,
            candidate=candidate,
            summary=summary,
            education=education,
            experience=experience,
            projects=projects,
            certifications=certifications,
        )
    """

    jobs = recommend_jobs(
        skills=skills,
        candidate=candidate,
        summary=summary,
        education=education,
        experience=experience,
        projects=projects,
        certifications=certifications,
    )

    # -----------------------------------------------------
    # CANDIDATE EXPERIENCE
    # Must be calculated BEFORE it is used below.
    # -----------------------------------------------------

    candidate_years = extract_candidate_experience_years(
        experience
    )

    # -----------------------------------------------------
    # ADD CAREER LEVEL
    # -----------------------------------------------------

    for job in jobs:

        job["recommended_level"] = (
            recommend_level(
                job.get(
                    "match_score",
                    0
                ),
                candidate_years,
            )
        )

    # -----------------------------------------------------
    # LEARNING PATH
    # -----------------------------------------------------

    learning = (
        recommend_learning_path(
            jobs
        )
    )

    # -----------------------------------------------------
    # FINAL RESPONSE
    # -----------------------------------------------------

    return {

        "candidate_experience_years": candidate_years,
        "candidate_experience_level": candidate_experience_level(
            experience
        ),
        "live_jobs_enabled": LIVE_JOBS_ENABLED,
        "live_job_location": LIVE_JOB_LOCATION,
        "live_job_max_days": LIVE_JOB_MAX_DAYS,

        "recommended_jobs":
            jobs,

        "learning_path":
            learning.get(
                "learning_path",
                []
            ),

        "recommended_certifications":
            learning.get(
                "recommended_certifications",
                []
            ),

        "learning_resources":
            learning.get(
                "learning_resources",
                []
            ),

    }