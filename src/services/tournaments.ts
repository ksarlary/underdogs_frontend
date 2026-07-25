import type { Game } from '../types/common'
import type { PageResponse } from '../types/pagination'
import type {
  CreateTournamentRequest,
  TournamentDetail,
  TournamentSummary,
  UpdateTournamentRequest,
} from '../types/tournament'
import {
  apiFetch,
  authenticatedApiFetch,
  authenticatedApiRequest,
  withQuery,
} from './httpClient'

export type TournamentListParams = {
  game?: Game | undefined
  page?: number
  size?: number
}

export function getTournaments(
  params: TournamentListParams = {},
): Promise<PageResponse<TournamentSummary>> {
  return apiFetch<PageResponse<TournamentSummary>>(
    withQuery('/api/v1/tournaments', params),
  )
}

export function getTournamentStats(): Promise<Record<Game, number>> {
  return authenticatedApiFetch<Record<Game, number>>(
    '/api/v1/tournaments/stats',
  )
}

export function getTournamentById(
  id: string,
): Promise<TournamentDetail> {
  const encodedTournamentId = encodeURIComponent(id)

  return apiFetch<TournamentDetail>(
    `/api/v1/tournaments/${encodedTournamentId}`,
  )
}

export async function createTournament(
  payload: CreateTournamentRequest,
): Promise<string | null> {
  const result = await authenticatedApiRequest<void>(
    '/api/v1/tournaments',
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

export function updateTournament(
  id: string,
  payload: UpdateTournamentRequest,
): Promise<void> {
  const encodedTournamentId = encodeURIComponent(id)

  return authenticatedApiFetch<void>(
    `/api/v1/tournaments/${encodedTournamentId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )
}
