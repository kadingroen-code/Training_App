"""
Tests for FTP Engine
"""

import pytest
from app.engine.ftp_engine import FTPEngine


def test_ftp_engine_initialization():
    """Test FTP engine initialization."""
    engine = FTPEngine(ftp=250.0)
    assert engine.ftp == 250.0
    assert engine.base_ftp == 250.0


def test_ftp_engine_invalid_ftp():
    """Test that invalid FTP raises error."""
    with pytest.raises(ValueError):
        FTPEngine(ftp=-1)


def test_calculate_power_for_zone():
    """Test power calculation for different zones."""
    engine = FTPEngine(ftp=250.0)
    
    zone_2_min, zone_2_max = engine.calculate_power_for_zone("zone_2")
    assert 250 * 0.55 <= zone_2_min <= 250 * 0.75
    assert 250 * 0.55 <= zone_2_max <= 250 * 0.75
    
    zone_4_min, zone_4_max = engine.calculate_power_for_zone("zone_4")
    assert 250 * 0.91 <= zone_4_min <= 250 * 1.05
    assert 250 * 0.91 <= zone_4_max <= 250 * 1.05


def test_resolve_power_target():
    """Test resolving percentage-based power targets."""
    engine = FTPEngine(ftp=250.0)
    
    power_60 = engine.resolve_power_target(0.60)
    assert power_60 == 250.0 * 0.60
    
    power_105 = engine.resolve_power_target(1.05)
    assert power_105 == 250.0 * 1.05


def test_adaptive_adjustment():
    """Test adaptive FTP adjustment logic."""
    engine = FTPEngine(ftp=250.0)
    
    # Level 9.0 should trigger adjustment
    assert engine.check_adaptive_adjustment(9.0) == True
    assert engine.check_adaptive_adjustment(9.5) == True
    assert engine.check_adaptive_adjustment(8.9) == False
    
    # Apply adjustment
    new_ftp = engine.apply_adaptive_adjustment()
    assert new_ftp == 250.0 * 1.02
