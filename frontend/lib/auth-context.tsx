'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'coach' | 'athlete'

export interface User {
  id: number
  email: string
  role: UserRole
  name?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isCoach: boolean
  isAthlete: boolean
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In production, this would check for auth token and fetch user
    // For now, we'll use localStorage to persist mock auth
    const storedUser = localStorage.getItem('auth_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        // Invalid stored data
      }
    } else {
      // Default to coach for development
      const defaultUser: User = {
        id: 1,
        email: 'coach@example.com',
        role: 'coach',
        name: 'Coach User',
      }
      setUser(defaultUser)
      localStorage.setItem('auth_user', JSON.stringify(defaultUser))
    }
    setIsLoading(false)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('auth_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isCoach: user?.role === 'coach',
    isAthlete: user?.role === 'athlete',
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
