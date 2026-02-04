'use client'

import { useState, useEffect } from 'react'
import { Users, Search } from 'lucide-react'
import { coachApi, athleteApi, Athlete, AthleteProfile } from '@/lib/api'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Card from '@/components/ui/Card'
import AthleteCard from '@/components/features/athletes/AthleteCard'
import { useAuth } from '@/hooks/useAuth'

export default function AthletesPage() {
  const { user, isCoach } = useAuth()
  const COACH_ID = isCoach ? user?.id || 1 : 1
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [profiles, setProfiles] = useState<Record<number, AthleteProfile>>({})
  const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { toasts, showToast, removeToast } = useToast()

  useEffect(() => {
    loadAthletes()
  }, [])

  useEffect(() => {
    filterAthletes()
  }, [athletes, searchQuery])

  const loadAthletes = async () => {
    try {
      setLoading(true)
      const athleteList = await coachApi.getAthletes(COACH_ID)
      setAthletes(athleteList)
      
      // Load profiles for each athlete
      const profilePromises = athleteList.map(async (athlete) => {
        try {
          const profile = await athleteApi.getProfile(athlete.id)
          return { athleteId: athlete.id, profile }
        } catch {
          return { athleteId: athlete.id, profile: null }
        }
      })
      
      const profileResults = await Promise.all(profilePromises)
      const profilesMap: Record<number, AthleteProfile> = {}
      profileResults.forEach(({ athleteId, profile }) => {
        if (profile) {
          profilesMap[athleteId] = profile
        }
      })
      setProfiles(profilesMap)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to load athletes',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const filterAthletes = () => {
    if (!searchQuery) {
      setFilteredAthletes(athletes)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = athletes.filter((athlete) =>
      athlete.email.toLowerCase().includes(query)
    )
    setFilteredAthletes(filtered)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Athletes</h1>
        <p className="text-gray-600">
          View and manage athlete profiles and fitness markers
        </p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search athletes by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Athletes Grid */}
      {filteredAthletes.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No athletes found
            </h3>
            <p className="text-gray-600">
              {athletes.length === 0
                ? 'No athletes are assigned to this coach'
                : 'Try adjusting your search'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAthletes.map((athlete) => (
            <AthleteCard
              key={athlete.id}
              athlete={athlete}
              profile={profiles[athlete.id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
