import type { Group } from '@/entities/room/model/types'

import type { PermissionEnum } from '@/features/auth/model/permissions'

export interface User {
  id: number
  name: string
  email?: string
  groups?: Group[]
  role?: Role
  login?: string
  password?: string
  permissions?: PermissionEnum[]
}

export type UserData = Partial<User>

export interface Role {
  id: number,
  name: string
}
