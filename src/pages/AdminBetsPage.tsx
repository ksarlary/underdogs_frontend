import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BetStatusBadge from '../components/bets/BetStatusBadge'
import EmptyState from '../components/shared/EmptyState'
import ErrorState from '../components/shared/ErrorState'
import LoadingState from '../components/shared/LoadingState'
import Pagination from '../components/shared/Pagination'
import { getBetStats, getBets } from '../services/bets'
import { ApiError } from '../services/httpClient'
import type { Bet } from '../types/bet'
import type { BetStatus } from '../types/common'
import { formatKibbles } from '../utils/formatters'

type BetFilterStatus = BetStatus | 'ALL'

type BetFilter = {
  value: BetFilterStatus
  label: string
}

const betFilters: BetFilter[] = [
  { value: 'ALL', label: 'Tous' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'WON', label: 'Gagnés' },
  { value: 'LOST', label: 'Perdus' },
  { value: 'CANCELLED', label: 'Annulés' },
]

function formatDate(value: string): string {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function AdminBetsPage() {
  const [bets, setBets] = useState<Bet[]>([])
  const [selectedStatus, setSelectedStatus] = useState<BetFilterStatus>('ALL')
  const [page, setPage] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [stats, setStats] = useState<Record<BetStatus, number> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let isMounted = true

    async function loadBets(): Promise<void> {
      setIsLoading(true)

      try {
        const data = await getBets({
          status: selectedStatus === 'ALL' ? undefined : selectedStatus,
          page,
        })

        if (isMounted) {
          setBets(data.content)
          setTotalPages(data.totalPages)
          setError('')
        }
      } catch (loadError: unknown) {
        console.error(loadError)

        if (isMounted) {
          if (loadError instanceof ApiError && loadError.status === 403) {
            setError(
              'Votre session ne possède pas le rôle administrateur côté serveur.',
            )
          } else {
            setError('Impossible de charger les paris pour le moment.')
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadBets()

    return () => {
      isMounted = false
    }
  }, [selectedStatus, page])

  useEffect(() => {
    async function loadStats(): Promise<void> {
      try {
        setStats(await getBetStats())
      } catch (statsError: unknown) {
        console.error(statsError)
      }
    }

    void loadStats()
  }, [])

  function handleStatusFilterChange(status: BetFilterStatus): void {
    setSelectedStatus(status)
    setPage(0)
  }

  const betStats = [
    {
      label: 'Paris en attente',
      value: stats?.PENDING ?? 0,
    },
    {
      label: 'Paris gagnés',
      value: stats?.WON ?? 0,
    },
    {
      label: 'Paris perdus',
      value: stats?.LOST ?? 0,
    },
    {
      label: 'Paris annulés',
      value: stats?.CANCELLED ?? 0,
    },
  ]

  return (
    <section className="admin-page" aria-labelledby="admin-bets-title">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 id="admin-bets-title">Paris</h1>
          <p>
            Suivre les mises et vérifier leur résolution après la fin ou
            l'annulation d'un match.
          </p>
        </div>
      </div>

      {isLoading && <LoadingState message="Chargements des paris..." />}

      {!isLoading && error && <ErrorState message={error} />}

      {!isLoading && !error && (
        <>
          <section className="admin-stats-grid" aria-label="Résumé des paris">
            {betStats.map((stat) => (
              <article className="admin-stat-card" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </section>

          <div className="bet-filters" aria-label="Filtres des paris admin">
            {betFilters.map((filter) => (
              <button
                key={filter.value}
                className={
                  selectedStatus === filter.value ? 'filter-button active' : 'filter-button'
                }
                type="button"
                aria-pressed={selectedStatus === filter.value}
                onClick={() => handleStatusFilterChange(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <section className="admin-panel" aria-labelledby="admin-bets-table-title">
            <div className="admin-panel-header">
              <div>
                <h2 id="admin-bets-table-title">Tous les paris</h2>
                <p>Consulter les paris placés par les utilisateurs.</p>
              </div>
            </div>

            {bets.length === 0 ? (
              <EmptyState
                message="Aucun pari ne correspond à ce filtre."
                variant="panel"
              />
            ) : null}

            {bets.length > 0 ? (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Match</th>
                      <th>Sélection</th>
                      <th>Parieur</th>
                      <th>Mise</th>
                      <th>Cote</th>
                      <th>Gain potentiel</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bets.map((bet) => (
                      <tr key={bet.id}>
                        <td>
                          <strong>{bet.team1Name} vs {bet.team2Name}</strong>
                        </td>
                        <td>{bet.selectedTeamName}</td>
                        <td>{bet.username}</td>
                        <td>{formatKibbles(bet.amount)}</td>
                        <td>x{bet.coefficient}</td>
                        <td>{formatKibbles(bet.potentialGain)}</td>
                        <td>
                          <BetStatusBadge status={bet.status} />
                        </td>
                        <td>
                          <time dateTime={bet.createdAt}>{formatDate(bet.createdAt)}</time>
                        </td>
                        <td>
                          <Link
                            className="secondary-button admin-table-action"
                            to={`/matches/${bet.matchId}`}
                          >
                            Voir match
                          </Link>
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
  )
}

export default AdminBetsPage
