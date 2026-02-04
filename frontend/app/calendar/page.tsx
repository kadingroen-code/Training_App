'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'
import { calendarApi, workoutApi, CalendarEvent, WorkoutTemplate } from '@/lib/api'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import CalendarView from '@/components/features/calendar/CalendarView'
import EventCard from '@/components/features/calendar/EventCard'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

export default function CalendarPage() {
  const { user, isCoach } = useAuth()
  const ATHLETE_ID = !isCoach ? user?.id || 2 : 2
  const { toasts, showToast, removeToast } = useToast()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([])
  const [createForm, setCreateForm] = useState({
    template_id: '',
    scheduled_date: formatDate(new Date()),
    scheduled_time: '',
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadEvents()
    loadWorkouts()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 2)

      const data = await calendarApi.getAthleteCalendar(
        ATHLETE_ID,
        formatDate(startDate),
        formatDate(endDate)
      )
      setEvents(data)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to load calendar events',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const loadWorkouts = async () => {
    try {
      const data = await workoutApi.list()
      setWorkouts(data)
    } catch (error) {
      console.error('Failed to load workouts:', error)
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setCreateForm({
      ...createForm,
      scheduled_date: formatDate(date),
    })
    setShowCreateModal(true)
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  const handleCreateEvent = async () => {
    if (!createForm.template_id || !createForm.scheduled_date) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    try {
      setCreating(true)
      await calendarApi.createEvent({
        athlete_id: ATHLETE_ID,
        template_id: parseInt(createForm.template_id),
        scheduled_date: createForm.scheduled_date,
        scheduled_time: createForm.scheduled_time || undefined,
      })
      showToast('Event created successfully', 'success')
      setShowCreateModal(false)
      setCreateForm({
        template_id: '',
        scheduled_date: formatDate(new Date()),
        scheduled_time: '',
      })
      loadEvents()
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to create event',
        'error'
      )
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
          <p className="text-gray-600">
            View and manage scheduled workouts
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="mt-4 md:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Workout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <CalendarView
            events={events}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        </div>

        {/* Events List */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
            {events.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No events scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events
                  .sort((a, b) => 
                    new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
                  )
                  .slice(0, 5)
                  .map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => handleEventClick(event)}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Schedule Workout"
      >
        <div className="space-y-4">
          <Select
            label="Workout Template"
            options={[
              { value: '', label: 'Select a workout...' },
              ...workouts.map((w) => ({
                value: w.id.toString(),
                label: w.name,
              })),
            ]}
            value={createForm.template_id}
            onChange={(e) => setCreateForm({ ...createForm, template_id: e.target.value })}
            required
          />

          <Input
            label="Date"
            type="date"
            value={createForm.scheduled_date}
            onChange={(e) => setCreateForm({ ...createForm, scheduled_date: e.target.value })}
            required
          />

          <Input
            label="Time (Optional)"
            type="time"
            value={createForm.scheduled_time}
            onChange={(e) => setCreateForm({ ...createForm, scheduled_time: e.target.value })}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateEvent} isLoading={creating}>
              Schedule Workout
            </Button>
          </div>
        </div>
      </Modal>

      {/* Event Detail Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Event Details"
        size="lg"
      >
        {selectedEvent && (
          <div>
            <EventCard event={selectedEvent} />
          </div>
        )}
      </Modal>
    </div>
  )
}
