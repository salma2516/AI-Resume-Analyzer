from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
)

from datetime import datetime

from app.database.database import Base


# =========================================================
# GOOGLE AUTHENTICATED USER
# =========================================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    google_id = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    name = Column(
        String(255),
        nullable=False,
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    profile_picture = Column(
        String(1000),
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    last_login = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


# =========================================================
# RESUME ANALYSIS
# =========================================================

class ResumeAnalysis(Base):

    __tablename__ = "resume_analysis"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    candidate_name = Column(
        String
    )

    email = Column(
        String
    )

    phone = Column(
        String
    )

    ats_score = Column(
        Float
    )

    resume_score = Column(
        Float
    )

    job_match_score = Column(
        Float
    )

    pdf_report = Column(
        String
    )

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow,
    )