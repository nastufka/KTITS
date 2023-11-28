<script setup lang="ts">
import { computed } from 'vue'
import EosCard from '@/shared/ui/EosCard'
import { useGridSelectionStore } from '../model/gridSeletionStore'
import type { GridMode } from '../model/types'
import FourXFourIcon from '@/shared/icons/FourXFourIcon.vue'
import OneXThreeIcon from '@/shared/icons/OneXThreeIcon.vue'
import OneFrameIcon from '@/shared/icons/OneFrameIcon.vue'
import PictureInPictureIcon from '@/shared/icons/PictureInPictureIcon.vue'
import { useRoomsStore } from '@/entities/room/model/roomsStore'

const roomsStore = useRoomsStore()
const gridSeletionStore = useGridSelectionStore()
const modes = computed<GridMode[]>(() => gridSeletionStore.modes)
const activeMode = computed<GridMode | undefined>(() => modes.value.find(m => m.id === roomsStore.activeRoom?.gridModeId))
const setMode = (id: number) => {
  roomsStore.setGridMode(id)
}
const bodyStyle = {
  display: 'flex',
  'justify-content': 'center',
  'align-items': 'center',
  padding: '16px 6px'
}
</script>

<template>
  <div class="grid-modes">
    <EosCard 
      v-for="mode in modes"
      :key="mode.id"
      class="mode-card"
      :class="{ 'active-mode': mode.id === activeMode?.id }"
      :bodyStyle="bodyStyle"
      @click="setMode(mode.id)"
    >
      <div class="mode-card-content">
        <FourXFourIcon v-if="mode.className === '4x4'" :active="mode.id === activeMode?.id" />
        <OneXThreeIcon v-if="mode.className === '1x3'" :active="mode.id === activeMode?.id" />
        <OneFrameIcon v-if="mode.className === 'one-frame'" :active="mode.id === activeMode?.id" />
        <PictureInPictureIcon v-if="mode.className === 'picture-in-picture'" :active="mode.id === activeMode?.id" />
        <div class="mode-card-content-name">{{ mode.name }}</div>
      </div>
    </EosCard>
  </div>
</template>

<style lang="scss">
.grid-modes {
  display: flex;
  justify-content: center;
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
    border: 2px solid #3761F3;
    .mode-card-content-name {
      color: var(--sc-base-7);
    }
  }
}
</style>