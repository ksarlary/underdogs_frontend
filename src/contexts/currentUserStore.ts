import { createContext } from 'react'
import type { CurrentUser } from '../types/user'

export type CurrentUserContextValue = {
  currentUser: CurrentUser | null
  currentUserError: string
  isAuthenticated: boolean
  isAdmin: boolean
  isAuthReady: boolean
  isLoadingUser: boolean
  refreshCurrentUser: () => Promise<CurrentUser | null>
  login: () => Promise<void>
  logout: () => Promise<void>
}

export const CurrentUserContext = createContext<
  CurrentUserContextValue | undefined
>(undefined)
