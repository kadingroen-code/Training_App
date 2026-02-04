"""
Tests for VDOT Engine
"""

import pytest
from app.engine.vdot_engine import VDOTEngine


def test_vdot_engine_initialization():
    """Test VDOT engine initialization."""
    engine = VDOTEngine(vdot=50.0)
    assert engine.vdot == 50.0


def test_vdot_engine_invalid_vdot():
    """Test that invalid VDOT raises error."""
    with pytest.raises(ValueError):
        VDOTEngine(vdot=-1)


def test_calculate_vo2_from_performance():
    """Test VO2 calculation from distance and time."""
    engine = VDOTEngine(vdot=50.0)
    vo2 = engine.calculate_vo2_from_performance(distance_meters=1600, time_minutes=6.0)
    assert vo2 > 0


def test_calculate_pace_for_zone():
    """Test pace calculation for different zones."""
    engine = VDOTEngine(vdot=50.0)
    easy_pace = engine.calculate_pace_for_zone("easy")
    threshold_pace = engine.calculate_pace_for_zone("threshold")
    interval_pace = engine.calculate_pace_for_zone("interval")
    
    # Easy should be slower (higher min/km) than threshold
    assert easy_pace > threshold_pace
    # Threshold should be slower than interval
    assert threshold_pace > interval_pace


def test_resolve_pace_target():
    """Test resolving percentage-based pace targets."""
    engine = VDOTEngine(vdot=50.0)
    pace_105 = engine.resolve_pace_target(1.05, "threshold")
    pace_100 = engine.resolve_pace_target(1.0, "threshold")
    
    # 105% should be faster (lower min/km) than 100%
    assert pace_105 < pace_100
