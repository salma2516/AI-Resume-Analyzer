from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse


# =========================================================
# PATH CONFIGURATION
# =========================================================

# main.py:
#
# backend/
# ├── .env
# └── app/
#     └── main.py
#
# Therefore:
# BASE_DIR = backend/app

BASE_DIR = Path(__file__).resolve().parent

# backend/
BACKEND_DIR = BASE_DIR.parent

# backend/.env
ENV_FILE = BACKEND_DIR / ".env"


# =========================================================
# ENVIRONMENT VARIABLES
# =========================================================

try:
    from dotenv import load_dotenv

    if ENV_FILE.exists():
        load_dotenv(ENV_FILE)

        print("=" * 70)
        print("ENVIRONMENT")
        print("=" * 70)
        print("Loaded .env:")
        print(ENV_FILE)
        print("=" * 70)
    else:
        print("=" * 70)
        print("WARNING: .env FILE NOT FOUND")
        print("=" * 70)
        print("Expected location:")
        print(ENV_FILE)
        print("=" * 70)

except ImportError:
    print("=" * 70)
    print("WARNING: python-dotenv is not installed.")
    print("Run:")
    print("pip install python-dotenv")
    print("=" * 70)


# =========================================================
# API ROUTERS
# =========================================================

# IMPORTANT:
# .env is loaded BEFORE these imports.
#
# This is important because:
#
# job_recommender.py
# email_service.py
#
# read environment variables when they are imported.

from app.api import analyze
from app.api import auth

from app.application_router import (
    router as application_router,
)


# =========================================================
# DATABASE
# =========================================================

from app.database.database import engine
from app.database import models


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

try:
    models.Base.metadata.create_all(
        bind=engine
    )

    print(
        "Database tables initialized successfully."
    )

except Exception as database_error:

    print("=" * 70)
    print("DATABASE INITIALIZATION ERROR")
    print("=" * 70)

    print(
        type(database_error).__name__
    )

    print(
        str(database_error)
    )

    print("=" * 70)


# =========================================================
# CREATE FASTAPI APP
# =========================================================

app = FastAPI(
    title="AI Resume Analyzer API",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# DIRECTORY CONFIGURATION
# =========================================================

# backend/app/uploads/
UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# backend/app/reports/
REPORT_DIR = BASE_DIR / "reports"

REPORT_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# =========================================================
# REGISTER RESUME ANALYSIS ROUTES
# =========================================================

app.include_router(
    analyze.router
)


# =========================================================
# REGISTER GOOGLE AUTH ROUTES
# =========================================================

app.include_router(
    auth.router
)


# =========================================================
# REGISTER APPLICATION TRACKING ROUTES
# =========================================================
#
# Final endpoints:
#
# POST /api/applications/mark-applied
# GET  /api/applications
# GET  /api/applications/{application_id}
#

app.include_router(
    application_router,
    prefix="/api",
)


# =========================================================
# PDF REPORT ENDPOINT
# =========================================================

@app.get("/api/report")
async def get_report():

    print("\n" + "=" * 70)
    print("PDF REPORT REQUEST")
    print("=" * 70)

    # -----------------------------------------------------
    # PRIMARY LOCATION
    # backend/app/uploads/resume_analysis_report.pdf
    # -----------------------------------------------------

    upload_pdf = (
        UPLOAD_DIR
        / "resume_analysis_report.pdf"
    )

    # -----------------------------------------------------
    # BACKUP LOCATION
    # backend/app/reports/resume_analysis_report.pdf
    # -----------------------------------------------------

    report_pdf = (
        REPORT_DIR
        / "resume_analysis_report.pdf"
    )

    print(
        "Checking upload PDF:"
    )

    print(upload_pdf)

    print(
        "Exists:",
        upload_pdf.exists(),
    )

    print()

    print(
        "Checking report PDF:"
    )

    print(report_pdf)

    print(
        "Exists:",
        report_pdf.exists(),
    )

    print("=" * 70)

    # -----------------------------------------------------
    # CHECK UPLOADS FOLDER
    # -----------------------------------------------------

    if upload_pdf.exists():

        print(
            "PDF FOUND IN UPLOADS FOLDER"
        )

        print(
            "=" * 70 + "\n"
        )

        return FileResponse(
            path=str(upload_pdf),
            media_type="application/pdf",
            filename="resume_analysis_report.pdf",
        )

    # -----------------------------------------------------
    # CHECK REPORTS FOLDER
    # -----------------------------------------------------

    if report_pdf.exists():

        print(
            "PDF FOUND IN REPORTS FOLDER"
        )

        print(
            "=" * 70 + "\n"
        )

        return FileResponse(
            path=str(report_pdf),
            media_type="application/pdf",
            filename="resume_analysis_report.pdf",
        )

    # -----------------------------------------------------
    # PDF NOT FOUND
    # -----------------------------------------------------

    print(
        "PDF NOT FOUND"
    )

    print(
        "=" * 70 + "\n"
    )

    raise HTTPException(
        status_code=404,
        detail=(
            "Resume analysis report has not "
            "been generated yet. "
            "Please analyze a resume first."
        ),
    )


# =========================================================
# ROOT ENDPOINT
# =========================================================

@app.get("/")
def root():

    return {
        "message": (
            "AI Resume Analyzer API is Running"
        )
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "Healthy"
    }


# =========================================================
# APPLICATION TRACKING HEALTH CHECK
# =========================================================

@app.get("/api/applications/health")
def application_health():

    return {
        "status": "Healthy",
        "service": "Application Tracking",
        "endpoints": {
            "mark_applied":
                "/api/applications/mark-applied",

            "list_applications":
                "/api/applications",

        },
    }


# =========================================================
# STARTUP INFORMATION
# =========================================================

@app.on_event("startup")
async def startup_event():

    print("\n")
    print("=" * 70)
    print("AI RESUME ANALYZER API")
    print("=" * 70)

    print(
        "Application:",
        app.title,
    )

    print(
        "Version:",
        app.version,
    )

    print(
        "Base directory:",
        BASE_DIR,
    )

    print(
        "Backend directory:",
        BACKEND_DIR,
    )

    print(
        ".env:",
        ENV_FILE,
    )

    print(
        "Upload directory:",
        UPLOAD_DIR,
    )

    print(
        "Report directory:",
        REPORT_DIR,
    )

    print()
    print("Important endpoints:")
    print(
        "POST /analyze/"
    )
    print(
        "POST /api/applications/mark-applied"
    )
    print(
        "GET  /api/applications"
    )
    print(
        "GET  /api/applications/health"
    )
    print(
        "GET  /api/report"
    )
    print(
        "GET  /health"
    )

    print("=" * 70)
    print("API STARTUP COMPLETE")
    print("=" * 70)
    print()