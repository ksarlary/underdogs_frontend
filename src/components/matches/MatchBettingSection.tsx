import BetSlip from '../bets/BetSlip'
import ErrorState from '../shared/ErrorState'
import LoadingState from '../shared/LoadingState'
import type { MatchDetail, TeamOdds } from '../../types/match'

function getBettingUnavailableMessage(status: MatchDetail['status']): string {
  if (status === 'LIVE') {
    return 'La période de paris en direct est terminée.'
  }

  if (status === 'FINISHED') {
    return 'Ce match est terminé, les paris sont fermés.'
  }

  if (status === 'CANCELLED') {
    return 'Ce match est annulé, les paris sont fermés.'
  }

  return 'Les paris sont fermés pour ce match.'
}

type MatchBettingSectionProps = {
  match: MatchDetail
  isOddsLoading: boolean
  oddsError: string
  isVisitor: boolean
  isBlocked: boolean
  canPlaceBet: boolean
  selectedBet: TeamOdds | null
  onLogin: () => void
  onClearBet: () => void
}

function MatchBettingSection({
  match,
  isOddsLoading,
  oddsError,
  isVisitor,
  isBlocked,
  canPlaceBet,
  selectedBet,
  onLogin,
  onClearBet,
}: MatchBettingSectionProps) {
  return (
    <>
      {isOddsLoading && <LoadingState message="Chargement des cotes..." />}

      {!isOddsLoading && oddsError && <ErrorState message={oddsError} />}

      {match.bettingOpen && isVisitor ? (
        <div className="page-status page-status-with-action">
          <span>Connectez-vous pour placer un pari.</span>

          <button
            className="secondary-button"
            type="button"
            onClick={onLogin}
          >
            Se connecter
          </button>
        </div>
      ) : null}

      {match.bettingOpen && isBlocked ? (
        <p className="page-status">
          Votre compte est bloqué. Vous ne pouvez pas placer de pari.
        </p>
      ) : null}

      {match.bettingOpen && canPlaceBet && selectedBet && (
        <BetSlip
          matchId={match.id}
          selection={selectedBet}
          onClear={onClearBet}
        />
      )}

      {!match.bettingOpen && (
        <p className="page-status">
          {getBettingUnavailableMessage(match.status)}
        </p>
      )}
    </>
  )
}

export default MatchBettingSection
