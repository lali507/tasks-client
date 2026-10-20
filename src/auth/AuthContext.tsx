import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { authStorageKey, onUnauthorized } from '../api/client'
import type { AuthResponse } from '../api/types'

interface AuthState {
  user: AuthResponse | null
  signIn: (auth: AuthResponse) => void
  signOut: () => void
}

const AuthContext = createContext<AuthState | null>(null)

// SC-01-R2: kept in localStorage, so a refresh does not log out
const load = (): AuthResponse | null => {
  try {
    return JSON.parse(localStorage.getItem(authStorageKey) ?? 'null') as AuthResponse | null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(load)

  const signIn = useCallback((auth: AuthResponse) => {
    localStorage.setItem(authStorageKey, JSON.stringify(auth))
    setUser(auth)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(authStorageKey)
    setUser(null)
  }, [])

  // SC-01-R3: an expired token or a deleted user (UM-07) -> back to login
  useEffect(() => onUnauthorized(signOut), [signOut])

  // SC-01-R2: localStorage is shared by every tab of the browser. When another tab logs in
  // as someone else or logs out, reload, so this tab shows the user whose token it sends.
  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === authStorageKey || event.key === null) window.location.reload()
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth outside AuthProvider')
  return context
}
