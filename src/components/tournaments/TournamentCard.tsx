import { Link } from 'react-router-dom'
import type { TournamentSummary } from '../../types/tournament'
import { getGameLabel } from '../../utils/displayLabels'

type TournamentCardProps = {
  tournament: TournamentSummary
}

function TournamentCard({ tournament }: TournamentCardProps) {
  return (
    <article className="tournament-card tournament-list-card">
      <p className="card-game">{getGameLabel(tournament.game)}</p>

      <h3>{tournament.name}</h3>

      <div className="card-actions">
        <Link
          className="secondary-button"
          to={`/tournaments/${tournament.id}`}
        >
          Voir le tournoi
        </Link>
      </div>
    </article>
  )
}

export default TournamentCard
