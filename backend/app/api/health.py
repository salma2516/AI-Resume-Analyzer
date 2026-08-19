from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "status": "success",
        "message": "AI Resume Analyzer Backend is running"
    }