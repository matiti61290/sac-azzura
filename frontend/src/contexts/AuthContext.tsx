'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthService } from '@/src/services/auth.service'
import { User } from '@/src/types/user'
import { AuthContextType } from '@/src/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Vérifier au montage si un utilisateur est déjà connecté (localStorage)
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
  }, [])

  const login = async (credentials: { mail: string; password: string }) => {
    const data = await AuthService.login(credentials)
    
    // Supposons que l'API retourne un objet user et un token
    // Ajustez selon la réponse réelle de votre API
    const userData = data.user || data
    setUser(userData)
    setIsConnected(true)
    
    // Sauvegarder dans localStorage pour persister la connexion
    localStorage.setItem('user', JSON.stringify(userData))
    if (data.token) {
      localStorage.setItem('token', data.token)
    }
  }

  const logout = () => {
    setUser(null)
    setIsConnected(false)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ isConnected, user, login, logout }}>
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