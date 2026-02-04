"""
Application configuration settings
"""

import os
import warnings
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"  # development, staging, production
    
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
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment"""
        return self.ENVIRONMENT.lower() == "development"


settings = Settings()

# Production security warnings
if settings.is_production:
    if settings.SECRET_KEY == "your-secret-key-change-in-production" or len(settings.SECRET_KEY) < 32:
        warnings.warn(
            "SECURITY WARNING: SECRET_KEY is using default or weak value. "
            "Change it to a strong random string in production!",
            UserWarning
        )
    
    if "localhost" in str(settings.CORS_ORIGINS):
        warnings.warn(
            "SECURITY WARNING: CORS_ORIGINS contains localhost. "
            "This should not be used in production!",
            UserWarning
        )
    
    if not settings.DATABASE_URL or "localhost" in settings.DATABASE_URL:
        warnings.warn(
            "SECURITY WARNING: DATABASE_URL appears to be pointing to localhost. "
            "Use production database in production environment!",
            UserWarning
        )
