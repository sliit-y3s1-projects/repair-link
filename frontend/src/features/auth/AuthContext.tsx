/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { setAccessToken, type AuthResult } from '@/lib/api'

export type Role = 'consumer' | 'technician' | 'seller' | 'admin'

export type Session = {
  id: string
  email: string
  name: string
  role: Role
}

type AuthContextValue = {
  session: Session | null
  authenticate: (result: AuthResult) => void
  signIn: (role: Role) => void
  signOut: () => void
  switchRole: (role: Role) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const stored = localStorage.getItem('repair-link-session')
    if (!stored) return null
    try { return JSON.parse(stored) as Session } catch { localStorage.removeItem('repair-link-session'); return null }
  })
  const value = useMemo(() => ({
    session,
    authenticate: (result: AuthResult) => { const next: Session = { id: result.user.id, email: result.user.email, name: result.user.name, role: result.user.role }; setAccessToken(result.token); localStorage.setItem('repair-link-session', JSON.stringify(next)); setSession(next) },
    signIn: (role: Role) => { setAccessToken(null); setSession({ id: `preview-${role}`, email: `${role}@preview.local`, name: 'Chamal Senarathna', role }) },
    signOut: () => { setAccessToken(null); localStorage.removeItem('repair-link-session'); setSession(null) },
    switchRole: (role: Role) => setSession((current) => current ? { ...current, role } : current),
  }), [session])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const roleLabels: Record<Role, string> = {
  consumer: 'Consumer',
  technician: 'Technician',
  seller: 'Seller',
  admin: 'Administrator',
}

export const roleDashboardPaths: Record<Role, string> = {
  consumer: '/consumer/dashboard',
  technician: '/technician/dashboard',
  seller: '/seller/dashboard',
  admin: '/admin/dashboard',
}
