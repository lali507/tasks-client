import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import type { Role } from '../api/types'
import { useAuth } from '../auth/AuthContext'

// Logged-in screens; with roles, only for those roles (SC-00-R1). The server still decides (401/403).
export function RequireAuth({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/tasks" replace />
  return children
}

// SC-02-R2: a logged-in user does not see login or register
export function GuestOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return user ? <Navigate to="/tasks" replace /> : children
}
