<script setup lang="ts">
import type { AxiosError } from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, computed, provide, watch, onUnmounted } from 'vue'

import { Routing } from '@/pages'
import SideMenu from '@/widgets/SideMenu/ui'
import { useGlobalStore } from '@/stores/globalStore'
import { UserRoles } from '@/features/auth/model/roles'
import { useUserStore } from '@/entities/user/model/userStore'
import { checkAuth, hasPermission } from '@/features/auth/lib'
import type { PermissionEnum } from '@/features/auth/model/permissions'
import type { SystemSettingsResponse } from '@/entities/systemSettings/model/types'
import { ax, dateFormatKey, datePlaceholderKey, getCookie } from '@/shared/api/common'

import { antdLocale, dateFormat, datePlaceholder, routesAllowedWithoutPermissions } from './providers'

provide(dateFormatKey, dateFormat)
provide(datePlaceholderKey, datePlaceholder)

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const globalStore = useGlobalStore()
const auth = computed<boolean>(() => userStore.auth)
const isDefaultListLoaded = computed<boolean>(() => globalStore.isDefaultListLoaded)
const areSystemSettingsLoaded = computed<boolean>(() => !!globalStore.systemSettings)
const isNotLoginPage = computed<boolean>(() => auth.value && route.path !== 'login')
const isStudent = computed<boolean>(() => userStore.currentUser.role?.id === UserRoles.Student)

watch(auth, v => {
  if (v) {
    !isStudent.value && !isDefaultListLoaded.value && getDefaultList()
    !areSystemSettingsLoaded.value && getSystemSettings()
  }
})

function handleError(e: AxiosError) {
  if (e.response) {
    router.push({ name: 'error', params: { status: e.response.status }})
  }
}

function getDefaultList() {
  ax.get('/default_list')
    .then(r => globalStore.setDefaultList(r.data))
    .catch(handleError)
}

function getSystemSettings() {
  ax.get<SystemSettingsResponse>('/settings')
  .then(r => globalStore.setSystemSettings(r.data))
  .catch(handleError)
}

async function onVisibilityChange() {
  const res = await checkAuth()
  const auth = res.data

  if (auth) {
    const userCookie = getCookie('currentUser')
    const currentUser = userCookie && JSON.parse(userCookie)

    if (currentUser) {
      userStore.setCurrentUser(currentUser)
    }

    if (route.name === 'login') {
      router.push({ name: 'schedule' })
      return
    }

    const routePermissions: PermissionEnum[] | undefined = route.meta.permissions ? route.meta.permissions as PermissionEnum[] : undefined
    const userHasPermissions = (route.name && routesAllowedWithoutPermissions.includes(route.name))
      ? true
      : routePermissions
        ? hasPermission(routePermissions)
        : false

    if (!userHasPermissions) {
      router.push({ name: 'error', params: { status: 403 } })
      return
    }
  } else {
    router.push({ name: 'login' })
  }
}

onMounted(() => {
  window.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  window.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <a-config-provider
    :locale="antdLocale"
  >
    <div class="main">
      <SideMenu v-if="isNotLoginPage" />
      <div class="main-routing">
        <Routing />
      </div>
    </div>
  </a-config-provider>
</template>

<style lang="scss">
.main {
  display: flex;
  height: 100%;
  width: 100%;
  
  &-routing {
    height: 100%;
    width: 100%;
    padding: 8px;
    overflow: hidden;
  }
}
</style>
