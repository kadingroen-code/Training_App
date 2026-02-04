import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pairsApi, PAIRSLog, PAIRSLogCreate } from '@/lib/api'

export function usePAIRSLogs(athleteId: number, limit = 30) {
  return useQuery({
    queryKey: ['pairs-logs', athleteId, limit],
    queryFn: () => pairsApi.getAthleteLogs(athleteId, limit),
    enabled: !!athleteId,
  })
}

export function useCreatePAIRSLog() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ athleteId, log }: { athleteId: number; log: PAIRSLogCreate }) =>
      pairsApi.createLog(athleteId, log),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pairs-logs', variables.athleteId] })
    },
  })
}
