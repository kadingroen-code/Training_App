"""
Token management service for OAuth tokens
Handles getting, saving, refreshing, and revoking tokens
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from app.models.oauth_token import OAuthToken
from app.services.token_encryption import encrypt_token, decrypt_token


def get_token(db: Session, user_id: int, provider: str) -> Optional[OAuthToken]:
    """
    Get an OAuth token for a user and provider.
    
    Args:
        db: Database session
        user_id: User ID
        provider: Provider name ("garmin" or "strava")
        
    Returns:
        OAuthToken if found, None otherwise
    """
    return db.query(OAuthToken).filter(
        OAuthToken.user_id == user_id,
        OAuthToken.provider == provider,
        OAuthToken.status == "active"
    ).first()


def save_token(
    db: Session,
    user_id: int,
    provider: str,
    token_data: dict,
    provider_user_id: Optional[str] = None
) -> OAuthToken:
    """
    Save or update an OAuth token.
    
    Args:
        db: Database session
        user_id: User ID
        provider: Provider name ("garmin" or "strava")
        token_data: Dictionary containing:
            - access_token: Access token string
            - refresh_token: Refresh token string (optional)
            - expires_in: Expiration time in seconds (optional)
            - token_type: Token type (default: "Bearer")
            - scopes: List of scopes (optional)
        provider_user_id: Provider's user ID (for Garmin, this is persistent)
        
    Returns:
        The saved OAuthToken
    """
    # Check if token already exists
    existing_token = db.query(OAuthToken).filter(
        OAuthToken.user_id == user_id,
        OAuthToken.provider == provider
    ).first()
    
    # Encrypt tokens
    encrypted_access_token = encrypt_token(token_data["access_token"])
    encrypted_refresh_token = None
    if token_data.get("refresh_token"):
        encrypted_refresh_token = encrypt_token(token_data["refresh_token"])
    
    # Calculate expiration times
    expires_at = None
    refresh_at = None
    if token_data.get("expires_in"):
        expires_at = datetime.utcnow() + timedelta(seconds=token_data["expires_in"])
        # Refresh 5 minutes before expiration
        refresh_at = expires_at - timedelta(minutes=5)
    elif provider == "garmin":
        # Garmin tokens expire every 3 months (90 days)
        expires_at = datetime.utcnow() + timedelta(days=90)
        refresh_at = expires_at - timedelta(minutes=5)
    
    if existing_token:
        # Update existing token
        existing_token.access_token = encrypted_access_token
        if encrypted_refresh_token:
            existing_token.refresh_token = encrypted_refresh_token
        existing_token.token_type = token_data.get("token_type", "Bearer")
        existing_token.expires_at = expires_at
        existing_token.refresh_at = refresh_at
        existing_token.status = "active"
        if provider_user_id:
            existing_token.provider_user_id = provider_user_id
        if token_data.get("scopes"):
            existing_token.scopes = token_data["scopes"]
        existing_token.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_token)
        return existing_token
    else:
        # Create new token
        new_token = OAuthToken(
            user_id=user_id,
            provider=provider,
            provider_user_id=provider_user_id,
            access_token=encrypted_access_token,
            refresh_token=encrypted_refresh_token,
            token_type=token_data.get("token_type", "Bearer"),
            expires_at=expires_at,
            refresh_at=refresh_at,
            scopes=token_data.get("scopes", []),
            status="active"
        )
        db.add(new_token)
        db.commit()
        db.refresh(new_token)
        return new_token


def refresh_token_if_needed(db: Session, token: OAuthToken) -> OAuthToken:
    """
    Refresh a token if it's close to expiration (within 5 minutes).
    
    Args:
        db: Database session
        token: OAuthToken to check and potentially refresh
        
    Returns:
        The token (refreshed if needed)
    """
    # Check if refresh is needed
    if not token.refresh_at:
        return token
    
    now = datetime.utcnow()
    if now < token.refresh_at:
        # Not time to refresh yet
        return token
    
    # Need to refresh
    try:
        if token.provider == "garmin":
            from app.services.garmin_service import refresh_garmin_token
            new_token_data = refresh_garmin_token(decrypt_token(token.refresh_token))
        elif token.provider == "strava":
            from app.services.strava_service import refresh_strava_token
            new_token_data = refresh_strava_token(decrypt_token(token.refresh_token))
        else:
            return token
        
        # Update token with new data
        token.access_token = encrypt_token(new_token_data["access_token"])
        if new_token_data.get("refresh_token"):
            token.refresh_token = encrypt_token(new_token_data["refresh_token"])
        
        # Update expiration times
        if new_token_data.get("expires_in"):
            token.expires_at = datetime.utcnow() + timedelta(seconds=new_token_data["expires_in"])
            token.refresh_at = token.expires_at - timedelta(minutes=5)
        elif token.provider == "garmin":
            token.expires_at = datetime.utcnow() + timedelta(days=90)
            token.refresh_at = token.expires_at - timedelta(minutes=5)
        
        token.last_refreshed = datetime.utcnow()
        token.refresh_count += 1
        token.status = "active"
        
        db.commit()
        db.refresh(token)
        return token
    except Exception as e:
        # If refresh fails, mark token as expired
        token.status = "expired"
        db.commit()
        raise Exception(f"Failed to refresh {token.provider} token: {str(e)}")


def revoke_token(db: Session, user_id: int, provider: str) -> bool:
    """
    Revoke an OAuth token by marking it as revoked.
    
    Args:
        db: Database session
        user_id: User ID
        provider: Provider name ("garmin" or "strava")
        
    Returns:
        True if token was found and revoked, False otherwise
    """
    token = db.query(OAuthToken).filter(
        OAuthToken.user_id == user_id,
        OAuthToken.provider == provider
    ).first()
    
    if token:
        token.status = "revoked"
        db.commit()
        return True
    return False


def get_valid_token(db: Session, user_id: int, provider: str) -> Optional[OAuthToken]:
    """
    Get a valid token, refreshing if necessary.
    
    Args:
        db: Database session
        user_id: User ID
        provider: Provider name ("garmin" or "strava")
        
    Returns:
        Valid OAuthToken if available, None otherwise
    """
    token = get_token(db, user_id, provider)
    if not token:
        return None
    
    # Refresh if needed
    token = refresh_token_if_needed(db, token)
    
    # Check if token is still valid
    if token.status != "active":
        return None
    
    if token.expires_at and datetime.utcnow() >= token.expires_at:
        token.status = "expired"
        db.commit()
        return None
    
    return token
