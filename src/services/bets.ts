import type { BetStatus } from '../types/common'
import type { Bet, PlaceBetRequest } from '../types/bet'
import type { PageResponse } from '../types/pagination'
import {
  authenticatedApiFetch,
  authenticatedApiRequest,
  withQuery,
} from './httpClient'

export type BetListParams = {
  status?: BetStatus | undefined
  page?: number
  size?: number
}

export async function createBet(
  payload: PlaceBetRequest,
): Promise<string | null> {
  const result = await authenticatedApiRequest<void>(
    '/api/v1/bets',
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

export function getMyBets(
  params: BetListParams = {},
): Promise<PageResponse<Bet>> {
  return authenticatedApiFetch<PageResponse<Bet>>(
    withQuery('/api/v1/bets/me', params),
  )
}

export function getBets(
  params: BetListParams = {},
): Promise<PageResponse<Bet>> {
  return authenticatedApiFetch<PageResponse<Bet>>(
    withQuery('/api/v1/bets', params),
  )
}

export function getBetStats(): Promise<Record<BetStatus, number>> {
  return authenticatedApiFetch<Record<BetStatus, number>>('/api/v1/bets/stats')
}
