"""
Activity matching service
Matches activities from Garmin/Strava to calendar events by date and time
"""

from datetime import datetime, timedelta
from typing import Dict, Optional
from app.models.calendar_event import CalendarEvent


def match_activity_to_event(
    activity: Dict,
    event: CalendarEvent,
    time_window_hours: int = 2
) -> bool:
    """
    Check if an activity matches a calendar event based on date and time.
    
    Args:
        activity: Activity dictionary from Garmin/Strava API
        event: CalendarEvent to match against
        time_window_hours: Time window in hours for matching (default: ±2 hours)
        
    Returns:
        True if activity matches event, False otherwise
    """
    # Extract activity start time
    activity_start = parse_activity_start_time(activity)
    if not activity_start:
        return False
    
    # Match by date first
    activity_date = activity_start.date()
    if activity_date != event.scheduled_date:
        return False
    
    # If event has no scheduled time, match by date only
    if not event.scheduled_time:
        return True
    
    # Match by time window (±time_window_hours)
    event_time = event.scheduled_time.replace(tzinfo=None) if event.scheduled_time.tzinfo else event.scheduled_time
    activity_time = activity_start.replace(tzinfo=None) if activity_start.tzinfo else activity_start
    
    time_diff = abs((activity_time - event_time).total_seconds())
    time_window_seconds = time_window_hours * 3600
    
    return time_diff <= time_window_seconds


def parse_activity_start_time(activity: Dict) -> Optional[datetime]:
    """
    Parse activity start time from activity data.
    Handles different formats from Garmin and Strava.
    
    Args:
        activity: Activity dictionary
        
    Returns:
        datetime object or None if parsing fails
    """
    # Try different possible field names
    time_fields = [
        "startTimeLocal",
        "startTimeGMT",
        "start_date_local",
        "start_date",
        "startTime",
        "activityDate",
    ]
    
    for field in time_fields:
        if field in activity:
            time_str = activity[field]
            if isinstance(time_str, str):
                # Try parsing various datetime formats
                formats = [
                    "%Y-%m-%dT%H:%M:%S",
                    "%Y-%m-%dT%H:%M:%S.%f",
                    "%Y-%m-%dT%H:%M:%S%z",
                    "%Y-%m-%dT%H:%M:%S.%f%z",
                    "%Y-%m-%d %H:%M:%S",
                    "%Y-%m-%d",
                ]
                for fmt in formats:
                    try:
                        return datetime.strptime(time_str, fmt)
                    except ValueError:
                        continue
            elif isinstance(time_str, (int, float)):
                # Unix timestamp
                return datetime.fromtimestamp(time_str)
    
    return None


def extract_completion_data(activity: Dict, source: str) -> Dict:
    """
    Extract completion data from activity for storage in calendar event.
    Stores all available data in raw_data, with key metrics at top level.
    
    Args:
        activity: Activity dictionary from API
        source: Source provider ("garmin" or "strava")
        
    Returns:
        Completion data dictionary structured for calendar event
    """
    activity_start = parse_activity_start_time(activity)
    
    # Extract key metrics (common fields)
    completion_data = {
        "source": source,
        "activity_id": str(activity.get("activityId") or activity.get("id", "")),
        "start_time": activity_start.isoformat() if activity_start else None,
        "activity_type": activity.get("activityType", {}).get("typeKey") or activity.get("type", "unknown"),
        "distance_meters": activity.get("distance", 0),
        "duration_seconds": activity.get("elapsedTime", 0) or activity.get("movingTime", 0),
        "average_pace_seconds_per_km": None,
        "average_speed_mps": activity.get("averageSpeed", 0),
        "average_heart_rate": activity.get("averageHR", 0) or activity.get("average_heartrate", 0),
        "max_heart_rate": activity.get("maxHR", 0) or activity.get("max_heartrate", 0),
        "average_power": activity.get("avgPower", 0) or activity.get("watts", 0),
        "max_power": activity.get("maxPower", 0) or activity.get("max_watts", 0),
        "elevation_gain": activity.get("elevationGain", 0) or activity.get("total_elevation_gain", 0),
        "calories": activity.get("calories", 0),
        "raw_data": activity,  # Store all original data
    }
    
    # Calculate pace if we have distance and time
    if completion_data["distance_meters"] and completion_data["duration_seconds"]:
        distance_km = completion_data["distance_meters"] / 1000.0
        duration_minutes = completion_data["duration_seconds"] / 60.0
        if distance_km > 0 and duration_minutes > 0:
            completion_data["average_pace_seconds_per_km"] = (duration_minutes * 60) / distance_km
    
    # Convert speed from m/s to km/h if needed
    if completion_data["average_speed_mps"]:
        completion_data["average_speed_kmh"] = completion_data["average_speed_mps"] * 3.6
    
    # Remove None values for cleaner storage
    completion_data = {k: v for k, v in completion_data.items() if v is not None}
    
    return completion_data


def find_matching_event(
    activity: Dict,
    events: list[CalendarEvent],
    time_window_hours: int = 2
) -> Optional[CalendarEvent]:
    """
    Find the best matching calendar event for an activity.
    
    Args:
        activity: Activity dictionary
        events: List of CalendarEvents to search
        time_window_hours: Time window for matching
        
    Returns:
        Best matching CalendarEvent or None
    """
    matches = []
    
    for event in events:
        if match_activity_to_event(activity, event, time_window_hours):
            # Calculate time difference for ranking
            activity_start = parse_activity_start_time(activity)
            if activity_start and event.scheduled_time:
                event_time = event.scheduled_time.replace(tzinfo=None) if event.scheduled_time.tzinfo else event.scheduled_time
                activity_time = activity_start.replace(tzinfo=None) if activity_start.tzinfo else activity_start
                time_diff = abs((activity_time - event_time).total_seconds())
                matches.append((time_diff, event))
    
    if not matches:
        return None
    
    # Return closest match by time
    matches.sort(key=lambda x: x[0])
    return matches[0][1]
