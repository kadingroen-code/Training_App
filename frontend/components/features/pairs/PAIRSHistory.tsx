import { Clock, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { PAIRSLog } from '@/lib/api'
import { formatDateReadable } from '@/lib/utils'

interface PAIRSHistoryProps {
  logs: PAIRSLog[]
}

export default function PAIRSHistory({ logs }: PAIRSHistoryProps) {
  if (logs.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No PAIRS assessments logged yet</p>
        </div>
      </Card>
    )
  }

  const getRiskLevel = (soreness: number | null, pain: number | null) => {
    const max = Math.max(soreness || 0, pain || 0)
    if (max >= 7) return { level: 'high', color: 'error' as const }
    if (max >= 4) return { level: 'medium', color: 'warning' as const }
    return { level: 'low', color: 'success' as const }
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Assessment History</h2>
      <div className="space-y-4">
        {logs.map((log) => {
          const risk = getRiskLevel(log.muscle_soreness, log.joint_pain)
          return (
            <div
              key={log.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formatDateReadable(log.created_at)}
                  </span>
                </div>
                {risk.level === 'high' && (
                  <Badge variant={risk.color}>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    High Risk
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Muscle Soreness</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${((log.muscle_soreness || 0) / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {log.muscle_soreness ?? 'N/A'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Joint Pain</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${((log.joint_pain || 0) / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {log.joint_pain ?? 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {log.notes && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">{log.notes}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
