/**
 * API client for communicating with FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch {
        // If response is not JSON, use status text
      }
      throw new APIError(errorMessage, response.status, response.statusText)
    }

    return response.json()
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    // Network or other errors
    throw new APIError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0,
      'Network Error'
    )
  }
}

// TypeScript Types
export interface WorkoutTemplate {
  id: number
  coach_id: number
  name: string
  description: string | null
  sport: string
  logic_json: Record<string, any>
  markdown_source: string | null
}

export interface WorkoutTemplateCreate {
  name: string
  description?: string
  sport: string
  logic_json?: Record<string, any>
  markdown_source?: string
}

export interface AthleteProfile {
  id: number
  user_id: number
  current_vdot: number | null
  current_ftp: number | null
  max_hr: number | null
  threshold_pace: number | null
}

export interface AthleteProfileUpdate {
  current_vdot?: number
  current_ftp?: number
  max_hr?: number
  threshold_pace?: number
}

export interface Athlete {
  id: number
  email: string
}

export interface CalendarEvent {
  id: number
  athlete_id: number
  template_id: number
  scheduled_date: string
  scheduled_time: string | null
  resolved_targets: Record<string, any>
  status: string
  completion_data: Record<string, any> | null
}

export interface CalendarEventCreate {
  athlete_id: number
  template_id: number
  scheduled_date: string
  scheduled_time?: string
}

export interface PAIRSLog {
  id: number
  athlete_id: number
  calendar_event_id: number | null
  muscle_soreness: number | null
  joint_pain: number | null
  notes: string | null
  created_at: string
}

export interface PAIRSLogCreate {
  calendar_event_id?: number
  muscle_soreness?: number
  joint_pain?: number
  notes?: string
}

export interface BulkAssignResponse {
  message: string
  events_created: number
}

// Workout Template API
export const workoutApi = {
  list: (coachId?: number, sport?: string): Promise<WorkoutTemplate[]> => {
    const params = new URLSearchParams()
    if (coachId) params.append('coach_id', coachId.toString())
    if (sport) params.append('sport', sport)
    return apiRequest<WorkoutTemplate[]>(`/api/workouts/?${params.toString()}`)
  },
  
  get: (templateId: number): Promise<WorkoutTemplate> =>
    apiRequest<WorkoutTemplate>(`/api/workouts/${templateId}`),
  
  create: (template: WorkoutTemplateCreate, coachId: number): Promise<WorkoutTemplate> =>
    apiRequest<WorkoutTemplate>(`/api/workouts/?coach_id=${coachId}`, {
      method: 'POST',
      body: JSON.stringify(template),
    }),
  
  resolve: (templateId: number, athleteId: number): Promise<Record<string, any>> =>
    apiRequest<Record<string, any>>(`/api/workouts/${templateId}/resolve?athlete_id=${athleteId}`, {
      method: 'POST',
    }),
}

// Athlete API
export const athleteApi = {
  getProfile: (athleteId: number): Promise<AthleteProfile> =>
    apiRequest<AthleteProfile>(`/api/athletes/${athleteId}/profile`),
  
  updateProfile: (athleteId: number, profile: AthleteProfileUpdate): Promise<AthleteProfile> =>
    apiRequest<AthleteProfile>(`/api/athletes/${athleteId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),
}

// Coach API
export const coachApi = {
  getAthletes: (coachId: number): Promise<Athlete[]> =>
    apiRequest<Athlete[]>(`/api/coaches/${coachId}/athletes`),
  
  bulkAssignWorkout: (
    coachId: number,
    templateId: number,
    athleteIds: number[],
    startDate: string
  ): Promise<BulkAssignResponse> => {
    const params = new URLSearchParams()
    params.append('template_id', templateId.toString())
    athleteIds.forEach(id => params.append('athlete_ids', id.toString()))
    params.append('start_date', startDate)
    return apiRequest<BulkAssignResponse>(`/api/coaches/${coachId}/bulk-assign?${params.toString()}`, {
      method: 'POST',
    })
  },
}

// Calendar API
export const calendarApi = {
  getAthleteCalendar: (athleteId: number, startDate?: string, endDate?: string): Promise<CalendarEvent[]> => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return apiRequest<CalendarEvent[]>(`/api/calendar/athlete/${athleteId}?${params.toString()}`)
  },
  
  createEvent: (event: CalendarEventCreate): Promise<CalendarEvent> =>
    apiRequest<CalendarEvent>('/api/calendar/', {
      method: 'POST',
      body: JSON.stringify(event),
    }),
}

// PAIRS API
export const pairsApi = {
  createLog: (athleteId: number, log: PAIRSLogCreate): Promise<PAIRSLog> =>
    apiRequest<PAIRSLog>(`/api/pairs/?athlete_id=${athleteId}`, {
      method: 'POST',
      body: JSON.stringify(log),
    }),
  
  getAthleteLogs: (athleteId: number, limit = 30): Promise<PAIRSLog[]> =>
    apiRequest<PAIRSLog[]>(`/api/pairs/athlete/${athleteId}?limit=${limit}`),
}
