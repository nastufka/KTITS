import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getCookie } from '@/shared/api/common'

import type { User } from './types'
import { AccessPermissions } from '@/features/auth/model/roles'

export const useUserStore = defineStore('userStore', () => {
  const auth = ref<boolean>(false)
  
  const userFromCookies = getCookie('currentUser')
  const parsedUser: User = userFromCookies ? JSON.parse(userFromCookies as string || '') : {}
  const currentUser = ref<User>(parsedUser as User ?? {})
  setPermissions()

  function setPermissions() {
    const role = currentUser.value.role?.id
    if (role !== undefined) {
      const permissions = AccessPermissions[role]
      currentUser.value.permissions = permissions
    }
  }
  
  function setCurrentUser(user: User): void {
    currentUser.value = user
    setPermissions()
  }

  function setAuth(v: boolean) {
    auth.value = v
  }

  return {
    auth,
    currentUser,
    setAuth,
    setCurrentUser,
  }
})
