import os
import smtplib
from email.message import EmailMessage
from html import escape

try:
    from email_validator import validate_email, EmailNotValidError
except ImportError:
    validate_email = None
    EmailNotValidError = Exception


def send_application_confirmation(
    candidate_email,
    candidate_name,
    job_role,
    company,
    location="",
    match_score=0,
    apply_url="",
):
    """
    Sends a professional application-tracking confirmation.

    Important:
    This confirms that the application was marked as Applied
    inside the AI Resume Analyzer. It does NOT claim that the
    employer received the application.
    """

    if not candidate_email or not str(candidate_email).strip():
        return {
            "sent": False,
            "reason": "Candidate email is missing.",
        }

    # Normalize the recipient. The application router should pass
    # the email obtained from the authenticated Google account.
    candidate_email = str(candidate_email).strip().lower()

    # Validate the destination before opening an SMTP connection.
    if validate_email is not None:
        try:
            validated = validate_email(candidate_email, check_deliverability=False)
            candidate_email = validated.normalized
        except EmailNotValidError:
            return {
                "sent": False,
                "reason": "Candidate email address is invalid.",
            }

    host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()

    try:
        port = int(os.getenv("SMTP_PORT", "587"))
    except ValueError:
        port = 587

    username = os.getenv("SMTP_USERNAME", "").strip()
    password = os.getenv("SMTP_PASSWORD", "").strip()

    sender_name = os.getenv(
        "SMTP_SENDER_NAME",
        "AI Resume Analyzer",
    ).strip() or "AI Resume Analyzer"

    if not username or not password:
        return {
            "sent": False,
            "reason": "SMTP is not configured.",
        }

    # ---------------------------------------------------------
    # Clean values
    # ---------------------------------------------------------

    candidate_name = (
        candidate_name.strip()
        if candidate_name
        else "Candidate"
    )

    job_role = job_role.strip()
    company = company.strip()

    location = (
        location.strip()
        if location
        else "Not specified"
    )

    try:
        match_score = float(match_score)
    except (TypeError, ValueError):
        match_score = 0

    # Keep score between 0 and 100
    match_score = max(0, min(100, match_score))

    apply_url = apply_url.strip() if apply_url else ""

    # ---------------------------------------------------------
    # Subject
    # ---------------------------------------------------------

    subject = (
        f"Application Tracked — {job_role} at {company}"
    )

    # ---------------------------------------------------------
    # Plain-text email
    # ---------------------------------------------------------

    text_body = f"""
Hello {candidate_name},

Your job application has been successfully recorded in
AI Resume Analyzer.

APPLICATION DETAILS
-------------------

Position:
{job_role}

Company:
{company}

Location:
{location}

Resume Match:
{match_score:.0f}%

Application Link:
{apply_url or "Not available"}

APPLICATION STATUS
------------------

Status: Marked as Applied

This email confirms that you marked this opportunity as
"Applied" inside the AI Resume Analyzer.

Please note that this does NOT confirm that the employer
received, reviewed, or accepted your application.

For the actual submission status, please check the employer's
career portal or the job application website.

Good luck with your application!

Regards,
AI Resume Analyzer

AI-powered resume analysis and career assistant
"""

    # ---------------------------------------------------------
    # HTML email
    # ---------------------------------------------------------

    safe_name = escape(candidate_name)
    safe_role = escape(job_role)
    safe_company = escape(company)
    safe_location = escape(location)
    safe_score = f"{match_score:.0f}"

    if apply_url:
        safe_url = escape(apply_url, quote=True)

        application_link = f"""
        <a href="{safe_url}"
           style="
             display:inline-block;
             padding:12px 22px;
             background:#2563eb;
             color:#ffffff;
             text-decoration:none;
             border-radius:8px;
             font-weight:600;
           ">
            View Application
        </a>
        """
    else:
        application_link = """
        <span style="color:#6b7280;">
            Application link not available
        </span>
        """

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Application Tracked</title>
</head>

<body style="
    margin:0;
    padding:0;
    background:#f3f4f6;
    font-family:Arial,Helvetica,sans-serif;
    color:#111827;
">

<div style="
    max-width:650px;
    margin:30px auto;
    background:#ffffff;
    border-radius:14px;
    overflow:hidden;
    box-shadow:0 4px 20px rgba(0,0,0,0.08);
">

    <!-- Header -->

    <div style="
        background:linear-gradient(
            135deg,
            #2563eb,
            #7c3aed
        );
        padding:30px;
        color:#ffffff;
    ">

        <h1 style="
            margin:0;
            font-size:24px;
        ">
            AI Resume Analyzer
        </h1>

        <p style="
            margin:8px 0 0;
            opacity:0.9;
        ">
            Application Tracking Confirmation
        </p>

    </div>


    <!-- Content -->

    <div style="padding:32px;">

        <h2 style="
            margin-top:0;
            color:#111827;
        ">
            Application Successfully Tracked
        </h2>

        <p>
            Hello <strong>{safe_name}</strong>,
        </p>

        <p style="line-height:1.6;">
            Your application has been successfully recorded
            in <strong>AI Resume Analyzer</strong>.
        </p>


        <!-- Job Details -->

        <div style="
            margin:25px 0;
            padding:22px;
            background:#f8fafc;
            border:1px solid #e5e7eb;
            border-radius:10px;
        ">

            <h3 style="
                margin-top:0;
                color:#2563eb;
            ">
                Application Details
            </h3>

            <p>
                <strong>Position</strong><br>
                {safe_role}
            </p>

            <p>
                <strong>Company</strong><br>
                {safe_company}
            </p>

            <p>
                <strong>Location</strong><br>
                {safe_location}
            </p>

            <p>
                <strong>Resume Match</strong><br>

                <span style="
                    display:inline-block;
                    margin-top:6px;
                    padding:6px 12px;
                    background:#dcfce7;
                    color:#166534;
                    border-radius:20px;
                    font-weight:bold;
                ">
                    {safe_score}% Match
                </span>
            </p>

        </div>


        <!-- Status -->

        <div style="
            margin:25px 0;
            padding:18px;
            background:#eff6ff;
            border-left:4px solid #2563eb;
            border-radius:6px;
        ">

            <strong>Application Status</strong>

            <p style="
                margin-bottom:0;
                color:#1d4ed8;
                font-weight:600;
            ">
                ✓ Marked as Applied
            </p>

        </div>


        <!-- Application Button -->

        <div style="
            text-align:center;
            margin:30px 0;
        ">

            {application_link}

        </div>


        <!-- Important -->

        <div style="
            margin-top:30px;
            padding:18px;
            background:#fff7ed;
            border:1px solid #fed7aa;
            border-radius:8px;
            color:#9a3412;
        ">

            <strong>Important</strong>

            <p style="
                margin-bottom:0;
                line-height:1.6;
            ">
                This email confirms that the opportunity was
                marked as <strong>Applied</strong> inside the
                AI Resume Analyzer.
                It does <strong>not</strong> confirm that the
                employer received, reviewed, or accepted the
                application.
            </p>

        </div>


        <p style="
            margin-top:30px;
            line-height:1.6;
        ">
            Please verify the actual submission status on the
            employer's career portal or job application website.
        </p>

        <p style="margin-top:30px;">
            Good luck with your application! 🚀
        </p>

        <p>
            Regards,<br>
            <strong>AI Resume Analyzer</strong>
        </p>

    </div>


    <!-- Footer -->

    <div style="
        padding:20px;
        background:#f9fafb;
        border-top:1px solid #e5e7eb;
        text-align:center;
        color:#6b7280;
        font-size:12px;
    ">

        AI-powered Resume Analysis & Career Assistant

    </div>

</div>

</body>
</html>
"""

    # ---------------------------------------------------------
    # Create email
    # ---------------------------------------------------------

    message = EmailMessage()

    message["Subject"] = subject
    message["From"] = f"{sender_name} <{username}>"
    message["To"] = candidate_email
    message["Reply-To"] = username

    # Plain text fallback
    message.set_content(text_body)

    # HTML version
    message.add_alternative(
        html_body,
        subtype="html",
    )

    # ---------------------------------------------------------
    # Send
    # ---------------------------------------------------------

    try:
        smtp_timeout = int(
            os.getenv("SMTP_TIMEOUT", "30")
        )
    except ValueError:
        smtp_timeout = 30

    smtp_debug = (
        os.getenv("SMTP_DEBUG", "false").strip().lower()
        in {"1", "true", "yes", "on"}
    )

    try:
        print(
            f"[Email] Connecting to SMTP server "
            f"{host}:{port} as {username}"
        )

        with smtplib.SMTP(
            host,
            port,
            timeout=smtp_timeout,
        ) as server:

            if smtp_debug:
                server.set_debuglevel(1)

            server.ehlo()

            # Gmail SMTP on port 587 requires STARTTLS.
            server.starttls()
            server.ehlo()

            server.login(
                username,
                password,
            )

            refused = server.send_message(message)

        # send_message() returns a dictionary of refused recipients.
        if refused:
            print(
                f"[Email] SMTP refused recipient(s): {refused}"
            )
            return {
                "sent": False,
                "reason": (
                    "SMTP server refused the recipient: "
                    f"{refused}"
                ),
            }

        print(
            f"[Email] Application confirmation sent "
            f"to {candidate_email}"
        )

        return {
            "sent": True,
            "reason": "Confirmation email sent successfully.",
            "recipient": candidate_email,
        }

    except smtplib.SMTPAuthenticationError as error:

        print("[Email] SMTP authentication failed.")

        return {
            "sent": False,
            "reason": (
                "SMTP authentication failed. "
                "Check SMTP_USERNAME and make sure "
                "SMTP_PASSWORD is a valid Google App Password."
            ),
        }

    except smtplib.SMTPException as error:

        print(
            "[Email] SMTP error:",
            error,
        )

        return {
            "sent": False,
            "reason": f"SMTP error: {error}",
        }

    except Exception as error:

        print(
            "[Email] Confirmation failed:",
            error,
        )

        return {
            "sent": False,
            "reason": str(error),
        }