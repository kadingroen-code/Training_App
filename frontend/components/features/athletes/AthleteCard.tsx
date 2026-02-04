import Link from 'next/link'
import { User, Activity, Zap } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Athlete, AthleteProfile } from '@/lib/api'
import { formatPace, formatPower } from '@/lib/utils'

interface AthleteCardProps {
  athlete: Athlete
  profile?: AthleteProfile
}

export default function AthleteCard({ athlete, profile }: AthleteCardProps) {
  return (
    <Link href={`/athletes/${athlete.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {athlete.email}
              </h3>
              <p className="text-sm text-gray-500">Athlete</p>
            </div>
          </div>
        </div>
        
        {profile && (
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
            {profile.current_vdot && (
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">VDOT</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {profile.current_vdot.toFixed(1)}
                  </div>
                </div>
              </div>
            )}
            {profile.current_ftp && (
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">FTP</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {formatPower(profile.current_ftp)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </Link>
  )
}
