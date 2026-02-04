"""
Script to create test data for local development
Creates a coach, athlete, and athlete profile with sample fitness markers
"""

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.athlete_profile import AthleteProfile

db = SessionLocal()

try:
    # Create a coach
    coach = User(
        email="coach@example.com",
        role=UserRole.COACH
    )
    db.add(coach)
    db.commit()
    db.refresh(coach)
    print(f"✅ Created coach: ID={coach.id}, Email={coach.email}")

    # Create an athlete
    athlete = User(
        email="athlete@example.com",
        role=UserRole.ATHLETE
    )
    db.add(athlete)
    db.commit()
    db.refresh(athlete)
    print(f"✅ Created athlete: ID={athlete.id}, Email={athlete.email}")

    # Create athlete profile
    profile = AthleteProfile(
        user_id=athlete.id,
        current_vdot=50.0,  # Example VDOT (moderate runner)
        current_ftp=250.0,   # Example FTP in watts (moderate cyclist)
        max_hr=190,
        threshold_pace=240.0  # 4:00 min/km in seconds
    )
    db.add(profile)
    db.commit()
    print(f"✅ Created athlete profile for user {athlete.id}")
    print(f"   - VDOT: {profile.current_vdot}")
    print(f"   - FTP: {profile.current_ftp}W")
    print(f"   - Max HR: {profile.max_hr} bpm")
    print(f"   - Threshold Pace: {profile.threshold_pace} sec/km")
    
    print("\n📝 Test Data Summary:")
    print(f"   Coach ID: {coach.id}")
    print(f"   Athlete ID: {athlete.id}")
    print(f"   Use these IDs when testing the API endpoints!")

except Exception as e:
    print(f"❌ Error creating test data: {e}")
    db.rollback()
finally:
    db.close()
