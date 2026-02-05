"""
Test OAuth setup and endpoints
Verifies that OAuth configuration is correct and endpoints are accessible
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.core.pkce import generate_pkce_pair, generate_state
from app.services.garmin_service import generate_oauth_url as garmin_url
from app.services.strava_service import generate_oauth_url as strava_url
from app.services.token_encryption import get_token_encryption


def test_config():
    """Test OAuth configuration"""
    print("Testing OAuth Configuration...")
    print("=" * 60)
    
    issues = []
    
    # Check Garmin config
    if not settings.GARMIN_CLIENT_ID:
        issues.append("❌ GARMIN_CLIENT_ID not set")
    else:
        print("✅ GARMIN_CLIENT_ID configured")
    
    if not settings.GARMIN_CLIENT_SECRET:
        issues.append("❌ GARMIN_CLIENT_SECRET not set")
    else:
        print("✅ GARMIN_CLIENT_SECRET configured")
    
    # Check Strava config
    if not settings.STRAVA_CLIENT_ID:
        issues.append("❌ STRAVA_CLIENT_ID not set")
    else:
        print("✅ STRAVA_CLIENT_ID configured")
    
    if not settings.STRAVA_CLIENT_SECRET:
        issues.append("❌ STRAVA_CLIENT_SECRET not set")
    else:
        print("✅ STRAVA_CLIENT_SECRET configured")
    
    # Check encryption key
    if not settings.OAUTH_TOKEN_ENCRYPTION_KEY:
        issues.append("❌ OAUTH_TOKEN_ENCRYPTION_KEY not set")
    else:
        try:
            encryption = get_token_encryption()
            print("✅ OAUTH_TOKEN_ENCRYPTION_KEY configured and valid")
        except Exception as e:
            issues.append(f"❌ OAUTH_TOKEN_ENCRYPTION_KEY invalid: {str(e)}")
    
    if issues:
        print("\n⚠️  Issues found:")
        for issue in issues:
            print(f"  {issue}")
        return False
    
    print("\n✅ All configuration checks passed!")
    return True


def test_pkce():
    """Test PKCE generation"""
    print("\nTesting PKCE Generation...")
    print("=" * 60)
    
    try:
        verifier, challenge = generate_pkce_pair()
        state = generate_state()
        
        print(f"✅ Code verifier generated: {len(verifier)} chars")
        print(f"✅ Code challenge generated: {len(challenge)} chars")
        print(f"✅ State generated: {len(state)} chars")
        
        # Verify challenge is base64url
        if challenge.replace('-', '').replace('_', '').isalnum():
            print("✅ Code challenge format valid")
        else:
            print("❌ Code challenge format invalid")
            return False
        
        return True
    except Exception as e:
        print(f"❌ PKCE generation failed: {str(e)}")
        return False


def test_oauth_urls():
    """Test OAuth URL generation"""
    print("\nTesting OAuth URL Generation...")
    print("=" * 60)
    
    try:
        verifier, challenge = generate_pkce_pair()
        state = generate_state()
        user_id = 1  # Test user ID
        
        # Test Garmin URL
        if settings.GARMIN_CLIENT_ID:
            garmin_auth_url = garmin_url(user_id, state, challenge)
            print(f"✅ Garmin OAuth URL generated")
            print(f"   URL length: {len(garmin_auth_url)}")
            if "code_challenge" in garmin_auth_url:
                print("✅ PKCE parameters included")
        else:
            print("⚠️  Skipping Garmin URL test (no CLIENT_ID)")
        
        # Test Strava URL
        if settings.STRAVA_CLIENT_ID:
            strava_auth_url = strava_url(user_id, state, challenge)
            print(f"✅ Strava OAuth URL generated")
            print(f"   URL length: {len(strava_auth_url)}")
            if "code_challenge" in strava_auth_url:
                print("✅ PKCE parameters included")
        else:
            print("⚠️  Skipping Strava URL test (no CLIENT_ID)")
        
        return True
    except Exception as e:
        print(f"❌ OAuth URL generation failed: {str(e)}")
        return False


def test_database():
    """Test database connection and OAuthToken table"""
    print("\nTesting Database...")
    print("=" * 60)
    
    try:
        from app.core.database import engine, Base
        from app.models.oauth_token import OAuthToken
        
        # Test connection
        with engine.connect() as conn:
            print("✅ Database connection successful")
        
        # Check if table exists
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if "oauth_tokens" in tables:
            print("✅ oauth_tokens table exists")
        else:
            print("⚠️  oauth_tokens table not found")
            print("   Run: python init_db.py")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Database test failed: {str(e)}")
        return False


def main():
    """Run all tests"""
    print("OAuth Setup Test Suite")
    print("=" * 60)
    print()
    
    results = []
    
    results.append(("Configuration", test_config()))
    results.append(("PKCE Generation", test_pkce()))
    results.append(("OAuth URLs", test_oauth_urls()))
    results.append(("Database", test_database()))
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    all_passed = all(result[1] for result in results)
    
    if all_passed:
        print("\n🎉 All tests passed! OAuth setup is ready.")
    else:
        print("\n⚠️  Some tests failed. Please fix the issues above.")
    
    return all_passed


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
