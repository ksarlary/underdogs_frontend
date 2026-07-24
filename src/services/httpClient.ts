import { getAccessToken } from './keycloak'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

const normalizedApiBaseUrl = apiBaseUrl.endsWith('/')
  ? apiBaseUrl.slice(0, -1)
  : apiBaseUrl

type ApiErrorOptions = {
  status?: number
  code?: string
  body?: unknown
  cause?: unknown
}

export type ApiResponse<T> = {
  data: T
  status: number
  headers: Headers
}

export class ApiError extends Error {
  readonly status?: number
  readonly code?: string
  readonly body?: unknown

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(
      message,
      options.cause === undefined ? undefined : { cause: options.cause },
    )

    this.name = 'ApiError'
    if (options.status !== undefined) {
      this.status = options.status
    }
    if (options.code !== undefined) {
      this.code = options.code
    }
    this.body = options.body
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function buildUrl(path: string): string {
  if (!path.startsWith('/')) {
    throw new ApiError(`API path must start with "/": ${path}`, {
      code: 'INVALID_API_PATH',
    })
  }

  return `${normalizedApiBaseUrl}${path}`
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text()

  if (!text) {
    return null
  }

  const contentType = response.headers.get('Content-Type') ?? ''

  if (contentType.includes('application/json')) {
    return JSON.parse(text) as unknown
  }

  return text
}

function getErrorMessage(body: unknown, status: number): string {
  if (
    isRecord(body) &&
    typeof body.message === 'string' &&
    body.message.length > 0
  ) {
    return body.message
  }

  if (typeof body === 'string' && body.length > 0) {
    return body
  }

  return `API request failed: ${status}`
}

function getErrorCode(body: unknown): string | undefined {
  if (isRecord(body) && typeof body.code === 'string') {
    return body.code
  }

  return undefined
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  let response: Response

  try {
    response = await fetch(buildUrl(path), options)
  } catch (cause: unknown) {
    throw new ApiError('Unable to reach the API', {
      code: 'NETWORK_ERROR',
      cause,
    })
  }

  const data = await parseResponseBody(response)

  if (!response.ok) {
    const code = getErrorCode(data)

    throw new ApiError(getErrorMessage(data, response.status), {
      status: response.status,
      ...(code === undefined ? {} : { code }),
      body: data,
    })
  }

  return {
    data: data as T,
    status: response.status,
    headers: response.headers,
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const result = await apiRequest<T>(path, options)

  return result.data
}

export async function authenticatedApiRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  let token: string | null

  try {
    token = await getAccessToken()
  } catch (cause: unknown) {
    throw new ApiError('Session expired', {
      status: 401,
      code: 'SESSION_EXPIRED',
      cause,
    })
  }

  if (!token) {
    throw new ApiError('Authentication required', {
      status: 401,
      code: 'AUTHENTICATION_REQUIRED',
    })
  }

  const headers = new Headers(options.headers)

  headers.set('Authorization', `Bearer ${token}`)

  return apiRequest<T>(path, {
    ...options,
    headers,
  })
}

export async function authenticatedApiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const result = await authenticatedApiRequest<T>(path, options)

  return result.data
}
