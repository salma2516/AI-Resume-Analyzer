from datetime import datetime

from pydantic import BaseModel


class ResumeAnalysisBase(BaseModel):

    candidate_name: str

    email: str

    phone: str

    ats_score: float

    resume_score: float

    job_match_score: float

    pdf_report: str


class ResumeAnalysisCreate(
    ResumeAnalysisBase
):
    pass


class ResumeAnalysisResponse(
    ResumeAnalysisBase
):

    id: int

    uploaded_at: datetime

    class Config:
        from_attributes = True