import type { Bet, PlaceBetRequest } from '../types/bet'
import {
  authenticatedApiFetch,
  authenticatedApiRequest,
} from './httpClient'

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

export function getMyBets(): Promise<Bet[]> {
  return authenticatedApiFetch<Bet[]>('/api/v1/bets/me')
}

export function getBets(): Promise<Bet[]> {
  return authenticatedApiFetch<Bet[]>('/api/v1/bets')
}
