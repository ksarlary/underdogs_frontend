import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getCurrentUser } from '../services/api'
import { ApiError } from '../services/httpClient'
import {
  initKeycloak,
  isKeycloakAuthenticated,
  login as keycloakLogin,
  logout as keycloakLogout,
} from '../services/keycloak'
import type { CurrentUser } from '../types/user'
import {
  CurrentUserContext,
  type CurrentUserContextValue,
} from './currentUserStore'

type CurrentUserProviderProps = {
  children: ReactNode
}

export function CurrentUserProvider({
  children,
}: CurrentUserProviderProps) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [currentUserError, setCurrentUserError] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false)
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(false)

  const refreshCurrentUser =
    useCallback(async (): Promise<CurrentUser | null> => {
      if (!isKeycloakAuthenticated()) {
        setCurrentUser(null)
        setCurrentUserError('')
        return null
      }

      setIsLoadingUser(true)
      setCurrentUserError('')

      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
        setCurrentUserError('')

        return user
      } catch (error: unknown) {
        setCurrentUserError(
          error instanceof ApiError && error.code === 'SESSION_EXPIRED'
            ? 'Ta session a expiré. Reconnecte-toi pour continuer.'
            : 'Impossible de charger les informations de votre compte.',
        )

        throw error
      } finally {
        setIsLoadingUser(false)
      }
    }, [])

  useEffect(() => {
    let isActive = true

    async function initializeAuthentication(): Promise<void> {
      try {
        const authenticated = await initKeycloak()

        if (!isActive) {
          return
        }

        setIsAuthenticated(authenticated)

        if (!authenticated) {
          setCurrentUser(null)
          setCurrentUserError('')
          return
        }

        try {
          await refreshCurrentUser()
        } catch (error: unknown) {
          if (isActive) {
            console.error('Unable to load current user', error)
          }
        }
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        console.error('Unable to initialize authentication', error)

        setIsAuthenticated(false)
        setCurrentUser(null)
        setCurrentUserError('')
      } finally {
        if (isActive) {
          setIsAuthReady(true)
        }
      }
    }

    void initializeAuthentication()

    return () => {
      isActive = false
    }
  }, [refreshCurrentUser])

  const isAdmin = currentUser?.role === 'ADMIN'

  const value = useMemo<CurrentUserContextValue>(
    () => ({
      currentUser,
      currentUserError,
      isAuthenticated,
      isAdmin,
      isAuthReady,
      isLoadingUser,
      refreshCurrentUser,
      login: keycloakLogin,
      logout: keycloakLogout,
    }),
    [
      currentUser,
      currentUserError,
      isAuthenticated,
      isAdmin,
      isAuthReady,
      isLoadingUser,
      refreshCurrentUser,
    ],
  )

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  )
}
