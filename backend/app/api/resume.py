from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.parser import extract_text

from app.services.extractor import (
    extract_name,
    extract_email,
    extract_phone,
    extract_linkedin,
    extract_github,
    extract_skills,
)

from app.services.education import extract_education
from app.services.experience import extract_experience
from app.services.projects import extract_projects
from app.services.certifications import extract_certifications

from app.services.ats import calculate_ats_score
from app.services.resume_score import calculate_resume_score

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):

    # Validate file type
    if not file.filename.lower().endswith((".pdf", ".docx")):
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported."
        )

    # Extract text from resume
    text = await extract_text(file)

    # Candidate Information
    candidate = {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "linkedin": extract_linkedin(text),
        "github": extract_github(text),
    }

    # Resume Analysis
    analysis = {
        "candidate": candidate,
        "skills": extract_skills(text),
        "education": extract_education(text),
        "experience": extract_experience(text),
        "projects": extract_projects(text),
        "certifications": extract_certifications(text),
    }

    # ATS Score
    ats = calculate_ats_score(text)

    # Resume Score
    resume_score = calculate_resume_score(analysis)

    # Final Response
    return {
        **analysis,

        "ats": {
            "score": ats["ats_score"],
            "feedback": ats["feedback"]
        },

        "resume_score": resume_score,

        "characters": len(text),

        "preview": text[:1000]
    }