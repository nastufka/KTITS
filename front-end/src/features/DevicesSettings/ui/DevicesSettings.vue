<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import EosCard from '@/shared/ui/EosCard'
import type { Camera } from '@/entities/camera/model/types'
import type { Room } from '@/entities/room/model/types'
import { useRoomsStore } from '@/entities/room/model/roomsStore'
import { EosCollapse, EosCollapsePanel } from '@/shared/ui/EosCollapse'
import DeviceItemSettings from './DeviceItemSettings.vue'

const { t } = useI18n({})

const roomsStore = useRoomsStore()
const activeRoom = computed<Room | undefined>(() => roomsStore.activeRoom)
const cams = computed<Camera[] | undefined>(() => activeRoom.value?.cams)

</script>

<template>
  <eos-card class="devices-settings" :body-style="{ height: '728px', padding: '12px', 'overflow-y': 'auto' }">
    <eos-collapse class="devices-settings-collapse">
      <eos-collapse-panel 
        v-for="cam in cams" 
        :key="cam.id" 
        :header="cam.name"
      >
        <DeviceItemSettings :device="cam" />
      </eos-collapse-panel>
    </eos-collapse>
  </eos-card>
</template>

<style lang="scss">
.devices-settings {
  &-collapse {
    background: var(--sc-base-5);
  }
}
</style>