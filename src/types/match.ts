import type { Game, MatchStatus } from './common'

export type MatchSummary = {
  id: string
  team1Name: string
  team2Name: string
  game: Game
  scheduledAt: string
  status: MatchStatus
}

export type MatchDetail = {
  id: string
  team1Id: string
  team1Name: string
  team1Score: number | null
  team2Id: string
  team2Name: string
  team2Score: number | null
  tournamentId: string
  tournamentName: string
  game: Game
  scheduledAt: string
  status: MatchStatus
  winnerTeamId: string | null
  winnerTeamName: string | null
  bettingOpen: boolean
  bettingClosesAt: string | null
}

export type TeamOdds = {
  id: string
  name: string
  coefficient: number
}

export type MatchOdds = {
  matchId: string
  team1: TeamOdds
  team2: TeamOdds
}

export type CreateMatchRequest = {
  team1Id: string
  team2Id: string
  tournamentId: string
  game: Game
  scheduledAt: string
}

export type UpdateMatchRequest = {
  team1Id?: string
  team2Id?: string
  tournamentId?: string
  game?: Game
  scheduledAt?: string
  status?: MatchStatus
  team1Score?: number
  team2Score?: number
  winnerTeamId?: string
}
