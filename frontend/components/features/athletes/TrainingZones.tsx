'use client'

import { AthleteProfile } from '@/lib/api'
import { calculateVDOTZones, calculateFTPZones, formatPaceZone, formatPower } from '@/lib/training-zones'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface TrainingZonesProps {
  profile: AthleteProfile
}

const zoneColors: Record<string, string> = {
  green: 'bg-green-100 text-green-800 border-green-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
}

export default function TrainingZones({ profile }: TrainingZonesProps) {
  const vdotZones = profile.current_vdot ? calculateVDOTZones(profile.current_vdot) : null
  const ftpZones = profile.current_ftp ? calculateFTPZones(profile.current_ftp) : null

  if (!vdotZones && !ftpZones) {
    return (
      <Card>
        <p className="text-gray-500 text-center py-8">
          Add VDOT or FTP values to see training zones
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {vdotZones && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Running Zones (VDOT {profile.current_vdot?.toFixed(1)})</h3>
          <div className="space-y-3">
            {Object.values(vdotZones).map((zone) => (
              <div
                key={zone.name}
                className={`p-4 rounded-lg border ${zoneColors[zone.color] || zoneColors.gray}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{zone.name}</h4>
                  <Badge variant="default">{zone.name}</Badge>
                </div>
                <p className="text-sm mb-2">
                  {formatPaceZone(zone.min)} - {formatPaceZone(zone.max)}
                </p>
                <p className="text-xs opacity-80">{zone.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {ftpZones && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Cycling Zones (FTP {formatPower(profile.current_ftp!)})</h3>
          <div className="space-y-3">
            {Object.values(ftpZones).map((zone) => (
              <div
                key={zone.name}
                className={`p-4 rounded-lg border ${zoneColors[zone.color] || zoneColors.gray}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{zone.name}</h4>
                  <Badge variant="default">{zone.name}</Badge>
                </div>
                <p className="text-sm mb-2">
                  {formatPower(zone.min)} - {formatPower(zone.max)}
                </p>
                <p className="text-xs opacity-80">{zone.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
