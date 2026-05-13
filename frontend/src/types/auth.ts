import { User } from './user'

export interface AuthContextType {
  isConnected: boolean
  user: User | null
  login: (credentials: { mail: string; password: string }) => Promise<void>
  logout: () => void
}