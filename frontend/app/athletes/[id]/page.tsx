'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save, User } from 'lucide-react'
import { athleteApi, AthleteProfile } from '@/lib/api'
import { athleteProfileSchema, type AthleteProfileFormData } from '@/lib/validations'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import FitnessMarkers from '@/components/features/athletes/FitnessMarkers'
import TrainingZones from '@/components/features/athletes/TrainingZones'
import Link from 'next/link'

export default function AthleteProfilePage() {
  const params = useParams()
  const router = useRouter()
  const athleteId = parseInt(params.id as string)
  
  const { toasts, showToast, removeToast } = useToast()
  const [profile, setProfile] = useState<AthleteProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AthleteProfileFormData>({
    resolver: zodResolver(athleteProfileSchema),
    defaultValues: {
      current_vdot: undefined,
      current_ftp: undefined,
      max_hr: undefined,
      threshold_pace: undefined,
    },
  })

  useEffect(() => {
    loadProfile()
  }, [athleteId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await athleteApi.getProfile(athleteId)
      setProfile(data)
      reset({
        current_vdot: data.current_vdot ?? undefined,
        current_ftp: data.current_ftp ?? undefined,
        max_hr: data.max_hr ?? undefined,
        threshold_pace: data.threshold_pace ?? undefined,
      })
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to load athlete profile',
        'error'
      )
      router.push('/athletes')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: AthleteProfileFormData) => {
    try {
      const updated = await athleteApi.updateProfile(athleteId, data)
      setProfile(updated)
      setIsEditing(false)
      showToast('Profile updated successfully', 'success')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to update profile',
        'error'
      )
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

  if (!profile) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/athletes">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Athletes
          </Button>
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Athlete Profile</h1>
              <p className="text-gray-600">ID: {athleteId}</p>
            </div>
          </div>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  reset({
                    current_vdot: profile.current_vdot ?? undefined,
                    current_ftp: profile.current_ftp ?? undefined,
                    max_hr: profile.max_hr ?? undefined,
                    threshold_pace: profile.threshold_pace ?? undefined,
                  })
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Fitness Markers Display */}
      {!isEditing && (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Fitness Markers</h2>
            <FitnessMarkers profile={profile} />
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Training Zones</h2>
            <TrainingZones profile={profile} />
          </div>
        </>
      )}

      {/* Edit Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Fitness Markers</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="VDOT"
                  type="number"
                  step="0.1"
                  {...register('current_vdot', { valueAsNumber: true })}
                  error={errors.current_vdot?.message}
                  helperText="Running fitness metric (typically 30-85)"
                />
                
                <Input
                  label="FTP (Watts)"
                  type="number"
                  step="1"
                  {...register('current_ftp', { valueAsNumber: true })}
                  error={errors.current_ftp?.message}
                  helperText="Functional Threshold Power in watts"
                />
                
                <Input
                  label="Max Heart Rate (bpm)"
                  type="number"
                  step="1"
                  {...register('max_hr', { valueAsNumber: true })}
                  error={errors.max_hr?.message}
                  helperText="Maximum heart rate in beats per minute"
                />
                
                <Input
                  label="Threshold Pace (sec/km)"
                  type="number"
                  step="0.1"
                  {...register('threshold_pace', { valueAsNumber: true })}
                  error={errors.threshold_pace?.message}
                  helperText="Lactate threshold pace in seconds per kilometer"
                />
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
