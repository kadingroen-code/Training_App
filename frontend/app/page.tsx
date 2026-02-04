'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Activity, Users, Calendar, AlertCircle, Plus, ArrowRight, TrendingUp } from 'lucide-react'
import { workoutApi, coachApi, calendarApi, pairsApi, WorkoutTemplate, Athlete, CalendarEvent, PAIRSLog } from '@/lib/api'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import { formatDateReadable } from '@/lib/utils'

const COACH_ID = 1 // TODO: Get from auth context
const ATHLETE_ID = 2 // TODO: Get from auth context

export default function Home() {
  const { toasts, showToast, removeToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    workouts: 0,
    athletes: 0,
    upcomingEvents: 0,
    highRiskAlerts: 0,
  })
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutTemplate[]>([])
  const [recentAthletes, setRecentAthletes] = useState<Athlete[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [recentPAIRS, setRecentPAIRS] = useState<PAIRSLog[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load workouts
      const workouts = await workoutApi.list(COACH_ID)
      setRecentWorkouts(workouts.slice(0, 5))
      setStats((s) => ({ ...s, workouts: workouts.length }))

      // Load athletes
      const athletes = await coachApi.getAthletes(COACH_ID)
      setRecentAthletes(athletes.slice(0, 5))
      setStats((s) => ({ ...s, athletes: athletes.length }))

      // Load upcoming events
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 7)
      const events = await calendarApi.getAthleteCalendar(
        ATHLETE_ID,
        new Date().toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )
      setUpcomingEvents(events.slice(0, 5))
      setStats((s) => ({ ...s, upcomingEvents: events.length }))

      // Load PAIRS logs and check for alerts
      const pairsLogs = await pairsApi.getAthleteLogs(ATHLETE_ID, 10)
      setRecentPAIRS(pairsLogs.slice(0, 5))
      const highRisk = pairsLogs.filter(
        (log) =>
          (log.muscle_soreness && log.muscle_soreness >= 7) ||
          (log.joint_pain && log.joint_pain >= 7)
      ).length
      setStats((s) => ({ ...s, highRiskAlerts: highRisk }))
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to load dashboard data',
        'error'
      )
    } finally {
      setLoading(false)
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
    <div className="container mx-auto px-4 py-8">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Dynamic Endurance Training Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Build once, assign many. Automatically scale workouts to each athlete's unique fitness markers.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Workouts</p>
              <p className="text-3xl font-bold text-gray-900">{stats.workouts}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Athletes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.athletes}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Upcoming Events</p>
              <p className="text-3xl font-bold text-gray-900">{stats.upcomingEvents}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">High-Risk Alerts</p>
              <p className="text-3xl font-bold text-gray-900">{stats.highRiskAlerts}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/workouts/new">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Create Workout</h3>
                  <p className="text-sm text-gray-600">Create a new workout template</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>

          <Link href="/pairs">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Log PAIRS</h3>
                  <p className="text-sm text-gray-600">Record wellness assessment</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>

          <Link href="/calendar">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">View Calendar</h3>
                  <p className="text-sm text-gray-600">See scheduled workouts</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Workouts */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Workouts</h2>
            <Link href="/workouts">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          {recentWorkouts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No workouts yet</p>
          ) : (
            <div className="space-y-3">
              {recentWorkouts.map((workout) => (
                <Link key={workout.id} href={`/workouts/${workout.id}`}>
                  <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{workout.name}</h3>
                        <p className="text-sm text-gray-500">{workout.sport}</p>
                      </div>
                      <Badge variant="default">{workout.sport}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Events */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
            <Link href="/calendar">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming events</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Link key={event.id} href="/calendar">
                  <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {event.resolved_targets?.name || 'Workout'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDateReadable(event.scheduled_date)}
                        </p>
                      </div>
                      <Badge variant="default">{event.status}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Feature Highlights */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0">
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3">
                1
              </div>
              <h3 className="font-semibold mb-2">Coach Creates Template</h3>
              <p className="text-sm text-gray-600">
                Input workouts in natural language: "Warmup - 10m 60% FTP, Main Set 5x - 800m 105% VDOT-Pace"
              </p>
            </div>
            <div className="flex flex-col">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3">
                2
              </div>
              <h3 className="font-semibold mb-2">Dynamic Engine Resolves</h3>
              <p className="text-sm text-gray-600">
                System converts relative targets to absolute values based on each athlete's VDOT/FTP
              </p>
            </div>
            <div className="flex flex-col">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3">
                3
              </div>
              <h3 className="font-semibold mb-2">Assign to Athletes</h3>
              <p className="text-sm text-gray-600">
                Bulk assign to multiple athletes - each gets personalized targets automatically
              </p>
            </div>
            <div className="flex flex-col">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3">
                4
              </div>
              <h3 className="font-semibold mb-2">Track & Adapt</h3>
              <p className="text-sm text-gray-600">
                Monitor completion, log PAIRS data, and adjust FTP based on performance
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
