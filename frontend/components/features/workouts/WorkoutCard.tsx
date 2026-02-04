import Link from 'next/link'
import { Activity, Calendar, User } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { WorkoutTemplate } from '@/lib/api'
import { formatDateReadable } from '@/lib/utils'

interface WorkoutCardProps {
  workout: WorkoutTemplate
}

const sportColors: Record<string, 'default' | 'success' | 'info'> = {
  running: 'default',
  cycling: 'success',
  swimming: 'info',
  triathlon: 'default',
}

export default function WorkoutCard({ workout }: WorkoutCardProps) {
  return (
    <Link href={`/workouts/${workout.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {workout.name}
          </h3>
          <Badge variant={sportColors[workout.sport] || 'default'}>
            {workout.sport}
          </Badge>
        </div>
        
        {workout.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {workout.description}
          </p>
        )}
        
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Activity className="w-4 h-4" />
            <span>Template</span>
          </div>
          {workout.markdown_source && (
            <div className="flex items-center space-x-1">
              <span>Markdown</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
