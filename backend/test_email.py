from app.services.email_service import send_application_confirmation

result = send_application_confirmation(
    candidate_email="YOUR_EMAIL@gmail.com",
    candidate_name="Test User",
    job_role="Python Developer",
    company="Test Company",
    location="Bengaluru",
    match_score=85,
    apply_url="https://example.com",
)

print("\nEMAIL RESULT:")
print(result)