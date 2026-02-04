"""
Workout Resolver - Converts workout templates with relative targets
to absolute values based on athlete's fitness markers.
"""

from typing import Dict, List, Any, Optional
from app.engine.vdot_engine import VDOTEngine
from app.engine.ftp_engine import FTPEngine


class WorkoutResolver:
    """
    Resolves workout templates by converting relative targets (e.g., "105% VDOT-Pace")
    to absolute values (e.g., "4:15 min/km") based on athlete's current fitness.
    """
    
    def __init__(self, vdot: Optional[float] = None, ftp: Optional[float] = None):
        """
        Initialize resolver with athlete's fitness markers.
        
        Args:
            vdot: Athlete's VDOT (for running workouts)
            ftp: Athlete's FTP in watts (for cycling workouts)
        """
        self.vdot_engine = VDOTEngine(vdot) if vdot else None
        self.ftp_engine = FTPEngine(ftp) if ftp else None
    
    def resolve_running_segment(self, segment: Dict[str, Any]) -> Dict[str, Any]:
        """
        Resolve a running workout segment.
        
        Expected segment format:
        {
            "type": "run",
            "distance": 800,  # meters
            "pace_target": "105% VDOT-Pace",  # or "threshold", "easy", "interval"
            "zone": "interval"  # optional, used if pace_target is zone name
        }
        
        Returns:
            Resolved segment with absolute pace and time
        """
        if not self.vdot_engine:
            raise ValueError("VDOT engine not initialized. Cannot resolve running segment.")
        
        resolved = segment.copy()
        
        # Parse pace target
        pace_target = segment.get("pace_target", "threshold")
        
        if isinstance(pace_target, str):
            if "%" in pace_target and "VDOT" in pace_target:
                # Parse percentage (e.g., "105% VDOT-Pace")
                percentage_str = pace_target.split("%")[0].strip()
                try:
                    percentage = float(percentage_str) / 100.0
                    zone = segment.get("zone", "threshold")
                    absolute_pace = self.vdot_engine.resolve_pace_target(percentage, zone)
                except ValueError:
                    # Fallback to zone-based pace
                    zone = segment.get("zone", "threshold")
                    absolute_pace = self.vdot_engine.calculate_pace_for_zone(zone)
            elif pace_target.lower() in ["easy", "threshold", "interval"]:
                # Zone name
                absolute_pace = self.vdot_engine.calculate_pace_for_zone(pace_target.lower())
            else:
                # Assume it's already an absolute pace (min/km)
                absolute_pace = float(pace_target)
        else:
            # Numeric value assumed to be absolute pace
            absolute_pace = float(pace_target)
        
        resolved["absolute_pace_min_per_km"] = round(absolute_pace, 2)
        
        # Calculate time if distance is provided
        if "distance" in segment:
            distance_m = float(segment["distance"])
            time_minutes = self.vdot_engine.calculate_time_for_distance(distance_m, absolute_pace)
            resolved["target_time_minutes"] = round(time_minutes, 2)
        
        return resolved
    
    def resolve_cycling_segment(self, segment: Dict[str, Any]) -> Dict[str, Any]:
        """
        Resolve a cycling workout segment.
        
        Expected segment format:
        {
            "type": "bike",
            "duration": 10,  # minutes
            "power_target": "60% FTP",  # or zone name like "zone_2"
            "zone": "zone_2"  # optional
        }
        
        Returns:
            Resolved segment with absolute power target
        """
        if not self.ftp_engine:
            raise ValueError("FTP engine not initialized. Cannot resolve cycling segment.")
        
        resolved = segment.copy()
        
        # Parse power target
        power_target = segment.get("power_target", "zone_2")
        
        if isinstance(power_target, str):
            if "%" in power_target and "FTP" in power_target:
                # Parse percentage (e.g., "60% FTP")
                percentage_str = power_target.split("%")[0].strip()
                try:
                    percentage = float(percentage_str) / 100.0
                    absolute_power = self.ftp_engine.resolve_power_target(percentage)
                except ValueError:
                    # Fallback to zone-based power
                    zone = segment.get("zone", "zone_2")
                    min_power, max_power = self.ftp_engine.calculate_power_for_zone(zone)
                    absolute_power = (min_power + max_power) / 2  # Use midpoint
            elif power_target.startswith("zone_"):
                # Zone name
                min_power, max_power = self.ftp_engine.calculate_power_for_zone(power_target)
                absolute_power = (min_power + max_power) / 2  # Use midpoint
                resolved["power_range"] = (round(min_power, 0), round(max_power, 0))
            else:
                # Assume it's already absolute power in watts
                absolute_power = float(power_target)
        else:
            # Numeric value assumed to be absolute power
            absolute_power = float(power_target)
        
        resolved["absolute_power_watts"] = round(absolute_power, 0)
        
        return resolved
    
    def resolve_workout(self, workout_template: Dict[str, Any]) -> Dict[str, Any]:
        """
        Resolve an entire workout template.
        
        Expected template format:
        {
            "sport": "run" | "bike",
            "segments": [
                {"type": "warmup", ...},
                {"type": "main", ...},
                {"type": "cooldown", ...}
            ]
        }
        
        Returns:
            Resolved workout with all absolute targets
        """
        resolved = workout_template.copy()
        resolved_segments = []
        
        for segment in workout_template.get("segments", []):
            segment_type = segment.get("type", "").lower()
            sport = workout_template.get("sport", "").lower()
            
            if sport == "run" or segment_type in ["run", "warmup", "cooldown"]:
                resolved_segment = self.resolve_running_segment(segment)
            elif sport == "bike" or segment_type in ["bike", "ride"]:
                resolved_segment = self.resolve_cycling_segment(segment)
            else:
                # Unknown type, pass through
                resolved_segment = segment
            
            resolved_segments.append(resolved_segment)
        
        resolved["segments"] = resolved_segments
        resolved["resolved"] = True
        
        return resolved
