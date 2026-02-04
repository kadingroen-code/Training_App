'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import Card from './Card'
import Button from './Button'
import Select from './Select'
import { cn } from '@/lib/utils'

export interface FilterOption {
  key: string
  label: string
  type: 'select' | 'multiselect' | 'date' | 'number'
  options?: Array<{ value: string; label: string }>
}

interface FilterPanelProps {
  filters: FilterOption[]
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
  className?: string
}

export default function FilterPanel({ filters, values, onChange, className }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: string, value: any) => {
    onChange({ ...values, [key]: value })
  }

  const clearFilter = (key: string) => {
    const newValues = { ...values }
    delete newValues[key]
    onChange(newValues)
  }

  const clearAll = () => {
    onChange({})
  }

  const activeFiltersCount = Object.keys(values).filter((key) => values[key] !== '' && values[key] !== undefined).length

  return (
    <div className={className}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="mb-4"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Filter Options</h3>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => {
              if (filter.type === 'select' && filter.options) {
                return (
                  <div key={filter.key} className="relative">
                    <Select
                      label={filter.label}
                      options={[
                        { value: '', label: `All ${filter.label}` },
                        ...filter.options,
                      ]}
                      value={values[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    />
                    {values[filter.key] && (
                      <button
                        onClick={() => clearFilter(filter.key)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        aria-label={`Clear ${filter.label}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )
              }
              return null
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
