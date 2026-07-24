import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BetCard from '../components/bets/BetCard'
import EmptyState from '../components/shared/EmptyState'
import ErrorState from '../components/shared/ErrorState'
import LoadingState from '../components/shared/LoadingState'
import { useCurrentUser } from '../contexts/useCurrentUser'
import { getMyBets } from '../services/bets'
import type { Bet } from '../types/bet'
import type { BetStatus } from '../types/common'

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

function MyBetsPage() {
  const {
    currentUser,
    isAuthenticated,
    isAuthReady,
    login,
  } = useCurrentUser()
  const [bets, setBets] = useState<Bet[]>([])
  const [selectedStatus, setSelectedStatus] = useState<BetFilterStatus>('ALL')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated || !currentUser) {
      return
    }

    const userId = currentUser.id
    let isMounted = true

    async function loadBets(): Promise<void> {
      try {
        setIsLoading(true)
        setError('')

        const data = await getMyBets()
        const sortedBets = [...data].sort(
          (firstBet, secondBet) => new Date(secondBet.createdAt).getTime() - new Date(firstBet.createdAt).getTime(),
        )

        if (isMounted) {
          setBets(sortedBets)
          setError('')
          setLoadedUserId(userId)
        }
      } catch (loadError: unknown) {
        console.error(loadError)

        if (isMounted) {
          setError('Impossible de charger vos paris.')
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
  }, [currentUser, isAuthReady, isAuthenticated])

  const visibleBets = useMemo(() => {
    if (selectedStatus === 'ALL') {
      return bets
    }

    return bets.filter((bet) => bet.status === selectedStatus)
  }, [bets, selectedStatus])

  const hasLoadedCurrentUserBets =
    currentUser !== null && loadedUserId === currentUser.id

  const showBetsLoading =
    isAuthenticated &&
    !error &&
    (!hasLoadedCurrentUserBets || isLoading)

  async function handleLogin(): Promise<void> {
    try {
      await login()
    } catch (loginError: unknown) {
      console.error('Unable to start login from my bets page', loginError)
    }
  }

  if (!isAuthReady) {
    return <LoadingState message="Chargement..." />
  }

  if (!isAuthenticated) {
    return (
      <section className="my-bets-page">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Compte</p>
            <h1>Mes paris</h1>
          </div>
        </div>

        <div className="empty-state">
          <h2>Connectez-vous pour consulter vos paris.</h2>

          <button
            className="primary-button"
            type="button"
            onClick={() => void handleLogin()}
          >
            Se connecter
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="my-bets-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Compte</p>
          <h1>Mes paris</h1>
          <p>Consultez vos paris en cours et votre historique.</p>
        </div>
      </div>

      <div className="bet-filters" aria-label="Filtres des paris">
        {betFilters.map((filter) => (
          <button
            key={filter.value}
            className={selectedStatus === filter.value ? 'filter-button active' : 'filter-button'}
            type="button"
            aria-pressed={selectedStatus === filter.value}
            onClick={() => setSelectedStatus(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {showBetsLoading ? (
        <LoadingState message="Chargement de vos paris..." />
      ) : null}

      {error ? <ErrorState message={error} /> : null}

      {!showBetsLoading && !error && hasLoadedCurrentUserBets && bets.length === 0 ? (
        <div className="empty-state">
          <h2>Vous n'avez pas encore placé de pari.</h2>
          <Link className="primary-button" to="/matches">
            Voir les matchs disponibles
          </Link>
        </div>
      ) : null}

      {!showBetsLoading && !error && hasLoadedCurrentUserBets && bets.length > 0 && visibleBets.length === 0 ? (
        <EmptyState message="Aucun pari ne correspond à ce filtre." />
      ) : null}

      {!showBetsLoading && !error && hasLoadedCurrentUserBets && visibleBets.length > 0 ? (
        <div className="bet-card-list">
          {visibleBets.map((bet) => (
            <BetCard key={bet.id} bet={bet} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default MyBetsPage
