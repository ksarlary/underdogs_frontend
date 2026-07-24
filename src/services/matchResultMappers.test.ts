import { describe, expect, it } from 'vitest'
import { normalizeV1Result, normalizeV2Result } from './matchResultMappers'

describe('match result mappers', () => {
  it('normalise le schema V1', () => {
    const result = normalizeV1Result({
      matchId: 'match-1',
      status: 'LIVE',
      team1Id: 'team-1',
      team1Score: 8,
      team2Id: 'team-2',
      team2Score: 7,
      winnerTeamId: null,
    })

    expect(result).toEqual({
      matchId: 'match-1',
      status: 'LIVE',
      team1: {
        id: 'team-1',
        name: null,
        score: 8,
      },
      team2: {
        id: 'team-2',
        name: null,
        score: 7,
      },
      winner: null,
    })
  })

  it('normalise le schema V2', () => {
    const result = normalizeV2Result({
      match: {
        id: 'match-1',
        status: 'FINISHED',
      },
      teams: {
        home: {
          id: 'team-1',
          name: 'Team Vitality',
          score: 13,
        },
        away: {
          id: 'team-2',
          name: 'FaZe Clan',
          score: 10,
        },
      },
      winner: {
        id: 'team-1',
        name: 'Team Vitality',
      },
    })

    expect(result).toEqual({
      matchId: 'match-1',
      status: 'FINISHED',
      team1: {
        id: 'team-1',
        name: 'Team Vitality',
        score: 13,
      },
      team2: {
        id: 'team-2',
        name: 'FaZe Clan',
        score: 10,
      },
      winner: {
        id: 'team-1',
        name: 'Team Vitality',
      },
    })
  })
})
