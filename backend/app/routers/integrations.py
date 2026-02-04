"""
Integration API endpoints for Garmin, Strava, and Apple WorkoutKit
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from typing import Dict, Any
import httpx

router = APIRouter()


@router.post("/garmin/oauth/callback")
async def garmin_oauth_callback(code: str, state: str):
    """Handle Garmin OAuth callback."""
    # TODO: Exchange code for access token
    # Store tokens in user.oauth_tokens
    return {"message": "Garmin OAuth callback received", "code": code}


@router.get("/garmin/activities/{athlete_id}")
async def sync_garmin_activities(athlete_id: int, db: Session = Depends(get_db)):
    """Sync completed activities from Garmin Connect."""
    # TODO: Fetch activities from Garmin Connect API
    # Match to calendar events and update completion_data
    return {"message": "Garmin activities sync endpoint", "athlete_id": athlete_id}


@router.post("/garmin/workout/{event_id}/push")
async def push_workout_to_garmin(event_id: int, db: Session = Depends(get_db)):
    """Push structured workout to Garmin device."""
    from app.models.calendar_event import CalendarEvent
    
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    
    # TODO: Convert resolved_targets to Garmin Training API format
    # POST to Garmin Training API
    
    return {"message": "Workout pushed to Garmin", "event_id": event_id}


@router.post("/strava/webhook")
async def strava_webhook(payload: Dict[str, Any]):
    """Handle Strava webhook events (activity updates, deauthorizations)."""
    # TODO: Process webhook events
    # Handle deauthorization by clearing tokens
    return {"message": "Strava webhook received"}


@router.get("/strava/activities/{athlete_id}")
async def sync_strava_activities(athlete_id: int, db: Session = Depends(get_db)):
    """Sync completed activities from Strava."""
    # TODO: Fetch activities from Strava API
    return {"message": "Strava activities sync endpoint", "athlete_id": athlete_id}


@router.post("/apple/workout/{event_id}/generate")
async def generate_apple_workout(event_id: int, db: Session = Depends(get_db)):
    """Generate Apple WorkoutKit CustomWorkout for watchOS 10+."""
    from app.models.calendar_event import CalendarEvent
    
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    
    # TODO: Convert resolved_targets to CustomWorkout JSON format
    # This would be used by iOS app to create workout on Apple Watch
    
    workout_json = {
        "workoutType": "running",  # or "cycling"
        "segments": event.resolved_targets.get("segments", [])
    }
    
    return {"workout": workout_json, "event_id": event_id}
