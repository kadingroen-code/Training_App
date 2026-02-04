'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Activity } from 'lucide-react'
import { workoutApi, WorkoutTemplate } from '@/lib/api'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import WorkoutCard from '@/components/features/workouts/WorkoutCard'
import Card from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'

export default function WorkoutsPage() {
  const { user, isCoach } = useAuth()
  const COACH_ID = isCoach ? user?.id || 1 : 1
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([])
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sportFilter, setSportFilter] = useState<string>('')
  const { toasts, showToast, removeToast } = useToast()

  const sports = [
    { value: '', label: 'All Sports' },
    { value: 'running', label: 'Running' },
    { value: 'cycling', label: 'Cycling' },
    { value: 'swimming', label: 'Swimming' },
    { value: 'triathlon', label: 'Triathlon' },
  ]

  useEffect(() => {
    loadWorkouts()
  }, [])

  useEffect(() => {
    filterWorkouts()
  }, [workouts, searchQuery, sportFilter])

  const loadWorkouts = async () => {
    try {
      setLoading(true)
      const data = await workoutApi.list(COACH_ID, sportFilter || undefined)
      setWorkouts(data)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to load workouts',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const filterWorkouts = () => {
    let filtered = [...workouts]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (w) =>
          w.name.toLowerCase().includes(query) ||
          w.description?.toLowerCase().includes(query) ||
          w.sport.toLowerCase().includes(query)
      )
    }

    if (sportFilter) {
      filtered = filtered.filter((w) => w.sport === sportFilter)
    }

    setFilteredWorkouts(filtered)
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
    <div className="container mx-auto px-4 py-8">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workouts</h1>
          <p className="text-gray-600">
            Create and manage workout templates for your athletes
          </p>
        </div>
        <Link href="/workouts/new" className="mt-4 md:mt-0">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Workout
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            label=""
            options={sports}
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
          />
        </div>
      </Card>

      {/* Workouts Grid */}
      {filteredWorkouts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No workouts found
            </h3>
            <p className="text-gray-600 mb-6">
              {workouts.length === 0
                ? 'Get started by creating your first workout template'
                : 'Try adjusting your search or filters'}
            </p>
            {workouts.length === 0 && (
              <Link href="/workouts/new">
                <Button>Create Your First Workout</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      )}
    </div>
  )
}
