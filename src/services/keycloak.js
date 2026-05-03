import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8083',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'underdogs',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'underdogs-frontend',
})

let initPromise

export function initKeycloak() {
  if (!initPromise) {
    initPromise = keycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
      redirectUri: window.location.origin,
    })
  }

  return initPromise
}

export function login() {
  return keycloak.login({
    redirectUri: window.location.origin,
  })
}

export function logout() {
  return keycloak.logout({
    redirectUri: window.location.origin,
  })
}

export async function getAccessToken() {
  if (!keycloak.authenticated) {
    return null
  }

  await keycloak.updateToken(30)
  return keycloak.token
}

export default keycloak
