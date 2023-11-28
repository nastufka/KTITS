<script setup lang="ts">
import { ref } from 'vue'

import Schedule from '@/widgets/Schedule/ui'
import SessionCard from '@/widgets/SessionCard/ui'
import type { Session } from '@/entities/session/model/types'

const sessionCardData = ref<Session>()
const isSessionCardOpen = ref<boolean>(false)
const scheduleRef = ref<InstanceType<typeof Schedule> | null>(null)

function openSessionCard(session: Session) {
  isSessionCardOpen.value = true
  sessionCardData.value = session
}

function closeSessionCard() {
  isSessionCardOpen.value = false
  sessionCardData.value = undefined
}

function updateSchedule() {
  closeSessionCard()
  scheduleRef.value?.getData()
}
</script>

<template>
  <schedule
    ref="scheduleRef"
    @session-click="openSessionCard"
  />

  <session-card
    v-model:open="isSessionCardOpen"
    :session="sessionCardData"
    @cancel="closeSessionCard"
    @session-edit="updateSchedule"
  />
</template>
