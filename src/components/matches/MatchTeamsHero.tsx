import type { ReactNode } from 'react'
import type { MatchDetail, MatchOdds, TeamOdds } from '../../types/match'

type MatchTeamsHeroProps = {
  match: MatchDetail
  statusLabel: string
  scheduledAtLabel: string
  team1ScoreLabel: number | string
  team2ScoreLabel: number | string
  odds: MatchOdds | null
  canPlaceBet: boolean
  selectedBetId: string | null
  onSelectBet: (teamOdds: TeamOdds) => void
  onOpenRoster: (teamId: string) => void
}

function MatchTeamsHero({
  match,
  statusLabel,
  scheduledAtLabel,
  team1ScoreLabel,
  team2ScoreLabel,
  odds,
  canPlaceBet,
  selectedBetId,
  onSelectBet,
  onOpenRoster,
}: MatchTeamsHeroProps) {
  function renderTeamOdds(teamOdds: TeamOdds | undefined): ReactNode {
    if (!match.bettingOpen || !teamOdds) {
      return null
    }

    if (!canPlaceBet) {
      return (
        <div className="team-odds-card" aria-label={`Cote ${teamOdds.name}`}>
          <span>Cote estimée x{teamOdds.coefficient}</span>
          <strong>{teamOdds.name}</strong>
        </div>
      )
    }

    return (
      <button
        className={`team-odds-button ${
          selectedBetId === teamOdds.id ? 'team-odds-button-selected' : ''
        }`}
        type="button"
        onClick={() => onSelectBet(teamOdds)}
      >
        <span>Cote estimée x{teamOdds.coefficient}</span>
        <strong>Miser sur {teamOdds.name}</strong>
      </button>
    )
  }

  return (
    <div className="match-detail-hero">
      <article className="match-detail-team">
        <span>{match.team1Name}</span>
        <strong>{team1ScoreLabel}</strong>
        <button
          className="secondary-button roster-button"
          type="button"
          onClick={() => onOpenRoster(match.team1Id)}
        >
          Voir les joueurs
        </button>

        {renderTeamOdds(odds?.team1)}
      </article>

      <div className="match-detail-center">
        <span>{statusLabel}</span>
        <small>{scheduledAtLabel}</small>
      </div>

      <article className="match-detail-team match-detail-team-away">
        <span>{match.team2Name}</span>
        <strong>{team2ScoreLabel}</strong>
        <button
          className="secondary-button roster-button"
          type="button"
          onClick={() => onOpenRoster(match.team2Id)}
        >
          Voir les joueurs
        </button>

        {renderTeamOdds(odds?.team2)}
      </article>
    </div>
  )
}

export default MatchTeamsHero
