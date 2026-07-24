import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import underdogsLogo from '../assets/underdogs-logo-header.png'
import MatchSummaryRow from '../components/matches/MatchSummaryRow'
import EmptyState from '../components/shared/EmptyState'
import ErrorState from '../components/shared/ErrorState'
import LoadingState from '../components/shared/LoadingState'
import TournamentCard from '../components/tournaments/TournamentCard'
import { getMatches } from '../services/matches'
import { getTournaments } from '../services/tournaments'
import type { MatchSummary } from '../types/match'
import type { TournamentSummary } from '../types/tournament'
import { getGameLabel } from '../utils/displayLabels'

function getTimestamp(value: string): number | null {
  const timestamp = new Date(value).getTime()

  return Number.isNaN(timestamp) ? null : timestamp
}

function formatDateTime(value: string): string {
  const timestamp = getTimestamp(value)

  if (timestamp === null) {
    return 'Date non disponible'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

function HomePage() {
  const [matches, setMatches] = useState<MatchSummary[]>([])
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([])
  const [isMatchesLoading, setIsMatchesLoading] = useState<boolean>(true)
  const [isTournamentsLoading, setIsTournamentsLoading] =
    useState<boolean>(true)
  const [matchesError, setMatchesError] = useState<string>('')
  const [tournamentsError, setTournamentsError] = useState<string>('')
  const [currentTimestamp] = useState<number>(() => Date.now())

  useEffect(() => {
    let isMounted = true

    async function loadMatches(): Promise<void> {
      try {
        const data = await getMatches()

        if (isMounted) {
          setMatches(data)
          setMatchesError('')
        }
      } catch (loadError: unknown) {
        console.error(loadError)

        if (isMounted) {
          setMatchesError('Impossible de charger les matchs pour le moment.')
        }
      } finally {
        if (isMounted) {
          setIsMatchesLoading(false)
        }
      }
    }

    async function loadTournaments(): Promise<void> {
      try {
        const data = await getTournaments()

        if (isMounted) {
          setTournaments(data.slice(0, 3))
          setTournamentsError('')
        }
      } catch (loadError: unknown) {
        console.error(loadError)

        if (isMounted) {
          setTournamentsError(
            'Impossible de charger les tournois pour le moment.',
          )
        }
      } finally {
        if (isMounted) {
          setIsTournamentsLoading(false)
        }
      }
    }

    void loadMatches()
    void loadTournaments()

    return () => {
      isMounted = false
    }
  }, [])

  const liveMatches = useMemo(
    () =>
      matches
        .filter((match) => match.status === 'LIVE')
        .sort((firstMatch, secondMatch) => {
          const firstTimestamp = getTimestamp(firstMatch.scheduledAt) ?? 0
          const secondTimestamp = getTimestamp(secondMatch.scheduledAt) ?? 0

          return firstTimestamp - secondTimestamp
        }),
    [matches],
  )

  const upcomingMatches = useMemo(
    () =>
      matches
        .filter((match) => {
          if (match.status !== 'SCHEDULED') {
            return false
          }

          const timestamp = getTimestamp(match.scheduledAt)

          return timestamp !== null && timestamp > currentTimestamp
        })
        .sort((firstMatch, secondMatch) => {
          const firstTimestamp =
            getTimestamp(firstMatch.scheduledAt) ?? Infinity
          const secondTimestamp =
            getTimestamp(secondMatch.scheduledAt) ?? Infinity

          return firstTimestamp - secondTimestamp
        }),
    [currentTimestamp, matches],
  )

  const nextScheduledMatch = upcomingMatches[0] ?? null
  const nextScheduledMatchId = nextScheduledMatch?.id ?? null

  const previewMatches = useMemo(
    () =>
      [
        ...liveMatches,
        ...upcomingMatches.filter(
          (match) => match.id !== nextScheduledMatchId,
        ),
      ].slice(0, 3),
    [liveMatches, upcomingMatches, nextScheduledMatchId],
  )

  const matchStatsUnavailable = isMatchesLoading || Boolean(matchesError)

  return (
    <>
      <section className="hero-section" aria-labelledby="home-title">
        <div className="hero-copy">
          <img
            className="hero-logo"
            src={underdogsLogo}
            alt="UnderDogs Esports Betting"
          />

          <p className="eyebrow">Paris esport en kibbles</p>

          <h1 id="home-title">UnderDogs</h1>

          <p className="hero-text">
            Suis les tournois, repère les matchs importants et prépare tes
            futurs paris en monnaie fictive.
          </p>
        </div>

        <aside
          className="hero-panel"
          aria-label="Prochain match et activité UnderDogs"
        >
          <div className="ticket-card">
            <div className="ticket-content">
              <span className="ticket-label">À suivre</span>

              {isMatchesLoading && (
                <p className="ticket-message" role="status" aria-live="polite">
                  Chargement du prochain match...
                </p>
              )}

              {!isMatchesLoading && matchesError && (
                <p className="ticket-message" role="alert">
                  {matchesError}
                </p>
              )}

              {!isMatchesLoading && !matchesError && nextScheduledMatch && (
                <>
                  <p className="ticket-game">
                    {getGameLabel(nextScheduledMatch.game)}
                  </p>

                  <h2>
                    {nextScheduledMatch.team1Name} vs{' '}
                    {nextScheduledMatch.team2Name}
                  </h2>

                  <time
                    className="ticket-date"
                    dateTime={nextScheduledMatch.scheduledAt}
                  >
                    {formatDateTime(nextScheduledMatch.scheduledAt)}
                  </time>

                  <Link
                    className="secondary-button ticket-action"
                    to={`/matches/${nextScheduledMatch.id}`}
                  >
                    Voir le match
                  </Link>
                </>
              )}

              {!isMatchesLoading && !matchesError && !nextScheduledMatch && (
                <>
                  <h2>Aucun match programmé</h2>

                  <p className="ticket-message">
                    Les prochains matchs apparaîtront ici.
                  </p>
                </>
              )}
            </div>

            <div className="stats-row home-stats">
              <div>
                <strong>
                  {matchStatsUnavailable ? '—' : liveMatches.length}
                </strong>

                <span>En direct</span>
              </div>

              <div>
                <strong>
                  {matchStatsUnavailable ? '—' : upcomingMatches.length}
                </strong>

                <span>À venir</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section
        className="tournaments-section"
        aria-labelledby="home-matches-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Calendrier</p>

            <h2 id="home-matches-title">En direct et à venir</h2>
          </div>

          <Link className="secondary-button" to="/matches">
            Tous les matchs
          </Link>
        </div>

        {isMatchesLoading && (
          <LoadingState message="Chargement des matchs..." />
        )}

        {!isMatchesLoading && matchesError && (
          <ErrorState message={matchesError} />
        )}

        {!isMatchesLoading &&
          !matchesError &&
          previewMatches.length === 0 && (
            <EmptyState message="Aucun autre match en direct ou à venir pour le moment." />
          )}

        {!isMatchesLoading &&
          !matchesError &&
          previewMatches.length > 0 && (
            <div className="match-board">
              {previewMatches.map((match) => (
                <MatchSummaryRow key={match.id} match={match} />
              ))}
            </div>
          )}
      </section>

      <section
        className="tournaments-section"
        aria-labelledby="home-tournaments-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Compétitions</p>

            <h2 id="home-tournaments-title">Découvrir les tournois</h2>
          </div>

          <Link className="secondary-button" to="/tournaments">
            Tous les tournois
          </Link>
        </div>

        {isTournamentsLoading && (
          <LoadingState message="Chargement des tournois..." />
        )}

        {!isTournamentsLoading && tournamentsError && (
          <ErrorState message={tournamentsError} />
        )}

        {!isTournamentsLoading &&
          !tournamentsError &&
          tournaments.length === 0 && (
            <EmptyState message="Aucun tournoi disponible pour le moment." />
          )}

        {!isTournamentsLoading &&
          !tournamentsError &&
          tournaments.length > 0 && (
            <div className="tournament-grid">
              {tournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                />
              ))}
            </div>
          )}
      </section>
    </>
  )
}

export default HomePage
