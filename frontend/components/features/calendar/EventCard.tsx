import { Calendar, Clock, Target } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { CalendarEvent } from '@/lib/api'
import { formatDateReadable } from '@/lib/utils'

interface EventCardProps {
  event: CalendarEvent
  onClick?: () => void
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const statusColors: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
    scheduled: 'default',
    completed: 'success',
    cancelled: 'error',
  }

  return (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-shadow ${
        onClick ? '' : 'pointer-events-none'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {event.resolved_targets?.name || 'Workout'}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDateReadable(event.scheduled_date)}</span>
            </div>
            {event.scheduled_time && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(event.scheduled_time).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}</span>
              </div>
            )}
          </div>
        </div>
        <Badge variant={statusColors[event.status] || 'default'}>
          {event.status}
        </Badge>
      </div>

      {event.resolved_targets && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Target className="w-4 h-4" />
            <span className="font-medium">Resolved Targets</span>
          </div>
          <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
            {JSON.stringify(event.resolved_targets, null, 2).slice(0, 200)}
            {JSON.stringify(event.resolved_targets, null, 2).length > 200 && '...'}
          </div>
        </div>
      )}
    </Card>
  )
}
