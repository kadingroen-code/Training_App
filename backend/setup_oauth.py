"""
OAuth setup helper script
Helps configure OAuth providers (Garmin and Strava)
"""

import os
from pathlib import Path

def check_env_file():
    """Check if .env file exists and has required OAuth variables"""
    env_path = Path(__file__).parent / ".env"
    
    if not env_path.exists():
        print("❌ backend/.env file not found!")
        print("\nCreate backend/.env with the following template:")
        print_template()
        return False
    
    # Read .env file
    env_vars = {}
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip()
    
    # Check required variables
    required_vars = {
        "GARMIN_CLIENT_ID": "Garmin OAuth Client ID",
        "GARMIN_CLIENT_SECRET": "Garmin OAuth Client Secret",
        "STRAVA_CLIENT_ID": "Strava OAuth Client ID",
        "STRAVA_CLIENT_SECRET": "Strava OAuth Client Secret",
        "OAUTH_TOKEN_ENCRYPTION_KEY": "OAuth Token Encryption Key",
    }
    
    missing = []
    empty = []
    
    for var, description in required_vars.items():
        if var not in env_vars:
            missing.append(f"  - {var}: {description}")
        elif not env_vars[var]:
            empty.append(f"  - {var}: {description}")
    
    if missing or empty:
        print("⚠️  OAuth configuration incomplete:")
        if missing:
            print("\nMissing variables:")
            for item in missing:
                print(item)
        if empty:
            print("\nEmpty variables:")
            for item in empty:
                print(item)
        print("\nSee setup instructions below.")
        return False
    
    print("✅ All OAuth variables are configured!")
    return True


def print_template():
    """Print .env template for OAuth"""
    print("\n" + "=" * 60)
    print("OAuth Configuration Template")
    print("=" * 60)
    print("""
# OAuth Providers - Garmin
# Get these from: https://developer.garmin.com/gc-developer-program/
GARMIN_CLIENT_ID=your_garmin_client_id
GARMIN_CLIENT_SECRET=your_garmin_client_secret
GARMIN_OAUTH_REDIRECT_URI=http://localhost:8000/api/integrations/garmin/oauth/callback

# OAuth Providers - Strava
# Get these from: https://www.strava.com/settings/api
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_OAUTH_REDIRECT_URI=http://localhost:8000/api/integrations/strava/oauth/callback
STRAVA_WEBHOOK_SECRET=your_webhook_secret
STRAVA_VERIFY_TOKEN=your_verify_token

# Token Encryption
# Generate with: python generate_encryption_key.py
OAUTH_TOKEN_ENCRYPTION_KEY=your_fernet_encryption_key
""")


def print_setup_instructions():
    """Print setup instructions for OAuth providers"""
    print("\n" + "=" * 60)
    print("OAuth Provider Setup Instructions")
    print("=" * 60)
    
    print("\n📱 GARMIN CONNECT:")
    print("  1. Visit: https://developer.garmin.com/gc-developer-program/")
    print("  2. Create a developer account (if needed)")
    print("  3. Register your application")
    print("  4. Set redirect URI to: http://localhost:8000/api/integrations/garmin/oauth/callback")
    print("  5. Copy Client ID and Client Secret to .env")
    print("  6. Note: Garmin uses OAuth 2.0 PKCE (already implemented)")
    
    print("\n🏃 STRAVA:")
    print("  1. Visit: https://www.strava.com/settings/api")
    print("  2. Create a new application")
    print("  3. Set redirect URI to: http://localhost:8000/api/integrations/strava/oauth/callback")
    print("  4. Copy Client ID and Client Secret to .env")
    print("  5. For webhooks:")
    print("     - Set webhook URL: http://your-domain.com/api/integrations/strava/webhook")
    print("     - Generate a webhook secret and add to STRAVA_WEBHOOK_SECRET")
    print("     - Set STRAVA_VERIFY_TOKEN for webhook subscription")
    print("  6. Note: Request scope 'activity:read_all' (already configured)")
    
    print("\n🔐 ENCRYPTION KEY:")
    print("  Run: python generate_encryption_key.py")
    print("  Copy the generated key to OAUTH_TOKEN_ENCRYPTION_KEY in .env")


if __name__ == "__main__":
    print("OAuth Setup Checker")
    print("=" * 60)
    
    is_configured = check_env_file()
    
    if not is_configured:
        print_setup_instructions()
        print_template()
    else:
        print("\n✅ Ready to use OAuth integrations!")
        print("\nNext steps:")
        print("  1. Make sure database is initialized: python init_db.py")
        print("  2. Start the backend server")
        print("  3. Test OAuth endpoints at /api/integrations/garmin/oauth/authorize")
