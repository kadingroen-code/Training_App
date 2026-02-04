"""
Athlete API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.athlete_profile import AthleteProfile
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()


class AthleteProfileUpdate(BaseModel):
    current_vdot: float | None = None
    current_ftp: float | None = None
    max_hr: int | None = None
    threshold_pace: float | None = None


class AthleteProfileResponse(BaseModel):
    id: int
    user_id: int
    current_vdot: float | None
    current_ftp: float | None
    max_hr: int | None
    threshold_pace: float | None
    
    class Config:
        from_attributes = True


@router.get("/{athlete_id}/profile", response_model=AthleteProfileResponse)
async def get_athlete_profile(athlete_id: int, db: Session = Depends(get_db)):
    """Get athlete profile with fitness markers."""
    profile = db.query(AthleteProfile).filter(AthleteProfile.user_id == athlete_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Athlete profile not found")
    return profile


@router.put("/{athlete_id}/profile", response_model=AthleteProfileResponse)
async def update_athlete_profile(
    athlete_id: int,
    profile_update: AthleteProfileUpdate,
    db: Session = Depends(get_db)
):
    """Update athlete profile fitness markers."""
    profile = db.query(AthleteProfile).filter(AthleteProfile.user_id == athlete_id).first()
    
    if not profile:
        # Create new profile if it doesn't exist
        profile = AthleteProfile(user_id=athlete_id)
        db.add(profile)
    
    # Update fields
    if profile_update.current_vdot is not None:
        profile.current_vdot = profile_update.current_vdot
    if profile_update.current_ftp is not None:
        profile.current_ftp = profile_update.current_ftp
    if profile_update.max_hr is not None:
        profile.max_hr = profile_update.max_hr
    if profile_update.threshold_pace is not None:
        profile.threshold_pace = profile_update.threshold_pace
    
    db.commit()
    db.refresh(profile)
    
    return profile
