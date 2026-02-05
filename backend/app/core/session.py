"""
Session management for OAuth PKCE flow
Stores code_verifier temporarily during OAuth flow
"""

from typing import Dict, Optional
import secrets
from datetime import datetime, timedelta

# In-memory session store (for development)
# In production, use Redis or similar
_sessions: Dict[str, Dict] = {}


def create_session(user_id: int, code_verifier: str, state: str) -> str:
    """
    Create a session to store PKCE code_verifier during OAuth flow.
    
    Args:
        user_id: User ID
        code_verifier: PKCE code verifier
        state: CSRF state parameter
        
    Returns:
        Session ID
    """
    session_id = secrets.token_urlsafe(32)
    _sessions[session_id] = {
        "user_id": user_id,
        "code_verifier": code_verifier,
        "state": state,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=10),  # 10 min expiry
    }
    return session_id


def get_session(session_id: str) -> Optional[Dict]:
    """
    Get session data by session ID.
    
    Args:
        session_id: Session ID
        
    Returns:
        Session data dictionary or None if not found/expired
    """
    if session_id not in _sessions:
        return None
    
    session = _sessions[session_id]
    
    # Check expiration
    if datetime.utcnow() > session["expires_at"]:
        del _sessions[session_id]
        return None
    
    return session


def delete_session(session_id: str) -> bool:
    """
    Delete a session.
    
    Args:
        session_id: Session ID
        
    Returns:
        True if deleted, False if not found
    """
    if session_id in _sessions:
        del _sessions[session_id]
        return True
    return False


def cleanup_expired_sessions():
    """Remove expired sessions (call periodically)"""
    now = datetime.utcnow()
    expired = [sid for sid, sess in _sessions.items() if now > sess["expires_at"]]
    for sid in expired:
        del _sessions[sid]
