from pathlib import Path
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse


# =========================================================
# PATH CONFIGURATION
# =========================================================

# backend/
# ├── .env
# └── app/
#     └── main.py

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR.parent
ENV_FILE = BACKEND_DIR / ".env"


# =========================================================
# LOAD ENVIRONMENT VARIABLES
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
    print("Run: pip install python-dotenv")
    print("=" * 70)


# =========================================================
# API ROUTERS
# =========================================================

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
    models.Base.metadata.create_all(bind=engine)

    print("=" * 70)
    print("DATABASE")
    print("=" * 70)
    print("Database tables initialized successfully.")
    print("=" * 70)

except Exception as database_error:

    print("=" * 70)
    print("DATABASE INITIALIZATION ERROR")
    print("=" * 70)

    print("Error type:")
    print(type(database_error).__name__)

    print("Error:")
    print(str(database_error))

    print("=" * 70)


# =========================================================
# CREATE FASTAPI APP
# =========================================================

app = FastAPI(
    title="AI Resume Analyzer API",
    version="1.0.0",
    description="AI-powered Resume Analysis and Job Matching API",
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

# Render frontend:
# https://ai-resume-analyzer-frontend-gikb.onrender.com

frontend_url = os.getenv("FRONTEND_URL")

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    # Production frontend
    "https://ai-resume-analyzer-frontend-gikb.onrender.com",
]

# Add FRONTEND_URL from Render if available
if frontend_url:
    frontend_url = frontend_url.strip().rstrip("/")

    if frontend_url not in allowed_origins:
        allowed_origins.append(frontend_url)


# Remove duplicates
allowed_origins = list(dict.fromkeys(allowed_origins))


print("=" * 70)
print("CORS CONFIGURATION")
print("=" * 70)

for origin in allowed_origins:
    print("Allowed origin:", origin)

print("=" * 70)


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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

app.include_router(
    application_router,
    prefix="/api",
)


# =========================================================
# ROOT ENDPOINT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "AI Resume Analyzer API is Running",
        "version": app.version,
        "status": "healthy",
        "docs": "/docs",
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():
    return {
        "status": "Healthy",
        "service": "AI Resume Analyzer API",
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
            "mark_applied": "/api/applications/mark-applied",
            "list_applications": "/api/applications",
        },
    }


# =========================================================
# PDF REPORT ENDPOINT
# =========================================================

@app.get("/api/report")
async def get_report():

    print("\n" + "=" * 70)
    print("PDF REPORT REQUEST")
    print("=" * 70)

    upload_pdf = (
        UPLOAD_DIR /
        "resume_analysis_report.pdf"
    )

    report_pdf = (
        REPORT_DIR /
        "resume_analysis_report.pdf"
    )

    print("Checking upload PDF:")
    print(upload_pdf)
    print("Exists:", upload_pdf.exists())

    print()

    print("Checking report PDF:")
    print(report_pdf)
    print("Exists:", report_pdf.exists())

    print("=" * 70)

    # -----------------------------------------------------
    # CHECK UPLOADS
    # -----------------------------------------------------

    if upload_pdf.exists():

        print("PDF FOUND IN UPLOADS FOLDER")
        print("=" * 70)

        return FileResponse(
            path=str(upload_pdf),
            media_type="application/pdf",
            filename="resume_analysis_report.pdf",
        )

    # -----------------------------------------------------
    # CHECK REPORTS
    # -----------------------------------------------------

    if report_pdf.exists():

        print("PDF FOUND IN REPORTS FOLDER")
        print("=" * 70)

        return FileResponse(
            path=str(report_pdf),
            media_type="application/pdf",
            filename="resume_analysis_report.pdf",
        )

    # -----------------------------------------------------
    # PDF NOT FOUND
    # -----------------------------------------------------

    print("PDF NOT FOUND")
    print("=" * 70)

    raise HTTPException(
        status_code=404,
        detail=(
            "Resume analysis report has not been generated yet. "
            "Please analyze a resume first."
        ),
    )


# =========================================================
# STARTUP INFORMATION
# =========================================================

@app.on_event("startup")
async def startup_event():

    print()
    print("=" * 70)
    print("AI RESUME ANALYZER API")
    print("=" * 70)

    print("Application:", app.title)
    print("Version:", app.version)

    print()
    print("Base directory:")
    print(BASE_DIR)

    print()
    print("Backend directory:")
    print(BACKEND_DIR)

    print()
    print(".env:")
    print(ENV_FILE)

    print()
    print("Upload directory:")
    print(UPLOAD_DIR)

    print()
    print("Report directory:")
    print(REPORT_DIR)

    print()
    print("Frontend URL:")
    print(frontend_url)

    print()
    print("Important endpoints:")

    print("GET  /")
    print("GET  /health")
    print("POST /analyze/")
    print("POST /api/auth/google")
    print("POST /api/applications/mark-applied")
    print("GET  /api/applications")
    print("GET  /api/applications/health")
    print("GET  /api/report")

    print()
    print("Swagger documentation:")
    print("/docs")

    print("=" * 70)
    print("API STARTUP COMPLETE")
    print("=" * 70)
    print()