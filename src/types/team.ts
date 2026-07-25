import type { Game } from './common'

export type TeamSummary = {
  id: string
  name: string
  tag: string
  game: Game
}

export type CreateTeamRequest = {
  name: string
  tag: string
  game: Game
}

export type UpdateTeamRequest = {
  name?: string
  tag?: string
}

export type PlayerInTeam = {
  id: string
  nickname: string
  countryCode: string
}

export type TeamDetail = {
  id: string
  name: string
  tag: string
  game: Game
  players: PlayerInTeam[]
}
