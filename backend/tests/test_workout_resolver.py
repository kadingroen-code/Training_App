"""
Tests for Workout Resolver
"""

import pytest
from app.engine.workout_resolver import WorkoutResolver


def test_resolve_running_segment():
    """Test resolving a running workout segment."""
    resolver = WorkoutResolver(vdot=50.0)
    
    segment = {
        "type": "run",
        "distance": 800,
        "pace_target": "105% VDOT-Pace",
        "zone": "threshold"
    }
    
    resolved = resolver.resolve_running_segment(segment)
    assert "absolute_pace_min_per_km" in resolved
    assert "target_time_minutes" in resolved
    assert resolved["absolute_pace_min_per_km"] > 0


def test_resolve_cycling_segment():
    """Test resolving a cycling workout segment."""
    resolver = WorkoutResolver(ftp=250.0)
    
    segment = {
        "type": "bike",
        "duration": 10,
        "power_target": "60% FTP",
        "zone": "zone_2"
    }
    
    resolved = resolver.resolve_cycling_segment(segment)
    assert "absolute_power_watts" in resolved
    assert resolved["absolute_power_watts"] == 250.0 * 0.60


def test_resolve_full_workout():
    """Test resolving a complete workout template."""
    resolver = WorkoutResolver(vdot=50.0, ftp=250.0)
    
    workout = {
        "sport": "run",
        "segments": [
            {"type": "warmup", "distance": 1000, "pace_target": "easy"},
            {"type": "main", "distance": 800, "pace_target": "105% VDOT-Pace", "zone": "threshold"},
            {"type": "cooldown", "distance": 1000, "pace_target": "easy"}
        ]
    }
    
    resolved = resolver.resolve_workout(workout)
    assert resolved["resolved"] == True
    assert len(resolved["segments"]) == 3
    assert all("absolute_pace_min_per_km" in seg for seg in resolved["segments"])
