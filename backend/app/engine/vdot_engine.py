"""
VDOT Scaling Engine for Running Workouts

Implements the regression formula to calculate VO2 based on distance and time,
and provides pace calculations for different training zones.
"""

from typing import Dict, Optional
from math import sqrt


class VDOTEngine:
    """
    Dynamic scaling engine for running workouts based on VDOT.
    
    Formula: VO2 = -4.60 + 0.182258 * (d/t) + 0.000104 * (d/t)^2
    where d = distance in meters, t = time in minutes
    """
    
    # Pace constants (in days/km) for different zones
    PACE_CONSTANTS = {
        "easy": 0.085520318486574,      # Slower/Easy pace
        "threshold": 0.06970165201477,  # Threshold pace
        "interval": 0.064668134797248,  # VO2max/Interval pace
    }
    
    def __init__(self, vdot: float):
        """
        Initialize VDOT engine with athlete's current VDOT.
        
        Args:
            vdot: Athlete's current VDOT value
        """
        if vdot <= 0:
            raise ValueError("VDOT must be a positive number")
        self.vdot = vdot
    
    def calculate_vo2_from_performance(self, distance_meters: float, time_minutes: float) -> float:
        """
        Calculate VO2 from a performance (distance and time).
        
        Formula: VO2 = -4.60 + 0.182258 * (d/t) + 0.000104 * (d/t)^2
        
        Args:
            distance_meters: Distance in meters
            time_minutes: Time in minutes
            
        Returns:
            Calculated VO2 value
        """
        if time_minutes <= 0:
            raise ValueError("Time must be positive")
        if distance_meters <= 0:
            raise ValueError("Distance must be positive")
        
        velocity = distance_meters / time_minutes  # meters per minute
        vo2 = -4.60 + 0.182258 * velocity + 0.000104 * (velocity ** 2)
        
        return max(0, vo2)  # Ensure non-negative
    
    def calculate_pace_for_zone(self, zone: str) -> float:
        """
        Calculate target pace (in min/km) for a specific training zone.
        
        Args:
            zone: Training zone ("easy", "threshold", "interval")
            
        Returns:
            Pace in minutes per kilometer
        """
        if zone not in self.PACE_CONSTANTS:
            raise ValueError(f"Unknown zone: {zone}. Must be one of {list(self.PACE_CONSTANTS.keys())}")
        
        pace_constant = self.PACE_CONSTANTS[zone]
        # Convert from days/km to min/km
        pace_min_per_km = pace_constant * 24 * 60
        
        # Scale based on VDOT (simplified - in practice, this would use a more complex lookup table)
        # For now, we'll use a linear approximation
        base_vdot = 50.0  # Reference VDOT
        pace_adjustment = (base_vdot / self.vdot)
        target_pace = pace_min_per_km * pace_adjustment
        
        return target_pace
    
    def resolve_pace_target(self, target_percentage: float, zone: str = "threshold") -> float:
        """
        Resolve a percentage-based pace target to absolute pace.
        
        Args:
            target_percentage: Percentage of VDOT-pace (e.g., 1.05 for 105%)
            zone: Base zone to calculate from
            
        Returns:
            Absolute pace in min/km
        """
        base_pace = self.calculate_pace_for_zone(zone)
        return base_pace / target_percentage
    
    def calculate_time_for_distance(self, distance_meters: float, pace_min_per_km: float) -> float:
        """
        Calculate time to complete a distance at a given pace.
        
        Args:
            distance_meters: Distance in meters
            pace_min_per_km: Pace in minutes per kilometer
            
        Returns:
            Time in minutes
        """
        distance_km = distance_meters / 1000.0
        return distance_km * pace_min_per_km
    
    def get_zone_paces(self) -> Dict[str, float]:
        """
        Get all zone paces for the athlete's VDOT.
        
        Returns:
            Dictionary mapping zone names to paces (min/km)
        """
        return {
            zone: self.calculate_pace_for_zone(zone)
            for zone in self.PACE_CONSTANTS.keys()
        }
