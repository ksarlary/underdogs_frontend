import type {
  CreateMatchRequest,
  MatchDetail,
  MatchOdds,
  MatchSummary,
  UpdateMatchRequest,
} from '../types/match'
import {
  apiFetch,
  authenticatedApiFetch,
  authenticatedApiRequest,
} from './httpClient'

export function getMatches(): Promise<MatchSummary[]> {
  return apiFetch<MatchSummary[]>('/api/v1/matches')
}

export function getMatchById(id: string): Promise<MatchDetail> {
  const encodedMatchId = encodeURIComponent(id)

  return apiFetch<MatchDetail>(`/api/v1/matches/${encodedMatchId}`)
}

export function getMatchOdds(id: string): Promise<MatchOdds> {
  const encodedMatchId = encodeURIComponent(id)

  return apiFetch<MatchOdds>(
    `/api/v1/matches/${encodedMatchId}/odds`,
  )
}

export async function createMatch(
  payload: CreateMatchRequest,
): Promise<string | null> {
  const result = await authenticatedApiRequest<void>(
    '/api/v1/matches',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )

  return result.headers.get('Location')
}

export function updateMatch(
  id: string,
  payload: UpdateMatchRequest,
): Promise<void> {
  const encodedMatchId = encodeURIComponent(id)

  return authenticatedApiFetch<void>(
    `/api/v1/matches/${encodedMatchId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )
}
