import { Activity, Zap, Heart, Gauge } from 'lucide-react'
import Card from '@/components/ui/Card'
import { AthleteProfile } from '@/lib/api'
import { formatPace, formatPower } from '@/lib/utils'

interface FitnessMarkersProps {
  profile: AthleteProfile
}

export default function FitnessMarkers({ profile }: FitnessMarkersProps) {
  const markers = [
    {
      label: 'VDOT',
      value: profile.current_vdot,
      icon: Activity,
      color: 'blue',
      format: (v: number) => v.toFixed(1),
      description: 'Running fitness metric',
    },
    {
      label: 'FTP',
      value: profile.current_ftp,
      icon: Zap,
      color: 'green',
      format: formatPower,
      description: 'Functional Threshold Power',
    },
    {
      label: 'Max HR',
      value: profile.max_hr,
      icon: Heart,
      color: 'red',
      format: (v: number) => `${Math.round(v)} bpm`,
      description: 'Maximum heart rate',
    },
    {
      label: 'Threshold Pace',
      value: profile.threshold_pace,
      icon: Gauge,
      color: 'purple',
      format: formatPace,
      description: 'Lactate threshold pace',
    },
  ].filter((m) => m.value !== null && m.value !== undefined)

  if (markers.length === 0) {
    return (
      <Card>
        <p className="text-gray-500 text-center py-8">
          No fitness markers recorded yet
        </p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {markers.map((marker) => {
        const Icon = marker.icon
        return (
          <Card key={marker.label} className="p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className={`p-2 bg-${marker.color}-100 rounded-lg`}>
                  <Icon className={`w-5 h-5 text-${marker.color}-600`} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">{marker.label}</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {marker.format(marker.value!)}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{marker.description}</p>
          </Card>
        )
      })}
    </div>
  )
}
