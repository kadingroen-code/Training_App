"""
PKCE (Proof Key for Code Exchange) utilities for OAuth 2.0
"""

import secrets
import base64
import hashlib
from typing import Tuple


def generate_code_verifier() -> str:
    """
    Generate a cryptographically random code verifier for PKCE.
    
    Returns:
        A URL-safe base64-encoded string of 43-128 characters.
    """
    # Generate 32 random bytes (256 bits) and encode as base64url
    # This gives us 43 characters, which is within the 43-128 char range
    random_bytes = secrets.token_bytes(32)
    verifier = base64.urlsafe_b64encode(random_bytes).decode('utf-8').rstrip('=')
    return verifier


def generate_code_challenge(verifier: str) -> str:
    """
    Generate a code challenge from a code verifier using SHA-256.
    
    Args:
        verifier: The code verifier string
        
    Returns:
        A URL-safe base64-encoded SHA-256 hash of the verifier
    """
    # SHA-256 hash of the verifier
    sha256_hash = hashlib.sha256(verifier.encode('utf-8')).digest()
    # Base64url encode the hash
    challenge = base64.urlsafe_b64encode(sha256_hash).decode('utf-8').rstrip('=')
    return challenge


def generate_state() -> str:
    """
    Generate a random state parameter for CSRF protection.
    
    Returns:
        A URL-safe random string
    """
    return secrets.token_urlsafe(32)


def generate_pkce_pair() -> Tuple[str, str]:
    """
    Generate both code verifier and code challenge.
    
    Returns:
        A tuple of (code_verifier, code_challenge)
    """
    verifier = generate_code_verifier()
    challenge = generate_code_challenge(verifier)
    return verifier, challenge
