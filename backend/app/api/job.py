from fastapi import APIRouter
from pydantic import BaseModel
from app.services.job_match import calculate_job_match

router = APIRouter(prefix="/job", tags=["Job Matching"])


class JobRequest(BaseModel):
    resume_text: str
    job_description: str


@router.post("/match")
def match_job(request: JobRequest):

    print("Resume:", request.resume_text)
    print("Job:", request.job_description)

    result = calculate_job_match(
        request.resume_text,
        request.job_description
    )

    return result