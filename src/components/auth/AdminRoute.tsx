import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../../contexts/useCurrentUser'

type AdminRouteProps = {
  children: ReactNode
}

function AdminRoute({ children }: AdminRouteProps) {
  const { isAdmin, isAuthReady, isLoadingUser } = useCurrentUser()

  if (!isAuthReady || isLoadingUser) {
    return <p className="page-status">Chargement...</p>
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
