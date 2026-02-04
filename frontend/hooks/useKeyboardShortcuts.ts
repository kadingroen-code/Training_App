import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      shortcuts.forEach((shortcut) => {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
        const altMatch = shortcut.alt ? e.altKey : !e.altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault()
          shortcut.action()
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Common shortcuts
export const commonShortcuts = (router: ReturnType<typeof useRouter>) => [
  {
    key: 'k',
    ctrl: true,
    action: () => {
      // Focus search - would need to be implemented per page
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    },
    description: 'Focus search',
  },
  {
    key: 'h',
    ctrl: true,
    action: () => router.push('/'),
    description: 'Go to home',
  },
  {
    key: 'w',
    ctrl: true,
    action: () => router.push('/workouts'),
    description: 'Go to workouts',
  },
  {
    key: 'a',
    ctrl: true,
    action: () => router.push('/athletes'),
    description: 'Go to athletes',
  },
  {
    key: 'c',
    ctrl: true,
    action: () => router.push('/calendar'),
    description: 'Go to calendar',
  },
  {
    key: 'p',
    ctrl: true,
    action: () => router.push('/pairs'),
    description: 'Go to PAIRS',
  },
]
