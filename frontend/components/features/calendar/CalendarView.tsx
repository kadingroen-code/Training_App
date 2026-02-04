'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { CalendarEvent } from '@/lib/api'
import { formatDate, formatDateReadable } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface CalendarViewProps {
  events: CalendarEvent[]
  onDateClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
}

export default function CalendarView({ events, onDateClick, onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDate(date)
    return events.filter((event) => event.scheduled_date === dateStr)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const renderCalendarDays = () => {
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square p-1" />
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateEvents = getEventsForDate(date)
      const isCurrentDay = isToday(date)

      days.push(
        <div
          key={day}
          className={`aspect-square p-1 border border-gray-200 ${
            isCurrentDay ? 'bg-blue-50' : 'bg-white'
          } hover:bg-gray-50 cursor-pointer transition-colors`}
          onClick={() => onDateClick?.(date)}
        >
          <div className="h-full flex flex-col">
            <div
              className={`text-sm font-medium mb-1 ${
                isCurrentDay ? 'text-blue-600' : 'text-gray-900'
              }`}
            >
              {day}
            </div>
            <div className="flex-1 overflow-hidden space-y-0.5">
              {dateEvents.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  className="text-xs bg-blue-100 text-blue-900 px-1 py-0.5 rounded truncate cursor-pointer hover:bg-blue-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEventClick?.(event)
                  }}
                  title={event.resolved_targets?.name || 'Workout'}
                >
                  {event.resolved_targets?.name || 'Workout'}
                </div>
              ))}
              {dateEvents.length > 2 && (
                <div className="text-xs text-gray-500 px-1">
                  +{dateEvents.length - 2} more
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return days
  }

  return (
    <Card>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">
              {monthNames[month]} {year}
            </h2>
            <Button variant="ghost" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-700 border-b border-gray-200"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {renderCalendarDays()}
        </div>
      </div>

      {/* Event summary */}
      {events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4" />
            <span>{events.length} event{events.length !== 1 ? 's' : ''} this month</span>
          </div>
        </div>
      )}
    </Card>
  )
}
