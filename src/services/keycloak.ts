import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8083',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'underdogs',
  clientId:
    import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'underdogs-frontend',
})

let initPromise: Promise<boolean> | null = null

export function initKeycloak(): Promise<boolean> {
  if (initPromise === null) {
    initPromise = keycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
      redirectUri: window.location.origin,
    })
  }

  return initPromise
}

export function login(): Promise<void> {
  return keycloak.login({
    redirectUri: window.location.origin,
  })
}

export function logout(): Promise<void> {
  return keycloak.logout({
    redirectUri: window.location.origin,
  })
}

export function isKeycloakAuthenticated(): boolean {
  return keycloak.authenticated === true
}

export async function getAccessToken(): Promise<string | null> {
  if (!keycloak.authenticated) {
    return null
  }

  await keycloak.updateToken(30)

  return keycloak.token ?? null
}
