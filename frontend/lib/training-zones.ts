/**
 * Training zone calculations based on VDOT and FTP
 */

export interface TrainingZone {
  name: string
  min: number
  max: number
  color: string
  description: string
}

export interface VDOTZones {
  easy: TrainingZone
  moderate: TrainingZone
  threshold: TrainingZone
  interval: TrainingZone
  repetition: TrainingZone
}

export interface FTPZones {
  activeRecovery: TrainingZone
  endurance: TrainingZone
  tempo: TrainingZone
  lactateThreshold: TrainingZone
  vo2Max: TrainingZone
  anaerobic: TrainingZone
  neuromuscular: TrainingZone
}

/**
 * Calculate pace zones from VDOT
 * Based on Jack Daniels' VDOT system
 */
export function calculateVDOTZones(vdot: number): VDOTZones {
  // Convert VDOT to pace in seconds per km
  // Simplified calculation - in production, use full VDOT tables
  const thresholdPace = 3600 / (vdot * 0.8) // Approximate threshold pace
  
  return {
    easy: {
      name: 'Easy',
      min: thresholdPace * 1.3,
      max: thresholdPace * 1.5,
      color: 'green',
      description: 'Recovery and aerobic base building',
    },
    moderate: {
      name: 'Moderate',
      min: thresholdPace * 1.15,
      max: thresholdPace * 1.3,
      color: 'blue',
      description: 'Aerobic training',
    },
    threshold: {
      name: 'Threshold',
      min: thresholdPace * 0.95,
      max: thresholdPace * 1.05,
      color: 'yellow',
      description: 'Lactate threshold pace',
    },
    interval: {
      name: 'Interval',
      min: thresholdPace * 0.85,
      max: thresholdPace * 0.95,
      color: 'orange',
      description: 'VO2 max intervals',
    },
    repetition: {
      name: 'Repetition',
      min: thresholdPace * 0.7,
      max: thresholdPace * 0.85,
      color: 'red',
      description: 'Speed and power development',
    },
  }
}

/**
 * Calculate power zones from FTP
 * Standard 7-zone power system
 */
export function calculateFTPZones(ftp: number): FTPZones {
  return {
    activeRecovery: {
      name: 'Active Recovery',
      min: 0,
      max: ftp * 0.55,
      color: 'gray',
      description: 'Easy spinning, recovery',
    },
    endurance: {
      name: 'Endurance',
      min: ftp * 0.55,
      max: ftp * 0.75,
      color: 'blue',
      description: 'Aerobic base building',
    },
    tempo: {
      name: 'Tempo',
      min: ftp * 0.75,
      max: ftp * 0.9,
      color: 'green',
      description: 'Sustained effort',
    },
    lactateThreshold: {
      name: 'Lactate Threshold',
      min: ftp * 0.9,
      max: ftp * 1.05,
      color: 'yellow',
      description: 'FTP range',
    },
    vo2Max: {
      name: 'VO2 Max',
      min: ftp * 1.05,
      max: ftp * 1.2,
      color: 'orange',
      description: 'High intensity intervals',
    },
    anaerobic: {
      name: 'Anaerobic',
      min: ftp * 1.2,
      max: ftp * 1.5,
      color: 'red',
      description: 'Short, very hard efforts',
    },
    neuromuscular: {
      name: 'Neuromuscular',
      min: ftp * 1.5,
      max: ftp * 2.0,
      color: 'purple',
      description: 'Maximum power, sprints',
    },
  }
}

/**
 * Format pace from seconds per km to MM:SS/km
 */
export function formatPaceZone(secondsPerKm: number): string {
  const minutes = Math.floor(secondsPerKm / 60)
  const seconds = Math.floor(secondsPerKm % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`
}

/**
 * Format power in watts
 */
export function formatPower(watts: number): string {
  return `${Math.round(watts)}W`
}
