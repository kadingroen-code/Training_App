'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Users, Target, Calendar, Trash2 } from 'lucide-react'
import { workoutApi, coachApi, WorkoutTemplate, Athlete } from '@/lib/api'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import WorkoutPreview from '@/components/features/workouts/WorkoutPreview'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

export default function WorkoutDetailPage() {
  const { user, isCoach } = useAuth()
  const COACH_ID = isCoach ? user?.id || 1 : 1
  const ATHLETE_ID = !isCoach ? user?.id || 2 : 2
  const params = useParams()
  const router = useRouter()
  const workoutId = parseInt(params.id as string)
  
  const { toasts, showToast, removeToast } = useToast()
  const [workout, setWorkout] = useState<WorkoutTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [resolvedWorkout, setResolvedWorkout] = useState<Record<string, any> | null>(null)
  const [resolving, setResolving] = useState(false)
  const [showBulkAssign, setShowBulkAssign] = useState(false)
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [selectedAthletes, setSelectedAthletes] = useState<number[]>([])
  const [assignDate, setAssignDate] = useState<string>(formatDate(new Date()))
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    loadWorkout()
    loadAthletes()
  }, [workoutId])

  const loadWorkout = async () => {
    try {
      setLoading(true)
      const data = await workoutApi.get(workoutId)
      setWorkout(data)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to load workout',
        'error'
      )
      router.push('/workouts')
    } finally {
      setLoading(false)
    }
  }

  const loadAthletes = async () => {
    try {
      const data = await coachApi.getAthletes(COACH_ID)
      setAthletes(data)
    } catch (error) {
      console.error('Failed to load athletes:', error)
    }
  }

  const handleResolve = async () => {
    try {
      setResolving(true)
      const resolved = await workoutApi.resolve(workoutId, ATHLETE_ID)
      setResolvedWorkout(resolved)
      showToast('Workout resolved successfully', 'success')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to resolve workout',
        'error'
      )
    } finally {
      setResolving(false)
    }
  }

  const handleBulkAssign = async () => {
    if (selectedAthletes.length === 0) {
      showToast('Please select at least one athlete', 'error')
      return
    }

    if (!assignDate) {
      showToast('Please select a date', 'error')
      return
    }

    try {
      setAssigning(true)
      await coachApi.bulkAssignWorkout(
        COACH_ID,
        workoutId,
        selectedAthletes,
        assignDate
      )
      showToast(
        `Workout assigned to ${selectedAthletes.length} athlete(s)`,
        'success'
      )
      setShowBulkAssign(false)
      setSelectedAthletes([])
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to assign workout',
        'error'
      )
    } finally {
      setAssigning(false)
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

  if (!workout) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/workouts">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workouts
          </Button>
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{workout.name}</h1>
              <Badge variant="default">{workout.sport}</Badge>
            </div>
            {workout.description && (
              <p className="text-gray-600">{workout.description}</p>
            )}
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button variant="outline" onClick={handleResolve} isLoading={resolving}>
              <Target className="w-4 h-4 mr-2" />
              Preview Resolve
            </Button>
            <Button onClick={() => setShowBulkAssign(true)}>
              <Users className="w-4 h-4 mr-2" />
              Assign to Athletes
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {workout.markdown_source && (
            <Card>
              <CardHeader>
                <CardTitle>Markdown Source</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {workout.markdown_source}
                </pre>
              </CardContent>
            </Card>
          )}

          {resolvedWorkout && (
            <WorkoutPreview
              resolvedWorkout={resolvedWorkout}
              athleteName="Test Athlete"
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Workout Logic</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-x-auto">
                {JSON.stringify(workout.logic_json, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workout Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Sport</div>
                <div className="font-medium text-gray-900 capitalize">{workout.sport}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Coach ID</div>
                <div className="font-medium text-gray-900">{workout.coach_id}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Template ID</div>
                <div className="font-medium text-gray-900">{workout.id}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bulk Assign Modal */}
      <Modal
        isOpen={showBulkAssign}
        onClose={() => setShowBulkAssign(false)}
        title="Assign Workout to Athletes"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Athletes
            </label>
            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-2">
              {athletes.length === 0 ? (
                <p className="text-sm text-gray-500 p-4 text-center">
                  No athletes available
                </p>
              ) : (
                <div className="space-y-2">
                  {athletes.map((athlete) => (
                    <label
                      key={athlete.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAthletes.includes(athlete.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAthletes([...selectedAthletes, athlete.id])
                          } else {
                            setSelectedAthletes(
                              selectedAthletes.filter((id) => id !== athlete.id)
                            )
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900">{athlete.email}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Input
            label="Start Date"
            type="date"
            value={assignDate}
            onChange={(e) => setAssignDate(e.target.value)}
            required
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkAssign(false)
                setSelectedAthletes([])
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkAssign} isLoading={assigning}>
              Assign Workout
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
