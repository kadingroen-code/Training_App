"""
Database initialization script (safe version)
Creates all tables using SQLAlchemy models
Works even if .env file is missing or has permission issues
"""

import os
import sys

# Set default DATABASE_URL if not in environment
if "DATABASE_URL" not in os.environ:
    os.environ["DATABASE_URL"] = "postgresql://user:password@localhost:5432/endurance_training"
    print("⚠️  Using default DATABASE_URL. Set DATABASE_URL in environment or .env file for production.")
    print(f"   Current: {os.environ['DATABASE_URL']}")
    print()

# Try to import, handling .env permission issues
try:
    from app.core.database import engine, Base
    from app.models import User, AthleteProfile, WorkoutTemplate, CalendarEvent, PAIRSLog, OAuthToken
except Exception as e:
    error_msg = str(e)
    if "Operation not permitted" in error_msg or ".env" in error_msg.lower():
        print("⚠️  .env file permission issue detected.")
        print("   Trying to work around it...")
        # Temporarily disable .env loading
        import app.core.config as config_module
        # Re-import after setting env vars
        if "DATABASE_URL" not in os.environ:
            os.environ["DATABASE_URL"] = "postgresql://user:password@localhost:5432/endurance_training"
        # Force reload config
        import importlib
        importlib.reload(config_module)
        from app.core.database import engine, Base
        from app.models import User, AthleteProfile, WorkoutTemplate, CalendarEvent, PAIRSLog, OAuthToken
    else:
        print(f"❌ Import error: {e}")
        print("\nMake sure you're running from the backend directory:")
        print("  cd backend")
        print("  python3 init_db_safe.py")
        sys.exit(1)

def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    print(f"Database URL: {os.environ.get('DATABASE_URL', 'Not set')}")
    print()
    
    try:
        # Test database connection first
        with engine.connect() as conn:
            print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("\nPlease check:")
        print("  1. PostgreSQL is running")
        print("  2. DATABASE_URL is correct in .env or environment")
        print("  3. Database 'endurance_training' exists")
        print("\nTo create database:")
        print("  createdb endurance_training")
        sys.exit(1)
    
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        print("\nTables created:")
        print("  - users")
        print("  - athlete_profiles")
        print("  - workout_templates")
        print("  - calendar_events")
        print("  - pairs_logs")
        print("  - oauth_tokens")
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_db()
