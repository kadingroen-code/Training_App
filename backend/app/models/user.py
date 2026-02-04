"""
User model - represents coaches and athletes
"""

from sqlalchemy import Column, Integer, String, Enum, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class UserRole(str, enum.Enum):
    COACH = "coach"
    ATHLETE = "athlete"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    
    # OAuth tokens (encrypted JSON)
    oauth_tokens = Column(JSON, default={})  # { "garmin": {...}, "strava": {...} }
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    athlete_profile = relationship("AthleteProfile", back_populates="user", uselist=False)
    workout_templates = relationship("WorkoutTemplate", back_populates="coach")
    calendar_events = relationship("CalendarEvent", back_populates="athlete")
