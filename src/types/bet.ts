import type { BetStatus } from './common'

export type Bet = {
  id: string
  matchId: string
  team1Name: string
  team2Name: string
  selectedTeamId: string
  selectedTeamName: string
  username: string
  amount: number
  coefficient: number
  potentialGain: number
  status: BetStatus
  createdAt: string
  resolvedAt: string | null
}

export type PlaceBetRequest = {
  matchId: string
  teamId: string
  amount: number
}
