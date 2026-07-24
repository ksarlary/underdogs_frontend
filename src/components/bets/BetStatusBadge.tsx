import type { BetStatus } from '../../types/common'
import { getBetStatusLabel } from '../../utils/displayLabels'

type BetStatusBadgeProps = {
  status: BetStatus
}

function BetStatusBadge({ status }: BetStatusBadgeProps) {
  const label = getBetStatusLabel(status)

  return <span className={`bet-status-badge bet-status-${status.toLowerCase()}`}>{label}</span>
}

export default BetStatusBadge
