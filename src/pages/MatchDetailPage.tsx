import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MatchBettingSection from '../components/matches/MatchBettingSection'
import MatchInfoGrid from '../components/matches/MatchInfoGrid'
import MatchTeamsHero from '../components/matches/MatchTeamsHero'
import ErrorState from '../components/shared/ErrorState'
import LoadingState from '../components/shared/LoadingState'
import TeamRosterModal from '../components/teams/TeamRosterModal'
import { useCurrentUser } from '../contexts/useCurrentUser'
import { ApiError } from '../services/httpClient'
import { getMatchById, getMatchOdds } from '../services/matches'
import { getMatchResult } from '../services/matchResults'
import { getTeamById } from '../services/teams'
import type { MatchStatus } from '../types/common'
import type { MatchDetail, MatchOdds, TeamOdds } from '../types/match'
import type { MatchResult } from '../types/matchResult'
import type { TeamDetail } from '../types/team'
import {
  getGameLabel,
  getMatchStatusLabel,
} from '../utils/displayLabels'

type DisplayResult = {
  status: MatchStatus
  team1Score: number | null
  team2Score: number | null
  winnerName: string | null
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return 'Non planifié'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Non planifié'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatScore(score: number | null | undefined): number | string {
  return score ?? '-'
}

function getResultWinnerName(
  match: MatchDetail,
  matchResult: MatchResult | null,
): string | null {
  if (!matchResult?.winner) {
    return match.winnerTeamName
  }

  if (matchResult.winner.name) {
    return matchResult.winner.name
  }

  if (matchResult.winner.id === match.team1Id) {
    return match.team1Name
  }

  if (matchResult.winner.id === match.team2Id) {
    return match.team2Name
  }

  return match.winnerTeamName
}

function buildDisplayResult(
  match: MatchDetail,
  matchResult: MatchResult | null,
): DisplayResult {
  if (!matchResult) {
    return {
      status: match.status,
      team1Score: match.team1Score,
      team2Score: match.team2Score,
      winnerName: match.winnerTeamName,
    }
  }

  return {
    status: matchResult.status,
    team1Score: matchResult.team1.score,
    team2Score: matchResult.team2.score,
    winnerName: getResultWinnerName(match, matchResult),
  }
}

function getBettingStatusLabel(match: MatchDetail): string {
  if (!match.bettingOpen) {
    return 'Fermés'
  }

  if (match.bettingClosesAt) {
    return `Ouverts jusqu'à ${formatDateTime(match.bettingClosesAt)}`
  }

  return 'Ouverts'
}

function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const {
    currentUser,
    isAuthReady,
    isAuthenticated,
    login,
  } = useCurrentUser()
  const [match, setMatch] = useState<MatchDetail | null>(null)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<TeamDetail | null>(null)
  const [isRosterLoading, setIsRosterLoading] = useState<boolean>(false)
  const [rosterError, setRosterError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [odds, setOdds] = useState<MatchOdds | null>(null)
  const [isOddsLoading, setIsOddsLoading] = useState<boolean>(false)
  const [oddsError, setOddsError] = useState<string>('')
  const [selectedBet, setSelectedBet] = useState<TeamOdds | null>(null)

  const isBlocked = currentUser?.status === 'BLOCKED'
  const isVisitor = isAuthReady && !isAuthenticated
  const canPlaceBet = isAuthenticated && !isBlocked

  const displayResult = useMemo(
    () => (match ? buildDisplayResult(match, matchResult) : null),
    [match, matchResult],
  )

  useEffect(() => {
    if (!id) {
      return
    }

    const matchId = id
    let isMounted = true

    async function loadVersionedResult(): Promise<void> {
      try {
        const resultData = await getMatchResult(matchId)

        if (isMounted) {
          setMatchResult(resultData)
        }
      } catch (resultError: unknown) {
        console.error('Unable to load versioned match result', resultError)
      }
    }

    async function loadOdds(): Promise<void> {
      setIsOddsLoading(true)
      setOddsError('')

      try {
        const oddsData = await getMatchOdds(matchId)

        if (isMounted) {
          setOdds(oddsData)
        }
      } catch (loadError: unknown) {
        console.error(loadError)

        if (isMounted) {
          setOddsError(
            'Impossible de charger les cotes pour le moment.',
          )
        }
      } finally {
        if (isMounted) {
          setIsOddsLoading(false)
        }
      }
    }

    async function loadMatch(): Promise<void> {
      setIsLoading(true)
      setError('')
      setMatch(null)
      setMatchResult(null)
      setOdds(null)
      setOddsError('')
      setSelectedBet(null)

      try {
        const matchData = await getMatchById(matchId)

        if (!isMounted) {
          return
        }

        setMatch(matchData)
        setIsLoading(false)

        void loadVersionedResult()

        if (matchData.bettingOpen) {
          void loadOdds()
        }
      } catch (loadError: unknown) {
        console.error(loadError)

        if (!isMounted) {
          return
        }

        setMatch(null)

        if (
          loadError instanceof ApiError &&
          loadError.status === 404
        ) {
          setError('Ce match n’existe pas ou a été supprimé.')
        } else {
          setError('Impossible de charger ce match pour le moment.')
        }

        setIsLoading(false)
      }
    }

    void loadMatch()

    return () => {
      isMounted = false
    }
  }, [id])

  async function openRoster(teamId: string): Promise<void> {
    setIsRosterLoading(true)
    setRosterError('')

    try {
      const team = await getTeamById(teamId)
      setSelectedTeam(team)
    } catch (loadError: unknown) {
      console.error(loadError)
      setRosterError('Impossible de charger les joueurs de cette équipe.')
    } finally {
      setIsRosterLoading(false)
    }
  }

  function closeRoster(): void {
    setSelectedTeam(null)
    setRosterError('')
  }

  async function handleLogin(): Promise<void> {
    try {
      await login()
    } catch (loginError: unknown) {
      console.error('Unable to start login from match detail', loginError)
    }
  }

  if (!id) {
    return (
      <section
        className="tournaments-section"
        aria-labelledby="match-detail-title"
      >
        <div className="detail-actions">
          <Link className="secondary-button" to="/matches">
            Retour aux matchs
          </Link>
        </div>

        <ErrorState message="Identifiant du match manquant." />
      </section>
    )
  }

  return (
    <section
      className="tournaments-section"
      aria-labelledby="match-detail-title"
    >
      <div className="detail-actions">
        <Link className="secondary-button" to="/matches">
          Retour aux matchs
        </Link>
      </div>

      {isLoading && <LoadingState message="Chargement du match..." />}

      {!isLoading && error && <ErrorState message={error} />}

      {!isLoading && !error && match && displayResult && (
        <>
          <div className="section-heading">
            <div>
              <p className="eyebrow">{getGameLabel(match.game)}</p>
              <h1 id="match-detail-title">
                {match.team1Name} vs {match.team2Name}
              </h1>
            </div>
          </div>

          <MatchTeamsHero
            match={match}
            statusLabel={getMatchStatusLabel(displayResult.status)}
            scheduledAtLabel={formatDateTime(match.scheduledAt)}
            team1ScoreLabel={formatScore(displayResult.team1Score)}
            team2ScoreLabel={formatScore(displayResult.team2Score)}
            odds={odds}
            canPlaceBet={canPlaceBet}
            selectedBetId={selectedBet?.id ?? null}
            onSelectBet={setSelectedBet}
            onOpenRoster={(teamId) => void openRoster(teamId)}
          />

          <MatchBettingSection
            match={match}
            isOddsLoading={isOddsLoading}
            oddsError={oddsError}
            isVisitor={isVisitor}
            isBlocked={isBlocked}
            canPlaceBet={canPlaceBet}
            selectedBet={selectedBet}
            onLogin={() => void handleLogin()}
            onClearBet={() => setSelectedBet(null)}
          />

          <MatchInfoGrid
            tournamentId={match.tournamentId}
            tournamentName={match.tournamentName}
            bettingStatusLabel={getBettingStatusLabel(match)}
            winnerName={displayResult.winnerName}
          />
        </>
      )}

      {(selectedTeam || isRosterLoading || rosterError) && (
        <TeamRosterModal
          team={selectedTeam}
          isLoading={isRosterLoading}
          error={rosterError}
          onClose={closeRoster}
        />
      )}
    </section>
  )
}

export default MatchDetailPage
