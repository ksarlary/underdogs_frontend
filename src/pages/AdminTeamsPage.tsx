import { useEffect, useState } from 'react'
import TeamDrawer from '../components/admin/TeamDrawer'
import EmptyState from '../components/shared/EmptyState'
import ErrorState from '../components/shared/ErrorState'
import LoadingState from '../components/shared/LoadingState'
import Pagination from '../components/shared/Pagination'
import { getTeamStats, getTeams } from '../services/teams'
import type { Game } from '../types/common'
import type { TeamSummary } from '../types/team'
import { getGameLabel } from '../utils/displayLabels'

type TeamFilterStatus = Game | 'ALL'

type TeamFilter = {
  value: TeamFilterStatus
  label: string
}

const teamFilters: TeamFilter[] = [
  { value: 'ALL', label: 'Toutes' },
  { value: 'LEAGUE_OF_LEGENDS', label: 'League of Legends' },
  { value: 'VALORANT', label: 'Valorant' },
  { value: 'COUNTER_STRIKE', label: 'Counter-Strike 2' },
  { value: 'DOTA_2', label: 'Dota 2' },
]

function AdminTeamsPage() {
  const [teams, setTeams] = useState<TeamSummary[]>([])
  const [selectedGame, setSelectedGame] = useState<TeamFilterStatus>('ALL')
  const [page, setPage] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [stats, setStats] = useState<Record<Game, number> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] =
    useState<boolean>(false)
  const [selectedTeamToEdit, setSelectedTeamToEdit] =
    useState<TeamSummary | null>(null)
  const [reloadToken, setReloadToken] = useState<number>(0)

  useEffect(() => {
    let isMounted = true

    async function loadTeams(): Promise<void> {
      setIsLoading(true)

      try {
        const data = await getTeams({
          game: selectedGame === 'ALL' ? undefined : selectedGame,
          page,
        })

        if (isMounted) {
          setTeams(data.content)
          setTotalPages(data.totalPages)
          setError('')
        }
      } catch (loadError: unknown) {
        if (isMounted) {
          console.error(loadError)
          setError('Impossible de charger les équipes pour le moment.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadTeams()

    return () => {
      isMounted = false
    }
  }, [selectedGame, page, reloadToken])

  useEffect(() => {
    let isMounted = true

    async function loadStats(): Promise<void> {
      try {
        const data = await getTeamStats()

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

  function handleTeamSaved(): void {
    setReloadToken((token) => token + 1)
  }

  function handleGameFilterChange(game: TeamFilterStatus): void {
    setSelectedGame(game)
    setPage(0)
  }

  const teamStats = [
    {
      label: 'Total',
      value: stats ? Object.values(stats).reduce((total, count) => total + count, 0) : 0,
    },
    {
      label: 'League of Legends',
      value: stats?.LEAGUE_OF_LEGENDS ?? 0,
    },
    {
      label: 'Valorant',
      value: stats?.VALORANT ?? 0,
    },
    {
      label: 'Counter-Strike 2',
      value: stats?.COUNTER_STRIKE ?? 0,
    },
  ]

  return (
    <>
      <section className="admin-page" aria-labelledby="admin-teams-title">
        <div className="admin-page-heading">
          <div>
            <p className="eyebrow">Administration</p>
            <h1 id="admin-teams-title">Gestion des équipes</h1>
            <p>
              Créez les équipes de référence utilisées pour composer les matchs.
            </p>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => setIsCreateDrawerOpen(true)}
          >
            Créer une équipe
          </button>
        </div>

        {isLoading && <LoadingState message="Chargement des équipes..." />}

        {!isLoading && error && <ErrorState message={error} />}

        {!isLoading && !error && (
          <>
            <section className="admin-stats-grid" aria-label="Résumé des équipes">
              {teamStats.map((stat) => (
                <article className="admin-stat-card" key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </article>
              ))}
            </section>

            <div className="bet-filters" aria-label="Filtres des équipes">
              {teamFilters.map((filter) => (
                <button
                  key={filter.value}
                  className={
                    selectedGame === filter.value
                      ? 'filter-button active'
                      : 'filter-button'
                  }
                  type="button"
                  aria-pressed={selectedGame === filter.value}
                  onClick={() => handleGameFilterChange(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <section className="admin-panel" aria-labelledby="admin-teams-table-title">
              <div className="admin-panel-header">
                <div>
                  <h2 id="admin-teams-table-title">Équipes</h2>
                  <p>
                    Une équipe appartient à un jeu et peut ensuite être utilisée
                    dans les matchs de ce jeu.
                  </p>
                </div>
              </div>

              {teams.length === 0 ? (
                <EmptyState
                  message="Aucune équipe ne correspond à ce filtre."
                  variant="panel"
                />
              ) : null}

              {teams.length > 0 ? (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Équipe</th>
                        <th>Tag</th>
                        <th>Jeu</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {teams.map((team) => (
                        <tr key={team.id}>
                          <td>
                            <strong>{team.name}</strong>
                          </td>
                          <td>{team.tag}</td>
                          <td>{getGameLabel(team.game)}</td>
                          <td>
                            <div className="admin-table-actions">
                              <button
                                className="secondary-button admin-table-action"
                                type="button"
                                onClick={() => setSelectedTeamToEdit(team)}
                              >
                                Modifier
                              </button>
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

      <TeamDrawer
        isOpen={isCreateDrawerOpen}
        team={null}
        onClose={() => setIsCreateDrawerOpen(false)}
        onTeamSaved={handleTeamSaved}
      />

      <TeamDrawer
        isOpen={Boolean(selectedTeamToEdit)}
        team={selectedTeamToEdit}
        onClose={() => setSelectedTeamToEdit(null)}
        onTeamSaved={handleTeamSaved}
      />
    </>
  )
}

export default AdminTeamsPage
