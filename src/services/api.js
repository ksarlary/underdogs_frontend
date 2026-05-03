import { getAccessToken } from './keycloak'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export async function getCurrentUser() {
  const token = await getAccessToken()

  if (!token) {
    return null
  }

  const response = await fetch(`${apiBaseUrl}/api/v1/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch current user: ${response.status}`)
  }

  return response.json()
}
