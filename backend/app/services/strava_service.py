"""
Strava API service
Handles OAuth 2.0 PKCE flow, token management, activity fetching, and webhook verification
Compliant with 2026 requirements (no AI/ML usage with Strava data)
"""

import httpx
import hmac
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from urllib.parse import urlencode
from app.core.config import settings


def generate_oauth_url(user_id: int, state: str, code_challenge: str) -> str:
    """
    Generate Strava OAuth 2.0 authorization URL with PKCE.
    
    Args:
        user_id: User ID (for state tracking)
        state: CSRF state parameter
        code_challenge: PKCE code challenge
        
    Returns:
        Authorization URL
    """
    params = {
        "client_id": settings.STRAVA_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": settings.STRAVA_OAUTH_REDIRECT_URI,
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
        "scope": "activity:read_all",  # Explicit scope as required by 2026 compliance
        "approval_prompt": "force",  # Force re-authorization to get fresh tokens
    }
    
    return f"{settings.STRAVA_OAUTH_AUTHORIZE_URL}?{urlencode(params)}"


async def exchange_code(code: str, code_verifier: str, state: str) -> Dict:
    """
    Exchange authorization code for access token using PKCE.
    
    Args:
        code: Authorization code from callback
        code_verifier: PKCE code verifier
        state: CSRF state parameter (for validation)
        
    Returns:
        Token response dictionary with access_token, refresh_token, expires_in, etc.
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            settings.STRAVA_OAUTH_TOKEN_URL,
            data={
                "client_id": settings.STRAVA_CLIENT_ID,
                "client_secret": settings.STRAVA_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "code_verifier": code_verifier,
            },
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
            }
        )
        response.raise_for_status()
        token_data = response.json()
        
        # Extract athlete ID from token response
        athlete = token_data.get("athlete", {})
        provider_user_id = str(athlete.get("id")) if athlete else None
        
        return {
            "access_token": token_data["access_token"],
            "refresh_token": token_data["refresh_token"],
            "expires_in": token_data.get("expires_in", 21600),  # 6 hours default
            "token_type": token_data.get("token_type", "Bearer"),
            "scopes": token_data.get("scope", "activity:read_all").split(","),
            "provider_user_id": provider_user_id,
        }


def refresh_strava_token(refresh_token: str) -> Dict:
    """
    Refresh Strava access token using refresh token.
    
    Args:
        refresh_token: Refresh token
        
    Returns:
        New token data
    """
    with httpx.Client() as client:
        response = client.post(
            settings.STRAVA_OAUTH_TOKEN_URL,
            data={
                "client_id": settings.STRAVA_CLIENT_ID,
                "client_secret": settings.STRAVA_CLIENT_SECRET,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            },
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
            }
        )
        response.raise_for_status()
        token_data = response.json()
        
        return {
            "access_token": token_data["access_token"],
            "refresh_token": token_data.get("refresh_token", refresh_token),  # Keep old if not provided
            "expires_in": token_data.get("expires_in", 21600),  # 6 hours
            "token_type": token_data.get("token_type", "Bearer"),
        }


async def get_activities(
    access_token: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    page: int = 1,
    per_page: int = 30
) -> List[Dict]:
    """
    Fetch activities from Strava API.
    
    Args:
        access_token: Valid access token
        start_date: Start date for activity range (default: 30 days ago)
        end_date: End date for activity range (default: today)
        page: Page number (default: 1)
        per_page: Activities per page (max 200, default: 30)
        
    Returns:
        List of activity dictionaries
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    # Convert to Unix timestamps
    after = int(start_date.timestamp())
    before = int(end_date.timestamp())
    
    activities_url = f"{settings.STRAVA_API_BASE_URL}/athlete/activities"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            activities_url,
            params={
                "after": after,
                "before": before,
                "page": page,
                "per_page": min(per_page, 200),  # Strava max is 200
            },
            headers={
                "Authorization": f"Bearer {access_token}",
            }
        )
        response.raise_for_status()
        return response.json()


async def get_activity_details(access_token: str, activity_id: int) -> Dict:
    """
    Get detailed information for a specific activity.
    
    Args:
        access_token: Valid access token
        activity_id: Strava activity ID
        
    Returns:
        Activity details dictionary
    """
    activity_url = f"{settings.STRAVA_API_BASE_URL}/activities/{activity_id}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            activity_url,
            headers={
                "Authorization": f"Bearer {access_token}",
            }
        )
        response.raise_for_status()
        return response.json()


def verify_webhook_signature(payload_body: bytes, signature: str) -> bool:
    """
    Verify Strava webhook signature to ensure authenticity.
    
    Args:
        payload_body: Raw request body as bytes
        signature: X-Hub-Signature-256 header value (format: sha256=...)
        
    Returns:
        True if signature is valid, False otherwise
    """
    if not settings.STRAVA_WEBHOOK_SECRET:
        return False
    
    # Extract hash from signature header (format: sha256=...)
    if not signature.startswith("sha256="):
        return False
    
    received_hash = signature[7:]  # Remove "sha256=" prefix
    
    # Calculate expected hash
    expected_hash = hmac.new(
        settings.STRAVA_WEBHOOK_SECRET.encode('utf-8'),
        payload_body,
        hashlib.sha256
    ).hexdigest()
    
    # Constant-time comparison to prevent timing attacks
    return hmac.compare_digest(received_hash, expected_hash)


def verify_webhook_subscription(mode: str, token: str, challenge: str) -> Optional[str]:
    """
    Verify Strava webhook subscription (for initial setup).
    
    Args:
        mode: Verification mode ("subscribe")
        token: Verification token
        challenge: Challenge string from Strava
        
    Returns:
        Challenge string if verification succeeds, None otherwise
    """
    if mode == "subscribe" and token == settings.STRAVA_VERIFY_TOKEN:
        return challenge
    return None
