import { Link } from 'react-router-dom'

type MatchInfoGridProps = {
  tournamentId: string
  tournamentName: string
  bettingStatusLabel: string
  winnerName: string | null
}

function MatchInfoGrid({
  tournamentId,
  tournamentName,
  bettingStatusLabel,
  winnerName,
}: MatchInfoGridProps) {
  return (
    <div className="detail-meta-grid">
      <article className="tournament-card detail-meta-card">
        <div className="card-topline">
          <span>Tournoi</span>
          <strong>
            <Link className="detail-meta-link" to={`/tournaments/${tournamentId}`}>
              {tournamentName}
            </Link>
          </strong>
        </div>
      </article>

      <article className="tournament-card detail-meta-card">
        <div className="card-topline">
          <span>Paris</span>
          <strong>{bettingStatusLabel}</strong>
        </div>
      </article>

      <article className="tournament-card detail-meta-card">
        <div className="card-topline">
          <span>Gagnant</span>
          <strong>{winnerName ?? 'À déterminer'}</strong>
        </div>
      </article>
    </div>
  )
}

export default MatchInfoGrid
