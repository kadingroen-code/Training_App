"""
Coach API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.workout_template import WorkoutTemplate
from pydantic import BaseModel

router = APIRouter()


@router.get("/{coach_id}/athletes")
async def get_coach_athletes(
    coach_id: int = Path(..., gt=0),
    db: Session = Depends(get_db)
):
    """Get all athletes assigned to a coach."""
    # TODO: Implement coach-athlete relationship
    athletes = db.query(User).filter(User.role == "athlete").all()
    return [{"id": a.id, "email": a.email} for a in athletes]


@router.post("/{coach_id}/bulk-assign")
async def bulk_assign_workout(
    coach_id: int = Path(..., gt=0),
    template_id: int = Query(..., gt=0),
    athlete_ids: List[int] = Query(..., min_length=1, description="List of athlete IDs"),
    start_date: str = Query(..., pattern=r'^\d{4}-\d{2}-\d{2}$', description="Start date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    """Bulk assign a workout template to multiple athletes."""
    from app.models.calendar_event import CalendarEvent
    from datetime import datetime, timedelta
    from app.engine.workout_resolver import WorkoutResolver
    
    template = db.query(WorkoutTemplate).filter(WorkoutTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Workout template not found")
    
    if template.coach_id != coach_id:
        raise HTTPException(status_code=403, detail="Not authorized to assign this template")
    
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    created_events = []
    
    for athlete_id in athlete_ids:
        # Get athlete profile
        from app.models.athlete_profile import AthleteProfile
        profile = db.query(AthleteProfile).filter(AthleteProfile.user_id == athlete_id).first()
        
        if not profile:
            continue
        
        # Resolve workout for this athlete
        resolver = WorkoutResolver(
            vdot=profile.current_vdot,
            ftp=profile.current_ftp
        )
        
        resolved_workout = resolver.resolve_workout(template.logic_json)
        
        # Create calendar event
        event = CalendarEvent(
            athlete_id=athlete_id,
            template_id=template_id,
            scheduled_date=start,
            resolved_targets=resolved_workout
        )
        
        db.add(event)
        created_events.append(event)
    
    db.commit()
    
    return {
        "message": f"Assigned workout to {len(created_events)} athletes",
        "events_created": len(created_events)
    }
