"""
Markdown Workout Parser

Parses coach input like:
"Warmup - 10m 60% FTP
Main Set 5x - 800m 105% VDOT-Pace
Cooldown - 5m easy"

Into structured workout template JSON.
"""

import re
from typing import Dict, List, Any, Optional


class MarkdownWorkoutParser:
    """
    Parses markdown/text workout descriptions into structured JSON templates.
    """
    
    # Patterns for different workout elements
    PATTERNS = {
        "segment_header": re.compile(r'^(warmup|warm-up|main|main set|cooldown|cool-down|intervals?|recovery)', re.IGNORECASE),
        "distance_time": re.compile(r'(\d+(?:\.\d+)?)\s*(m|km|meters?|kilometers?|min|minutes?|hr|hours?)', re.IGNORECASE),
        "repetitions": re.compile(r'(\d+)x\s*[-–]?\s*', re.IGNORECASE),
        "percentage_ftp": re.compile(r'(\d+(?:\.\d+)?)%\s*FTP', re.IGNORECASE),
        "percentage_vdot": re.compile(r'(\d+(?:\.\d+)?)%\s*VDOT[-_]?Pace', re.IGNORECASE),
        "zone": re.compile(r'\b(easy|moderate|tempo|threshold|interval|vo2max|zone\s*[1-6])\b', re.IGNORECASE),
    }
    
    def parse(self, markdown_text: str, sport: str = "run") -> Dict[str, Any]:
        """
        Parse markdown workout text into structured template.
        
        Args:
            markdown_text: Raw markdown/text input
            sport: Sport type ("run", "bike", etc.)
            
        Returns:
            Structured workout template dictionary
        """
        lines = [line.strip() for line in markdown_text.split('\n') if line.strip()]
        
        segments = []
        current_segment = None
        
        for line in lines:
            # Check if this is a new segment header
            header_match = self.PATTERNS["segment_header"].search(line)
            if header_match:
                # Save previous segment if exists
                if current_segment:
                    segments.append(current_segment)
                
                # Start new segment
                segment_type = header_match.group(1).lower().replace('-', '').replace(' ', '_')
                if segment_type == "main_set":
                    segment_type = "main"
                
                current_segment = {
                    "type": segment_type,
                    "sport": sport
                }
                
                # Parse the rest of the line
                remaining = line[header_match.end():].strip()
                self._parse_segment_content(remaining, current_segment)
            elif current_segment:
                # Continue parsing current segment
                self._parse_segment_content(line, current_segment)
            else:
                # No segment header yet, try to infer
                current_segment = {"type": "main", "sport": sport}
                self._parse_segment_content(line, current_segment)
        
        # Add last segment
        if current_segment:
            segments.append(current_segment)
        
        return {
            "sport": sport,
            "segments": segments,
            "markdown_source": markdown_text
        }
    
    def _parse_segment_content(self, text: str, segment: Dict[str, Any]):
        """Parse content within a segment line."""
        # Check for repetitions
        rep_match = self.PATTERNS["repetitions"].search(text)
        if rep_match:
            segment["repetitions"] = int(rep_match.group(1))
            text = self.PATTERNS["repetitions"].sub('', text).strip()
        
        # Parse distance/time
        dt_matches = list(self.PATTERNS["distance_time"].finditer(text))
        if dt_matches:
            for match in dt_matches:
                value = float(match.group(1))
                unit = match.group(2).lower()
                
                if unit in ['m', 'meter', 'meters']:
                    segment["distance"] = int(value)
                elif unit in ['km', 'kilometer', 'kilometers']:
                    segment["distance"] = int(value * 1000)
                elif unit in ['min', 'minute', 'minutes']:
                    segment["duration"] = value
                elif unit in ['hr', 'hour', 'hours']:
                    segment["duration"] = value * 60
        
        # Parse power targets (cycling)
        ftp_match = self.PATTERNS["percentage_ftp"].search(text)
        if ftp_match:
            percentage = float(ftp_match.group(1))
            segment["power_target"] = f"{percentage}% FTP"
            segment["zone"] = self._ftp_to_zone(percentage)
        
        # Parse pace targets (running)
        vdot_match = self.PATTERNS["percentage_vdot"].search(text)
        if vdot_match:
            percentage = float(vdot_match.group(1))
            segment["pace_target"] = f"{percentage}% VDOT-Pace"
            segment["zone"] = self._percentage_to_zone(percentage)
        
        # Parse zone names
        zone_match = self.PATTERNS["zone"].search(text)
        if zone_match and "zone" not in segment:
            zone_name = zone_match.group(1).lower()
            if segment.get("sport") == "bike":
                segment["zone"] = self._normalize_cycling_zone(zone_name)
            else:
                segment["zone"] = self._normalize_running_zone(zone_name)
                segment["pace_target"] = zone_name
    
    def _ftp_to_zone(self, percentage: float) -> str:
        """Convert FTP percentage to zone name."""
        if percentage < 0.55:
            return "zone_1"
        elif percentage <= 0.75:
            return "zone_2"
        elif percentage <= 0.90:
            return "zone_3"
        elif percentage <= 1.05:
            return "zone_4"
        elif percentage <= 1.20:
            return "zone_5"
        else:
            return "zone_6"
    
    def _percentage_to_zone(self, percentage: float) -> str:
        """Convert VDOT percentage to zone name."""
        if percentage < 0.90:
            return "easy"
        elif percentage <= 1.05:
            return "threshold"
        else:
            return "interval"
    
    def _normalize_cycling_zone(self, zone_name: str) -> str:
        """Normalize cycling zone names."""
        zone_map = {
            "easy": "zone_2",
            "moderate": "zone_3",
            "tempo": "zone_3",
            "threshold": "zone_4",
            "interval": "zone_5",
            "vo2max": "zone_5",
        }
        # Handle "zone 1", "zone_1", etc.
        if "zone" in zone_name:
            num = re.search(r'\d+', zone_name)
            if num:
                return f"zone_{num.group()}"
        return zone_map.get(zone_name, "zone_2")
    
    def _normalize_running_zone(self, zone_name: str) -> str:
        """Normalize running zone names."""
        zone_map = {
            "easy": "easy",
            "moderate": "easy",
            "tempo": "threshold",
            "threshold": "threshold",
            "interval": "interval",
            "vo2max": "interval",
        }
        return zone_map.get(zone_name, "threshold")
