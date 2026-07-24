import { apiFetch } from './httpClient'
import {
  normalizeV1Result,
  normalizeV2Result,
} from './matchResultMappers'
import type {
  MatchResult,
  MatchResultV1Dto,
  MatchResultV2Dto,
} from '../types/matchResult'

type MatchResultApiVersion = 'v1' | 'v2'

const configuredApiVersion = import.meta.env.VITE_MATCH_RESULT_API_VERSION ?? 'v1'

function isSupportedApiVersion(
  version: string,
): version is MatchResultApiVersion {
  return version === 'v1' || version === 'v2'
}

if (!isSupportedApiVersion(configuredApiVersion)) {
  throw new Error(
    `Unsupported match result API version: ${configuredApiVersion}`,
  )
}

const apiVersion: MatchResultApiVersion = configuredApiVersion

export async function getMatchResult(
  id: string,
): Promise<MatchResult> {
  const encodedMatchId = encodeURIComponent(id)
  const path = `/api/${apiVersion}/matches/${encodedMatchId}/result`

  if (apiVersion === 'v1') {
    const data = await apiFetch<MatchResultV1Dto>(path)

    return normalizeV1Result(data)
  }

  const data = await apiFetch<MatchResultV2Dto>(path)

  return normalizeV2Result(data)
}
