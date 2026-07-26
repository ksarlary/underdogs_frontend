import { useEffect, useState } from 'react'
import MatchSummaryRow from '../components/matches/MatchSummaryRow'
import EmptyState from '../components/shared/EmptyState'
import ErrorState from '../components/shared/ErrorState'
import LoadingState from '../components/shared/LoadingState'
import Pagination from '../components/shared/Pagination'
import { getMatches } from '../services/matches'
import type { Game, MatchStatus } from '../types/common'
import type { MatchSummary } from '../types/match'

type MatchGameFilter = Game | 'ALL'
type MatchStatusFilter = MatchStatus | 'ALL'

type GameFilterOption = {
  value: MatchGameFilter
  label: string
}

type StatusFilterOption = {
  value: MatchStatusFilter
  label: string
}

const gameFilters: GameFilterOption[] = [
  { value: 'ALL', label: 'Tous les jeux' },
  { value: 'LEAGUE_OF_LEGENDS', label: 'League of Legends' },
  { value: 'VALORANT', label: 'Valorant' },
  { value: 'COUNTER_STRIKE', label: 'Counter-Strike 2' },
  { value: 'DOTA_2', label: 'Dota 2' },
]

const statusFilters: StatusFilterOption[] = [
  { value: 'ALL', label: 'Tous' },
  { value: 'LIVE', label: 'En direct' },
  { value: 'SCHEDULED', label: 'À venir' },
  { value: 'FINISHED', label: 'Terminés' },
  { value: 'CANCELLED', label: 'Annulés' },
]

function MatchesPage() {
  const [matches, setMatches] = useState<MatchSummary[]>([])
  const [selectedGame, setSelectedGame] = useState<MatchGameFilter>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<MatchStatusFilter>('ALL')
  const [page, setPage] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [reloadCounter, setReloadCounter] = useState<number>(0)

  useEffect(() => {
    let isMounted = true

    async function loadMatches(): Promise<void> {
      setIsLoading(true)
      setError('')

      try {
        const data = await getMatches({
          game: selectedGame === 'ALL' ? undefined : selectedGame,
          status: selectedStatus === 'ALL' ? undefined : selectedStatus,
          page,
        })

        if (isMounted) {
          setMatches(data.content)
          setTotalPages(data.totalPages)
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
  }, [selectedGame, selectedStatus, page, reloadCounter])

  function handleGameFilterChange(game: MatchGameFilter): void {
    setSelectedGame(game)
    setPage(0)
  }

  function handleStatusFilterChange(status: MatchStatusFilter): void {
    setSelectedStatus(status)
    setPage(0)
  }

  return (
    <section className="tournaments-section" aria-labelledby="matches-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Calendrier esport</p>
          <h1 id="matches-title">Matchs</h1>
        </div>
      </div>

      <div className="bet-filters" aria-label="Filtres par jeu">
        {gameFilters.map((filter) => (
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

      <div className="bet-filters" aria-label="Filtres par statut">
        {statusFilters.map((filter) => (
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

      {isLoading && <LoadingState message="Chargement des matchs..." />}

      {!isLoading && error && (
        <ErrorState
          message={error}
          onRetry={() => setReloadCounter((counter) => counter + 1)}
        />
      )}

      {!isLoading && !error && matches.length === 0 && (
        <EmptyState message="Aucun match ne correspond à ce filtre." />
      )}

      {!isLoading && !error && matches.length > 0 && (
        <>
          <div className="match-board">
            {matches.map((match) => (
              <MatchSummaryRow key={match.id} match={match} />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  )
}

export default MatchesPage
