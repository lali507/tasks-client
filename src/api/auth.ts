import { api } from './client'
import type { AuthResponse } from './types'

// SC-01-R4
export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/api/auth/login', { email, password })

export const register = (email: string, displayName: string, password: string) =>
  api.post<AuthResponse>('/api/auth/register', { email, displayName, password })

// SC-01-R1: a basic check before sending; the server decides
export const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
