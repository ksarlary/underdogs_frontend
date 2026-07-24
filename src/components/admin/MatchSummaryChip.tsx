import type { MatchStatus } from '../../types/common'
import { getMatchStatusLabel } from '../../utils/displayLabels'

type MatchSummaryChipProps = {
  team1Name: string
  team2Name: string
  status: MatchStatus
}

function MatchSummaryChip({ team1Name, team2Name, status }: MatchSummaryChipProps) {
  return (
    <div className="admin-result-match admin-field-full">
      <div>
        <span>{team1Name}</span>
        <strong>vs</strong>
        <span>{team2Name}</span>
      </div>
      <small>{getMatchStatusLabel(status)}</small>
    </div>
  )
}

export default MatchSummaryChip
