'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Activity, Users, Calendar, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Workouts', href: '/workouts', icon: Activity },
  { name: 'Athletes', href: '/athletes', icon: Users },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'PAIRS', href: '/pairs', icon: AlertCircle },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around h-16">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive ? 'text-blue-600' : 'text-gray-600'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
