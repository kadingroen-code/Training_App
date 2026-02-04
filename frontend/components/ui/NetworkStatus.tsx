'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import Badge from './Badge'

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right">
      <Badge variant="error" className="flex items-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span>Offline</span>
      </Badge>
    </div>
  )
}
