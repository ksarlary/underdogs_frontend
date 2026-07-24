import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CancelMatchDrawer from '../components/admin/CancelMatchDrawer'
import CreateMatchDrawer from '../components/admin/CreateMatchDrawer'
import EditMatchDrawer from '../components/admin/EditMatchDrawer'
import ResolveMatchDrawer from '../components/admin/ResolveMatchDrawer'
import EmptyState from '../components/shared/EmptyState'
import ErrorState from '../components/shared/ErrorState'
import LoadingState from '../components/shared/LoadingState'
import { getMatches } from '../services/matches'
import type { MatchStatus } from '../types/common'
import type { MatchSummary } from '../types/match'
import {
  getGameLabel,
  getMatchStatusLabel,
} from '../utils/displayLabels'

type MatchFilterStatus = MatchStatus | 'ALL'

type MatchFilter = {
  value: MatchFilterStatus
  label: string
}

const matchFilters: MatchFilter[] = [
  { value: 'ALL', label: 'Tous' },
  { value: 'SCHEDULED', label: 'À venir' },
  { value: 'LIVE', label: 'En direct' },
  { value: 'FINISHED', label: 'Terminés' },
  { value: 'CANCELLED', label: 'Annulés' },
]

const matchStatusPriority: Record<MatchStatus, number> = {
  LIVE: 0,
  SCHEDULED: 1,
  FINISHED: 2,
  CANCELLED: 3,
}

function getDateTimestamp(value: string | null | undefined): number {
  if (!value) {
    return 0
  }

  const timestamp = new Date(value).getTime()

  return Number.isNaN(timestamp) ? 0 : timestamp
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return 'Non planifié'
  }

  const timestamp = getDateTimestamp(value)

  if (timestamp === 0) {
    return 'Non planifié'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

function getStatusClassName(status: MatchStatus): string {
  return `admin-status admin-status-${status.toLowerCase()}`
}

function compareMatches(firstMatch: MatchSummary, secondMatch: MatchSummary): number {
  const priorityDifference =
    matchStatusPriority[firstMatch.status] -
    matchStatusPriority[secondMatch.status]

  if (priorityDifference !== 0) {
    return priorityDifference
  }

  const firstTimestamp = getDateTimestamp(firstMatch.scheduledAt)
  const secondTimestamp = getDateTimestamp(secondMatch.scheduledAt)

  if (firstMatch.status === 'FINISHED' || firstMatch.status === 'CANCELLED') {
    return secondTimestamp - firstTimestamp
  }

  return firstTimestamp - secondTimestamp
}

function canResolveMatch(match: MatchSummary): boolean {
  return match.status === 'LIVE'
}

function canEditMatch(match: MatchSummary): boolean {
  return match.status === 'SCHEDULED'
}

function canCancelMatch(match: MatchSummary): boolean {
  return match.status === 'SCHEDULED' || match.status === 'LIVE'
}

function AdminPage() {
  const [matches, setMatches] = useState<MatchSummary[]>([])
  const [selectedStatus, setSelectedStatus] =
    useState<MatchFilterStatus>('ALL')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState<boolean>(false)
  const [selectedMatchToEdit, setSelectedMatchToEdit] =
    useState<MatchSummary | null>(null)
  const [selectedMatchToResolve, setSelectedMatchToResolve] =
    useState<MatchSummary | null>(null)
  const [selectedMatchToCancel, setSelectedMatchToCancel] =
    useState<MatchSummary | null>(null)

  async function refreshMatches(): Promise<void> {
    try {
      const data = await getMatches()
      setMatches(data)
      setError('')
    } catch (loadError: unknown) {
      console.error(loadError)
      setError('La liste des matchs n’a pas pu être rechargée.')
    }
  }

  useEffect(() => {
    let isMounted = true

    async function loadMatches(): Promise<void> {
      try {
        const data = await getMatches()

        if (isMounted) {
          setMatches(data)
          setError('')
        }
      } catch (loadError: unknown) {
        console.error(loadError)

        if (isMounted) {
          setError('Impossible de charger les matchs pour le moment.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadMatches()

    return () => {
      isMounted = false
    }
  }, [])

  const visibleMatches = useMemo(() => {
    const sortedMatches = [...matches].sort(compareMatches)

    if (selectedStatus === 'ALL') {
      return sortedMatches
    }

    return sortedMatches.filter((match) => match.status === selectedStatus)
  }, [matches, selectedStatus])

  const matchStats = useMemo(() => {
    const countByStatus = (status: MatchStatus): number =>
      matches.filter((match) => match.status === status).length

    return [
      {
        label: 'Matchs à venir',
        value: countByStatus('SCHEDULED'),
      },
      {
        label: 'Matchs en direct',
        value: countByStatus('LIVE'),
      },
      {
        label: 'Matchs terminés',
        value: countByStatus('FINISHED'),
      },
      {
        label: 'Matchs annulés',
        value: countByStatus('CANCELLED'),
      },
    ]
  }, [matches])

  return (
    <>
      <section className="admin-page" aria-labelledby="admin-title">
        <div className="admin-page-heading">
          <div>
            <p className="eyebrow">Administration</p>
            <h1 id="admin-title">Gestion des matchs</h1>
            <p>
              Programmez les matchs, suivez leur statut et renseignez leur
              résultat.
            </p>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => setIsCreateDrawerOpen(true)}
          >
            Créer un match
          </button>
        </div>

        {isLoading && <LoadingState message="Chargement des matchs..." />}

        {!isLoading && error && <ErrorState message={error} />}

        {!isLoading && !error && (
          <>
            <section className="admin-stats-grid" aria-label="Résumé des matchs">
              {matchStats.map((stat) => (
                <article className="admin-stat-card" key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </article>
              ))}
            </section>

            <div className="bet-filters" aria-label="Filtres des matchs">
              {matchFilters.map((filter) => (
                <button
                  key={filter.value}
                  className={
                    selectedStatus === filter.value
                      ? 'filter-button active'
                      : 'filter-button'
                  }
                  type="button"
                  aria-pressed={selectedStatus === filter.value}
                  onClick={() => setSelectedStatus(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <section className="admin-panel" aria-labelledby="admin-matches-title">
              <div className="admin-panel-header">
                <div>
                  <h2 id="admin-matches-title">Matchs</h2>
                  <p>
                    Les matchs programmés passent automatiquement en direct
                    lorsque leur heure de début est atteinte.
                  </p>
                </div>
              </div>

              {matches.length === 0 ? (
                <EmptyState message="Aucun match disponible." variant="panel" />
              ) : null}

              {matches.length > 0 && visibleMatches.length === 0 ? (
                <EmptyState
                  message="Aucun match ne correspond à ce filtre."
                  variant="panel"
                />
              ) : null}

              {visibleMatches.length > 0 ? (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Match</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {visibleMatches.map((match) => (
                        <tr key={match.id}>
                          <td>
                            <strong>{match.team1Name} vs {match.team2Name}</strong>
                            <small>{getGameLabel(match.game)}</small>
                          </td>
                          <td>
                            <time dateTime={match.scheduledAt}>
                              {formatDateTime(match.scheduledAt)}
                            </time>
                          </td>
                          <td>
                            <span className={getStatusClassName(match.status)}>
                              {getMatchStatusLabel(match.status)}
                            </span>
                          </td>
                          <td>
                            <div className="admin-table-actions">
                              <Link
                                className="secondary-button admin-table-action"
                                to={`/matches/${match.id}`}
                              >
                                Voir
                              </Link>

                              {canEditMatch(match) && (
                                <button
                                  className="secondary-button admin-table-action"
                                  type="button"
                                  onClick={() => setSelectedMatchToEdit(match)}
                                >
                                  Modifier
                                </button>
                              )}

                              {canResolveMatch(match) && (
                                <button
                                  className="primary-button admin-table-action"
                                  type="button"
                                  onClick={() => setSelectedMatchToResolve(match)}
                                >
                                  Terminer
                                </button>
                              )}

                              {canCancelMatch(match) && (
                                <button
                                  className="secondary-button admin-table-action admin-danger-button"
                                  type="button"
                                  onClick={() => setSelectedMatchToCancel(match)}
                                >
                                  Annuler
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>
          </>
        )}
      </section>

      <CreateMatchDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onMatchCreated={refreshMatches}
      />

      <EditMatchDrawer
        isOpen={Boolean(selectedMatchToEdit)}
        match={selectedMatchToEdit}
        onClose={() => setSelectedMatchToEdit(null)}
        onMatchUpdated={refreshMatches}
      />

      <ResolveMatchDrawer
        isOpen={Boolean(selectedMatchToResolve)}
        match={selectedMatchToResolve}
        onClose={() => setSelectedMatchToResolve(null)}
        onMatchResolved={refreshMatches}
      />

      <CancelMatchDrawer
        isOpen={Boolean(selectedMatchToCancel)}
        match={selectedMatchToCancel}
        onClose={() => setSelectedMatchToCancel(null)}
        onMatchCancelled={refreshMatches}
      />
    </>
  )
}

export default AdminPage
