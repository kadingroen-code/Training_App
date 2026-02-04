"""
Calendar Event API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from app.core.database import get_db
from app.models.calendar_event import CalendarEvent, EventStatus
from pydantic import BaseModel

router = APIRouter()


class CalendarEventResponse(BaseModel):
    id: int
    athlete_id: int
    template_id: int
    scheduled_date: date
    scheduled_time: Optional[datetime]
    resolved_targets: dict
    status: str
    completion_data: Optional[dict]
    
    class Config:
        from_attributes = True


@router.get("/athlete/{athlete_id}", response_model=List[CalendarEventResponse])
async def get_athlete_calendar(
    athlete_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get calendar events for an athlete."""
    query = db.query(CalendarEvent).filter(CalendarEvent.athlete_id == athlete_id)
    
    if start_date:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        query = query.filter(CalendarEvent.scheduled_date >= start)
    
    if end_date:
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
        query = query.filter(CalendarEvent.scheduled_date <= end)
    
    return query.order_by(CalendarEvent.scheduled_date).all()


@router.post("/", response_model=CalendarEventResponse)
async def create_calendar_event(
    athlete_id: int,
    template_id: int,
    scheduled_date: str,
    scheduled_time: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Create a calendar event (assign workout to athlete)."""
    from app.models.athlete_profile import AthleteProfile
    from app.models.workout_template import WorkoutTemplate
    from app.engine.workout_resolver import WorkoutResolver
    
    # Get template
    template = db.query(WorkoutTemplate).filter(WorkoutTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Workout template not found")
    
    # Get athlete profile
    profile = db.query(AthleteProfile).filter(AthleteProfile.user_id == athlete_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Athlete profile not found")
    
    # Resolve workout
    resolver = WorkoutResolver(
        vdot=profile.current_vdot,
        ftp=profile.current_ftp
    )
    
    resolved_workout = resolver.resolve_workout(template.logic_json)
    
    # Parse dates
    sched_date = datetime.strptime(scheduled_date, "%Y-%m-%d").date()
    sched_datetime = None
    if scheduled_time:
        sched_datetime = datetime.fromisoformat(scheduled_time)
    
    # Create event
    event = CalendarEvent(
        athlete_id=athlete_id,
        template_id=template_id,
        scheduled_date=sched_date,
        scheduled_time=sched_datetime,
        resolved_targets=resolved_workout,
        status=EventStatus.SCHEDULED
    )
    
    db.add(event)
    db.commit()
    db.refresh(event)
    
    return event


@router.put("/{event_id}/complete")
async def complete_calendar_event(
    event_id: int,
    completion_data: dict,
    db: Session = Depends(get_db)
):
    """Mark a calendar event as completed with performance data."""
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    
    event.status = EventStatus.COMPLETED
    event.completion_data = completion_data
    event.completed_at = datetime.now()
    
    db.commit()
    db.refresh(event)
    
    return {"message": "Event marked as completed", "event_id": event_id}
