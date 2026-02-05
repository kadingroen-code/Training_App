"""
Generate a Fernet encryption key for OAuth token encryption.
Run this script to generate a secure key for OAUTH_TOKEN_ENCRYPTION_KEY.
"""

from cryptography.fernet import Fernet

def generate_key():
    """Generate a new Fernet encryption key"""
    key = Fernet.generate_key()
    key_string = key.decode('utf-8')
    
    print("=" * 60)
    print("OAUTH_TOKEN_ENCRYPTION_KEY")
    print("=" * 60)
    print()
    print("Add this to your backend/.env file:")
    print()
    print(f"OAUTH_TOKEN_ENCRYPTION_KEY={key_string}")
    print()
    print("=" * 60)
    print("⚠️  IMPORTANT: Keep this key secure!")
    print("   - Never commit it to version control")
    print("   - Use different keys for development and production")
    print("   - If you lose this key, you cannot decrypt existing tokens")
    print("=" * 60)
    
    return key_string

if __name__ == "__main__":
    generate_key()
