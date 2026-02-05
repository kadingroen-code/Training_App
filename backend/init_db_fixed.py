"""
Database initialization script (fixed version)
Handles .env permission issues by setting environment variables directly
"""

import os
import sys

# Set environment variables before importing app modules
# This avoids .env file permission issues
if "DATABASE_URL" not in os.environ:
    # Try to read from .env manually, or use default
    env_file = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_file):
        try:
            with open(env_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        key = key.strip()
                        value = value.strip().strip('"').strip("'")
                        if key == "DATABASE_URL" and key not in os.environ:
                            os.environ[key] = value
        except Exception:
            pass  # If we can't read .env, use default
    
    if "DATABASE_URL" not in os.environ:
        os.environ["DATABASE_URL"] = "postgresql://user:password@localhost:5432/endurance_training"
        print("⚠️  Using default DATABASE_URL")
        print(f"   Set DATABASE_URL in .env or environment for production")
        print()

# Now import after setting env vars
try:
    # Temporarily disable .env loading in config
    # by setting a flag before import
    os.environ["SKIP_ENV_FILE"] = "1"
    
    from app.core.database import engine, Base
    from app.models import User, AthleteProfile, WorkoutTemplate, CalendarEvent, PAIRSLog, OAuthToken
    
    # Clear the flag
    if "SKIP_ENV_FILE" in os.environ:
        del os.environ["SKIP_ENV_FILE"]
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nTroubleshooting:")
    print("  1. Make sure you're in the backend directory")
    print("  2. Check PostgreSQL is running: brew services list")
    print("  3. Create database: createdb endurance_training")
    print("  4. Update DATABASE_URL in .env file")
    sys.exit(1)

def init_db():
    """Create all database tables"""
    print("Initializing database...")
    db_url = os.environ.get("DATABASE_URL", "not set")
    # Mask password in output
    if "@" in db_url:
        parts = db_url.split("@")
        if len(parts) == 2:
            db_url = "postgresql://***@" + parts[1]
    print(f"Database: {db_url}")
    print()
    
    # Test connection
    try:
        with engine.connect() as conn:
            print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("\nPlease check:")
        print("  1. PostgreSQL is running:")
        print("     brew services list  # Check if postgresql is started")
        print("     brew services start postgresql@15  # Start if needed")
        print("  2. Database exists:")
        print("     createdb endurance_training")
        print("  3. DATABASE_URL is correct in .env:")
        print("     DATABASE_URL=postgresql://username:password@localhost:5432/endurance_training")
        sys.exit(1)
    
    # Create tables
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        print("\nTables created:")
        print("  ✓ users")
        print("  ✓ athlete_profiles")
        print("  ✓ workout_templates")
        print("  ✓ calendar_events")
        print("  ✓ pairs_logs")
        print("  ✓ oauth_tokens")
        print("\n🎉 Database initialization complete!")
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_db()
