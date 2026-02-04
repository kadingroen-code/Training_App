import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { calendarApi, CalendarEvent, CalendarEventCreate } from '@/lib/api'

export function useCalendarEvents(athleteId: number, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['calendar-events', athleteId, startDate, endDate],
    queryFn: () => calendarApi.getAthleteCalendar(athleteId, startDate, endDate),
    enabled: !!athleteId,
  })
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (event: CalendarEventCreate) => calendarApi.createEvent(event),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events', variables.athlete_id] })
    },
  })
}
