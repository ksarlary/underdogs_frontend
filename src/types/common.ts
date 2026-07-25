export type Game =
  | 'LEAGUE_OF_LEGENDS'
  | 'VALORANT'
  | 'COUNTER_STRIKE'
  | 'DOTA_2'

export type MatchStatus =
  | 'SCHEDULED'
  | 'LIVE'
  | 'FINISHED'
  | 'CANCELLED'

export type BetStatus =
  | 'PENDING'
  | 'WON'
  | 'LOST'
  | 'CANCELLED'

export type UserRole = 'USER' | 'ADMIN'

export type UserStatus = 'ACTIVE' | 'BLOCKED'
