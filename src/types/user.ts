import type { UserRole, UserStatus } from './common'

export type CurrentUser = {
  id: string
  externalAuthId: string
  username: string
  email: string
  firstName: string
  lastName: string
  birthDate: string
  kibblesBalance: number
  role: UserRole
  status: UserStatus
  blockedReason: string | null
  createdAt: string
  updatedAt: string
}
