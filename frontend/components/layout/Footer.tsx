import Link from 'next/link'
import { Activity } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              Dynamic Endurance Training Platform
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/workouts" className="hover:text-blue-600 transition-colors">
              Workouts
            </Link>
            <Link href="/athletes" className="hover:text-blue-600 transition-colors">
              Athletes
            </Link>
            <Link href="/calendar" className="hover:text-blue-600 transition-colors">
              Calendar
            </Link>
            <Link href="/pairs" className="hover:text-blue-600 transition-colors">
              PAIRS
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
