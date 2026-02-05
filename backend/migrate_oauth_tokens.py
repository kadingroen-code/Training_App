"""
Migration script to move OAuth tokens from User.oauthTokens JSON field
to the new OAuthToken table with encryption.

Run this script after deploying the new schema:
    python migrate_oauth_tokens.py
"""

import sys
import os
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.oauth_token import OAuthToken
from app.services.token_encryption import encrypt_token
from app.core.config import settings


def migrate_tokens():
    """Migrate tokens from User.oauthTokens to OAuthToken table"""
    db = SessionLocal()
    
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        
        # Get all users with OAuth tokens
        users = db.query(User).all()
        
        migrated_count = 0
        error_count = 0
        
        for user in users:
            oauth_tokens = user.oauth_tokens or {}
            
            if not oauth_tokens or not isinstance(oauth_tokens, dict):
                continue
            
            # Migrate Garmin tokens
            if "garmin" in oauth_tokens:
                garmin_data = oauth_tokens["garmin"]
                try:
                    # Check if token already exists
                    existing = db.query(OAuthToken).filter(
                        OAuthToken.user_id == user.id,
                        OAuthToken.provider == "garmin"
                    ).first()
                    
                    if not existing:
                        # Calculate expiration (Garmin tokens expire in 90 days)
                        expires_at = datetime.utcnow() + timedelta(days=90)
                        refresh_at = expires_at - timedelta(minutes=5)
                        
                        new_token = OAuthToken(
                            user_id=user.id,
                            provider="garmin",
                            provider_user_id=garmin_data.get("user_id") or garmin_data.get("userId"),
                            access_token=encrypt_token(garmin_data.get("access_token", "")),
                            refresh_token=encrypt_token(garmin_data.get("refresh_token", "")) if garmin_data.get("refresh_token") else None,
                            token_type=garmin_data.get("token_type", "Bearer"),
                            expires_at=expires_at,
                            refresh_at=refresh_at,
                            scopes=garmin_data.get("scopes", []),
                            status="active"
                        )
                        db.add(new_token)
                        migrated_count += 1
                        print(f"Migrated Garmin token for user {user.id}")
                except Exception as e:
                    print(f"Error migrating Garmin token for user {user.id}: {str(e)}")
                    error_count += 1
            
            # Migrate Strava tokens
            if "strava" in oauth_tokens:
                strava_data = oauth_tokens["strava"]
                try:
                    existing = db.query(OAuthToken).filter(
                        OAuthToken.user_id == user.id,
                        OAuthToken.provider == "strava"
                    ).first()
                    
                    if not existing:
                        # Strava tokens expire in 6 hours
                        expires_at = datetime.utcnow() + timedelta(hours=6)
                        refresh_at = expires_at - timedelta(minutes=5)
                        
                        new_token = OAuthToken(
                            user_id=user.id,
                            provider="strava",
                            provider_user_id=strava_data.get("athlete_id") or strava_data.get("userId"),
                            access_token=encrypt_token(strava_data.get("access_token", "")),
                            refresh_token=encrypt_token(strava_data.get("refresh_token", "")) if strava_data.get("refresh_token") else None,
                            token_type=strava_data.get("token_type", "Bearer"),
                            expires_at=expires_at,
                            refresh_at=refresh_at,
                            scopes=strava_data.get("scopes", []),
                            status="active"
                        )
                        db.add(new_token)
                        migrated_count += 1
                        print(f"Migrated Strava token for user {user.id}")
                except Exception as e:
                    print(f"Error migrating Strava token for user {user.id}: {str(e)}")
                    error_count += 1
        
        db.commit()
        print(f"\nMigration complete!")
        print(f"Migrated tokens: {migrated_count}")
        print(f"Errors: {error_count}")
        print(f"\nNote: Old tokens in User.oauthTokens are preserved but deprecated.")
        print(f"After verifying migration, you can remove the oauthTokens field from User model.")
        
    except Exception as e:
        db.rollback()
        print(f"Migration failed: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Starting OAuth token migration...")
    print(f"Environment: {settings.ENVIRONMENT}")
    
    if settings.is_production:
        response = input("You are in production. Are you sure you want to continue? (yes/no): ")
        if response.lower() != "yes":
            print("Migration cancelled.")
            sys.exit(0)
    
    migrate_tokens()
