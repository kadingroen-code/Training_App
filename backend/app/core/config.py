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
    GARMIN_OAUTH_REDIRECT_URI: str = "http://localhost:8000/api/integrations/garmin/oauth/callback"
    GARMIN_OAUTH_AUTHORIZE_URL: str = "https://connect.garmin.com/oauthConfirm"
    GARMIN_OAUTH_TOKEN_URL: str = "https://connectapi.garmin.com/oauth-service/oauth/exchange/user/2.0"
    
    STRAVA_CLIENT_ID: str = ""
    STRAVA_CLIENT_SECRET: str = ""
    STRAVA_OAUTH_REDIRECT_URI: str = "http://localhost:8000/api/integrations/strava/oauth/callback"
    STRAVA_OAUTH_AUTHORIZE_URL: str = "https://www.strava.com/oauth/authorize"
    STRAVA_OAUTH_TOKEN_URL: str = "https://www.strava.com/oauth/token"
    STRAVA_WEBHOOK_SECRET: str = ""
    STRAVA_VERIFY_TOKEN: str = ""  # For webhook subscription verification
    
    # Token Encryption
    OAUTH_TOKEN_ENCRYPTION_KEY: str = ""  # Fernet key (32 bytes base64 encoded)
    
    # API Keys
    GARMIN_API_BASE_URL: str = "https://connectapi.garmin.com"
    STRAVA_API_BASE_URL: str = "https://www.strava.com/api/v3"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        # Allow .env file to be optional (will use defaults if not found)
        env_ignore_empty = True
        # Don't fail if .env can't be read (permission issues, etc.)
        env_file_required = False
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment"""
        return self.ENVIRONMENT.lower() == "development"


# Initialize settings, handling .env permission issues gracefully
try:
    settings = Settings()
except Exception as e:
    if "Operation not permitted" in str(e) or ".env" in str(e).lower():
        # If .env has permission issues, try without it
        import warnings
        warnings.warn(
            f"Could not read .env file: {e}. Using defaults and environment variables only.",
            UserWarning
        )
        # Create settings without .env file
        class SettingsNoEnv(Settings):
            class Config:
                env_file = None  # Don't load .env
                case_sensitive = True
        settings = SettingsNoEnv()
    else:
        raise

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
