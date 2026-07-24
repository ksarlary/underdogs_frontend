import type { CurrentUser } from '../types/user'
import { authenticatedApiFetch } from './httpClient'

export function getCurrentUser(): Promise<CurrentUser> {
  return authenticatedApiFetch<CurrentUser>(
    '/api/v1/users/me',
  )
}
