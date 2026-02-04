"""
Calendar Event model - resolved workouts assigned to athletes
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class EventStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    SKIPPED = "skipped"
    CANCELLED = "cancelled"


class CalendarEvent(Base):
    __tablename__ = "calendar_events"
    
    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("workout_templates.id"), nullable=False)
    
    # Event scheduling
    scheduled_date = Column(Date, nullable=False)
    scheduled_time = Column(DateTime(timezone=True), nullable=True)
    
    # Resolved workout with absolute targets
    resolved_targets = Column(JSON, nullable=False)
    
    # Status tracking
    status = Column(Enum(EventStatus), default=EventStatus.SCHEDULED)
    
    # Completion data (from Garmin/Strava)
    completion_data = Column(JSON, nullable=True)  # Actual performance data
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    athlete = relationship("User", back_populates="calendar_events")
    template = relationship("WorkoutTemplate", back_populates="calendar_events")
