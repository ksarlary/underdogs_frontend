import { NavLink, Outlet } from 'react-router-dom'
import underdogsLogo from '../../assets/underdogs-logo-header.png'
import { useCurrentUser } from '../../contexts/useCurrentUser'

function AdminLayout() {
  const { currentUser, logout } = useCurrentUser()
  const displayName = currentUser?.firstName || currentUser?.username || 'Admin'

  function handleLogout(): void {
    void logout()
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <NavLink className="admin-brand" to="/admin" aria-label="UnderDogs admin">
          <img src={underdogsLogo} alt="UnderDogs Admin" />

          <span>
            <strong>UnderDogs Admin</strong>
            <small>Centre de contrôle</small>
          </span>
        </NavLink>

        <div className="admin-header-actions">
          <NavLink className="secondary-button" to="/matches">
            Voir le site
          </NavLink>

          <span className="user-chip">Bonjour {displayName}</span>

          <button className="auth-button" type="button" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </header>

      <aside className="admin-sidebar">
        <p className="admin-sidebar-title">Navigation</p>

        <nav className="admin-sidebar-nav" aria-label="Navigation administration">
          <NavLink to="/admin" end>
            Matchs
          </NavLink>

          <NavLink to="/admin/tournaments">
            Tournois
          </NavLink>

          <NavLink to="/admin/teams">
            Équipes
          </NavLink>

          <NavLink to="/admin/bets">
            Paris
          </NavLink>
        </nav>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
