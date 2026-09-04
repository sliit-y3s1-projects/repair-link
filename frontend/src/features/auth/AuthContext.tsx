/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type Role = 'consumer' | 'technician' | 'seller' | 'admin'

export type Session = {
  name: string
  role: Role
}

type AuthContextValue = {
  session: Session | null
  signIn: (role: Role) => void
  signOut: () => void
  switchRole: (role: Role) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const value = useMemo(() => ({
    session,
    signIn: (role: Role) => setSession({ name: 'Chamal Senarathna', role }),
    signOut: () => setSession(null),
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
