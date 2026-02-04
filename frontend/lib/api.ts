/**
 * API client for communicating with FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  return response.json()
}

// Workout Template API
export const workoutApi = {
  list: (coachId?: number, sport?: string) =>
    apiRequest(`/api/workouts/?coach_id=${coachId || ''}&sport=${sport || ''}`),
  
  get: (templateId: number) =>
    apiRequest(`/api/workouts/${templateId}`),
  
  create: (template: any) =>
    apiRequest('/api/workouts/', {
      method: 'POST',
      body: JSON.stringify(template),
    }),
  
  resolve: (templateId: number, athleteId: number) =>
    apiRequest(`/api/workouts/${templateId}/resolve?athlete_id=${athleteId}`, {
      method: 'POST',
    }),
}

// Athlete API
export const athleteApi = {
  getProfile: (athleteId: number) =>
    apiRequest(`/api/athletes/${athleteId}/profile`),
  
  updateProfile: (athleteId: number, profile: any) =>
    apiRequest(`/api/athletes/${athleteId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),
}

// Calendar API
export const calendarApi = {
  getAthleteCalendar: (athleteId: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return apiRequest(`/api/calendar/athlete/${athleteId}?${params.toString()}`)
  },
  
  createEvent: (event: any) =>
    apiRequest('/api/calendar/', {
      method: 'POST',
      body: JSON.stringify(event),
    }),
}

// PAIRS API
export const pairsApi = {
  createLog: (athleteId: number, log: any) =>
    apiRequest(`/api/pairs/?athlete_id=${athleteId}`, {
      method: 'POST',
      body: JSON.stringify(log),
    }),
  
  getAthleteLogs: (athleteId: number, limit = 30) =>
    apiRequest(`/api/pairs/athlete/${athleteId}?limit=${limit}`),
}
