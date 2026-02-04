"""
FTP Scaling Engine for Cycling Workouts

Implements power zone calculations based on Functional Threshold Power (FTP)
and adaptive FTP adjustments based on performance.
"""

from typing import Dict, Optional, Tuple


class FTPEngine:
    """
    Dynamic scaling engine for cycling workouts based on FTP.
    
    Power Zones:
    - Zone 2 (Endurance): 55% - 75% FTP
    - Zone 4 (Threshold): 91% - 105% FTP
    - Zone 5 (VO2max): 106% - 120% FTP
    """
    
    # Power zone definitions as percentage of FTP
    POWER_ZONES = {
        "zone_1": (0.50, 0.54),      # Active Recovery
        "zone_2": (0.55, 0.75),      # Endurance
        "zone_3": (0.76, 0.90),      # Tempo
        "zone_4": (0.91, 1.05),      # Threshold
        "zone_5": (1.06, 1.20),      # VO2max
        "zone_6": (1.21, 1.50),      # Anaerobic
    }
    
    # Adaptive FTP adjustment threshold
    LEVEL_9_THRESHOLD = 9.0
    FTP_ADJUSTMENT_PERCENTAGE = 0.02  # 2% increase
    
    def __init__(self, ftp: float):
        """
        Initialize FTP engine with athlete's current FTP.
        
        Args:
            ftp: Athlete's current Functional Threshold Power in watts
        """
        if ftp <= 0:
            raise ValueError("FTP must be a positive number")
        self.ftp = ftp
        self.base_ftp = ftp  # Store original for tracking
    
    def calculate_power_for_zone(self, zone: str) -> Tuple[float, float]:
        """
        Calculate power range for a specific training zone.
        
        Args:
            zone: Training zone ("zone_2", "zone_4", "zone_5", etc.)
            
        Returns:
            Tuple of (min_power, max_power) in watts
        """
        if zone not in self.POWER_ZONES:
            raise ValueError(f"Unknown zone: {zone}. Must be one of {list(self.POWER_ZONES.keys())}")
        
        min_pct, max_pct = self.POWER_ZONES[zone]
        min_power = self.ftp * min_pct
        max_power = self.ftp * max_pct
        
        return (min_power, max_power)
    
    def resolve_power_target(self, target_percentage: float) -> float:
        """
        Resolve a percentage-based power target to absolute power.
        
        Args:
            target_percentage: Percentage of FTP (e.g., 0.60 for 60%, 1.05 for 105%)
            
        Returns:
            Absolute power in watts
        """
        return self.ftp * target_percentage
    
    def get_zone_powers(self) -> Dict[str, Tuple[float, float]]:
        """
        Get all zone power ranges for the athlete's FTP.
        
        Returns:
            Dictionary mapping zone names to (min_power, max_power) tuples
        """
        return {
            zone: self.calculate_power_for_zone(zone)
            for zone in self.POWER_ZONES.keys()
        }
    
    def check_adaptive_adjustment(self, session_level: float) -> bool:
        """
        Check if FTP should be adjusted based on session completion.
        
        Args:
            session_level: Session intensity level (e.g., 9.0 for Level 9.0)
            
        Returns:
            True if adjustment should be applied
        """
        return session_level >= self.LEVEL_9_THRESHOLD
    
    def apply_adaptive_adjustment(self) -> float:
        """
        Apply 2% FTP increase after completing Level 9.0+ sessions.
        
        Returns:
            New FTP value
        """
        self.ftp = self.ftp * (1 + self.FTP_ADJUSTMENT_PERCENTAGE)
        return self.ftp
    
    def reset_to_base(self):
        """Reset FTP to original base value."""
        self.ftp = self.base_ftp
    
    def update_ftp(self, new_ftp: float):
        """
        Update FTP value (e.g., from new test results).
        
        Args:
            new_ftp: New FTP value in watts
        """
        if new_ftp <= 0:
            raise ValueError("FTP must be a positive number")
        self.ftp = new_ftp
        self.base_ftp = new_ftp
