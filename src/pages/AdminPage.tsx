import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CancelMatchDrawer from '../components/admin/CancelMatchDrawer'
import CreateMatchDrawer from '../components/admin/CreateMatchDrawer'
import EditMatchDrawer from '../components/admin/EditMatchDrawer'
import ResolveMatchDrawer from '../components/admin/ResolveMatchDrawer'
import EmptyState from '../components/shared/EmptyState'
import ErrorState from '../components/shared/ErrorState'
import LoadingState from '../components/shared/LoadingState'
import Pagination from '../components/shared/Pagination'
import { getMatchStats, getMatches } from '../services/matches'
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
  const [page, setPage] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [stats, setStats] = useState<Record<MatchStatus, number> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState<boolean>(false)
  const [selectedMatchToEdit, setSelectedMatchToEdit] =
    useState<MatchSummary | null>(null)
  const [selectedMatchToResolve, setSelectedMatchToResolve] =
    useState<MatchSummary | null>(null)
  const [selectedMatchToCancel, setSelectedMatchToCancel] =
    useState<MatchSummary | null>(null)
  const [reloadToken, setReloadToken] = useState<number>(0)

  useEffect(() => {
    let isMounted = true

    async function loadMatches(): Promise<void> {
      setIsLoading(true)

      try {
        const data = await getMatches({
          status: selectedStatus === 'ALL' ? undefined : selectedStatus,
          page,
        })

        if (isMounted) {
          setMatches(data.content)
          setTotalPages(data.totalPages)
          setError('')
        }
      } catch (loadError: unknown) {
        if (isMounted) {
          console.error(loadError)
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
  }, [selectedStatus, page, reloadToken])

  useEffect(() => {
    let isMounted = true

    async function loadStats(): Promise<void> {
      try {
        const data = await getMatchStats()

        if (isMounted) {
          setStats(data)
        }
      } catch (statsError: unknown) {
        console.error(statsError)
      }
    }

    void loadStats()

    return () => {
      isMounted = false
    }
  }, [reloadToken])

  function handleStatusFilterChange(status: MatchFilterStatus): void {
    setSelectedStatus(status)
    setPage(0)
  }

  function handleMatchChanged(): void {
    setReloadToken((token) => token + 1)
  }

  const matchStats = [
    {
      label: 'Matchs à venir',
      value: stats?.SCHEDULED ?? 0,
    },
    {
      label: 'Matchs en direct',
      value: stats?.LIVE ?? 0,
    },
    {
      label: 'Matchs terminés',
      value: stats?.FINISHED ?? 0,
    },
    {
      label: 'Matchs annulés',
      value: stats?.CANCELLED ?? 0,
    },
  ]

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
                  onClick={() => handleStatusFilterChange(filter.value)}
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
                <EmptyState
                  message="Aucun match ne correspond à ce filtre."
                  variant="panel"
                />
              ) : null}

              {matches.length > 0 ? (
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
                      {matches.map((match) => (
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

              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </section>
          </>
        )}
      </section>

      <CreateMatchDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onMatchCreated={handleMatchChanged}
      />

      <EditMatchDrawer
        isOpen={Boolean(selectedMatchToEdit)}
        match={selectedMatchToEdit}
        onClose={() => setSelectedMatchToEdit(null)}
        onMatchUpdated={handleMatchChanged}
      />

      <ResolveMatchDrawer
        isOpen={Boolean(selectedMatchToResolve)}
        match={selectedMatchToResolve}
        onClose={() => setSelectedMatchToResolve(null)}
        onMatchResolved={handleMatchChanged}
      />

      <CancelMatchDrawer
        isOpen={Boolean(selectedMatchToCancel)}
        match={selectedMatchToCancel}
        onClose={() => setSelectedMatchToCancel(null)}
        onMatchCancelled={handleMatchChanged}
      />
    </>
  )
}

export default AdminPage
