import { Link } from 'react-router-dom'
import type { Bet } from '../../types/bet'
import { formatKibbles } from '../../utils/formatters'
import BetStatusBadge from './BetStatusBadge'

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

type BetCardProps = {
  bet: Bet
}

function BetCard({ bet }: BetCardProps) {
  const netGain = bet.potentialGain - bet.amount

  return (
    <article className="bet-card">
      <div className="bet-card-header">
        <div>
          <Link className="bet-card-match" to={`/matches/${bet.matchId}`}>
            {bet.team1Name} vs {bet.team2Name}
          </Link>
          <p>Pari placé le {formatDate(bet.createdAt)}</p>
        </div>

        <BetStatusBadge status={bet.status} />
      </div>

      <div className="bet-card-selection">
        <span>Votre choix</span>
        <strong>{bet.selectedTeamName}</strong>
      </div>

      <div className="bet-card-stats">
        <div>
          <span>Mise</span>
          <strong>{formatKibbles(bet.amount)}</strong>
        </div>

        <div>
          <span>Cote</span>
          <strong>x{bet.coefficient}</strong>
        </div>

        <div>
          <span>Retour potentiel</span>
          <strong>{formatKibbles(bet.potentialGain)}</strong>
        </div>
      </div>

      {bet.status === 'WON' ? (
        <p className="bet-card-result">Bénéfice net : +{formatKibbles(netGain)}</p>
      ) : null}

      {bet.status === 'LOST' ? (
        <p className="bet-card-result">Mise perdue : {formatKibbles(bet.amount)}</p>
      ) : null}

      {bet.status === 'CANCELLED' ? (
        <p className="bet-card-result">Mise remboursée : {formatKibbles(bet.amount)}</p>
      ) : null}
    </article>
  )
}

export default BetCard
