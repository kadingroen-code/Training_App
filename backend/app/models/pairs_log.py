"""
PAIRS (Post-Activity Injury Risk Screening) Log model
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Integer as IntType
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class PAIRSLog(Base):
    __tablename__ = "pairs_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    calendar_event_id = Column(Integer, ForeignKey("calendar_events.id"), nullable=True)
    
    # Soreness/pain ratings (0-10 scale)
    muscle_soreness = Column(IntType, nullable=True)
    joint_pain = Column(IntType, nullable=True)
    
    # Additional notes
    notes = Column(String, nullable=True)
    
    # Alert flags
    alert_coach = Column(String, default="false")  # "true" if coach should be notified
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    athlete = relationship("User")
    calendar_event = relationship("CalendarEvent")
