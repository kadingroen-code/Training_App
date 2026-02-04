'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Activity } from 'lucide-react'
import { pairsApi, PAIRSLog, coachApi, Athlete } from '@/lib/api'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import PAIRSForm from '@/components/features/pairs/PAIRSForm'
import PAIRSHistory from '@/components/features/pairs/PAIRSHistory'

const ATHLETE_ID = 2 // TODO: Get from auth context
const COACH_ID = 1 // TODO: Get from auth context

export default function PAIRSPage() {
  const { toasts, showToast, removeToast } = useToast()
  const [logs, setLogs] = useState<PAIRSLog[]>([])
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<Array<{ athlete: Athlete; log: PAIRSLog }>>([])
  const [isCoach, setIsCoach] = useState(false) // TODO: Get from auth context

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // For now, assume athlete view. In production, check user role
      const athleteLogs = await pairsApi.getAthleteLogs(ATHLETE_ID)
      setLogs(athleteLogs)

      // Load alerts for coaches
      // TODO: Implement coach alerts API endpoint
      // For now, we'll check if user is coach and load athlete data
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to load PAIRS data',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const loadAlerts = async () => {
    try {
      const athletes = await coachApi.getAthletes(COACH_ID)
      const alertPromises = athletes.map(async (athlete) => {
        try {
          const athleteLogs = await pairsApi.getAthleteLogs(athlete.id, 1)
          if (athleteLogs.length > 0) {
            const latestLog = athleteLogs[0]
            const maxValue = Math.max(
              latestLog.muscle_soreness || 0,
              latestLog.joint_pain || 0
            )
            if (maxValue >= 7) {
              return { athlete, log: latestLog }
            }
          }
          return null
        } catch {
          return null
        }
      })

      const alertResults = await Promise.all(alertPromises)
      setAlerts(alertResults.filter((a): a is { athlete: Athlete; log: PAIRSLog } => a !== null))
    } catch (error) {
      console.error('Failed to load alerts:', error)
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PAIRS</h1>
        <p className="text-gray-600">
          Post-Activity Injury Risk Screening - Log and monitor athlete wellness
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <PAIRSForm athleteId={ATHLETE_ID} onSuccess={loadData} />
          <PAIRSHistory logs={logs} />
        </div>

        {/* Sidebar - Alerts */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold">High-Risk Alerts</h2>
            </div>
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500">
                  No high-risk athletes (soreness/pain ≥ 7)
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(({ athlete, log }) => {
                  const maxValue = Math.max(
                    log.muscle_soreness || 0,
                    log.joint_pain || 0
                  )
                  return (
                    <div
                      key={athlete.id}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {athlete.email}
                        </span>
                        <Badge variant="error">{maxValue}/10</Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        Soreness: {log.muscle_soreness ?? 'N/A'} | Pain:{' '}
                        {log.joint_pain ?? 'N/A'}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
