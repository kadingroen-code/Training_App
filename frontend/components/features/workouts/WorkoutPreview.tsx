import Card from '@/components/ui/Card'

interface WorkoutPreviewProps {
  resolvedWorkout: Record<string, any>
  athleteName?: string
}

export default function WorkoutPreview({ resolvedWorkout, athleteName }: WorkoutPreviewProps) {
  const renderWorkoutStep = (step: any, index: number) => {
    if (typeof step === 'string') {
      return (
        <div key={index} className="p-3 bg-gray-50 rounded-lg mb-2">
          <p className="text-sm font-medium text-gray-900">{step}</p>
        </div>
      )
    }

    if (step.type) {
      return (
        <div key={index} className="p-4 bg-blue-50 rounded-lg mb-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-blue-900 uppercase">
              {step.type}
            </span>
            {step.duration && (
              <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                {step.duration}
              </span>
            )}
          </div>
          
          {step.targets && (
            <div className="mt-2 space-y-1">
              {Object.entries(step.targets).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {typeof value === 'number' ? value.toFixed(1) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {step.reps && (
            <div className="mt-2 text-sm text-gray-600">
              Reps: <span className="font-semibold">{step.reps}</span>
            </div>
          )}
        </div>
      )
    }

    return (
      <div key={index} className="p-3 bg-gray-50 rounded-lg mb-2">
        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
          {JSON.stringify(step, null, 2)}
        </pre>
      </div>
    )
  }

  const renderWorkout = (workout: any) => {
    if (Array.isArray(workout)) {
      return workout.map((step, index) => renderWorkoutStep(step, index))
    }

    if (workout.steps && Array.isArray(workout.steps)) {
      return workout.steps.map((step: any, index: number) => renderWorkoutStep(step, index))
    }

    return Object.entries(workout).map(([key, value], index) => (
      <div key={index} className="p-3 bg-gray-50 rounded-lg mb-2">
        <div className="text-sm font-medium text-gray-900 mb-1">{key}:</div>
        <div className="text-sm text-gray-600">
          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
        </div>
      </div>
    ))
  }

  return (
    <Card>
      {athleteName && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Resolved for: {athleteName}
          </h3>
        </div>
      )}
      <div className="space-y-2">
        {renderWorkout(resolvedWorkout)}
      </div>
    </Card>
  )
}
