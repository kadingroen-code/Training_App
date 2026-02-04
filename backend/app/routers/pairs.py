"""
PAIRS (Post-Activity Injury Risk Screening) API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.pairs_log import PAIRSLog
from pydantic import BaseModel, Field

router = APIRouter()


class PAIRSLogCreate(BaseModel):
    calendar_event_id: Optional[int] = Field(None, gt=0)
    muscle_soreness: Optional[int] = Field(None, ge=0, le=10, description="Muscle soreness on 0-10 scale")
    joint_pain: Optional[int] = Field(None, ge=0, le=10, description="Joint pain on 0-10 scale")
    notes: Optional[str] = Field(None, max_length=1000)


class PAIRSLogResponse(BaseModel):
    id: int
    athlete_id: int
    calendar_event_id: Optional[int]
    muscle_soreness: Optional[int]
    joint_pain: Optional[int]
    notes: Optional[str]
    alert_coach: str
    
    class Config:
        from_attributes = True


@router.post("/", response_model=PAIRSLogResponse)
async def create_pairs_log(
    log_data: PAIRSLogCreate,
    athlete_id: int = Query(..., gt=0),
    db: Session = Depends(get_db)
):
    """Create a PAIRS log entry for post-workout assessment."""
    # Determine if coach should be alerted
    alert_threshold = 7  # Alert if soreness/pain >= 7
    should_alert = (
        (log_data.muscle_soreness and log_data.muscle_soreness >= alert_threshold) or
        (log_data.joint_pain and log_data.joint_pain >= alert_threshold)
    )
    
    pairs_log = PAIRSLog(
        athlete_id=athlete_id,
        calendar_event_id=log_data.calendar_event_id,
        muscle_soreness=log_data.muscle_soreness,
        joint_pain=log_data.joint_pain,
        notes=log_data.notes,
        alert_coach="true" if should_alert else "false"
    )
    
    db.add(pairs_log)
    db.commit()
    db.refresh(pairs_log)
    
    # TODO: Send notification to coach if alert_coach is true
    
    return pairs_log


@router.get("/athlete/{athlete_id}", response_model=List[PAIRSLogResponse])
async def get_athlete_pairs_logs(
    athlete_id: int = Path(..., gt=0),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get PAIRS logs for an athlete."""
    logs = db.query(PAIRSLog).filter(
        PAIRSLog.athlete_id == athlete_id
    ).order_by(PAIRSLog.created_at.desc()).limit(limit).all()
    
    return logs


@router.get("/alerts")
async def get_pairs_alerts(
    coach_id: int = Query(..., gt=0, description="Coach ID (will be from auth token in production)"),
    db: Session = Depends(get_db)
):
    """Get all PAIRS alerts that require coach attention."""
    alerts = db.query(PAIRSLog).filter(
        PAIRSLog.alert_coach == "true"
    ).order_by(PAIRSLog.created_at.desc()).all()
    
    return [{"id": a.id, "athlete_id": a.athlete_id, "created_at": a.created_at} for a in alerts]
