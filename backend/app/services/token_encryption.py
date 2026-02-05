"""
Token encryption service for OAuth tokens
Uses Fernet symmetric encryption to encrypt tokens at rest
"""

from cryptography.fernet import Fernet
import hashlib  # Standard library, not from cryptography
import base64
import os
from app.core.config import settings


class TokenEncryption:
    """Service for encrypting and decrypting OAuth tokens"""
    
    def __init__(self):
        """Initialize Fernet cipher with encryption key from config"""
        encryption_key = settings.OAUTH_TOKEN_ENCRYPTION_KEY
        
        if not encryption_key:
            # Generate a key if not provided (for development only)
            # In production, this should be set in environment variables
            if settings.is_development:
                # Generate a temporary key for development
                key = Fernet.generate_key()
                encryption_key = key.decode('utf-8')
            else:
                raise ValueError(
                    "OAUTH_TOKEN_ENCRYPTION_KEY must be set in production. "
                    "Generate one with: python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())'"
                )
        
        # Ensure key is properly formatted (32 bytes base64 encoded)
        if isinstance(encryption_key, str):
            # If it's a base64 string, use it directly
            try:
                # Validate it's a valid Fernet key
                self.cipher = Fernet(encryption_key.encode('utf-8'))
            except Exception:
                # If not valid, derive a key from the string
                # Hash the string to get 32 bytes
                digest = hashlib.sha256(encryption_key.encode('utf-8')).digest()
                key = base64.urlsafe_b64encode(digest)
                self.cipher = Fernet(key)
        else:
            self.cipher = Fernet(encryption_key)
    
    def encrypt_token(self, token: str) -> str:
        """
        Encrypt an OAuth token.
        
        Args:
            token: The plaintext token to encrypt
            
        Returns:
            Encrypted token as base64-encoded string
        """
        if not token:
            return ""
        return self.cipher.encrypt(token.encode('utf-8')).decode('utf-8')
    
    def decrypt_token(self, encrypted_token: str) -> str:
        """
        Decrypt an OAuth token.
        
        Args:
            encrypted_token: The encrypted token to decrypt
            
        Returns:
            Decrypted token as plaintext string
        """
        if not encrypted_token:
            return ""
        return self.cipher.decrypt(encrypted_token.encode('utf-8')).decode('utf-8')


# Global instance
_token_encryption = None


def get_token_encryption() -> TokenEncryption:
    """Get the global token encryption instance"""
    global _token_encryption
    if _token_encryption is None:
        _token_encryption = TokenEncryption()
    return _token_encryption


def encrypt_token(token: str) -> str:
    """Convenience function to encrypt a token"""
    return get_token_encryption().encrypt_token(token)


def decrypt_token(encrypted_token: str) -> str:
    """Convenience function to decrypt a token"""
    return get_token_encryption().decrypt_token(encrypted_token)
