import type { Game } from '../types/common'
import type { PageResponse } from '../types/pagination'
import type {
  CreateTeamRequest,
  TeamDetail,
  TeamSummary,
  UpdateTeamRequest,
} from '../types/team'
import {
  apiFetch,
  authenticatedApiFetch,
  authenticatedApiRequest,
  withQuery,
} from './httpClient'

export type TeamListParams = {
  game?: Game | undefined
  page?: number
  size?: number
}

export function getTeams(
  params: TeamListParams = {},
): Promise<PageResponse<TeamSummary>> {
  return apiFetch<PageResponse<TeamSummary>>(withQuery('/api/v1/teams', params))
}

export function getTeamStats(): Promise<Record<Game, number>> {
  return authenticatedApiFetch<Record<Game, number>>('/api/v1/teams/stats')
}

export function getTeamById(id: string): Promise<TeamDetail> {
  const encodedTeamId = encodeURIComponent(id)

  return apiFetch<TeamDetail>(
    `/api/v1/teams/${encodedTeamId}`,
  )
}

export async function createTeam(
  payload: CreateTeamRequest,
): Promise<string | null> {
  const result = await authenticatedApiRequest<void>('/api/v1/teams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return result.headers.get('Location')
}

export async function updateTeam(
  id: string,
  payload: UpdateTeamRequest,
): Promise<void> {
  const encodedTeamId = encodeURIComponent(id)

  await authenticatedApiRequest<void>(`/api/v1/teams/${encodedTeamId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}
