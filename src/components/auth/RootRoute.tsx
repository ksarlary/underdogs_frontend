import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../../contexts/useCurrentUser'
import HomePage from '../../pages/HomePage'

function RootRoute() {
  const { isAdmin, isAuthReady, isLoadingUser } = useCurrentUser()

  if (!isAuthReady || isLoadingUser) {
    return <p className="page-status">Chargement...</p>
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return <HomePage />
}

export default RootRoute
