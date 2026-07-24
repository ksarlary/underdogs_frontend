import type { Game } from './common'
import type { MatchSummary } from './match'

export type TournamentSummary = {
  id: string
  name: string
  game: Game
}

export type TournamentDetail = {
  id: string
  name: string
  game: Game
  startDate: string
  endDate: string
  matches: MatchSummary[]
}

export type CreateTournamentRequest = {
  name: string
  game: Game
  startDate: string
  endDate: string
}

export type UpdateTournamentRequest = {
  name?: string
  startDate?: string
  endDate?: string
}
