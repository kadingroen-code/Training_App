'use client'

import { Keyboard } from 'lucide-react'
import Modal from './Modal'
import Card from './Card'

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
}

interface ShortcutHelpProps {
  isOpen: boolean
  onClose: () => void
  shortcuts: Shortcut[]
}

export default function ShortcutHelp({ isOpen, onClose, shortcuts }: ShortcutHelpProps) {
  const formatKey = (shortcut: Shortcut): string => {
    const parts: string[] = []
    if (shortcut.ctrl) parts.push('Ctrl')
    if (shortcut.shift) parts.push('Shift')
    if (shortcut.alt) parts.push('Alt')
    parts.push(shortcut.key.toUpperCase())
    return parts.join(' + ')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="md">
      <div className="space-y-4">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">{shortcut.description}</span>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
              {formatKey(shortcut)}
            </kbd>
          </div>
        ))}
      </div>
    </Modal>
  )
}
