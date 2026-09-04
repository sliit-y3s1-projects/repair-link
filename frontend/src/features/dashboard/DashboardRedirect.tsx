import { Navigate } from 'react-router'
import { roleDashboardPaths, useAuth } from '@/features/auth/AuthContext'

export function DashboardRedirect() {
  const { session } = useAuth()
  return <Navigate to={session ? roleDashboardPaths[session.role] : '/auth'} replace />
}
