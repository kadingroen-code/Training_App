'use client'

import { useState } from 'react'
import { BookOpen, Check } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { workoutTemplates, getTemplatesBySport, type WorkoutTemplate } from '@/lib/workout-templates'

interface TemplateLibraryProps {
  sport?: string
  onSelect: (template: WorkoutTemplate) => void
}

export default function TemplateLibrary({ sport, onSelect }: TemplateLibraryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  const templates = sport
    ? getTemplatesBySport(sport)
    : workoutTemplates

  const filteredTemplates = categoryFilter
    ? templates.filter((t) => t.category === categoryFilter)
    : templates

  const categories = ['beginner', 'intermediate', 'advanced']

  const categoryColors: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
    beginner: 'success',
    intermediate: 'default',
    advanced: 'error',
  }

  return (
    <>
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Template Library</h2>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            variant={categoryFilter === '' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('')}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <Badge variant={categoryColors[template.category] || 'default'}>
                  {template.category}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 capitalize">{template.sport}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(template)
                  }}
                >
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {selectedTemplate && (
        <Modal
          isOpen={!!selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          title={selectedTemplate.name}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 mb-2">{selectedTemplate.description}</p>
              <div className="flex items-center space-x-2">
                <Badge variant="default">{selectedTemplate.sport}</Badge>
                <Badge variant={categoryColors[selectedTemplate.category] || 'default'}>
                  {selectedTemplate.category}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Workout Structure:</h4>
              <pre className="p-4 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm whitespace-pre-wrap">
                {selectedTemplate.markdown_source}
              </pre>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onSelect(selectedTemplate)
                  setSelectedTemplate(null)
                }}
              >
                <Check className="w-4 h-4 mr-2" />
                Use This Template
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
