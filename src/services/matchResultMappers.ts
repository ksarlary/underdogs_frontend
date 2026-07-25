import type {
  MatchResult,
  MatchResultV1Dto,
  MatchResultV2Dto,
} from '../types/matchResult'

export function normalizeV1Result(data: MatchResultV1Dto): MatchResult {
  return {
    matchId: data.matchId,
    status: data.status,
    team1: {
      id: data.team1Id,
      name: null,
      score: data.team1Score,
    },
    team2: {
      id: data.team2Id,
      name: null,
      score: data.team2Score,
    },
    winner: data.winnerTeamId
      ? {
          id: data.winnerTeamId,
          name: null,
        }
      : null,
  }
}

export function normalizeV2Result(data: MatchResultV2Dto): MatchResult {
  return {
    matchId: data.match.id,
    status: data.match.status,
    team1: {
      id: data.teams.home.id,
      name: data.teams.home.name ?? null,
      score: data.teams.home.score,
    },
    team2: {
      id: data.teams.away.id,
      name: data.teams.away.name ?? null,
      score: data.teams.away.score,
    },
    winner: data.winner
      ? {
          id: data.winner.id,
          name: data.winner.name ?? null,
        }
      : null,
  }
}
