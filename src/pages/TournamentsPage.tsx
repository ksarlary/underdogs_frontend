import { useEffect, useRef, useState } from 'react'
import EmptyState from '../components/shared/EmptyState'
import ErrorState from '../components/shared/ErrorState'
import LoadingState from '../components/shared/LoadingState'
import TournamentCard from '../components/tournaments/TournamentCard'
import { getTournaments } from '../services/tournaments'
import type { TournamentSummary } from '../types/tournament'

function TournamentsPage() {
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const requestIdRef = useRef<number>(0)

  async function loadTournaments(): Promise<void> {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    setIsLoading(true)
    setError('')

    try {
      const data = await getTournaments()

      if (requestId !== requestIdRef.current) {
        return
      }

      setTournaments(data)
    } catch (loadError: unknown) {
      if (requestId !== requestIdRef.current) {
        return
      }

      console.error(loadError)
      setError('Impossible de charger les tournois pour le moment.')
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    async function loadInitialTournaments(): Promise<void> {
      try {
        const data = await getTournaments()

        if (requestId !== requestIdRef.current) {
          return
        }

        setTournaments(data)
        setError('')
      } catch (loadError: unknown) {
        if (requestId !== requestIdRef.current) {
          return
        }

        console.error(loadError)
        setError('Impossible de charger les tournois pour le moment.')
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialTournaments()

    return () => {
      requestIdRef.current += 1
    }
  }, [])

  return (
    <section className="tournaments-section" aria-labelledby="tournaments-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Compétitions esport</p>
          <h1 id="tournaments-title">Tournois</h1>
        </div>
      </div>

      {isLoading && <LoadingState message="Chargement des tournois..." />}

      {!isLoading && error && (
        <ErrorState message={error} onRetry={() => void loadTournaments()} />
      )}

      {!isLoading && !error && tournaments.length === 0 && (
        <EmptyState message="Aucun tournoi disponible." />
      )}

      {!isLoading && !error && tournaments.length > 0 && (
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
  )
}

export default TournamentsPage
