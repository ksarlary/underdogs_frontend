import { useEffect, useState } from 'react'
import Pagination from '../components/shared/Pagination'
import EmptyState from '../components/shared/EmptyState'
import ErrorState from '../components/shared/ErrorState'
import LoadingState from '../components/shared/LoadingState'
import TournamentCard from '../components/tournaments/TournamentCard'
import { getTournaments } from '../services/tournaments'
import type { Game } from '../types/common'
import type { TournamentSummary } from '../types/tournament'

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

function TournamentsPage() {
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([])
  const [selectedGame, setSelectedGame] = useState<TournamentFilterStatus>('ALL')
  const [page, setPage] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [reloadToken, setReloadToken] = useState<number>(0)

  useEffect(() => {
    let isMounted = true

    async function loadTournaments(): Promise<void> {
      setIsLoading(true)
      setError('')

      try {
        const data = await getTournaments({
          game: selectedGame === 'ALL' ? undefined : selectedGame,
          page,
        })

        if (isMounted) {
          setTournaments(data.content)
          setTotalPages(data.totalPages)
        }
      } catch (loadError: unknown) {
        if (isMounted) {
          console.error(loadError)
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
  }, [selectedGame, page, reloadToken])

  function handleGameFilterChange(game: TournamentFilterStatus): void {
    setSelectedGame(game)
    setPage(0)
  }

  return (
    <section className="tournaments-section" aria-labelledby="tournaments-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Compétitions esport</p>
          <h1 id="tournaments-title">Tournois</h1>
        </div>
      </div>

      <div className="bet-filters" aria-label="Filtres des tournois">
        {tournamentFilters.map((filter) => (
          <button
            key={filter.value}
            className={
              selectedGame === filter.value ? 'filter-button active' : 'filter-button'
            }
            type="button"
            aria-pressed={selectedGame === filter.value}
            onClick={() => handleGameFilterChange(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading && <LoadingState message="Chargement des tournois..." />}

      {!isLoading && error && (
        <ErrorState
          message={error}
          onRetry={() => setReloadToken((token) => token + 1)}
        />
      )}

      {!isLoading && !error && tournaments.length === 0 && (
        <EmptyState message="Aucun tournoi ne correspond à ce filtre." />
      )}

      {!isLoading && !error && tournaments.length > 0 && (
        <>
          <div className="tournament-grid">
            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
              />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  )
}

export default TournamentsPage
