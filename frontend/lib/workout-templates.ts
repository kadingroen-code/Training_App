import { WorkoutTemplateCreate } from '@/lib/api'

export interface WorkoutTemplate {
  id: string
  name: string
  description: string
  sport: 'running' | 'cycling' | 'swimming' | 'triathlon'
  category: 'beginner' | 'intermediate' | 'advanced'
  markdown_source: string
}

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'tempo-run',
    name: '5K Tempo Run',
    description: 'Classic tempo run for building lactate threshold',
    sport: 'running',
    category: 'intermediate',
    markdown_source: 'Warmup - 10m easy pace\nMain Set - 20m at threshold pace (100% VDOT-Pace)\nCooldown - 10m easy pace',
  },
  {
    id: 'interval-run',
    name: 'VO2 Max Intervals',
    description: 'High-intensity intervals for improving VO2 max',
    sport: 'running',
    category: 'advanced',
    markdown_source: 'Warmup - 15m easy pace\nMain Set - 6x 800m at 105% VDOT-Pace with 2m recovery jog\nCooldown - 10m easy pace',
  },
  {
    id: 'long-run',
    name: 'Long Run',
    description: 'Aerobic base building long run',
    sport: 'running',
    category: 'beginner',
    markdown_source: 'Long Run - 90m at 70% VDOT-Pace',
  },
  {
    id: 'ftp-intervals',
    name: 'FTP Intervals',
    description: 'Threshold power intervals for cycling',
    sport: 'cycling',
    category: 'intermediate',
    markdown_source: 'Warmup - 15m at 50% FTP\nMain Set - 3x 10m at 100% FTP with 5m recovery at 50% FTP\nCooldown - 10m at 50% FTP',
  },
  {
    id: 'sweet-spot',
    name: 'Sweet Spot Training',
    description: 'Sustained effort just below threshold',
    sport: 'cycling',
    category: 'intermediate',
    markdown_source: 'Warmup - 10m at 50% FTP\nMain Set - 2x 20m at 88% FTP with 5m recovery at 50% FTP\nCooldown - 10m at 50% FTP',
  },
  {
    id: 'vo2-cycling',
    name: 'VO2 Max Cycling',
    description: 'High-intensity power intervals',
    sport: 'cycling',
    category: 'advanced',
    markdown_source: 'Warmup - 15m at 50% FTP\nMain Set - 5x 3m at 120% FTP with 3m recovery at 50% FTP\nCooldown - 10m at 50% FTP',
  },
  {
    id: 'swim-intervals',
    name: 'Swim Interval Set',
    description: 'Swimming interval workout',
    sport: 'swimming',
    category: 'intermediate',
    markdown_source: 'Warmup - 400m easy\nMain Set - 8x 100m at threshold pace with 30s rest\nCooldown - 200m easy',
  },
]

export function getTemplatesBySport(sport?: string): WorkoutTemplate[] {
  if (!sport) return workoutTemplates
  return workoutTemplates.filter((t) => t.sport === sport)
}

export function getTemplatesByCategory(category?: string): WorkoutTemplate[] {
  if (!category) return workoutTemplates
  return workoutTemplates.filter((t) => t.category === category)
}
