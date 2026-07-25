import { useContext } from 'react'
import {
  CurrentUserContext,
  type CurrentUserContextValue,
} from './currentUserStore'

export function useCurrentUser(): CurrentUserContextValue {
  const context = useContext(CurrentUserContext)

  if (context === undefined) {
    throw new Error('useCurrentUser must be used within CurrentUserProvider')
  }

  return context
}
