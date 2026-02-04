'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save, Eye, ArrowLeft } from 'lucide-react'
import { workoutApi } from '@/lib/api'
import { workoutTemplateSchema, type WorkoutTemplateFormData } from '@/lib/validations'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import TemplateLibrary from '@/components/features/workouts/TemplateLibrary'

const sports = [
  { value: 'running', label: 'Running' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'triathlon', label: 'Triathlon' },
]

export default function NewWorkoutPage() {
  const router = useRouter()
  const { user, isCoach } = useAuth()
  const COACH_ID = isCoach ? user?.id || 1 : 1
  const { toasts, showToast, removeToast } = useToast()
  const [showPreview, setShowPreview] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<WorkoutTemplateFormData>({
    resolver: zodResolver(workoutTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      sport: 'running',
      markdown_source: '',
    },
  })

  const markdownSource = watch('markdown_source')
  const selectedSport = watch('sport')

  const handleTemplateSelect = (template: any) => {
    setValue('name', template.name)
    setValue('description', template.description)
    setValue('sport', template.sport)
    setValue('markdown_source', template.markdown_source)
  }

  const onSubmit = async (data: WorkoutTemplateFormData) => {
    try {
      const workout = await workoutApi.create(data, COACH_ID)
      showToast('Workout created successfully!', 'success')
      router.push(`/workouts/${workout.id}`)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to create workout',
        'error'
      )
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl font-semibold mb-4">Workout Details</h2>
              <div className="space-y-4">
                <Input
                  label="Workout Name"
                  {...register('name')}
                  error={errors.name?.message}
                  required
                  placeholder="e.g., 5K Tempo Run"
                />
                
                <Select
                  label="Sport"
                  options={sports}
                  {...register('sport')}
                  error={errors.sport?.message}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional description of the workout"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
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
                    {markdownSource || 'Enter markdown to see preview...'}
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
                    {...register('markdown_source')}
                    rows={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="Enter workout structure in markdown format..."
                  />
                  {errors.markdown_source && (
                    <p className="mt-1 text-sm text-red-600">{errors.markdown_source.message}</p>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
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

            <TemplateLibrary sport={selectedSport} onSelect={handleTemplateSelect} />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end space-x-4">
          <Link href="/workouts">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            Create Workout
          </Button>
        </div>
      </form>
    </div>
  )
}
