"""
Configuration - the constants that give the system form.
"""
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings - the parameters of existence."""

    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Confluence"

    # CORS - the boundaries we permit (localhost development and Docker)
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",   # Local frontend development
        "http://localhost:4000",   # Frontend in Docker
        "http://localhost:8000",   # Backend API
    ]

    # Database - the persistence of memory
    DATABASE_URL: str = "postgresql+asyncpg://confluence:confluence@db:5432/confluence"

    # Redis - the ephemeral cache
    REDIS_URL: str = "redis://redis:6379/0"

    # Data sources - the rivers we drink from (optional)
    USDA_API_KEY: str = ""
    NOAA_API_KEY: str = ""
    NASA_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
