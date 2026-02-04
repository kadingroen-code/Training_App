'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import Input from './Input'
import { debounce } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)

  const debouncedOnChange = debounce((searchValue: string) => {
    onChange(searchValue)
  }, debounceMs)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    debouncedOnChange(newValue)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <Input
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Clear search"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
