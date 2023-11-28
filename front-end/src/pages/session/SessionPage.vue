<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ax } from '@/shared/api/common'
import { useGlobalStore } from '@/stores/globalStore'
import RoomsCard from '@/widgets/Session/RoomsCard/ui'
import ActionsCard from '@/widgets/Session/ActionsCard/ui'
import RecordingCard from '@/widgets/Session/RecordingCard/ui'
import { useRoomsStore } from '@/entities/room/model/roomsStore'
import ActionSwitcherCard from '@/widgets/Session/ActionSwitcherCard/ui'
import type { AxiosError } from 'axios'

const route = useRoute()
const router = useRouter()
const roomsStore = useRoomsStore()
const globalStore = useGlobalStore()

function addScript(src: string): void {
  const script = document.createElement("script")
  script.src = src
  document.getElementsByTagName("head")[0].appendChild(script)
}

function handleError(e: AxiosError) {
  if (e.response) {
    router.push({ name: 'error', params: { status: e.response.status }})
  }
}

onMounted(() => {
  addScript(new URL('/src/entities/camera/api/adapter.js', import.meta.url).href)
  addScript(new URL('/src/entities/camera/api/jsVideoPlugin.js', import.meta.url).href)
  addScript(new URL('/src/shared/api/common/jquery-3.4.1.min.js', import.meta.url).href)

  ax.get(`/sessions/${route.params.id}`)
    .then(res => {
      roomsStore.setSession(res.data)
    })
    .catch(handleError)
})
</script>

<template>
  <div class="session-page">
    <RoomsCard />
    <ActionsCard />
    <RecordingCard />
    <ActionSwitcherCard />
  </div>
</template>

<style lang="scss">
.session-page {
  display: grid;
  grid-template-columns: minmax(1068px, 1366px) 480px;
  grid-template-rows: 85% 14%;
  grid-gap: 8px;
  width: 100%;
  height: 100%;
  &__left {
    display: grid;
    grid-template-rows: 86% 14%;
  }
  &__right {
    display: grid;
    grid-template-rows: 86% 14%;
    margin-left: 8px;
  }
  .bottom-card {
    margin-top: 8px;
  }
}
</style>