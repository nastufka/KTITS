import { createRouter, createWebHistory } from 'vue-router'

import { routes } from '@/pages'
import { checkAuth } from '@/features/auth/lib'
import { hasPermission } from '@/features/auth/lib'
import { useUserStore } from '@/entities/user/model/userStore'
import type { PermissionEnum } from '@/features/auth/model/permissions'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export const routesAllowedWithoutPermissions: Array<string | symbol> = ['error', 'login']

router.beforeEach(async(to, _, next) => {
  const res = await checkAuth()
  const userStore = useUserStore()
  userStore.setAuth(res.data)
  const auth = res.data
  const routePermissions: PermissionEnum[] | undefined = to.meta.permissions ? to.meta.permissions as PermissionEnum[] : undefined
  const userHasPermissions = (to.name && routesAllowedWithoutPermissions.includes(to.name))
    ? true
    : routePermissions
      ? hasPermission(routePermissions)
      : false

  if (!auth && to.path !== '/login') {
    next('/login')
  } else if (auth && to.path === '/login') {
    next('/schedule')
  } else if (userHasPermissions) {
    next()
  } else {
    next({ name: 'error', params: { status: 403 } })
  }
})
