"""
Script to test API endpoints programmatically
Run this after starting the backend server to verify all endpoints work
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint"""
    print("🏥 Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
    print("   ✅ Health check passed\n")
    return True

def test_get_athlete_profile(athlete_id: int = 2):
    """Test getting athlete profile"""
    print(f"👤 Testing get athlete profile (ID: {athlete_id})...")
    response = requests.get(f"{BASE_URL}/api/athletes/{athlete_id}/profile")
    assert response.status_code == 200
    data = response.json()
    assert "current_vdot" in data
    assert "current_ftp" in data
    print(f"   ✅ Profile retrieved: VDOT={data.get('current_vdot')}, FTP={data.get('current_ftp')}\n")
    return data

def test_create_workout_template(coach_id: int = 1):
    """Test creating a workout template"""
    print(f"📝 Testing create workout template (Coach ID: {coach_id})...")
    payload = {
        "name": "Threshold Run",
        "description": "5x 1km at threshold pace",
        "sport": "running",
        "markdown_source": "Warmup - 10m easy\nMain Set 5x - 1km 100% VDOT-Pace\nCooldown - 5m easy"
    }
    response = requests.post(
        f"{BASE_URL}/api/workouts/?coach_id={coach_id}",
        json=payload
    )
    assert response.status_code == 200
    data = response.json()
    template_id = data["id"]
    print(f"   ✅ Template created: ID={template_id}, Name={data['name']}\n")
    return template_id

def test_list_workout_templates(coach_id: int = 1):
    """Test listing workout templates"""
    print(f"📋 Testing list workout templates (Coach ID: {coach_id})...")
    response = requests.get(f"{BASE_URL}/api/workouts/?coach_id={coach_id}")
    assert response.status_code == 200
    templates = response.json()
    print(f"   ✅ Found {len(templates)} template(s)\n")
    return templates

def test_resolve_workout(template_id: int, athlete_id: int = 2):
    """Test resolving a workout for an athlete"""
    print(f"🔧 Testing resolve workout (Template: {template_id}, Athlete: {athlete_id})...")
    response = requests.post(
        f"{BASE_URL}/api/workouts/{template_id}/resolve?athlete_id={athlete_id}"
    )
    assert response.status_code == 200
    resolved = response.json()
    print(f"   ✅ Workout resolved successfully")
    print(f"   📊 Resolved workout structure: {json.dumps(resolved, indent=2)[:200]}...\n")
    return resolved

def test_create_calendar_event(athlete_id: int = 2, template_id: int = 1):
    """Test creating a calendar event"""
    print(f"📅 Testing create calendar event (Athlete: {athlete_id}, Template: {template_id})...")
    payload = {
        "athlete_id": athlete_id,
        "template_id": template_id,
        "scheduled_date": "2024-01-15"
    }
    response = requests.post(
        f"{BASE_URL}/api/calendar/",
        json=payload
    )
    assert response.status_code == 200
    data = response.json()
    event_id = data["id"]
    print(f"   ✅ Calendar event created: ID={event_id}\n")
    return event_id

def test_get_athlete_calendar(athlete_id: int = 2):
    """Test getting athlete calendar"""
    print(f"📆 Testing get athlete calendar (Athlete: {athlete_id})...")
    response = requests.get(f"{BASE_URL}/api/calendar/athlete/{athlete_id}")
    assert response.status_code == 200
    events = response.json()
    print(f"   ✅ Found {len(events)} calendar event(s)\n")
    return events

def test_create_pairs_log(athlete_id: int = 2):
    """Test creating a PAIRS log"""
    print(f"📊 Testing create PAIRS log (Athlete: {athlete_id})...")
    payload = {
        "muscle_soreness": 3,
        "joint_pain": 2,
        "notes": "Feeling good after workout"
    }
    response = requests.post(
        f"{BASE_URL}/api/pairs/?athlete_id={athlete_id}",
        json=payload
    )
    assert response.status_code == 200
    data = response.json()
    log_id = data["id"]
    print(f"   ✅ PAIRS log created: ID={log_id}, Alert={data['alert_coach']}\n")
    return log_id

def test_get_pairs_logs(athlete_id: int = 2):
    """Test getting PAIRS logs"""
    print(f"📋 Testing get PAIRS logs (Athlete: {athlete_id})...")
    response = requests.get(f"{BASE_URL}/api/pairs/athlete/{athlete_id}?limit=10")
    assert response.status_code == 200
    logs = response.json()
    print(f"   ✅ Found {len(logs)} PAIRS log(s)\n")
    return logs

def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 API Endpoint Testing")
    print("=" * 60)
    print("\n⚠️  Make sure the backend server is running on http://localhost:8000\n")
    
    try:
        # Basic health check
        test_health_check()
        
        # Athlete profile tests
        profile = test_get_athlete_profile()
        
        # Workout template tests
        template_id = test_create_workout_template()
        test_list_workout_templates()
        resolved = test_resolve_workout(template_id)
        
        # Calendar tests
        event_id = test_create_calendar_event(template_id=template_id)
        test_get_athlete_calendar()
        
        # PAIRS tests
        pairs_id = test_create_pairs_log()
        test_get_pairs_logs()
        
        print("=" * 60)
        print("✅ All tests passed!")
        print("=" * 60)
        print("\n📝 Summary:")
        print(f"   - Athlete Profile: ✅")
        print(f"   - Workout Template: ✅ (ID: {template_id})")
        print(f"   - Workout Resolution: ✅")
        print(f"   - Calendar Event: ✅ (ID: {event_id})")
        print(f"   - PAIRS Log: ✅ (ID: {pairs_id})")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to backend server!")
        print("   Make sure the backend is running: python3 backend/run.py")
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()
