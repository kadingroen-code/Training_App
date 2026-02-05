"""
OAuth Token model - stores encrypted OAuth tokens for Garmin and Strava
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, ARRAY, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class OAuthToken(Base):
    __tablename__ = "oauth_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider = Column(String, nullable=False)  # "garmin" | "strava"
    provider_user_id = Column(String, nullable=True)  # Garmin User ID (persistent identifier)
    
    # Tokens (encrypted at rest)
    access_token = Column(String, nullable=False)  # Encrypted
    refresh_token = Column(String, nullable=True)  # Encrypted
    token_type = Column(String, default="Bearer")
    
    # Expiration tracking
    expires_at = Column(DateTime(timezone=True), nullable=True)
    refresh_at = Column(DateTime(timezone=True), nullable=True)  # When to refresh (5 min before expires)
    
    # Metadata
    scopes = Column(ARRAY(String), default=[])  # Requested scopes
    last_refreshed = Column(DateTime(timezone=True), nullable=True)
    refresh_count = Column(Integer, default=0)
    status = Column(String, default="active")  # "active" | "revoked" | "expired"
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="oauth_tokens_new")
    
    # Indexes
    __table_args__ = (
        Index("idx_oauth_user_provider", "user_id", "provider"),
        Index("idx_oauth_expires_at", "expires_at"),
        Index("idx_oauth_refresh_at", "refresh_at"),
    )
