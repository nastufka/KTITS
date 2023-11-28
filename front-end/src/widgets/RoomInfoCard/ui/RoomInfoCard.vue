<script setup lang="ts">
import * as _ from 'lodash-es'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { AxiosResponse } from 'axios'

import { ax } from '@/shared/api/common'
import EosCard from '@/shared/ui/EosCard'
import EosButton from '@/shared/ui/EosButton'
import RoomInfo from '@/features/roomInfo/ui'
import RoomForm from '@/features/roomForm/ui'
import ArchiveRoom from '@/features/archiveRoom/ui'
import { useGlobalStore } from '@/stores/globalStore'
import type { Room } from '@/entities/room/model/types'
import notification from '@/shared/api/common/notification'
import HasPermission from '@/features/auth/ui/HasPermission.vue'
import { PermissionEnum } from '@/features/auth/model/permissions'

interface ResponseData {
  rooms: Room
}

const props = defineProps<{
  roomId: number
}>()
const { t } = useI18n({})
const router = useRouter()

const globalStore = useGlobalStore()
const roomData = computed<Room | undefined>(() => globalStore.roomList.find((r: Room) => r.id === props.roomId))
const roomToEdit = ref<Room>()
const isRoomFormOpen = ref<boolean>(false)

function openRoomForm(): void {
  roomToEdit.value = _.cloneDeep(roomData.value)
  isRoomFormOpen.value = true
}
function closeRoomForm(): void {
  isRoomFormOpen.value = false
  roomToEdit.value = undefined
}
// function getRoomData(): void {
//   ax.get<ResponseData>(`/rooms/${props.roomId}`)
//     .then((res: AxiosResponse<ResponseData>) => {
//       roomData.value = res.data.rooms
//     })
// }
function changeRoom(editedRoom: Room): void {
  ax.patch<Room>(`/rooms/${editedRoom.id}/`, {
    name: editedRoom.name,
    address: editedRoom.address,
    description: editedRoom.description,
    responsible: editedRoom.responsible
  }).then((res: AxiosResponse<Room>) => {
    notification.success({
      message: '',
      description: t('dataSavedSuccessfully')
    })
    globalStore.changeRoom(props.roomId, res.data)
    closeRoomForm()
  })
  .catch(() => {
    notification.error({
      message: '',
      description: t('dataCannotBeSaved'),
    })
  })
}

const onArchive = (): void => {
  router.push('/rooms')
}
</script>

<template>
  <eos-card class="room-info-card" :title="roomData?.name">
    <template #extra>
      <div class="room-info-card__extra">
        <has-permission :permissions="[PermissionEnum.CAN_UPDATE_ROOMS]">
          <archive-room
            class="room-list-table__action"
            :room="roomData"
            @archive="onArchive"
          />
        </has-permission>

        <has-permission :permissions="[PermissionEnum.CAN_UPDATE_ROOMS]">
          <eos-button
            type="primary"
            @click="openRoomForm"
          >
            {{ t('edit') }}
          </eos-button>
        </has-permission>
      </div>
    </template>
    <room-info class="room-info-card__content" :room="roomData" />

    <room-form
      :open="isRoomFormOpen"
      :roomToEdit="roomToEdit"
      @submit="changeRoom"
      @close="closeRoomForm"
    />
  </eos-card>
</template>

<style lang="scss">
.room-info-card {
  // display: grid;
  // grid-template-columns: 100%;
  // grid-template-rows: 54px auto;
  &__extra {
    display: flex;
    align-items: center;
    gap: 14px;

    .search-input {
      width: 300px;
    }
  }
  .ant-card-head {
    border-bottom: unset !important;
    &-title {
      color: #000;
      font-size: 24px;
      font-weight: 800;
      line-height: 28px;
    }
  }
  &__content {
    background: var(--sc-base-5);
    overflow-y: auto;
  }
}
</style>
