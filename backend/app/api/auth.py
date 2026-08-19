import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from google.oauth2 import id_token
from google.auth.transport import requests

from app.database.database import get_db
from app.database.models import User


# =========================================================
# LOAD BACKEND .ENV
# =========================================================

# auth.py:
# backend/app/api/auth.py
#
# parents[0] = api
# parents[1] = app
# parents[2] = backend

BASE_DIR = Path(__file__).resolve().parents[2]

ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


# =========================================================
# GOOGLE CLIENT ID
# =========================================================

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


print("\n" + "=" * 60)
print("GOOGLE AUTHENTICATION CONFIGURATION")
print("=" * 60)

print("Backend .env path:")
print(ENV_FILE)

print("Backend .env exists:")
print(ENV_FILE.exists())

print("Google Client ID loaded:")
print(bool(GOOGLE_CLIENT_ID))

if GOOGLE_CLIENT_ID:
    print(
        "Google Client ID:",
        GOOGLE_CLIENT_ID[:20] + "..."
    )
else:
    print(
        "WARNING: GOOGLE_CLIENT_ID is NOT configured."
    )

print("=" * 60 + "\n")


# =========================================================
# REQUEST SCHEMA
# =========================================================

class GoogleLoginRequest(BaseModel):
    credential: str


# =========================================================
# GOOGLE LOGIN
# =========================================================

@router.post("/google")
def google_login(
    request_data: GoogleLoginRequest,
    db: Session = Depends(get_db),
):
    """
    Verify Google ID token and create/find the user.
    """

    # =====================================================
    # GET CREDENTIAL
    # =====================================================

    credential = request_data.credential

    if not credential:
        raise HTTPException(
            status_code=400,
            detail="Google credential is required.",
        )

    # =====================================================
    # CHECK GOOGLE CLIENT ID
    # =====================================================

    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail=(
                "GOOGLE_CLIENT_ID is not configured "
                "on the backend."
            ),
        )

    try:

        # =================================================
        # VERIFY GOOGLE ID TOKEN
        # =================================================

        print("\n" + "-" * 60)
        print("GOOGLE LOGIN REQUEST")
        print("-" * 60)

        print("Received Google credential.")
        print("Verifying Google ID token...")

        idinfo = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            GOOGLE_CLIENT_ID,
        )

        print("Google token verified successfully.")

        # =================================================
        # VERIFY TOKEN ISSUER
        # =================================================

        issuer = idinfo.get("iss")

        print("Token issuer:", issuer)

        if issuer not in (
            "accounts.google.com",
            "https://accounts.google.com",
        ):
            raise ValueError(
                "Invalid Google token issuer."
            )

        # =================================================
        # VERIFY AUDIENCE
        # =================================================

        audience = idinfo.get("aud")

        print("Token audience matches configured client:")
        print(audience == GOOGLE_CLIENT_ID)

        if audience != GOOGLE_CLIENT_ID:
            raise ValueError(
                "Google token audience does not match "
                "the configured Google Client ID."
            )

        # =================================================
        # GET GOOGLE USER INFORMATION
        # =================================================

        google_id = idinfo.get("sub")
        email = idinfo.get("email")
        name = idinfo.get("name")
        picture = idinfo.get("picture")

        email_verified = idinfo.get(
            "email_verified",
            False,
        )

        print("Google ID received:", bool(google_id))
        print("Email received:", bool(email))
        print("Name received:", bool(name))
        print("Email verified:", email_verified)

        # =================================================
        # VALIDATE USER INFORMATION
        # =================================================

        if not google_id:
            raise ValueError(
                "Google ID is missing."
            )

        if not email:
            raise ValueError(
                "Google email is missing."
            )

        if not email_verified:
            raise ValueError(
                "Google email is not verified."
            )

        # =================================================
        # FIND USER BY GOOGLE ID
        # =================================================

        user = (
            db.query(User)
            .filter(
                User.google_id == google_id
            )
            .first()
        )

        # =================================================
        # EXISTING GOOGLE USER
        # =================================================

        if user:

            print(
                "Existing Google user found:",
                email,
            )

            user.name = (
                name or user.name
            )

            user.email = email

            user.profile_picture = picture

            user.last_login = datetime.utcnow()

        # =================================================
        # NEW GOOGLE USER
        # =================================================

        else:

            print(
                "Google ID not found. "
                "Checking email..."
            )

            # -------------------------------------------------
            # CHECK EXISTING EMAIL
            # -------------------------------------------------

            existing_email_user = (
                db.query(User)
                .filter(
                    User.email == email
                )
                .first()
            )

            # -------------------------------------------------
            # EXISTING EMAIL USER
            # -------------------------------------------------

            if existing_email_user:

                print(
                    "Existing email user found."
                )

                user = existing_email_user

                user.google_id = google_id

                user.name = (
                    name or user.name
                )

                user.profile_picture = picture

                user.last_login = datetime.utcnow()

            # -------------------------------------------------
            # CREATE NEW USER
            # -------------------------------------------------

            else:

                print(
                    "Creating new Google user..."
                )

                user = User(
                    google_id=google_id,
                    name=name or "Google User",
                    email=email,
                    profile_picture=picture,
                    created_at=datetime.utcnow(),
                    last_login=datetime.utcnow(),
                )

                db.add(user)

        # =====================================================
        # SAVE USER
        # =====================================================

        db.commit()

        db.refresh(user)

        print(
            "User authentication completed successfully."
        )

        print(
            "User ID:",
            user.id,
        )

        print(
            "User email:",
            user.email,
        )

        print("-" * 60 + "\n")

        # =====================================================
        # SUCCESS RESPONSE
        # =====================================================

        return {
            "success": True,
            "message": "Google authentication successful.",
            "user": {
                "id": user.id,
                "google_id": user.google_id,
                "name": user.name,
                "email": user.email,
                "profile_picture": user.profile_picture,
            },
        }

    # =========================================================
    # GOOGLE TOKEN ERROR
    # =========================================================

    except ValueError as error:

        print("\n" + "!" * 60)
        print("GOOGLE TOKEN VERIFICATION FAILED")
        print("!" * 60)
        print("Error:", str(error))
        print("!" * 60 + "\n")

        db.rollback()

        raise HTTPException(
            status_code=401,
            detail=(
                "Google authentication failed. "
                "The Google credential is invalid, "
                "expired, or does not match the configured "
                "Google Client ID."
            ),
        )

    # =========================================================
    # DATABASE / SERVER ERROR
    # =========================================================

    except Exception as error:

        print("\n" + "!" * 60)
        print("GOOGLE AUTHENTICATION SERVER ERROR")
        print("!" * 60)
        print("Error:", str(error))
        print("!" * 60 + "\n")

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Google authentication failed "
                "on the server."
            ),
        )