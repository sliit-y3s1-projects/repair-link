import { Navigate } from 'react-router'
import type { ReactNode } from 'react'
import { useAuth, type Role } from './AuthContext'

export function RoleGuard({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { session } = useAuth()
  if (!session) return <Navigate to="/auth" replace />
  if (!roles.includes(session.role)) return <Navigate to="/dashboard" replace />
  return children
}
