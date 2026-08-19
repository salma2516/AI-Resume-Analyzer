import os
import sqlite3
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google.auth.transport import requests
from google.oauth2 import id_token
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User

from app.services.email_service import (
    send_application_confirmation,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)


# =========================================================
# DATABASE PATH
# =========================================================

# application_router.py is located at:
#
# backend/
# └── app/
#     └── application_router.py
#
# Therefore:
#
# Path(__file__).resolve().parent
# =
# backend/app
#
# Database:
#
# backend/app/services/data/applications.db

APP_DIR = Path(__file__).resolve().parent

DATA_DIR = APP_DIR / "services" / "data"

DATA_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

DB_PATH = DATA_DIR / "applications.db"

# =========================================================
# APPLICATION STATUS
# =========================================================

APPLICATION_STATUSES = {
    "Applied",
    "Submitted",
    "Employer Portal",
    "Interview",
    "Rejected",
}



# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_connection() -> sqlite3.Connection:
    """
    Create a SQLite connection with Row support.
    """

    connection = sqlite3.connect(
        str(DB_PATH),
        timeout=10,
    )

    connection.row_factory = sqlite3.Row

    return connection


# =========================================================
# INITIALIZE DATABASE
# =========================================================

def initialize_database() -> None:
    """
    Create the applications table and safely migrate an existing
    applications.db to include status tracking.
    """

    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                candidate_email TEXT NOT NULL,
                candidate_name TEXT DEFAULT '',
                job_id TEXT DEFAULT '',
                job_role TEXT NOT NULL,
                company TEXT NOT NULL,
                location TEXT DEFAULT '',
                match_score REAL DEFAULT 0,
                apply_url TEXT DEFAULT '',
                source TEXT DEFAULT '',
                status TEXT DEFAULT 'Applied',
                applied_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        columns = connection.execute(
            "PRAGMA table_info(applications)"
        ).fetchall()

        column_names = {row["name"] for row in columns}

        if "status" not in column_names:
            connection.execute(
                """
                ALTER TABLE applications
                ADD COLUMN status TEXT DEFAULT 'Applied'
                """
            )

        if "updated_at" not in column_names:
            connection.execute(
                """
                ALTER TABLE applications
                ADD COLUMN updated_at TEXT
                """
            )

            connection.execute(
                """
                UPDATE applications
                SET updated_at = applied_at
                WHERE updated_at IS NULL
                """
            )

        connection.execute(
            """
            UPDATE applications
            SET status = 'Applied'
            WHERE status IS NULL
               OR TRIM(status) = ''
               OR status NOT IN (
                    'Applied',
                    'Submitted',
                    'Employer Portal',
                    'Interview',
                    'Rejected'
               )
            """
        )

        connection.execute(
            """
            UPDATE applications
            SET updated_at = COALESCE(
                updated_at,
                applied_at,
                CURRENT_TIMESTAMP
            )
            WHERE updated_at IS NULL
            """
        )

        connection.commit()


# Initialize when the module is imported.
initialize_database()


# =========================================================
# AUTHENTICATION
# =========================================================

APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
ENV_FILE = BACKEND_DIR / ".env"

load_dotenv(ENV_FILE)

GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    "",
).strip()

bearer_scheme = HTTPBearer(
    auto_error=False,
)


def get_authenticated_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db),
):
    """
    Verify the Google ID token sent by the frontend:

        Authorization: Bearer <Google ID token>

    The candidate email is taken from the verified Google
    account, never from the request body.
    """

    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please sign in with Google.",
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication scheme.",
        )

    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_CLIENT_ID is not configured.",
        )

    try:
        idinfo = id_token.verify_oauth2_token(
            credentials.credentials,
            requests.Request(),
            GOOGLE_CLIENT_ID,
        )

        if idinfo.get("iss") not in (
            "accounts.google.com",
            "https://accounts.google.com",
        ):
            raise ValueError("Invalid Google token issuer.")

        if idinfo.get("aud") != GOOGLE_CLIENT_ID:
            raise ValueError("Invalid Google token audience.")

        google_id = idinfo.get("sub")
        email = idinfo.get("email")
        email_verified = idinfo.get(
            "email_verified",
            False,
        )

        if not google_id or not email:
            raise ValueError(
                "Google user information is incomplete."
            )

        if not email_verified:
            raise ValueError(
                "Google email is not verified."
            )

    except ValueError as error:
        raise HTTPException(
            status_code=401,
            detail=f"Google authentication failed: {error}",
        )

    user = (
        db.query(User)
        .filter(User.google_id == google_id)
        .first()
    )

    if not user:
        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

    if not user:
        raise HTTPException(
            status_code=401,
            detail=(
                "Authenticated Google user was not found. "
                "Please sign in again."
            ),
        )

    return user


# =========================================================
# REQUEST MODEL
# =========================================================

class ApplicationRequest(BaseModel):


    candidate_name: str = ""

    job_id: str = ""

    job_role: str = Field(
        ...,
        min_length=1,
        max_length=300,
    )

    company: str = Field(
        ...,
        min_length=1,
        max_length=300,
    )

    location: str = ""

    match_score: float = Field(
        default=0,
        ge=0,
        le=100,
    )

    apply_url: str = ""

    source: str = ""


# =========================================================
# MARK AS APPLIED
# =========================================================

@router.post("/mark-applied")
async def mark_applied(
    payload: ApplicationRequest,
    user: User = Depends(get_authenticated_user),
):
    """
    Record a job application.

    Important:
    This endpoint records that the candidate marked the job
    as applied in AI Resume Analyzer.

    It does NOT claim that the external employer received
    the application.
    """

    # -----------------------------------------------------
    # CLEAN VALUES
    # -----------------------------------------------------

    candidate_email = str(
        user.email
    ).strip().lower()

    candidate_name = (
        payload.candidate_name or ""
    ).strip()

    job_id = (
        payload.job_id or ""
    ).strip()

    job_role = (
        payload.job_role or ""
    ).strip()

    company = (
        payload.company or ""
    ).strip()

    location = (
        payload.location or ""
    ).strip()

    apply_url = (
        payload.apply_url or ""
    ).strip()

    source = (
        payload.source or ""
    ).strip()

    match_score = float(
        payload.match_score or 0
    )

    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    if not candidate_email:

        raise HTTPException(
            status_code=400,
            detail="Candidate email is required.",
        )

    if not job_role:

        raise HTTPException(
            status_code=400,
            detail="Job role is required.",
        )

    if not company:

        raise HTTPException(
            status_code=400,
            detail="Company is required.",
        )

    if match_score < 0 or match_score > 100:

        raise HTTPException(
            status_code=400,
            detail="Match score must be between 0 and 100.",
        )

    # -----------------------------------------------------
    # CHECK DUPLICATE APPLICATION
    # -----------------------------------------------------

    try:

        with get_connection() as connection:

            existing = connection.execute(
                """
                SELECT *
                FROM applications
                WHERE LOWER(candidate_email) = ?
                  AND LOWER(job_role) = ?
                  AND LOWER(company) = ?
                ORDER BY id DESC
                LIMIT 1
                """,
                (
                    candidate_email,
                    job_role.lower(),
                    company.lower(),
                ),
            ).fetchone()

            # -------------------------------------------------
            # ALREADY TRACKED
            # -------------------------------------------------

            if existing:

                return {
                    "success": True,
                    "already_applied": True,

                    "message": (
                        "This application is already "
                        "tracked."
                    ),

                    "email": {
                        "sent": False,
                        "reason": (
                            "Application was already "
                            "tracked."
                        ),
                    },

                    "application": dict(existing),
                }

            # -------------------------------------------------
            # INSERT APPLICATION
            # -------------------------------------------------

            cursor = connection.execute(
                """
                INSERT INTO applications (

                    candidate_email,
                    candidate_name,
                    job_id,
                    job_role,
                    company,
                    location,
                    match_score,
                    apply_url,
                    source,
                    status,
                    updated_at

                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """,
                (
                    candidate_email,
                    candidate_name,
                    job_id,
                    job_role,
                    company,
                    location,
                    match_score,
                    apply_url,
                    source,
                    "Applied",
                ),
            )

            connection.commit()

            application_id = cursor.lastrowid

            # Fetch the inserted record.
            saved_application = connection.execute(
                """
                SELECT *
                FROM applications
                WHERE id = ?
                  AND LOWER(candidate_email) = ?
                """,
                (application_id, str(user.email).strip().lower()),
            ).fetchone()

    except sqlite3.Error as database_error:

        print(
            "APPLICATION DATABASE ERROR:",
            database_error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to save the application "
                "to the database."
            ),
        )

    # =====================================================
    # SEND CONFIRMATION EMAIL
    # =====================================================

    email_result = {
        "sent": False,
        "reason": "Email service was not executed.",
    }

    try:

        email_response = (
            send_application_confirmation(
                candidate_email=candidate_email,
                candidate_name=candidate_name,
                job_role=job_role,
                company=company,
                location=location,
                match_score=match_score,
                apply_url=apply_url,
            )
        )

        # Make sure the response is JSON serializable.
        if isinstance(
            email_response,
            dict,
        ):

            email_result = email_response

        else:

            email_result = {
                "sent": bool(email_response),
            }

    except Exception as email_error:

        # -------------------------------------------------
        # IMPORTANT
        # Email failure should NOT undo the application.
        # The application has already been saved.
        # -------------------------------------------------

        print(
            "APPLICATION EMAIL ERROR:",
            type(email_error).__name__,
        )

        print(
            "EMAIL ERROR:",
            str(email_error),
        )

        email_result = {
            "sent": False,
            "reason": (
                "Application was saved successfully, "
                "but the confirmation email could not "
                "be sent."
            ),
        }

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {
        "success": True,

        "already_applied": False,

        "application_id": application_id,

        "message": (
            "Application marked as applied "
            "successfully."
        ),

        "email": email_result,

        "application": (
            dict(saved_application)
            if saved_application
            else {
                "id": application_id,
                "candidate_email": candidate_email,
                "candidate_name": candidate_name,
                "job_id": job_id,
                "job_role": job_role,
                "company": company,
                "location": location,
                "match_score": match_score,
                "apply_url": apply_url,
                "source": source,
                "status": "Applied",
                "updated_at": None,
            }
        ),
    }


# =========================================================
# LIST APPLICATIONS
# =========================================================

@router.get("")
async def list_applications(
    user: User = Depends(get_authenticated_user),
):
    """
    Return all tracked applications
    for a candidate.
    """

    email = str(user.email).strip().lower()

    try:

        with get_connection() as connection:

            rows = connection.execute(
                """
                SELECT *
                FROM applications
                WHERE LOWER(candidate_email) = ?
                ORDER BY applied_at DESC, id DESC
                """,
                (email,),
            ).fetchall()

    except sqlite3.Error as database_error:

        print(
            "APPLICATION HISTORY ERROR:",
            database_error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to retrieve "
                "application history."
            ),
        )

    return {
        "success": True,

        "count": len(rows),

        "applications": [
            dict(row)
            for row in rows
        ],
    }



# =========================================================
# UPDATE APPLICATION STATUS
# =========================================================

class StatusUpdateRequest(BaseModel):
    status: str = Field(
        ...,
        min_length=1,
        max_length=50,
    )


@router.patch("/{application_id}/status")
async def update_application_status(
    application_id: int,
    payload: StatusUpdateRequest,
    user: User = Depends(get_authenticated_user),
):
    """
    Update an application status for the authenticated user.
    """

    if application_id <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid application ID.",
        )

    status = payload.status.strip()

    if status not in APPLICATION_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid application status. "
                "Allowed values: Applied, Submitted, "
                "Employer Portal, Interview, Rejected."
            ),
        )

    candidate_email = str(user.email).strip().lower()

    try:
        with get_connection() as connection:

            existing = connection.execute(
                """
                SELECT *
                FROM applications
                WHERE id = ?
                  AND LOWER(candidate_email) = ?
                """,
                (
                    application_id,
                    candidate_email,
                ),
            ).fetchone()

            if not existing:
                raise HTTPException(
                    status_code=404,
                    detail="Application not found.",
                )

            connection.execute(
                """
                UPDATE applications
                SET status = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                  AND LOWER(candidate_email) = ?
                """,
                (
                    status,
                    application_id,
                    candidate_email,
                ),
            )

            connection.commit()

            updated = connection.execute(
                """
                SELECT *
                FROM applications
                WHERE id = ?
                  AND LOWER(candidate_email) = ?
                """,
                (
                    application_id,
                    candidate_email,
                ),
            ).fetchone()

    except HTTPException:
        raise

    except sqlite3.Error as database_error:
        print(
            "APPLICATION STATUS UPDATE ERROR:",
            database_error,
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to update the application status.",
        )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Application not found.",
        )

    return {
        "success": True,
        "message": "Application status updated successfully.",
        "application": dict(updated),
    }



# =========================================================
# GET SINGLE APPLICATION
# =========================================================

@router.get("/{application_id}")
async def get_application(
    application_id: int,
    user: User = Depends(get_authenticated_user),
):
    """
    Return one tracked application.
    """

    if application_id <= 0:

        raise HTTPException(
            status_code=400,
            detail="Invalid application ID.",
        )

    try:

        with get_connection() as connection:

            row = connection.execute(
                """
                SELECT *
                FROM applications
                WHERE id = ?
                  AND LOWER(candidate_email) = ?
                """,
                (
                    application_id,
                    str(user.email).strip().lower(),
                ),
            ).fetchone()

    except sqlite3.Error as database_error:

        print(
            "APPLICATION LOOKUP ERROR:",
            database_error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to retrieve "
                "the application."
            ),
        )

    if not row:

        raise HTTPException(
            status_code=404,
            detail="Application not found.",
        )

    return {
        "success": True,
        "application": dict(row),
    }