import { NavLink } from 'react-router-dom'
import underdogsLogo from '../../assets/underdogs-logo-header.png'
import { useCurrentUser } from '../../contexts/useCurrentUser'
import { formatKibbles } from '../../utils/formatters'

function Header() {
  const { currentUser, isAuthenticated, isAuthReady, login, logout } = useCurrentUser()

  function handleAuthClick(): void {
    if (isAuthenticated) {
      void logout()
      return
    }

    void login()
  }

  return (
    <header className="site-header">
      <NavLink className="brand" to="/" aria-label="UnderDogs home">
        <img src={underdogsLogo} alt="UnderDogs Esports Betting" />
      </NavLink>

      <nav className="main-nav" aria-label="Navigation principale">
        <NavLink to="/">Accueil</NavLink>
        <NavLink to="/tournaments">Tournois</NavLink>
        <NavLink to="/matches">Matchs</NavLink>
        {isAuthenticated ? <NavLink to="/my-bets">Mes paris</NavLink> : null}
      </nav>

      <div className="auth-area">
        {isAuthenticated && currentUser ? (
          <>
            <span className="kibbles-chip">
              {formatKibbles(currentUser.kibblesBalance)}
            </span>

            <span className="user-chip">Bonjour {currentUser.firstName || currentUser.username}</span>
          </>
        ) : null}

        <button
          className="auth-button"
          type="button"
          onClick={handleAuthClick}
          disabled={!isAuthReady}
          aria-label={currentUser ? `Déconnecter ${currentUser.username}` : undefined}
        >
          {isAuthenticated ? 'Déconnexion' : 'Connexion'}
        </button>
      </div>
    </header>
  )
}

export default Header
