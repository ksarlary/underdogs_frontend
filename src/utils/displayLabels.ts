import type { BetStatus, Game, MatchStatus } from '../types/common'

const GAME_LABELS: Record<Game, string> = {
  COUNTER_STRIKE: 'Counter-Strike 2',
  DOTA_2: 'Dota 2',
  LEAGUE_OF_LEGENDS: 'League of Legends',
  VALORANT: 'Valorant',
}

const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  CANCELLED: 'Annulé',
  FINISHED: 'Terminé',
  LIVE: 'En direct',
  SCHEDULED: 'À venir',
}

const BET_STATUS_LABELS: Record<BetStatus, string> = {
  CANCELLED: 'Annulé',
  LOST: 'Perdu',
  PENDING: 'En attente',
  WON: 'Gagné',
}

export function getGameLabel(game: Game): string {
  return GAME_LABELS[game]
}

export function getMatchStatusLabel(status: MatchStatus): string {
  return MATCH_STATUS_LABELS[status]
}

export function getBetStatusLabel(status: BetStatus): string {
  return BET_STATUS_LABELS[status]
}
