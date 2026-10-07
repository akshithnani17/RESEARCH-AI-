import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "ResearchGap AI"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = Field(default="dev_secret_key_researchgap_ai_super_secure_jwt_2025_academic_platform_token_key_change_in_prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = Field(default="sqlite:///./researchgap.db")
    
    # AI / LLM Configuration
    LLM_PROVIDER: str = Field(default="openai_compatible")  # openai_compatible or offline_heuristic
    LLM_API_KEY: str = Field(default="")
    LLM_BASE_URL: str = Field(default="https://api.openai.com/v1")
    LLM_MODEL: str = Field(default="gpt-4o-mini")
    EMBEDDING_MODEL: str = Field(default="text-embedding-3-small")
    
    # Uploads
    UPLOAD_DIR: str = Field(default="./uploads")
    MAX_FILE_SIZE_MB: int = 30
    MIN_PAPERS_REQUIRED: int = 5
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    # Research Gap Scoring Weights (Configurable)
    WEIGHT_EVIDENCE_STRENGTH: float = 0.30
    WEIGHT_CROSS_PAPER_SUPPORT: float = 0.20
    WEIGHT_NOVELTY: float = 0.20
    WEIGHT_IMPACT: float = 0.15
    WEIGHT_FEASIBILITY: float = 0.15

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
