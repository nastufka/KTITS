<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import EosCard from '@/shared/ui/EosCard'
import EosAlert from '@/shared/ui/EosAlert'
import { dayjs } from '@/shared/api/common'
import CamsSelection from '@/features/camsSelection/ui'
import AttentionIcon from '@/shared/icons/AttentionIcon.vue'
import type { RecordFile, Room } from '@/entities/room/model/types'
import { useRoomsStore } from '@/entities/room/model/roomsStore'
import { EosCollapse, EosCollapsePanel } from '@/shared/ui/EosCollapse'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  searchValue: string
}>()
const { t } = useI18n({})

const roomsStore = useRoomsStore()
const activeKey = ref<string[]>([])
const activeRoom = computed<Room | undefined>(() => roomsStore.activeRoom)
const otherRoomContains = ref<Record<string, any>[]>([])
const records = computed<RecordFile[] | undefined>(() => {
  const filteredRecords = getRecordsWithValue(activeRoom.value, props.searchValue)
  if (filteredRecords && !filteredRecords.length) {
    otherRoomContains.value = roomsStore.rooms.filter((room: Room) => {
      return room.id !== activeRoom.value?.id && getRecordsWithValue(room, props.searchValue)?.length && props.searchValue
    }).map((r: Room) => { return { id: r.id, name: r.name } })
  }
  return filteredRecords
})
watch(() => activeRoom.value?.id, (id, oldId) => {
  if (id !== oldId) {
    activeKey.value = []
  }
})
const getRecordsWithValue = (room: Room | undefined, value: string) => {
  return room?.records?.filter((r: RecordFile) => {
    return value ? r.userName.toString().includes(value) : true
  })
}
const getRecordHeader = (r: RecordFile) => {
  return `${r.userName} #${r.id}: ${dayjs(r.date).format('DD.MM.YY HH:mm')}`
}
const onChange = (panelState: string[]) => {
  panelState.forEach(idxStr => {
    if (records.value) {
      const idx = parseInt(idxStr)
      if (!records.value[idx].hasCaptures) {
        roomsStore.setRecordCaptures(idx)
      }
    }
  })
}
function setActiveRoom(id: number): void {
  roomsStore.setActiveRoom(id)
}
</script>

<template>
  <eos-card class="record-files" :body-style="{ height: '728px', padding: '12px', 'overflow-y': 'auto' }">
    <eos-collapse 
      v-if="records?.length" 
      v-model:activeKey="activeKey" 
      @change="onChange"
    >
      <eos-collapse-panel 
        v-for="(record, idx) in records" 
        :key="idx" 
        :header="record.userName"
      >
        <CamsSelection class="record-files-selection" :video-files="record.videos" :files-selection="true" :record-id="record.id" />
      </eos-collapse-panel>
    </eos-collapse>
    <template v-else-if="!records?.length && otherRoomContains.length">
      <eos-alert class="record-files-alert" type="info">
        <template #icon>
          <AttentionIcon fill="#70B6F6" />
        </template>
        <template #description>
          <div class="record-files-alert-description">
            {{ t('containsInOtherRooms') }}: 
            <span 
              v-for="(room, idx) in otherRoomContains" 
              :key="room.id" 
              class="record-files-alert-description-room" 
              @click="setActiveRoom(room.id)"
            >
              {{ idx === otherRoomContains.length - 1 ? room.name : `${room.name}, `}}
            </span>
          </div>
        </template>
      </eos-alert>
    </template>
  </eos-card>
</template>

<style lang="scss">
.record-files {
  &-selection {
    height: auto;
    background: var(--sc-base-6);
    box-shadow: unset !important;
  }
  &-alert {
    .eos-alert-message {
      gap: 0;
    }
    &-description {
      font-size: 13px;
      line-height: 20px;
      color: var(--sc-base-1);
      &-room {
        cursor: pointer;
        color: var(--sc-base-7);
      }
    }
  }
}
</style>