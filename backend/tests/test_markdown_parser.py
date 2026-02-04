"""
Tests for Markdown Workout Parser
"""

from app.parsers.markdown_parser import MarkdownWorkoutParser


def test_parse_running_workout():
    """Test parsing a running workout from markdown."""
    parser = MarkdownWorkoutParser()
    
    markdown = """
    Warmup - 1km easy
    Main Set 5x - 800m 105% VDOT-Pace
    Cooldown - 1km easy
    """
    
    result = parser.parse(markdown, sport="run")
    assert result["sport"] == "run"
    assert len(result["segments"]) == 3
    assert result["segments"][0]["type"] == "warmup"
    assert result["segments"][1]["type"] == "main"
    assert result["segments"][1]["repetitions"] == 5


def test_parse_cycling_workout():
    """Test parsing a cycling workout from markdown."""
    parser = MarkdownWorkoutParser()
    
    markdown = """
    Warmup - 10m 60% FTP
    Main Set 3x - 5m 105% FTP
    Cooldown - 10m easy
    """
    
    result = parser.parse(markdown, sport="bike")
    assert result["sport"] == "bike"
    assert len(result["segments"]) == 3
    assert "power_target" in result["segments"][0]
    assert "60% FTP" in result["segments"][0]["power_target"]
