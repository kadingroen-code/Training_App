/**
 * Export utilities for various data types
 */

import { WorkoutTemplate, CalendarEvent, PAIRSLog } from '@/lib/api'
import { formatDate } from './utils'

/**
 * Export workouts as JSON
 */
export function exportWorkoutsAsJSON(workouts: WorkoutTemplate[]): void {
  const dataStr = JSON.stringify(workouts, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `workouts-${formatDate(new Date())}.json`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Export workouts as CSV
 */
export function exportWorkoutsAsCSV(workouts: WorkoutTemplate[]): void {
  const headers = ['ID', 'Name', 'Description', 'Sport', 'Coach ID']
  const rows = workouts.map((w) => [
    w.id.toString(),
    w.name,
    w.description || '',
    w.sport,
    w.coach_id.toString(),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `workouts-${formatDate(new Date())}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Export calendar events as iCal
 */
export function exportCalendarAsICal(events: CalendarEvent[]): void {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Training Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  events.forEach((event) => {
    const startDate = new Date(event.scheduled_date)
    if (event.scheduled_time) {
      const [hours, minutes] = event.scheduled_time.split(':')
      startDate.setHours(parseInt(hours), parseInt(minutes))
    }

    const endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + 1) // Default 1 hour duration

    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${event.id}@training-platform`)
    lines.push(`DTSTART:${formatDate(startDate)}`)
    lines.push(`DTEND:${formatDate(endDate)}`)
    lines.push(`SUMMARY:${event.resolved_targets?.name || 'Workout'}`)
    lines.push(`DESCRIPTION:${JSON.stringify(event.resolved_targets)}`)
    lines.push('END:VEVENT')
  })

  lines.push('END:VCALENDAR')

  const content = lines.join('\r\n')
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `calendar-${formatDate(new Date())}.ics`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Export PAIRS logs as CSV
 */
export function exportPAIRSAsCSV(logs: PAIRSLog[]): void {
  const headers = ['Date', 'Muscle Soreness', 'Joint Pain', 'Notes']
  const rows = logs.map((log) => [
    new Date(log.created_at).toLocaleDateString(),
    log.muscle_soreness?.toString() || '',
    log.joint_pain?.toString() || '',
    log.notes || '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `pairs-logs-${formatDate(new Date())}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
