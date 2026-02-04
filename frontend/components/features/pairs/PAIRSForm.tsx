'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { pairsApi, PAIRSLogCreate } from '@/lib/api'
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
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<PAIRSLogCreate>({
    muscle_soreness: undefined,
    joint_pain: undefined,
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.muscle_soreness === undefined && formData.joint_pain === undefined) {
      showToast('Please provide at least one assessment value', 'error')
      return
    }

    try {
      setLoading(true)
      await pairsApi.createLog(athleteId, formData)
      showToast('PAIRS assessment logged successfully', 'success')
      setFormData({
        muscle_soreness: undefined,
        joint_pain: undefined,
        notes: '',
      })
      onSuccess?.()
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to log assessment',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Log PAIRS Assessment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
                value={formData.muscle_soreness?.toString() || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    muscle_soreness: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
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
                value={formData.joint_pain?.toString() || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    joint_pain: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
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
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Additional notes about your condition..."
            maxLength={1000}
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.notes?.length || 0} / 1000 characters
          </div>
        </div>

        <Button type="submit" isLoading={loading} className="w-full md:w-auto">
          <Save className="w-4 h-4 mr-2" />
          Log Assessment
        </Button>
      </form>
    </Card>
  )
}
