"""
Database initialization script
Creates all tables using SQLAlchemy models
"""

import os
import sys

# Set default DATABASE_URL if not in environment (helps if .env has issues)
if "DATABASE_URL" not in os.environ:
    os.environ["DATABASE_URL"] = "postgresql://user:password@localhost:5432/endurance_training"

try:
    from app.core.database import engine, Base
    from app.models import User, AthleteProfile, WorkoutTemplate, CalendarEvent, PAIRSLog, OAuthToken
except Exception as e:
    print(f"❌ Error importing modules: {e}")
    print("\nTroubleshooting:")
    print("  1. Make sure you're in the backend directory")
    print("  2. Check that .env file exists and is readable")
    print("  3. Try: python3 init_db_safe.py (uses defaults)")
    sys.exit(1)

def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    
    # Test connection first
    try:
        with engine.connect() as conn:
            print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("\nPlease check:")
        print("  1. PostgreSQL is running")
        print("  2. DATABASE_URL is correct")
        print("  3. Database exists: createdb endurance_training")
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
