"""
Garmin Connect API service
Handles OAuth 2.0 PKCE flow, token management, and activity fetching
"""

import httpx
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from urllib.parse import urlencode
from app.core.config import settings


def generate_oauth_url(user_id: int, state: str, code_challenge: str) -> str:
    """
    Generate Garmin OAuth 2.0 authorization URL with PKCE.
    
    Args:
        user_id: User ID (for state tracking)
        state: CSRF state parameter
        code_challenge: PKCE code challenge
        
    Returns:
        Authorization URL
    """
    params = {
        "client_id": settings.GARMIN_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": settings.GARMIN_OAUTH_REDIRECT_URI,
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
        "scope": "activity",  # Request activity access
    }
    
    return f"{settings.GARMIN_OAUTH_AUTHORIZE_URL}?{urlencode(params)}"


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
            settings.GARMIN_OAUTH_TOKEN_URL,
            data={
                "client_id": settings.GARMIN_CLIENT_ID,
                "client_secret": settings.GARMIN_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": settings.GARMIN_OAUTH_REDIRECT_URI,
                "code_verifier": code_verifier,
            },
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
            }
        )
        response.raise_for_status()
        token_data = response.json()
        
        # Extract Garmin User ID from token response if available
        # Garmin may include user info in the token response
        provider_user_id = token_data.get("user_id") or token_data.get("userId")
        
        return {
            "access_token": token_data["access_token"],
            "refresh_token": token_data.get("refresh_token"),
            "expires_in": token_data.get("expires_in", 7776000),  # 90 days default
            "token_type": token_data.get("token_type", "Bearer"),
            "scopes": token_data.get("scope", "activity").split(),
            "provider_user_id": provider_user_id,
        }


def refresh_garmin_token(refresh_token: str) -> Dict:
    """
    Refresh Garmin access token using refresh token.
    
    Args:
        refresh_token: Refresh token
        
    Returns:
        New token data
    """
    with httpx.Client() as client:
        response = client.post(
            settings.GARMIN_OAUTH_TOKEN_URL,
            data={
                "client_id": settings.GARMIN_CLIENT_ID,
                "client_secret": settings.GARMIN_CLIENT_SECRET,
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
            "expires_in": token_data.get("expires_in", 7776000),  # 90 days
            "token_type": token_data.get("token_type", "Bearer"),
        }


async def get_activities(
    access_token: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> List[Dict]:
    """
    Fetch activities from Garmin Connect API.
    
    Args:
        access_token: Valid access token
        start_date: Start date for activity range (default: 30 days ago)
        end_date: End date for activity range (default: today)
        
    Returns:
        List of activity dictionaries
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    # Format dates for Garmin API (YYYY-MM-DD)
    start_str = start_date.strftime("%Y-%m-%d")
    end_str = end_date.strftime("%Y-%m-%d")
    
    # Garmin Connect API endpoint for activities
    # Note: This uses the unofficial API structure
    # The official API may have different endpoints
    activities_url = f"{settings.GARMIN_API_BASE_URL}/activity-service/activity/search/activities"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            activities_url,
            params={
                "startDate": start_str,
                "endDate": end_str,
                "limit": 100,  # Max activities per request
            },
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            }
        )
        response.raise_for_status()
        data = response.json()
        
        # Return activities list
        return data.get("activities", [])


async def get_activity_details(access_token: str, activity_id: str) -> Dict:
    """
    Get detailed information for a specific activity.
    
    Args:
        access_token: Valid access token
        activity_id: Garmin activity ID
        
    Returns:
        Activity details dictionary
    """
    activity_url = f"{settings.GARMIN_API_BASE_URL}/activity-service/activity/{activity_id}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            activity_url,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            }
        )
        response.raise_for_status()
        return response.json()
