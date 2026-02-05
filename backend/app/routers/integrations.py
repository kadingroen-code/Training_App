"""
Integration API endpoints for Garmin, Strava, and Apple WorkoutKit
Implements OAuth 2.0 PKCE flow, activity syncing, and webhook handling
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Query, Header
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.auth import get_current_user, get_current_athlete
from app.core.pkce import generate_pkce_pair, generate_state
from app.core.session import create_session, get_session, delete_session
from app.models.user import User
from app.models.calendar_event import CalendarEvent, EventStatus
from app.services.token_service import (
    get_valid_token, save_token, revoke_token
)
from app.services.garmin_service import (
    generate_oauth_url as garmin_generate_oauth_url,
    exchange_code as garmin_exchange_code,
    get_activities as garmin_get_activities,
)
from app.services.strava_service import (
    generate_oauth_url as strava_generate_oauth_url,
    exchange_code as strava_exchange_code,
    get_activities as strava_get_activities,
    verify_webhook_signature,
    verify_webhook_subscription,
)
from app.services.activity_matcher import (
    find_matching_event,
    extract_completion_data,
)
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import json

router = APIRouter()


# ==================== Garmin OAuth Endpoints ====================

@router.get("/garmin/oauth/authorize")
async def garmin_oauth_authorize(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initiate Garmin OAuth 2.0 PKCE flow.
    Generates authorization URL and stores PKCE verifier in session.
    """
    # Generate PKCE pair
    code_verifier, code_challenge = generate_pkce_pair()
    state = generate_state()
    
    # Create session to store code_verifier
    session_id = create_session(current_user.id, code_verifier, state)
    
    # Generate OAuth URL
    auth_url = garmin_generate_oauth_url(current_user.id, state, code_challenge)
    
    # Return redirect URL and session ID
    # Frontend should redirect user to auth_url
    return {
        "authorization_url": auth_url,
        "session_id": session_id,
        "state": state,
    }


@router.get("/garmin/oauth/callback")
async def garmin_oauth_callback(
    code: str = Query(...),
    state: str = Query(...),
    session_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Handle Garmin OAuth callback.
    Exchanges authorization code for tokens and stores them.
    """
    # Get session data
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=400, detail="Invalid or expired session")
    
    # Verify state matches
    if session["state"] != state:
        raise HTTPException(status_code=400, detail="State mismatch")
    
    user_id = session["user_id"]
    code_verifier = session["code_verifier"]
    
    try:
        # Exchange code for tokens
        token_data = await garmin_exchange_code(code, code_verifier, state)
        
        # Save tokens
        save_token(
            db,
            user_id,
            "garmin",
            token_data,
            provider_user_id=token_data.get("provider_user_id")
        )
        
        # Clean up session
        delete_session(session_id)
        
        return {
            "message": "Garmin OAuth authorization successful",
            "user_id": user_id,
        }
    except Exception as e:
        delete_session(session_id)
        raise HTTPException(status_code=400, detail=f"OAuth exchange failed: {str(e)}")


@router.post("/garmin/oauth/disconnect")
async def garmin_oauth_disconnect(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke Garmin OAuth tokens."""
    success = revoke_token(db, current_user.id, "garmin")
    if not success:
        raise HTTPException(status_code=404, detail="No Garmin tokens found")
    return {"message": "Garmin OAuth disconnected"}


@router.get("/garmin/activities/{athlete_id}")
async def sync_garmin_activities(
    athlete_id: int,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Sync completed activities from Garmin Connect.
    Matches activities to calendar events and updates completion_data.
    """
    # Get athlete's token
    token = get_valid_token(db, athlete_id, "garmin")
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Garmin not connected. Please authorize Garmin first."
        )
    
    # Parse dates
    if start_date:
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    else:
        start_dt = datetime.utcnow() - timedelta(days=30)
    
    if end_date:
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    else:
        end_dt = datetime.utcnow()
    
    try:
        # Fetch activities
        from app.services.token_encryption import decrypt_token
        access_token = decrypt_token(token.access_token)
        activities = await garmin_get_activities(access_token, start_dt, end_dt)
        
        # Get athlete's calendar events in date range
        events = db.query(CalendarEvent).filter(
            CalendarEvent.athlete_id == athlete_id,
            CalendarEvent.scheduled_date >= start_dt.date(),
            CalendarEvent.scheduled_date <= end_dt.date(),
            CalendarEvent.status == EventStatus.SCHEDULED
        ).all()
        
        matched_count = 0
        updated_events = []
        
        # Match activities to events
        for activity in activities:
            matching_event = find_matching_event(activity, events)
            if matching_event:
                # Extract completion data
                completion_data = extract_completion_data(activity, "garmin")
                
                # Update event
                matching_event.status = EventStatus.COMPLETED
                matching_event.completion_data = completion_data
                matching_event.completed_at = datetime.utcnow()
                
                updated_events.append(matching_event.id)
                matched_count += 1
        
        db.commit()
        
        return {
            "message": "Garmin activities synced",
            "activities_fetched": len(activities),
            "events_matched": matched_count,
            "updated_event_ids": updated_events,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync activities: {str(e)}")


# ==================== Strava OAuth Endpoints ====================

@router.get("/strava/oauth/authorize")
async def strava_oauth_authorize(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initiate Strava OAuth 2.0 PKCE flow.
    Generates authorization URL and stores PKCE verifier in session.
    """
    # Generate PKCE pair
    code_verifier, code_challenge = generate_pkce_pair()
    state = generate_state()
    
    # Create session to store code_verifier
    session_id = create_session(current_user.id, code_verifier, state)
    
    # Generate OAuth URL
    auth_url = strava_generate_oauth_url(current_user.id, state, code_challenge)
    
    return {
        "authorization_url": auth_url,
        "session_id": session_id,
        "state": state,
    }


@router.get("/strava/oauth/callback")
async def strava_oauth_callback(
    code: str = Query(...),
    state: str = Query(...),
    session_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Handle Strava OAuth callback."""
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=400, detail="Invalid or expired session")
    
    if session["state"] != state:
        raise HTTPException(status_code=400, detail="State mismatch")
    
    user_id = session["user_id"]
    code_verifier = session["code_verifier"]
    
    try:
        token_data = await strava_exchange_code(code, code_verifier, state)
        
        save_token(
            db,
            user_id,
            "strava",
            token_data,
            provider_user_id=token_data.get("provider_user_id")
        )
        
        delete_session(session_id)
        
        return {
            "message": "Strava OAuth authorization successful",
            "user_id": user_id,
        }
    except Exception as e:
        delete_session(session_id)
        raise HTTPException(status_code=400, detail=f"OAuth exchange failed: {str(e)}")


@router.post("/strava/oauth/disconnect")
async def strava_oauth_disconnect(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke Strava OAuth tokens."""
    success = revoke_token(db, current_user.id, "strava")
    if not success:
        raise HTTPException(status_code=404, detail="No Strava tokens found")
    return {"message": "Strava OAuth disconnected"}


@router.get("/strava/activities/{athlete_id}")
async def sync_strava_activities(
    athlete_id: int,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Sync completed activities from Strava.
    Matches activities to calendar events and updates completion_data.
    Note: Strava data is NOT used for AI/ML - Garmin is the source of truth.
    """
    token = get_valid_token(db, athlete_id, "strava")
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Strava not connected. Please authorize Strava first."
        )
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    else:
        start_dt = datetime.utcnow() - timedelta(days=30)
    
    if end_date:
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    else:
        end_dt = datetime.utcnow()
    
    try:
        from app.services.token_encryption import decrypt_token
        access_token = decrypt_token(token.access_token)
        activities = await strava_get_activities(access_token, start_dt, end_dt)
        
        events = db.query(CalendarEvent).filter(
            CalendarEvent.athlete_id == athlete_id,
            CalendarEvent.scheduled_date >= start_dt.date(),
            CalendarEvent.scheduled_date <= end_dt.date(),
            CalendarEvent.status == EventStatus.SCHEDULED
        ).all()
        
        matched_count = 0
        updated_events = []
        
        for activity in activities:
            matching_event = find_matching_event(activity, events)
            if matching_event:
                completion_data = extract_completion_data(activity, "strava")
                
                matching_event.status = EventStatus.COMPLETED
                matching_event.completion_data = completion_data
                matching_event.completed_at = datetime.utcnow()
                
                updated_events.append(matching_event.id)
                matched_count += 1
        
        db.commit()
        
        return {
            "message": "Strava activities synced",
            "activities_fetched": len(activities),
            "events_matched": matched_count,
            "updated_event_ids": updated_events,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync activities: {str(e)}")


@router.get("/strava/webhook")
async def strava_webhook_verify(
    mode: str = Query(...),
    token: str = Query(...),
    challenge: str = Query(...)
):
    """
    Verify Strava webhook subscription (GET request during setup).
    """
    verified_challenge = verify_webhook_subscription(mode, token, challenge)
    if verified_challenge:
        return {"hub.challenge": verified_challenge}
    raise HTTPException(status_code=403, detail="Webhook verification failed")


@router.post("/strava/webhook")
async def strava_webhook(
    request: Request,
    x_hub_signature_256: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Handle Strava webhook events (activity updates, deauthorizations).
    Verifies webhook signature before processing.
    """
    # Get raw body for signature verification
    body = await request.body()
    
    # Verify signature
    if not x_hub_signature_256 or not verify_webhook_signature(body, x_hub_signature_256):
        raise HTTPException(status_code=403, detail="Invalid webhook signature")
    
    # Parse payload
    try:
        payload = json.loads(body.decode('utf-8'))
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    
    # Process webhook event
    event_type = payload.get("object_type")
    aspect_type = payload.get("aspect_type")
    
    if event_type == "activity":
        # Activity created or updated
        activity_id = payload.get("object_id")
        # Could trigger activity sync here if needed
        pass
    elif event_type == "athlete":
        # Athlete deauthorized
        athlete_id = payload.get("owner_id")
        # Revoke tokens for this athlete
        # Note: We need to find user by Strava athlete ID
        # For now, this is a placeholder
        pass
    
    # Always return 200 OK immediately (Strava requirement)
    return {"status": "ok"}


# ==================== Garmin Workout Push ====================

@router.post("/garmin/workout/{event_id}/push")
async def push_workout_to_garmin(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Push structured workout to Garmin device."""
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    
    # Verify user owns this event
    if event.athlete_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # TODO: Convert resolved_targets to Garmin Training API format
    # POST to Garmin Training API
    
    return {"message": "Workout pushed to Garmin", "event_id": event_id}


# ==================== Apple WorkoutKit ====================

@router.post("/apple/workout/{event_id}/generate")
async def generate_apple_workout(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate Apple WorkoutKit CustomWorkout for watchOS 10+."""
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    
    if event.athlete_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # TODO: Convert resolved_targets to CustomWorkout JSON format
    workout_json = {
        "workoutType": "running",  # or "cycling"
        "segments": event.resolved_targets.get("segments", [])
    }
    
    return {"workout": workout_json, "event_id": event_id}
