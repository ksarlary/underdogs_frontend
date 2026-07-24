import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TournamentDrawer from '../components/admin/TournamentDrawer'
import EmptyState from '../components/shared/EmptyState'
import ErrorState from '../components/shared/ErrorState'
import LoadingState from '../components/shared/LoadingState'
import { getTournaments } from '../services/tournaments'
import type { Game } from '../types/common'
import type { TournamentSummary } from '../types/tournament'
import { getGameLabel } from '../utils/displayLabels'

type TournamentFilterStatus = Game | 'ALL'

type TournamentFilter = {
  value: TournamentFilterStatus
  label: string
}

const tournamentFilters: TournamentFilter[] = [
  { value: 'ALL', label: 'Tous' },
  { value: 'LEAGUE_OF_LEGENDS', label: 'League of Legends' },
  { value: 'VALORANT', label: 'Valorant' },
  { value: 'COUNTER_STRIKE', label: 'Counter-Strike 2' },
  { value: 'DOTA_2', label: 'Dota 2' },
]

function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([])
  const [selectedGame, setSelectedGame] =
    useState<TournamentFilterStatus>('ALL')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] =
    useState<boolean>(false)
  const [selectedTournamentToEdit, setSelectedTournamentToEdit] =
    useState<TournamentSummary | null>(null)

  async function refreshTournaments(): Promise<void> {
    try {
      const data = await getTournaments()
      setTournaments(data)
      setError('')
    } catch (loadError: unknown) {
      console.error(loadError)
      setError('La liste des tournois n’a pas pu être rechargée.')
    }
  }

  useEffect(() => {
    let isMounted = true

    async function loadTournaments(): Promise<void> {
      try {
        const data = await getTournaments()

        if (isMounted) {
          setTournaments(data)
          setError('')
        }
      } catch (loadError: unknown) {
        console.error(loadError)

        if (isMounted) {
          setError('Impossible de charger les tournois pour le moment.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadTournaments()

    return () => {
      isMounted = false
    }
  }, [])

  const visibleTournaments = useMemo(() => {
    const sortedTournaments = [...tournaments].sort((first, second) =>
      first.name.localeCompare(second.name, 'fr-FR'),
    )

    if (selectedGame === 'ALL') {
      return sortedTournaments
    }

    return sortedTournaments.filter(
      (tournament) => tournament.game === selectedGame,
    )
  }, [selectedGame, tournaments])

  const tournamentStats = useMemo(() => {
    const countByGame = (game: Game): number =>
      tournaments.filter((tournament) => tournament.game === game).length

    return [
      {
        label: 'Total',
        value: tournaments.length,
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
  }, [tournaments])

  return (
    <>
      <section className="admin-page" aria-labelledby="admin-tournaments-title">
        <div className="admin-page-heading">
          <div>
            <p className="eyebrow">Administration</p>
            <h1 id="admin-tournaments-title">Gestion des tournois</h1>
            <p>
              Créez les tournois de référence, puis rattachez les matchs depuis
              la gestion des matchs.
            </p>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => setIsCreateDrawerOpen(true)}
          >
            Créer un tournoi
          </button>
        </div>

        {isLoading && <LoadingState message="Chargement des tournois..." />}

        {!isLoading && error && <ErrorState message={error} />}

        {!isLoading && !error && (
          <>
            <section
              className="admin-stats-grid"
              aria-label="Résumé des tournois"
            >
              {tournamentStats.map((stat) => (
                <article className="admin-stat-card" key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </article>
              ))}
            </section>

            <div className="bet-filters" aria-label="Filtres des tournois">
              {tournamentFilters.map((filter) => (
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

            <section
              className="admin-panel"
              aria-labelledby="admin-tournaments-table-title"
            >
              <div className="admin-panel-header">
                <div>
                  <h2 id="admin-tournaments-table-title">Tournois</h2>
                  <p>
                    Modifiez le nom et la période d’un tournoi. Les matchs
                    rattachés restent gérés depuis la page Matchs.
                  </p>
                </div>
              </div>

              {tournaments.length === 0 ? (
                <EmptyState message="Aucun tournoi disponible." variant="panel" />
              ) : null}

              {tournaments.length > 0 && visibleTournaments.length === 0 ? (
                <EmptyState
                  message="Aucun tournoi ne correspond à ce filtre."
                  variant="panel"
                />
              ) : null}

              {visibleTournaments.length > 0 ? (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Tournoi</th>
                        <th>Jeu</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {visibleTournaments.map((tournament) => (
                        <tr key={tournament.id}>
                          <td>
                            <strong>{tournament.name}</strong>
                          </td>
                          <td>{getGameLabel(tournament.game)}</td>
                          <td>
                            <div className="admin-table-actions">
                              <Link
                                className="secondary-button admin-table-action"
                                to={`/tournaments/${tournament.id}`}
                              >
                                Voir
                              </Link>

                              <button
                                className="secondary-button admin-table-action"
                                type="button"
                                onClick={() =>
                                  setSelectedTournamentToEdit(tournament)
                                }
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

      <TournamentDrawer
        isOpen={isCreateDrawerOpen}
        tournament={null}
        onClose={() => setIsCreateDrawerOpen(false)}
        onTournamentSaved={refreshTournaments}
      />

      <TournamentDrawer
        isOpen={Boolean(selectedTournamentToEdit)}
        tournament={selectedTournamentToEdit}
        onClose={() => setSelectedTournamentToEdit(null)}
        onTournamentSaved={refreshTournaments}
      />
    </>
  )
}

export default AdminTournamentsPage
