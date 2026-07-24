import { useEffect, useMemo, useRef, useState } from 'react'
import MatchSummaryRow from '../components/matches/MatchSummaryRow'
import EmptyState from '../components/shared/EmptyState'
import ErrorState from '../components/shared/ErrorState'
import LoadingState from '../components/shared/LoadingState'
import { getMatches } from '../services/matches'
import type { MatchSummary } from '../types/match'

function getDateTimeTimestamp(value: string): number {
  const timestamp = new Date(value).getTime()

  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp
}

function MatchesPage() {
  const [matches, setMatches] = useState<MatchSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const requestIdRef = useRef<number>(0)

  async function loadMatches(): Promise<void> {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    setIsLoading(true)
    setError('')

    try {
      const data = await getMatches()

      if (requestId !== requestIdRef.current) {
        return
      }

      setMatches(data)
    } catch (loadError: unknown) {
      if (requestId !== requestIdRef.current) {
        return
      }

      console.error(loadError)
      setError('Impossible de charger les matchs pour le moment.')
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    async function loadInitialMatches(): Promise<void> {
      try {
        const data = await getMatches()

        if (requestId !== requestIdRef.current) {
          return
        }

        setMatches(data)
        setError('')
      } catch (loadError: unknown) {
        if (requestId !== requestIdRef.current) {
          return
        }

        console.error(loadError)
        setError('Impossible de charger les matchs pour le moment.')
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialMatches()

    return () => {
      requestIdRef.current += 1
    }
  }, [])

  const sortedMatches = useMemo(
    () =>
      [...matches].sort(
        (firstMatch, secondMatch) =>
          getDateTimeTimestamp(firstMatch.scheduledAt) -
          getDateTimeTimestamp(secondMatch.scheduledAt),
      ),
    [matches],
  )

  return (
    <section className="tournaments-section" aria-labelledby="matches-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Calendrier esport</p>
          <h1 id="matches-title">Matchs</h1>
        </div>
      </div>

      {isLoading && <LoadingState message="Chargement des matchs..." />}

      {!isLoading && error && (
        <ErrorState message={error} onRetry={() => void loadMatches()} />
      )}

      {!isLoading && !error && sortedMatches.length === 0 && (
        <EmptyState message="Aucun match disponible." />
      )}

      {!isLoading && !error && sortedMatches.length > 0 && (
        <div className="match-board">
          {sortedMatches.map((match) => (
            <MatchSummaryRow key={match.id} match={match} />
          ))}
        </div>
      )}
    </section>
  )
}

export default MatchesPage
