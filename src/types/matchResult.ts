import type { MatchStatus } from './common'

export type MatchResultTeam = {
  id: string
  name: string | null
  score: number | null
}

export type MatchResultWinner = {
  id: string
  name: string | null
}

export type MatchResult = {
  matchId: string
  status: MatchStatus
  team1: MatchResultTeam
  team2: MatchResultTeam
  winner: MatchResultWinner | null
}

export type MatchResultV1Dto = {
  matchId: string
  status: MatchStatus
  team1Id: string
  team1Score: number | null
  team2Id: string
  team2Score: number | null
  winnerTeamId: string | null
}

export type MatchResultV2Dto = {
  match: {
    id: string
    status: MatchStatus
  }
  teams: {
    home: {
      id: string
      name: string | null
      score: number | null
    }
    away: {
      id: string
      name: string | null
      score: number | null
    }
  }
  winner: {
    id: string
    name: string | null
  } | null
}
