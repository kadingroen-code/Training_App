"""
Application configuration settings
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/endurance_training"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # OAuth Providers
    GARMIN_CLIENT_ID: str = ""
    GARMIN_CLIENT_SECRET: str = ""
    STRAVA_CLIENT_ID: str = ""
    STRAVA_CLIENT_SECRET: str = ""
    
    # API Keys
    GARMIN_API_BASE_URL: str = "https://connectapi.garmin.com"
    STRAVA_API_BASE_URL: str = "https://www.strava.com/api/v3"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
