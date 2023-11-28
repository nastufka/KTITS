<script setup lang="ts">
import { ref, computed, onMounted, toRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import RoomCams from './RoomCams.vue'
import EosButton from '@/shared/ui/EosButton'
import RecIcon from '@/shared/icons/RecIcon.vue'
import { useRoomsStore } from '@/entities/room/model/roomsStore'
import type { Room, RoomNames, RecordFile, ActiveRecord } from '@/entities/room/model/types'

type CamActivate = {
  place: number,
  camId: number
}
const { t } = useI18n({})
const roomCamsRef = ref<typeof RoomCams[]>()
const roomsStore = useRoomsStore()
const rooms = computed<Room[]>(() => roomsStore.rooms)
const roomNames = computed<RoomNames[]>(() => roomsStore.roomNames)
const activeRoom = computed<Room | undefined>(() => roomsStore.activeRoom)
const sessionStatusId = computed<number>(() => roomsStore.sessionInfo.status?.id)
const activeRecord = computed<ActiveRecord | undefined>(() => roomsStore.activeRecord)
const disabledButton = (id: number) => {
  return sessionStatusId.value === 3 ? !!activeRecord.value && activeRecord.value?.roomId !== id : false
}
const getRoomCams = (room: Room) => {
  return sessionStatusId.value === 3
  ? (room.records && activeRecord.value?.id 
    ? room.records.find((r: RecordFile) => r.id === activeRecord.value?.id)?.videos 
    : []) 
  : room.cams
}
const getAnnotations = (records: any[] | undefined) => {
  return sessionStatusId.value === 3 && records && records.length && activeRecord.value?.id
  ? records.find(r => r.id === activeRecord.value?.id)?.annotations
  : []
}

function setActiveRoom(id: number) {
  const previousRoomId = activeRoom.value?.id
  roomsStore.setActiveRoom(id)
  if (roomCamsRef.value) {
    const previousRoom = roomCamsRef.value.find(room => {
      return toRaw(room).roomId === previousRoomId
    })
    previousRoom && previousRoom.playVideo('play')
  }
}

onMounted(() => {

})
</script>

<template>
  <div class="rooms">
    <div class="rooms__switcher">
      <template v-for="room in roomNames" :key="room.id">
        <a-tooltip 
          v-if="disabledButton(room.id)" 
          color="#fff"
          placement="top"
          :overlay-inner-style="{
            display: 'flex',
            background: '#fff',
            color: '#2F3144',
            fontSize: '13px',
            height: '64px',
            width: '467px'
          }"
        >
          <template #title>{{ t('changingRoomProhibited') }}</template>
          <EosButton 
            :disabled="disabledButton(room.id)"
            class="rooms__switcher__button"
          >
            {{ room.name }}
          </EosButton>
        </a-tooltip>
        <EosButton
          v-else
          :disabled="disabledButton(room.id)"
          :type="activeRoom?.id === room.id ? 'primary' : undefined"
          class="rooms__switcher__button"
          @click="setActiveRoom(room.id)"
          >
          {{ room.name }}
          <RecIcon v-if="room.recording" />
        </EosButton>
      </template>
    </div>
    <div class="rooms__list" :class="{ 'rooms__list-files': sessionStatusId === 3 }">
      <RoomCams
        v-for="room in rooms"
        v-show="activeRoom?.id === room.id"
        ref="roomCamsRef"
        :key="room.id"
        :roomId="room.id"
        :annotations="getAnnotations(room.records)"
        :cams="getRoomCams(room)"
      />
    </div>
  </div>
</template>

<style lang="scss">
.rooms {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  &__switcher {
    display: flex;
    align-items: center;
    gap: 10px;

    &__button {
      display: flex;
      align-items: center;
      width: fit-content;
      height: 44px;
      gap: 10px;
    }

    .activeButton {

    }
  }
  &__list {
    height: 100%;
  }
  // &__list-files {
  //   height: calc(100% - 46px);
  // }
}
</style>