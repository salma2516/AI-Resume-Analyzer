from sqlalchemy.orm import Session

from app.database import models
from app.database.schemas import ResumeAnalysisCreate


# ---------------------------------------
# Create Resume Analysis
# ---------------------------------------

def create_resume_analysis(
    db: Session,
    analysis: ResumeAnalysisCreate,
):
    """
    Save a new resume analysis.
    """

    db_analysis = models.ResumeAnalysis(
        candidate_name=analysis.candidate_name,
        email=analysis.email,
        phone=analysis.phone,
        ats_score=analysis.ats_score,
        resume_score=analysis.resume_score,
        job_match_score=analysis.job_match_score,
        pdf_report=analysis.pdf_report,
    )

    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)

    return db_analysis


# ---------------------------------------
# Get All Resume Analyses
# ---------------------------------------

def get_all_resume_analyses(
    db: Session,
):
    """
    Return all stored analyses.
    """

    return (
        db.query(models.ResumeAnalysis)
        .order_by(models.ResumeAnalysis.uploaded_at.desc())
        .all()
    )


# ---------------------------------------
# Get Analysis by ID
# ---------------------------------------

def get_resume_analysis(
    db: Session,
    analysis_id: int,
):
    """
    Return a single analysis.
    """

    return (
        db.query(models.ResumeAnalysis)
        .filter(models.ResumeAnalysis.id == analysis_id)
        .first()
    )


# ---------------------------------------
# Delete Analysis
# ---------------------------------------

def delete_resume_analysis(
    db: Session,
    analysis_id: int,
):
    """
    Delete a stored analysis.
    """

    analysis = (
        db.query(models.ResumeAnalysis)
        .filter(models.ResumeAnalysis.id == analysis_id)
        .first()
    )

    if analysis:

        db.delete(analysis)
        db.commit()

        return True

    return False


# ---------------------------------------
# Update Analysis
# ---------------------------------------

def update_resume_analysis(
    db: Session,
    analysis_id: int,
    analysis: ResumeAnalysisCreate,
):
    """
    Update an existing analysis.
    """

    db_analysis = (
        db.query(models.ResumeAnalysis)
        .filter(models.ResumeAnalysis.id == analysis_id)
        .first()
    )

    if not db_analysis:
        return None

    db_analysis.candidate_name = analysis.candidate_name
    db_analysis.email = analysis.email
    db_analysis.phone = analysis.phone
    db_analysis.ats_score = analysis.ats_score
    db_analysis.resume_score = analysis.resume_score
    db_analysis.job_match_score = analysis.job_match_score
    db_analysis.pdf_report = analysis.pdf_report

    db.commit()
    db.refresh(db_analysis)

    return db_analysis