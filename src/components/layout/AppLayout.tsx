import { Outlet } from 'react-router-dom'
import { useCurrentUser } from '../../contexts/useCurrentUser'
import Header from './Header'

function AppLayout() {
  const {
    currentUser,
    currentUserError,
    isAuthenticated,
    isLoadingUser,
    refreshCurrentUser,
  } = useCurrentUser()

  async function handleRetry(): Promise<void> {
    try {
      await refreshCurrentUser()
    } catch (error: unknown) {
      console.error('Unable to retry current user loading', error)
    }
  }

  return (
    <div className="app-shell">
      <Header />

      {isAuthenticated && isLoadingUser && currentUser === null ? (
        <div className="account-status-banner" role="status">
          Chargement des informations du compte...
        </div>
      ) : null}

      {isAuthenticated && currentUserError ? (
        <div
          className="account-status-banner account-status-error"
          role="alert"
        >
          <span>{currentUserError}</span>

          <button
            className="secondary-button"
            type="button"
            onClick={() => void handleRetry()}
            disabled={isLoadingUser}
          >
            Réessayer
          </button>
        </div>
      ) : null}

      {currentUser?.status === 'BLOCKED' ? (
        <div
          className="account-status-banner account-status-warning"
          role="alert"
        >
          <strong>Compte bloqué</strong>

          <span>
            {currentUser.blockedReason ||
              'Vous pouvez consulter le site, mais les actions protégées ne sont pas disponibles.'}
          </span>
        </div>
      ) : null}

      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
