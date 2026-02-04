'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Card from '@/components/ui/Card'
import { PAIRSLog } from '@/lib/api'
import { formatDateReadable } from '@/lib/utils'

interface PAIRSChartProps {
  logs: PAIRSLog[]
}

export default function PAIRSChart({ logs }: PAIRSChartProps) {
  if (logs.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500">Not enough data to display chart</p>
        </div>
      </Card>
    )
  }

  // Prepare data for chart - last 30 days or all logs if less
  const chartData = logs
    .slice(0, 30)
    .reverse()
    .map((log) => ({
      date: formatDateReadable(log.created_at),
      soreness: log.muscle_soreness ?? null,
      pain: log.joint_pain ?? null,
    }))

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">PAIRS Trends</h2>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fontSize: 12 }}
              label={{ value: 'Score (0-10)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="soreness"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Muscle Soreness"
              dot={{ r: 4 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="pain"
              stroke="#ef4444"
              strokeWidth={2}
              name="Joint Pain"
              dot={{ r: 4 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
