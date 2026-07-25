import type { Game, MatchStatus } from '../types/common'
import type {
  CreateMatchRequest,
  MatchDetail,
  MatchOdds,
  MatchSummary,
  UpdateMatchRequest,
} from '../types/match'
import type { PageResponse } from '../types/pagination'
import {
  apiFetch,
  authenticatedApiFetch,
  authenticatedApiRequest,
  withQuery,
} from './httpClient'

export type MatchListParams = {
  game?: Game | undefined
  status?: MatchStatus | undefined
  page?: number
  size?: number
}

export function getMatches(
  params: MatchListParams = {},
): Promise<PageResponse<MatchSummary>> {
  return apiFetch<PageResponse<MatchSummary>>(withQuery('/api/v1/matches', params))
}

export function getMatchStats(): Promise<Record<MatchStatus, number>> {
  return authenticatedApiFetch<Record<MatchStatus, number>>('/api/v1/matches/stats')
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
