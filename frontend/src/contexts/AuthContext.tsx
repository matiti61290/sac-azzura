'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthService } from '@/src/services/auth.service'
import { User } from '@/src/types/user'
import { AuthContextType } from '@/src/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User
        setUser(parsedUser)
        setIsConnected(true)
      } catch (e) {
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false) 
  }, [])

  const login = async (credentials: { mail: string; password: string }) => {
    const csrfToken = await AuthService.getCsrfToken()

    const data = await AuthService.login(credentials, csrfToken)
    console.log(data)
    
    const userData = data.user || data
    setUser(userData)
    setIsConnected(true)
    
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setIsConnected(false)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ isConnected, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}