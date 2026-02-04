'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { pairsApi } from '@/lib/api'
import { pairsLogSchema, type PAIRSLogFormData } from '@/lib/validations'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

interface PAIRSFormProps {
  athleteId: number
  onSuccess?: () => void
}

export default function PAIRSForm({ athleteId, onSuccess }: PAIRSFormProps) {
  const { showToast } = useToast()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PAIRSLogFormData>({
    resolver: zodResolver(pairsLogSchema),
    defaultValues: {
      muscle_soreness: undefined,
      joint_pain: undefined,
      notes: '',
    },
  })

  const onSubmit = async (data: PAIRSLogFormData) => {
    try {
      await pairsApi.createLog(athleteId, data)
      showToast('PAIRS assessment logged successfully', 'success')
      reset()
      onSuccess?.()
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to log assessment',
        'error'
      )
    }
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Log PAIRS Assessment</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Muscle Soreness (0-10)
            </label>
            <div className="space-y-2">
              <Input
                type="number"
                min="0"
                max="10"
                step="1"
                {...register('muscle_soreness', { valueAsNumber: true })}
                error={errors.muscle_soreness?.message}
                placeholder="0-10"
              />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>0 = No soreness</span>
                <span>10 = Extreme soreness</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Joint Pain (0-10)
            </label>
            <div className="space-y-2">
              <Input
                type="number"
                min="0"
                max="10"
                step="1"
                {...register('joint_pain', { valueAsNumber: true })}
                error={errors.joint_pain?.message}
                placeholder="0-10"
              />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>0 = No pain</span>
                <span>10 = Extreme pain</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            {...register('notes')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Additional notes about your condition..."
            maxLength={1000}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
          {errors.root && (
            <p className="mt-1 text-sm text-red-600">{errors.root.message}</p>
          )}
        </div>

        <Button type="submit" isLoading={isSubmitting} className="w-full md:w-auto">
          <Save className="w-4 h-4 mr-2" />
          Log Assessment
        </Button>
      </form>
    </Card>
  )
}
