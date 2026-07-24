import type {
  CreateTeamRequest,
  TeamDetail,
  TeamSummary,
  UpdateTeamRequest,
} from '../types/team'
import {
  apiFetch,
  authenticatedApiRequest,
} from './httpClient'

export function getTeams(): Promise<TeamSummary[]> {
  return apiFetch<TeamSummary[]>('/api/v1/teams')
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
