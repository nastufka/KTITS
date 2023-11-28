import * as _ from 'lodash-es'
import type { AxiosResponse } from 'axios'

import type { Session } from '@/entities/session/model/types'
import { useUserStore } from '@/entities/user/model/userStore'
import { ax, deleteCookie, setCookie } from '@/shared/api/common'

import type { LoginData } from '../model/types'
import { PermissionEnum } from '../model/permissions'

export const login = async (username: string, password: string): Promise<LoginData> => {
  try {
    const res: AxiosResponse = await ax.post('/login/', { username, password })
    const data: LoginData = await res.data
    const { id, name, role_id, role_name  } = data
    setCookie('authToken', data.token)
    setCookie('currentUser', JSON.stringify({ id, name, role: { id: role_id, name: role_name } }))
    return data
  } catch (e: any) {
    return e.response?.data
  }
}

export const logout = async (): Promise<void> => {
  await ax.post('/logout/')
  deleteCookie('authToken')
  deleteCookie('currentUser')
}

export const checkAuth = async (): Promise<AxiosResponse> => {
  return await ax.get('/check_token')
}

export function hasPermission(permissions: PermissionEnum[]): boolean {
  const userStore = useUserStore()
  const userPermissions = userStore.currentUser.permissions || []
  return _.difference(permissions, userPermissions).length === 0
}

export function canUpdateSession(session: Session) {
  const userStore = useUserStore()
  const userId = userStore.currentUser.id
  return hasPermission([PermissionEnum.CAN_UPDATE_ALL_SESSIONS])
    || (
      hasPermission([PermissionEnum.CAN_UPDATE_OWN_SESSIONS])
      && session.users.map(u => u.id).includes(userId)
    )
}
