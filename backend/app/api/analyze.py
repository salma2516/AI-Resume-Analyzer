from pathlib import Path
import traceback

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException,
)

from app.services.extractor import extract_text_from_pdf
from app.services.parser import parse_resume
from app.services.ats import calculate_ats_score
from app.services.resume_score import calculate_resume_score
from app.services.job_match import calculate_job_match
from app.services.resume_feedback import generate_resume_feedback
from app.services.resume_improver import generate_resume_improvements
from app.services.cover_letter import generate_cover_letter
from app.services.job_recommender import generate_job_recommendations
from app.services.career_roadmap import generate_career_roadmap
from app.services.interview_generator import generate_interview_questions
from app.services.report_generator import generate_pdf_report


# =========================================================
# ROUTER
# =========================================================

router = APIRouter()


# =========================================================
# UPLOAD DIRECTORY
# =========================================================

BASE_DIR = Path(__file__).resolve().parents[1]

UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def safe_list(value):
    """
    Always return a list.

    Prevents errors when parser/recommender returns
    None, dictionary, string, tuple, etc.
    """

    if value is None:
        return []

    if isinstance(value, list):
        return value

    if isinstance(value, tuple):
        return list(value)

    return []


def safe_dict(value):
    """
    Always return a dictionary.
    """

    if isinstance(value, dict):
        return value

    return {}


def normalize_job(job):
    """
    Normalize one recommended job into the structure
    expected by the frontend.
    """

    if not isinstance(job, dict):
        return None

    job = dict(job)

    # -----------------------------------------------------
    # ROLE
    # -----------------------------------------------------

    job_role = (
        job.get("job_role")
        or job.get("role")
        or job.get("title")
        or "Software Engineer"
    )

    job["job_role"] = str(job_role)

    # -----------------------------------------------------
    # COMPANY
    # -----------------------------------------------------

    company = (
        job.get("company")
        or job.get("companies")
        or "Company not specified"
    )

    if isinstance(company, list):

        company_list = [
            str(item).strip()
            for item in company
            if str(item).strip()
        ]

        job["companies"] = company_list

        if company_list:
            job["company"] = company_list[0]
        else:
            job["company"] = "Company not specified"

    else:

        company = str(company).strip()

        if not company:
            company = "Company not specified"

        job["company"] = company

        job["companies"] = [company]

    # -----------------------------------------------------
    # MATCH SCORE
    # -----------------------------------------------------

    match_score = job.get(
        "match_score",
        0,
    )

    try:
        match_score = float(match_score)
    except (
        TypeError,
        ValueError,
    ):
        match_score = 0

    job["match_score"] = round(
        match_score,
        1,
    )

    # -----------------------------------------------------
    # MATCHED SKILLS
    # -----------------------------------------------------

    matched_skills = job.get(
        "matched_skills",
        [],
    )

    if isinstance(
        matched_skills,
        str,
    ):

        matched_skills = [
            matched_skills
        ]

    elif not isinstance(
        matched_skills,
        list,
    ):

        matched_skills = []

    job["matched_skills"] = matched_skills

    # -----------------------------------------------------
    # MISSING SKILLS
    # -----------------------------------------------------

    missing_skills = job.get(
        "missing_skills",
        [],
    )

    if isinstance(
        missing_skills,
        str,
    ):

        missing_skills = [
            missing_skills
        ]

    elif not isinstance(
        missing_skills,
        list,
    ):

        missing_skills = []

    job["missing_skills"] = missing_skills

    # -----------------------------------------------------
    # DESCRIPTION
    # -----------------------------------------------------

    description = job.get(
        "description",
        "",
    )

    if description is None:
        description = ""

    job["description"] = str(
        description
    )

    # -----------------------------------------------------
    # SALARY
    # -----------------------------------------------------

    salary = job.get(
        "salary",
        "Not Available",
    )

    if salary is None or not str(
        salary
    ).strip():

        salary = "Not Available"

    job["salary"] = salary

    # -----------------------------------------------------
    # EXPERIENCE
    # -----------------------------------------------------

    experience = job.get(
        "experience",
        "Fresher",
    )

    if experience is None or not str(
        experience
    ).strip():

        experience = "Fresher"

    job["experience"] = experience

    # -----------------------------------------------------
    # CATEGORY
    # -----------------------------------------------------

    category = job.get(
        "category",
        "Technology",
    )

    if category is None or not str(
        category
    ).strip():

        category = "Technology"

    job["category"] = category

    # -----------------------------------------------------
    # LOCATION
    # -----------------------------------------------------

    location = job.get(
        "location",
        "",
    )

    if location is None:
        location = ""

    job["location"] = str(
        location
    )

    # -----------------------------------------------------
    # APPLY URL
    # -----------------------------------------------------

    apply_url = (
        job.get("apply_url")
        or job.get("apply_link")
        or ""
    )

    if apply_url is None:
        apply_url = ""

    apply_url = str(
        apply_url
    ).strip()

    # IMPORTANT:
    # Never invent a URL.
    job["apply_url"] = apply_url

    # Frontend compatibility
    job["apply_link"] = apply_url

    return job


# =========================================================
# ANALYZE RESUME
# =========================================================

@router.post("/analyze/")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
):

    try:

        # =================================================
        # 1. VALIDATE FILE
        # =================================================

        if not resume.filename:

            raise HTTPException(
                status_code=400,
                detail="No resume file selected.",
            )

        allowed_extensions = {
            ".pdf",
        }

        extension = Path(
            resume.filename
        ).suffix.lower()

        if extension not in allowed_extensions:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Only PDF resumes are currently supported."
                ),
            )

        # =================================================
        # 2. SAVE RESUME
        # =================================================

        safe_filename = Path(
            resume.filename
        ).name

        resume_path = (
            UPLOAD_DIR / safe_filename
        )

        file_content = await resume.read()

        if not file_content:

            raise HTTPException(
                status_code=400,
                detail="Uploaded resume is empty.",
            )

        with open(
            resume_path,
            "wb",
        ) as file:

            file.write(
                file_content
            )

        print(
            "\n"
            + "=" * 70
        )

        print(
            "RESUME UPLOAD"
        )

        print(
            "=" * 70
        )

        print(
            "Filename:",
            safe_filename,
        )

        print(
            "Path:",
            resume_path,
        )

        print(
            "Size:",
            len(file_content),
            "bytes",
        )

        # =================================================
        # 3. EXTRACT PDF TEXT
        # =================================================

        resume_text = extract_text_from_pdf(
            str(resume_path)
        )

        if resume_text is None:
            resume_text = ""

        print(
            "\n"
            + "=" * 70
        )

        print(
            "RAW RESUME TEXT"
        )

        print(
            "=" * 70
        )

        print(
            resume_text
        )

        print(
            "=" * 70
        )

        print(
            "TEXT LENGTH:",
            len(resume_text),
        )

        print(
            "=" * 70
            + "\n"
        )

        # =================================================
        # VALIDATE EXTRACTED TEXT
        # =================================================

        if not resume_text.strip():

            raise HTTPException(
                status_code=400,
                detail=(
                    "Unable to extract text from resume. "
                    "Make sure the PDF contains selectable text."
                ),
            )

        # =================================================
        # 4. PARSE RESUME
        # =================================================

        parsed = parse_resume(
            resume_text
        )

        if not isinstance(
            parsed,
            dict,
        ):

            raise HTTPException(
                status_code=500,
                detail=(
                    "Resume parser returned invalid data."
                ),
            )

        # =================================================
        # 5. EXTRACT PARSED DATA
        # =================================================

        candidate = safe_dict(
            parsed.get(
                "candidate",
                {},
            )
        )

        summary = parsed.get(
            "summary",
            "",
        )

        if summary is None:
            summary = ""

        summary = str(
            summary
        )

        skills = safe_list(
            parsed.get(
                "skills",
                [],
            )
        )

        experience = safe_list(
            parsed.get(
                "experience",
                [],
            )
        )

        education = safe_list(
            parsed.get(
                "education",
                [],
            )
        )

        projects = safe_list(
            parsed.get(
                "projects",
                [],
            )
        )

        certifications = safe_list(
            parsed.get(
                "certifications",
                [],
            )
        )

        # =================================================
        # DEBUG PARSED DATA
        # =================================================

        print(
            "\n"
            + "=" * 70
        )

        print(
            "PARSED RESUME DATA"
        )

        print(
            "=" * 70
        )

        print(
            "Candidate:",
            candidate,
        )

        print(
            "Skills:",
            skills,
        )

        print(
            "Education count:",
            len(education),
        )

        print(
            "Experience count:",
            len(experience),
        )

        print(
            "Projects count:",
            len(projects),
        )

        print(
            "Certifications count:",
            len(certifications),
        )

        print(
            "=" * 70
        )

        # =================================================
        # DEBUG PARSED EXPERIENCE
        # =================================================

        print(
            "\n"
            + "=" * 70
        )

        print(
            "PARSED EXPERIENCE"
        )

        print(
            "=" * 70
        )

        if experience:

            for index, item in enumerate(
                experience,
                start=1,
            ):

                if not isinstance(
                    item,
                    dict,
                ):

                    print(
                        f"Experience {index}:",
                        item,
                    )

                    continue

                print(
                    f"\nExperience {index}"
                )

                print(
                    "Job Title:",
                    item.get(
                        "job_title",
                        "",
                    ),
                )

                print(
                    "Company:",
                    item.get(
                        "company",
                        "",
                    ),
                )

                print(
                    "Duration:",
                    item.get(
                        "duration",
                        "",
                    ),
                )

                print(
                    "Description:",
                    item.get(
                        "description",
                        [],
                    ),
                )

        else:

            print(
                "NO EXPERIENCE FOUND"
            )

        print(
            "=" * 70
        )

        # =================================================
        # DEBUG PARSED PROJECTS
        # =================================================

        print(
            "\n"
            + "=" * 70
        )

        print(
            "PARSED PROJECTS"
        )

        print(
            "=" * 70
        )

        if projects:

            for index, project in enumerate(
                projects,
                start=1,
            ):

                if not isinstance(
                    project,
                    dict,
                ):

                    print(
                        f"Project {index}:",
                        project,
                    )

                    continue

                print(
                    f"\nProject {index}"
                )

                print(
                    "Title:",
                    project.get(
                        "title",
                        project.get(
                            "project_title",
                            "",
                        ),
                    ),
                )

                print(
                    "Technologies:",
                    project.get(
                        "technologies",
                        [],
                    ),
                )

                print(
                    "Description:",
                    project.get(
                        "description",
                        [],
                    ),
                )

        else:

            print(
                "NO PROJECTS FOUND"
            )

        print(
            "=" * 70
        )

        # =================================================
        # 6. ATS SCORE
        # =================================================

        ats_result = calculate_ats_score(
            resume_text
        )

        if not isinstance(
            ats_result,
            dict,
        ):

            ats_result = {
                "ats_score": 0,
                "details": ats_result,
            }

        # =================================================
        # 7. RESUME SCORE
        # =================================================

        resume_analysis_data = {

            "candidate": candidate,

            "skills": skills,

            "education": education,

            "experience": experience,

            "projects": projects,

            "certifications": certifications,
        }

        resume_result = calculate_resume_score(
            resume_analysis_data
        )

        if not isinstance(
            resume_result,
            dict,
        ):

            resume_result = {
                "score": 0,
                "details": resume_result,
            }

        # =================================================
        # 8. JOB MATCH
        # =================================================

        job_match = calculate_job_match(
            resume_text=resume_text,
            job_description=job_description,
        )

        if not isinstance(
            job_match,
            dict,
        ):

            job_match = {
                "match_score": 0,
                "missing_skills": [],
                "details": job_match,
            }

        # =================================================
        # 9. RESUME IMPROVEMENTS
        # =================================================

        resume_improvements = (
            generate_resume_improvements(
                summary=summary,
                skills=skills,
                experience=experience,
                projects=projects,
                education=education,
                certifications=certifications,
                job_match=job_match,
            )
        )

        # =================================================
        # 10. RESUME FEEDBACK
        # =================================================

        resume_feedback = (
            generate_resume_feedback(
                ats_score=ats_result.get(
                    "ats_score",
                    0,
                ),
                resume_score=resume_result.get(
                    "score",
                    0,
                ),
                job_match=job_match.get(
                    "match_score",
                    0,
                ),
                missing_skills=job_match.get(
                    "missing_skills",
                    [],
                ),
            )
        )

        # =========================================================
        # 11. JOB RECOMMENDATIONS
        # =========================================================

        print(
            "\n"
            + "=" * 70
        )

        print(
            "GENERATING JOB RECOMMENDATIONS"
        )

        print(
            "=" * 70
        )

        job_recommendation_result = (
            generate_job_recommendations(
                skills=skills,
                candidate=candidate,
                summary=summary,
                education=education,
                experience=experience,
                projects=projects,
                certifications=certifications,
            )
        )

        # ---------------------------------------------------------
        # IMPORTANT
        #
        # generate_job_recommendations() normally returns:
        #
        # {
        #     "recommended_jobs": [...],
        #     "learning_path": [...],
        #     "recommended_certifications": [...],
        #     "learning_resources": [...]
        # }
        #
        # Keep this COMPLETE dictionary because the career
        # roadmap may use .get("recommended_jobs").
        # ---------------------------------------------------------

        if isinstance(
            job_recommendation_result,
            dict,
        ):

            recommendation_data = (
                job_recommendation_result
            )

        elif isinstance(
            job_recommendation_result,
            list,
        ):

            # Backward compatibility.
            #
            # Convert the list into the same structured format
            # expected by the rest of the application.

            recommendation_data = {

                "recommended_jobs":
                    job_recommendation_result,

                "learning_path":
                    [],

                "recommended_certifications":
                    [],

                "learning_resources":
                    [],
            }

        else:

            recommendation_data = {

                "recommended_jobs":
                    [],

                "learning_path":
                    [],

                "recommended_certifications":
                    [],

                "learning_resources":
                    [],
            }

        # ---------------------------------------------------------
        # EXTRACT JOB LIST
        # ---------------------------------------------------------

        recommended_jobs = recommendation_data.get(
            "recommended_jobs",
            [],
        )

        if not isinstance(
            recommended_jobs,
            list,
        ):

            recommended_jobs = []

        # ---------------------------------------------------------
        # LEARNING DATA
        # ---------------------------------------------------------

        learning_path = recommendation_data.get(
            "learning_path",
            [],
        )

        if not isinstance(
            learning_path,
            list,
        ):

            learning_path = []

        recommended_certifications = (
            recommendation_data.get(
                "recommended_certifications",
                [],
            )
        )

        if not isinstance(
            recommended_certifications,
            list,
        ):

            recommended_certifications = []

        learning_resources = (
            recommendation_data.get(
                "learning_resources",
                [],
            )
        )

        if not isinstance(
            learning_resources,
            list,
        ):

            learning_resources = []

        # ---------------------------------------------------------
        # NORMALIZE JOBS
        # ---------------------------------------------------------

        normalized_jobs = []

        for job in recommended_jobs:

            normalized_job = normalize_job(
                job
            )

            if normalized_job is not None:

                normalized_jobs.append(
                    normalized_job
                )

        recommended_jobs = (
            normalized_jobs
        )

        # ---------------------------------------------------------
        # KEEP recommendation_data IN SYNC
        # ---------------------------------------------------------

        recommendation_data[
            "recommended_jobs"
        ] = recommended_jobs

        recommendation_data[
            "learning_path"
        ] = learning_path

        recommendation_data[
            "recommended_certifications"
        ] = recommended_certifications

        recommendation_data[
            "learning_resources"
        ] = learning_resources

        # ---------------------------------------------------------
        # DEBUG JOB RECOMMENDATIONS
        # ---------------------------------------------------------

        print(
            "\n"
            + "=" * 70
        )

        print(
            "JOB RECOMMENDATIONS"
        )

        print(
            "=" * 70
        )

        print(
            "Recommended jobs:",
            len(recommended_jobs),
        )

        for index, job in enumerate(
            recommended_jobs,
            start=1,
        ):

            print(
                f"\nJob {index}"
            )

            print(
                "Role:",
                job.get(
                    "job_role",
                    "",
                ),
            )

            print(
                "Company:",
                job.get(
                    "company",
                    "",
                ),
            )

            print(
                "Match:",
                job.get(
                    "match_score",
                    0,
                ),
                "%",
            )

            print(
                "Matched skills:",
                job.get(
                    "matched_skills",
                    [],
                ),
            )

            print(
                "Missing skills:",
                job.get(
                    "missing_skills",
                    [],
                ),
            )

            print(
                "Apply URL:",
                job.get(
                    "apply_url",
                    "",
                ),
            )

        print(
            "=" * 70
        )

        # =================================================
        # 12. CAREER ROADMAP
        # =================================================

        print(
            "\n"
            + "=" * 70
        )

        print(
            "GENERATING CAREER ROADMAP"
        )

        print(
            "=" * 70
        )

        # IMPORTANT FIX:
        #
        # Do NOT pass recommended_jobs here.
        #
        # recommended_jobs is a LIST.
        #
        # recommendation_data is the STRUCTURED DICTIONARY.
        #
        # This prevents:
        #
        # AttributeError:
        # 'list' object has no attribute 'get'
        #
        # if career_roadmap.py uses:
        #
        # recommended_jobs.get(...)
        #

        roadmap = generate_career_roadmap(
            skills=skills,
            experience=experience,
            recommended_jobs=recommendation_data,
        )

        # =================================================
        # 13. INTERVIEW QUESTIONS
        # =================================================

        interview_questions = (
            generate_interview_questions(
                skills=skills,
                projects=projects,
            )
        )

        # =================================================
        # 14. COVER LETTER
        # =================================================

        cover_letter = generate_cover_letter(
            candidate=candidate,
            skills=skills,
            experience=experience,
            projects=projects,
            education=education,
            job_description=job_description,
        )

        # =================================================
        # 15. BUILD RESPONSE
        # =================================================

        response = {

            "candidate":
                candidate,

            "summary":
                summary,

            "skills":
                skills,

            "education":
                education,

            "experience":
                experience,

            "projects":
                projects,

            "certifications":
                certifications,

            "job_description":
                job_description,

            "ats_score":
                ats_result,

            "resume_score":
                resume_result,

            "job_match":
                job_match,

            "resume_improvements":
                resume_improvements,

            "resume_feedback":
                resume_feedback,

            # IMPORTANT:
            # Frontend receives ONLY the actual list.

            "recommended_jobs":
                recommended_jobs,

            "learning_path":
                learning_path,

            "recommended_certifications":
                recommended_certifications,

            "learning_resources":
                learning_resources,

            "career_roadmap":
                roadmap,

            "interview_questions":
                interview_questions,

            "cover_letter":
                cover_letter,

            "pdf_report":
                "",
        }

        # =========================================================
        # 16. GENERATE PDF REPORT
        # =========================================================

        pdf_path = (
            UPLOAD_DIR
            / "resume_analysis_report.pdf"
        )

        try:

            print(
                "\n"
                + "=" * 70
            )

            print(
                "GENERATING PDF REPORT"
            )

            print(
                "=" * 70
            )

            print(
                "PDF output path:"
            )

            print(
                pdf_path
            )

            generate_pdf_report(
                output_path=str(
                    pdf_path
                ),
                analysis=response,
            )

            # -------------------------------------------------
            # VERIFY PDF
            # -------------------------------------------------

            if not pdf_path.exists():

                raise RuntimeError(
                    "PDF generator completed "
                    "but file was not created: "
                    f"{pdf_path}"
                )

            if pdf_path.stat().st_size == 0:

                raise RuntimeError(
                    "PDF file was created "
                    "but it is empty."
                )

            print(
                "PDF GENERATED SUCCESSFULLY"
            )

            print(
                "PDF path:",
                pdf_path,
            )

            print(
                "PDF size:",
                pdf_path.stat().st_size,
                "bytes",
            )

            response[
                "pdf_report"
            ] = "/api/report"

        except Exception as pdf_error:

            print(
                "\n"
                + "=" * 70
            )

            print(
                "PDF GENERATION ERROR"
            )

            print(
                "=" * 70
            )

            print(
                "Error type:",
                type(
                    pdf_error
                ).__name__,
            )

            print(
                "Error:",
                str(
                    pdf_error
                ),
            )

            print(
                "Expected PDF path:",
                pdf_path,
            )

            traceback.print_exc()

            print(
                "=" * 70
                + "\n"
            )

            # PDF failure should NOT destroy
            # the complete resume analysis.

            response[
                "pdf_report"
            ] = ""

        # =================================================
        # 17. FINAL DEBUG
        # =================================================

        print(
            "\n"
            + "=" * 70
        )

        print(
            "FINAL API RESPONSE SUMMARY"
        )

        print(
            "=" * 70
        )

        print(
            "Candidate:",
            bool(candidate),
        )

        print(
            "Skills:",
            len(skills),
        )

        print(
            "Experience:",
            len(experience),
        )

        print(
            "Projects:",
            len(projects),
        )

        print(
            "Education:",
            len(education),
        )

        print(
            "Certifications:",
            len(certifications),
        )

        print(
            "ATS:",
            ats_result,
        )

        print(
            "Job Match:",
            job_match,
        )

        print(
            "Recommended Jobs:",
            len(
                recommended_jobs
            ),
        )

        print(
            "Learning Path:",
            len(
                learning_path
            ),
        )

        print(
            "Recommended Certifications:",
            len(
                recommended_certifications
            ),
        )

        print(
            "Learning Resources:",
            len(
                learning_resources
            ),
        )

        print(
            "PDF:",
            response.get(
                "pdf_report",
                "",
            ),
        )

        print(
            "=" * 70
            + "\n"
        )

        # =================================================
        # 18. RETURN
        # =================================================

        return response

    # =====================================================
    # HTTP EXCEPTION
    # =====================================================

    except HTTPException:

        raise

    # =====================================================
    # UNEXPECTED ERROR
    # =====================================================

    except Exception as error:

        print(
            "\n"
            + "=" * 70
        )

        print(
            "ANALYZE ERROR"
        )

        print(
            "=" * 70
        )

        print(
            "Error type:",
            type(
                error
            ).__name__,
        )

        print(
            "Error:",
            str(
                error
            ),
        )

        print(
            "FULL TRACEBACK:"
        )

        traceback.print_exc()

        print(
            "=" * 70
            + "\n"
        )

        raise HTTPException(
            status_code=500,
            detail=str(
                error
            ),
        )