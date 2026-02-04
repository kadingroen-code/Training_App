import { z } from 'zod'

// Workout Template Validation
export const workoutTemplateSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  sport: z.enum(['running', 'cycling', 'swimming', 'triathlon'], {
    errorMap: () => ({ message: 'Please select a valid sport' }),
  }),
  markdown_source: z.string().max(10000, 'Markdown source must be less than 10000 characters').optional(),
  logic_json: z.record(z.any()).optional(),
})

export type WorkoutTemplateFormData = z.infer<typeof workoutTemplateSchema>

// Athlete Profile Validation
export const athleteProfileSchema = z.object({
  current_vdot: z
    .number()
    .min(30, 'VDOT must be at least 30')
    .max(85, 'VDOT must be at most 85')
    .optional()
    .nullable(),
  current_ftp: z
    .number()
    .min(0, 'FTP must be positive')
    .max(1000, 'FTP must be at most 1000 watts')
    .optional()
    .nullable(),
  max_hr: z
    .number()
    .int('Heart rate must be a whole number')
    .min(0, 'Heart rate must be positive')
    .max(250, 'Heart rate must be at most 250 bpm')
    .optional()
    .nullable(),
  threshold_pace: z
    .number()
    .min(0, 'Pace must be positive')
    .optional()
    .nullable(),
})

export type AthleteProfileFormData = z.infer<typeof athleteProfileSchema>

// PAIRS Log Validation
export const pairsLogSchema = z.object({
  calendar_event_id: z.number().int().positive().optional().nullable(),
  muscle_soreness: z
    .number()
    .int('Soreness must be a whole number')
    .min(0, 'Soreness must be between 0 and 10')
    .max(10, 'Soreness must be between 0 and 10')
    .optional()
    .nullable(),
  joint_pain: z
    .number()
    .int('Pain must be a whole number')
    .min(0, 'Pain must be between 0 and 10')
    .max(10, 'Pain must be between 0 and 10')
    .optional()
    .nullable(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().nullable(),
}).refine(
  (data) => data.muscle_soreness !== undefined || data.joint_pain !== undefined,
  {
    message: 'Please provide at least one assessment value (soreness or pain)',
    path: ['muscle_soreness'],
  }
)

export type PAIRSLogFormData = z.infer<typeof pairsLogSchema>

// Calendar Event Validation
export const calendarEventSchema = z.object({
  athlete_id: z.number().int().positive('Athlete ID is required'),
  template_id: z.number().int().positive('Workout template is required'),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
})

export type CalendarEventFormData = z.infer<typeof calendarEventSchema>
