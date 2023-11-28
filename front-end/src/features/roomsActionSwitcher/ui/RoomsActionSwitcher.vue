<script setup lang="ts">
import { computed } from 'vue'
import EosCard from '@/shared/ui/EosCard'
import { useActionSwitcherStore } from '../model/actionSwitcherStore'
import type { ActionMode } from '../model/types'
import CardIcon from '@/shared/icons/CardIcon.vue'
import AnnotationIcon from '@/shared/icons/AnnotationIcon.vue'
import CamsIcon from '@/shared/icons/CamsIcon.vue'
import SettingsCardIcon from '@/shared/icons/SettingsCardIcon.vue'
import { useI18n } from 'vue-i18n'
import { useRoomsStore } from '@/entities/room/model/roomsStore'

const { t } = useI18n({})
const roomsStore = useRoomsStore()
const sessionStatusId = computed<number>(() => roomsStore.sessionInfo.status?.id)
const actionSwitcherStore = useActionSwitcherStore()
const modes = computed<ActionMode[]>(() => actionSwitcherStore.modes)
const activeMode = computed<Object | any>(() => actionSwitcherStore.activeMode)
const availableModes = computed<ActionMode[]>(() => modes.value.filter(mode => mode.availableStatus.includes(sessionStatusId.value)))
const setMode = (id: number) => {
  actionSwitcherStore.setMode(id)
}
const showContition = (currentModeName: string, modeName: string, availableStatus: number[]) => {
  return currentModeName === modeName && availableStatus.includes(sessionStatusId.value)
}
</script>

<template>
  <div class="action-modes">
    <EosCard 
      v-for="mode in availableModes"
      :key="mode.id"
      class="mode-card"
      :class="{ 'active-mode': mode.id === activeMode.id }"
      @click="setMode(mode.id)"
    >
      <div class="mode-card-content">
        <CardIcon v-if="mode.name === 'card'" :active="mode.id === activeMode.id" />
        <AnnotationIcon v-if="mode.name === 'annotations'" :active="mode.id === activeMode.id" />
        <CamsIcon v-if="mode.name === 'cams' || mode.name === 'files'" :active="mode.id === activeMode.id" />
        <SettingsCardIcon v-if="mode.name === 'settings'" :active="mode.id === activeMode.id" />
        <span class="mode-card-content-name">{{ t(mode.name) }}</span>
      </div>
    </EosCard>
  </div>
</template>

<style lang="scss">
.action-modes {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;

  .mode-card {
    background: var(--sc-base-5);
    cursor: pointer;
    width: unset;
    height: 80px;
    min-width: 80px;
    &-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      &-name {
        font-size: 15px;
        font-weight: 800;
        line-height: 24px;
        color: var(--sc-base-1);
      }
    }
  }
  .active-mode {
    background: var(--sc-base-7);
    .mode-card-content-name {
      color: var(--sc-base-6);
    }
  }
}
</style>