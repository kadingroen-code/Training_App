import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { coachApi, athleteApi, Athlete, AthleteProfile, AthleteProfileUpdate } from '@/lib/api'

export function useAthletes(coachId: number) {
  return useQuery({
    queryKey: ['athletes', coachId],
    queryFn: () => coachApi.getAthletes(coachId),
    enabled: !!coachId,
  })
}

export function useAthleteProfile(athleteId: number) {
  return useQuery({
    queryKey: ['athlete-profile', athleteId],
    queryFn: () => athleteApi.getProfile(athleteId),
    enabled: !!athleteId,
  })
}

export function useUpdateAthleteProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ athleteId, profile }: { athleteId: number; profile: AthleteProfileUpdate }) =>
      athleteApi.updateProfile(athleteId, profile),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['athlete-profile', variables.athleteId] })
      queryClient.invalidateQueries({ queryKey: ['athletes'] })
    },
  })
}
