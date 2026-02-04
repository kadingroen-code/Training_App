"""
Athlete Profile model - stores fitness markers and performance data
"""

from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class AthleteProfile(Base):
    __tablename__ = "athlete_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Fitness markers
    current_vdot = Column(Float, nullable=True)  # For running
    current_ftp = Column(Float, nullable=True)   # For cycling (watts)
    max_hr = Column(Integer, nullable=True)      # Maximum heart rate (bpm)
    threshold_pace = Column(Float, nullable=True)  # Threshold pace (min/km)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="athlete_profile")
