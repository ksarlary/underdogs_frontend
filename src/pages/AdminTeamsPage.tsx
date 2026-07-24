import { useEffect, useMemo, useState } from 'react'
import TeamDrawer from '../components/admin/TeamDrawer'
import EmptyState from '../components/shared/EmptyState'
import ErrorState from '../components/shared/ErrorState'
import LoadingState from '../components/shared/LoadingState'
import { getTeams } from '../services/teams'
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
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] =
    useState<boolean>(false)
  const [selectedTeamToEdit, setSelectedTeamToEdit] =
    useState<TeamSummary | null>(null)

  async function refreshTeams(): Promise<void> {
    try {
      const data = await getTeams()
      setTeams(data)
      setError('')
    } catch (loadError: unknown) {
      console.error(loadError)
      setError('La liste des équipes n’a pas pu être rechargée.')
    }
  }

  useEffect(() => {
    let isMounted = true

    async function loadTeams(): Promise<void> {
      try {
        const data = await getTeams()

        if (isMounted) {
          setTeams(data)
          setError('')
        }
      } catch (loadError: unknown) {
        console.error(loadError)

        if (isMounted) {
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
  }, [])

  const visibleTeams = useMemo(() => {
    const sortedTeams = [...teams].sort((first, second) => {
      const gameComparison = getGameLabel(first.game).localeCompare(
        getGameLabel(second.game),
        'fr-FR',
      )

      if (gameComparison !== 0) {
        return gameComparison
      }

      return first.name.localeCompare(second.name, 'fr-FR')
    })

    if (selectedGame === 'ALL') {
      return sortedTeams
    }

    return sortedTeams.filter((team) => team.game === selectedGame)
  }, [selectedGame, teams])

  const teamStats = useMemo(() => {
    const countByGame = (game: Game): number =>
      teams.filter((team) => team.game === game).length

    return [
      {
        label: 'Total',
        value: teams.length,
      },
      {
        label: 'League of Legends',
        value: countByGame('LEAGUE_OF_LEGENDS'),
      },
      {
        label: 'Valorant',
        value: countByGame('VALORANT'),
      },
      {
        label: 'Counter-Strike 2',
        value: countByGame('COUNTER_STRIKE'),
      },
    ]
  }, [teams])

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
                  onClick={() => setSelectedGame(filter.value)}
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
                <EmptyState message="Aucune équipe disponible." variant="panel" />
              ) : null}

              {teams.length > 0 && visibleTeams.length === 0 ? (
                <EmptyState
                  message="Aucune équipe ne correspond à ce filtre."
                  variant="panel"
                />
              ) : null}

              {visibleTeams.length > 0 ? (
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
                      {visibleTeams.map((team) => (
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
            </section>
          </>
        )}
      </section>

      <TeamDrawer
        isOpen={isCreateDrawerOpen}
        team={null}
        onClose={() => setIsCreateDrawerOpen(false)}
        onTeamSaved={refreshTeams}
      />

      <TeamDrawer
        isOpen={Boolean(selectedTeamToEdit)}
        team={selectedTeamToEdit}
        onClose={() => setSelectedTeamToEdit(null)}
        onTeamSaved={refreshTeams}
      />
    </>
  )
}

export default AdminTeamsPage
