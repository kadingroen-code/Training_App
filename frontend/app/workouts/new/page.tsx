'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, ArrowLeft } from 'lucide-react'
import { workoutApi, WorkoutTemplateCreate } from '@/lib/api'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import Link from 'next/link'

const COACH_ID = 1 // TODO: Get from auth context

const sports = [
  { value: 'running', label: 'Running' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'triathlon', label: 'Triathlon' },
]

export default function NewWorkoutPage() {
  const router = useRouter()
  const { toasts, showToast, removeToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState<WorkoutTemplateCreate>({
    name: '',
    description: '',
    sport: 'running',
    markdown_source: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      showToast('Workout name is required', 'error')
      return
    }

    if (!formData.sport) {
      showToast('Sport is required', 'error')
      return
    }

    try {
      setLoading(true)
      const workout = await workoutApi.create(formData, COACH_ID)
      showToast('Workout created successfully!', 'success')
      router.push(`/workouts/${workout.id}`)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to create workout',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/workouts">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workouts
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Workout</h1>
        <p className="text-gray-600 mt-2">
          Create a workout template that can be assigned to multiple athletes
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl font-semibold mb-4">Workout Details</h2>
              <div className="space-y-4">
                <Input
                  label="Workout Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., 5K Tempo Run"
                />
                
                <Select
                  label="Sport"
                  options={sports}
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional description of the workout"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Workout Structure (Markdown)</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </div>
              
              {showPreview ? (
                <div className="prose max-w-none p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {formData.markdown_source || 'Enter markdown to see preview...'}
                  </pre>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Markdown Source
                    <span className="text-gray-500 text-xs ml-2">
                      (e.g., "Warmup - 10m 60% FTP, Main Set 5x - 800m 105% VDOT-Pace")
                    </span>
                  </label>
                  <textarea
                    value={formData.markdown_source}
                    onChange={(e) => setFormData({ ...formData, markdown_source: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="Enter workout structure in markdown format..."
                  />
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <h3 className="text-lg font-semibold mb-4">Tips</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Use relative targets like "60% FTP" or "105% VDOT-Pace"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>The system will automatically resolve these for each athlete</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>You can assign this workout to multiple athletes at once</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end space-x-4">
          <Link href="/workouts">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={loading}>
            <Save className="w-4 h-4 mr-2" />
            Create Workout
          </Button>
        </div>
      </form>
    </div>
  )
}
