"""
Workout Template API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.workout_template import WorkoutTemplate
from app.parsers.markdown_parser import MarkdownWorkoutParser
from pydantic import BaseModel, Field, field_validator

router = APIRouter()


class WorkoutTemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    sport: str = Field(..., min_length=1, max_length=50)
    logic_json: Optional[dict] = None
    markdown_source: Optional[str] = Field(None, max_length=10000)
    
    @field_validator('sport')
    @classmethod
    def validate_sport(cls, v: str) -> str:
        allowed_sports = ['running', 'cycling', 'swimming', 'triathlon']
        if v.lower() not in allowed_sports:
            raise ValueError(f"Sport must be one of: {', '.join(allowed_sports)}")
        return v.lower()


class WorkoutTemplateResponse(BaseModel):
    id: int
    coach_id: int
    name: str
    description: Optional[str]
    sport: str
    logic_json: dict
    markdown_source: Optional[str]
    
    class Config:
        from_attributes = True


@router.post("/", response_model=WorkoutTemplateResponse)
async def create_workout_template(
    template: WorkoutTemplateCreate,
    coach_id: int = Query(..., gt=0, description="Coach ID (will be from auth token in production)"),
    db: Session = Depends(get_db)
):
    """Create a new workout template."""
    # If markdown is provided, parse it
    if template.markdown_source and not template.logic_json:
        parser = MarkdownWorkoutParser()
        parsed = parser.parse(template.markdown_source, template.sport)
        logic_json = parsed
    else:
        logic_json = template.logic_json or {}
    
    db_template = WorkoutTemplate(
        coach_id=coach_id,
        name=template.name,
        description=template.description,
        sport=template.sport,
        logic_json=logic_json,
        markdown_source=template.markdown_source
    )
    
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    
    return db_template


@router.get("/{template_id}", response_model=WorkoutTemplateResponse)
async def get_workout_template(
    template_id: int = Path(..., gt=0),
    db: Session = Depends(get_db)
):
    """Get a workout template by ID."""
    template = db.query(WorkoutTemplate).filter(WorkoutTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Workout template not found")
    return template


@router.get("/", response_model=List[WorkoutTemplateResponse])
async def list_workout_templates(
    coach_id: Optional[int] = None,
    sport: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List workout templates, optionally filtered by coach or sport."""
    query = db.query(WorkoutTemplate)
    
    if coach_id:
        query = query.filter(WorkoutTemplate.coach_id == coach_id)
    if sport:
        query = query.filter(WorkoutTemplate.sport == sport)
    
    return query.all()


@router.post("/{template_id}/resolve")
async def resolve_workout_template(
    template_id: int = Path(..., gt=0),
    athlete_id: int = Query(..., gt=0),
    db: Session = Depends(get_db)
):
    """Resolve a workout template for a specific athlete."""
    from app.models.athlete_profile import AthleteProfile
    from app.engine.workout_resolver import WorkoutResolver
    
    template = db.query(WorkoutTemplate).filter(WorkoutTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Workout template not found")
    
    profile = db.query(AthleteProfile).filter(AthleteProfile.user_id == athlete_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Athlete profile not found")
    
    resolver = WorkoutResolver(
        vdot=profile.current_vdot,
        ftp=profile.current_ftp
    )
    
    resolved = resolver.resolve_workout(template.logic_json)
    
    return resolved
