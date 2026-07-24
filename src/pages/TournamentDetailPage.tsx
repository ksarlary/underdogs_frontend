import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import EmptyState from '../components/shared/EmptyState'
import ErrorState from '../components/shared/ErrorState'
import LoadingState from '../components/shared/LoadingState'
import { ApiError } from '../services/httpClient'
import { getTournamentById } from '../services/tournaments'
import type { TournamentDetail } from '../types/tournament'
import { getGameLabel, getMatchStatusLabel } from '../utils/displayLabels'

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return 'Non renseigné'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return 'Non planifié'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getDateTimeTimestamp(value: string): number {
  const timestamp = new Date(value).getTime()

  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp
}

function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [tournament, setTournament] = useState<TournamentDetail | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!id) {
      return
    }

    const tournamentId = id
    let isMounted = true

    async function loadTournament(): Promise<void> {
      try {
        const data = await getTournamentById(tournamentId)

        if (isMounted) {
          setTournament(data)
          setError('')
        }
      } catch (loadError: unknown) {
        if (!isMounted) {
          return
        }

        console.error(loadError)

        if (loadError instanceof ApiError && loadError.status === 404) {
          setError('Ce tournoi n’existe pas ou a été supprimé.')
          return
        }

        setError('Impossible de charger ce tournoi pour le moment.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadTournament()

    return () => {
      isMounted = false
    }
  }, [id])

  const sortedMatches = useMemo(
    () =>
      tournament
        ? [...tournament.matches].sort(
            (firstMatch, secondMatch) =>
              getDateTimeTimestamp(firstMatch.scheduledAt) -
              getDateTimeTimestamp(secondMatch.scheduledAt),
          )
        : [],
    [tournament],
  )

  return (
    <section className="tournaments-section" aria-labelledby="tournament-detail-title">
      <div className="detail-actions">
        <Link className="secondary-button" to="/tournaments">
          Retour aux tournois
        </Link>
      </div>

      {!id && <ErrorState message="Identifiant du tournoi manquant." />}

      {id && isLoading && <LoadingState message="Chargement du tournoi..." />}

      {id && !isLoading && error && <ErrorState message={error} />}

      {id && !isLoading && !error && tournament && (
        <>
          <div className="section-heading">
            <div>
              <p className="eyebrow">{getGameLabel(tournament.game)}</p>
              <h1 id="tournament-detail-title">{tournament.name}</h1>
            </div>
          </div>

          <div className="detail-meta-grid">
            <article className="tournament-card detail-meta-card">
              <div className="card-topline">
                <span>Début</span>
                <strong>{formatDate(tournament.startDate)}</strong>
              </div>
            </article>
            <article className="tournament-card detail-meta-card">
              <div className="card-topline">
                <span>Fin</span>
                <strong>{formatDate(tournament.endDate)}</strong>
              </div>
            </article>
            <article className="tournament-card detail-meta-card">
              <div className="card-topline">
                <span>Matchs</span>
                <strong>{sortedMatches.length}</strong>
              </div>
            </article>
          </div>

          <div className="detail-block">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Programme</p>
                <h2>Matchs du tournoi</h2>
              </div>
            </div>

            {sortedMatches.length === 0 ? (
              <EmptyState message="Aucun match associé à ce tournoi." />
            ) : (
              <div className="match-list">
                {sortedMatches.map((match) => (
                  <article className="match-row detail-match-row" key={match.id}>
                    <div>
                      <span>{match.team1Name}</span>
                      <small>vs</small>
                      <span>{match.team2Name}</span>
                    </div>
                    <div className="match-card-meta">
                      <time dateTime={match.scheduledAt}>
                        {formatDateTime(match.scheduledAt)}
                      </time>
                      <strong>{getMatchStatusLabel(match.status)}</strong>
                      <Link
                        className="secondary-button detail-match-action"
                        to={`/matches/${match.id}`}
                      >
                        Voir le match
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default TournamentDetailPage
