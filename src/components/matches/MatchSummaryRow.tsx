import { Link } from 'react-router-dom'
import type { MatchSummary } from '../../types/match'
import { getGameLabel, getMatchStatusLabel } from '../../utils/displayLabels'

type MatchSummaryRowProps = {
  match: MatchSummary
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return 'Non planifié'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function MatchSummaryRow({ match }: MatchSummaryRowProps) {
  return (
    <article className="match-board-row">
      <div className="match-board-game">
        <span>{getGameLabel(match.game)}</span>
        <strong>{getMatchStatusLabel(match.status)}</strong>
      </div>

      <div className="match-board-teams">
        <span>{match.team1Name}</span>
        <small>vs</small>
        <span>{match.team2Name}</span>
      </div>

      <time dateTime={match.scheduledAt}>
        {formatDateTime(match.scheduledAt)}
      </time>

      <Link
        className="secondary-button match-board-action"
        to={`/matches/${match.id}`}
      >
        Voir
      </Link>
    </article>
  )
}

export default MatchSummaryRow
