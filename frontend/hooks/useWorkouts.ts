import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workoutApi, WorkoutTemplate, WorkoutTemplateCreate } from '@/lib/api'

export function useWorkouts(coachId?: number, sport?: string) {
  return useQuery({
    queryKey: ['workouts', coachId, sport],
    queryFn: () => workoutApi.list(coachId, sport),
  })
}

export function useWorkout(templateId: number) {
  return useQuery({
    queryKey: ['workout', templateId],
    queryFn: () => workoutApi.get(templateId),
    enabled: !!templateId,
  })
}

export function useCreateWorkout() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ data, coachId }: { data: WorkoutTemplateCreate; coachId: number }) =>
      workoutApi.create(data, coachId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
    },
  })
}

export function useResolveWorkout() {
  return useMutation({
    mutationFn: ({ templateId, athleteId }: { templateId: number; athleteId: number }) =>
      workoutApi.resolve(templateId, athleteId),
  })
}
