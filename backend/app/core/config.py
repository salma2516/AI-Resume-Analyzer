from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "AI Resume Analyzer"
    APP_VERSION: str = "1.0.0"

    HOST: str = "127.0.0.1"
    PORT: int = 8000

    DATABASE_URL: str = "sqlite:///./resume_analyzer.db"

    SECRET_KEY: str = "CHANGE_THIS_TO_A_RANDOM_SECRET_KEY"
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"


settings = Settings()