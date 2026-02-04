"""
Workout Template model - master workout structures with logic
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class WorkoutTemplate(Base):
    __tablename__ = "workout_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Template metadata
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    sport = Column(String, nullable=False)  # "run", "bike", "swim", etc.
    
    # The master structure with relative targets
    logic_json = Column(JSON, nullable=False)
    
    # Markdown source (optional, for coach input)
    markdown_source = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    coach = relationship("User", back_populates="workout_templates")
    calendar_events = relationship("CalendarEvent", back_populates="template")
