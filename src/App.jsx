import { useEffect, useState } from 'react'
import './App.css'
import underdogsLogo from './assets/underdogs-logo-header.png'
import { getCurrentUser } from './services/api'
import keycloak, { initKeycloak, login, logout } from './services/keycloak'

const tournaments = [
  {
    name: 'Valorant Lock-In 2026',
    game: 'Valorant',
    status: 'Live now',
    prize: '15K pool',
    matches: [
      { home: 'Karmine Corp', away: 'Fnatic', odds: ['1.84', '1.96'] },
      { home: 'G2 Esports', away: 'Team Heretics', odds: ['2.20', '1.68'] },
    ],
  },
  {
    name: 'League Spring Clash',
    game: 'League of Legends',
    status: 'Next up',
    prize: 'EU bracket',
    matches: [
      { home: 'Vitality', away: 'BDS', odds: ['1.72', '2.12'] },
      { home: 'Rogue', away: 'SK Gaming', odds: ['2.45', '1.55'] },
    ],
  },
  {
    name: 'CS2 Night Series',
    game: 'Counter-Strike 2',
    status: 'Tonight',
    prize: 'BO3 finals',
    matches: [
      { home: 'NaVi', away: 'FaZe Clan', odds: ['1.91', '1.91'] },
      { home: 'Vitality', away: 'MOUZ', odds: ['1.64', '2.28'] },
    ],
  },
]

const stats = [
  { value: '24', label: 'matches tracked' },
  { value: '8', label: 'live tournaments' },
  { value: '1 click', label: 'Keycloak sign-in' },
]

function App() {
  const [authReady, setAuthReady] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [userError, setUserError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      try {
        const authenticated = await initKeycloak()

        if (!isMounted) {
          return
        }

        setIsAuthenticated(authenticated)
        setAuthReady(true)

        if (authenticated) {
          const user = await getCurrentUser()

          if (isMounted) {
            setCurrentUser(user)
          }
        }
      } catch (error) {
        console.error(error)

        if (isMounted) {
          setUserError('Unable to load your account for now.')
          setAuthReady(true)
        }
      }
    }

    loadSession()

    return () => {
      isMounted = false
    }
  }, [])

  const displayName =
    currentUser?.name ||
    currentUser?.username ||
    currentUser?.email ||
    keycloak.tokenParsed?.name ||
    keycloak.tokenParsed?.preferred_username

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="UnderDogs home">
          <img src={underdogsLogo} alt="UnderDogs Esports Betting" />
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#tournaments">Tournaments</a>
          <a href="#matches">Matches</a>
          <a href="#how-it-works">How it works</a>
        </nav>

        <div className="auth-area">
          {isAuthenticated ? (
            <>
              <span className="user-chip">
                {displayName ? `Hi, ${displayName}` : 'Account loaded'}
              </span>
              <button
                className="auth-button auth-button-secondary"
                type="button"
                onClick={logout}
              >
                Log out
              </button>
            </>
          ) : (
            <button
              className="auth-button"
              type="button"
              onClick={login}
              disabled={!authReady}
            >
              {authReady ? 'Sign up / Log in' : 'Loading...'}
            </button>
          )}
        </div>
      </header>

      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy">
            <img
              className="hero-logo"
              src={underdogsLogo}
              alt="UnderDogs Esports Betting"
            />
            <p className="eyebrow">Esports betting for sharp underdogs</p>
            <h1 id="hero-title">Back the play before the round starts.</h1>
            <p className="hero-text">
              Follow live tournaments, compare matchups, and jump into the next
              big esports moment with a fast Keycloak-secured account.
            </p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={login}>
                Start betting
              </button>
              <a className="secondary-button" href="#tournaments">
                View tournaments
              </a>
            </div>
          </div>

          <aside className="hero-panel" aria-label="Platform overview">
            <div className="ticket-card">
              <div>
                <span className="ticket-label">Hot pick</span>
                <h2>Karmine Corp vs Fnatic</h2>
              </div>
              <div className="odds-grid" aria-label="Example odds">
                <span>KC</span>
                <strong>1.84</strong>
                <span>FNC</span>
                <strong>1.96</strong>
              </div>
            </div>

            <div className="stats-row">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section
          id="tournaments"
          className="tournaments-section"
          aria-labelledby="tournaments-title"
        >
          <div className="section-heading">
            <p className="eyebrow">Tournaments in progress</p>
            <h2 id="tournaments-title">Live boards ready for action</h2>
          </div>

          <div id="matches" className="tournament-grid">
            {tournaments.map((tournament) => (
              <article className="tournament-card" key={tournament.name}>
                <div className="card-topline">
                  <span>{tournament.game}</span>
                  <strong>{tournament.status}</strong>
                </div>
                <h3>{tournament.name}</h3>
                <p>{tournament.prize}</p>

                <div className="match-list">
                  {tournament.matches.map((match) => (
                    <div
                      className="match-row"
                      key={`${match.home}-${match.away}`}
                    >
                      <div>
                        <span>{match.home}</span>
                        <small>vs</small>
                        <span>{match.away}</span>
                      </div>
                      <div className="match-odds">
                        <button type="button">{match.odds[0]}</button>
                        <button type="button">{match.odds[1]}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="how-it-works"
          className="cta-section"
          aria-labelledby="cta-title"
        >
          <div>
            <p className="eyebrow">Your next clutch call</p>
            <h2 id="cta-title">Read the lobby, trust the stats, place the bet.</h2>
          </div>
          <p>
            UnderDogs is built for esports fans who know momentum matters.
            Create an account, scan active matches, and get ready to back your
            read when the pressure is highest.
          </p>
          {isAuthenticated ? (
            <span className="cta-account">
              {userError ||
                (displayName ? `Ready, ${displayName}` : 'Account ready')}
            </span>
          ) : (
            <button className="primary-button" type="button" onClick={login}>
              Join UnderDogs
            </button>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <strong>UnderDogs</strong>
          <span>Esports betting project</span>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#tournaments">Tournaments</a>
          <a href="#how-it-works">Responsible play</a>
          <button type="button" onClick={isAuthenticated ? logout : login}>
            Account
          </button>
        </nav>
        <p>18+ only. Play responsibly.</p>
      </footer>
    </div>
  )
}

export default App
