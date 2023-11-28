<script setup lang="ts">
import _ from 'lodash-es'
import { useI18n } from 'vue-i18n'
import { ref, watch, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { TableColumnsType } from 'ant-design-vue'
import type { AxiosError, AxiosResponse } from 'axios'

import { ax } from '@/shared/api/common'
import EosCard from '@/shared/ui/EosCard'
import EosTable from '@/shared/ui/EosTable'
import EosButton from '@/shared/ui/EosButton'
import RoomForm from '@/features/roomForm/ui'
import RoomFilter from '@/features/roomFilter/ui'
import CamsIcon from '@/shared/icons/CamsIcon.vue'
import EditIcon from '@/shared/icons/EditIcon.vue'
import ArchiveRoom from '@/features/archiveRoom/ui'
import { hasPermission } from '@/features/auth/lib'
import ArrowIcon from '@/shared/icons/ArrowIcon.vue'
import { useGlobalStore } from '@/stores/globalStore'
import type { Room } from '@/entities/room/model/types'
import type { Device } from '@/entities/device/model/types'
import notification from '@/shared/api/common/notification'
import SimulatorIcon from '@/shared/icons/SimulatorIcon.vue'
import HasPermission from '@/features/auth/ui/HasPermission.vue'
import { PermissionEnum } from '@/features/auth/model/permissions'
import ScreenCaptureIcon from '@/shared/icons/ScreenCaptureIcon.vue'

interface TableDataType {
  name: string
  devicesQuantity: number
  responsible: any
  key: string
}
interface SortColumn {
  key: keyof Room
  asc: boolean
}
interface ResponseData {
  rooms: Room[]
}
type  RoomDataItem = Room & {
  camCount?: number
  screenCount?: number
  simCount?: number
}
type RoomFormMode = 'edit' | 'create'

const { t } = useI18n({})
const route = useRoute()
const router = useRouter()
const globalStore = useGlobalStore()
// const sort = ref<SortColumn>({
//   key: 'name' as keyof Room,
//   asc: true
// })
const currentFilter = ref<Record<string, number[]>>({
  name: [],
  responsible: [],
})
const columns = ref<TableColumnsType>([
  {
    title: t('roomName'),
    dataIndex: 'name',
    key: 'name',
    width: 237,
    minWidth: 200,
    resizable: true,
  },
  {
    title: t('responsible'),
    dataIndex: ['responsible', 'name'],
    key: 'responsible',
    width: 200,
    minWidth: 200,
    resizable: true,
  },
  {
    title: t('devicesQuantity', 2),
    dataIndex: 'devices',
    key: 'device_count',
    width: 200,
    minWidth: 160,
    resizable: true,
  },
  {
    key: 'actions',
    width: 120,
  },
])
const roomToEdit = ref<Room>()
const page = ref<number>()
const total = ref<number>(0)
const sort = ref<string>('')
const pageSize = ref<number>(18)
const loading = ref<boolean>(false)
const roomsDataSource = ref<RoomDataItem[]>([])
const isRoomFormOpen = ref<boolean>(false)
const currentMode = ref<RoomFormMode | null>(null)
const sameNameError = ref<boolean>(false)
//const roomForm = ref<typeof RoomForm>()
// const dataSource = computed<Room[] | undefined>(() => {
//   const result: Room[] = []
//   const filterKeys: string[] = Object.keys(currentFilter.value)
//   globalStore.roomList?.forEach((r: Room) => {
//     let correct = !Object.keys(currentFilter.value).length
//     Object.keys(currentFilter.value).forEach(key => {
//       if (correct) {
//         return
//       }
//       //console.log(currentFilter.value[key])
//       currentFilter.value[key].forEach((filterItem: any) => {
//         if (filterItem.option) {
//           correct = key === 'roomNames' ? filterItem.option.id === r.id : filterItem.option.id === r.responsible?.id 
//           console.log(correct)
//         } else {
//           correct = key === 'roomNames' 
//             ? r.name.toLowerCase().includes(filterItem.value.toLowerCase()) 
//             : r.responsible.name.toLowerCase().includes(filterItem.value.toLowerCase())
//         }
//       })
//       //console.log(correct)
//       // if (emptyFilters === filterKeys.length) {
//       //   correct = true
//       // }
//     })
//     if (!correct) {
//       return
//     }
//     result.push({
//       ...r,
//       devicesQuantity: r.devices.length
//     })
//   })
//   return result.sort((a: Room, b: Room) => {
//     const key = sort.value?.key
//     if (typeof a[key] === 'number' && typeof b[key] === 'number') {
//       return sort.value?.asc ? a[key] - b[key]  : b[key] - a[key]
//     }
//     return sort.value?.asc ? a[key].localeCompare(b[key])  : b[key].localeCompare(a[key])
//   })
// })



function openRoomForm(mode: RoomFormMode = 'create', room: Room | undefined = undefined): void {
  isRoomFormOpen.value = true
  currentMode.value = mode
  if (mode === 'edit') {
    roomToEdit.value = room
  }
}

function closeRoomForm(): void {
  isRoomFormOpen.value = false
  roomToEdit.value = undefined
  currentMode.value = null
  sameNameError.value = false
}
function onSubmitRoomForm(roomData: Room): void {
  currentMode.value === 'create' ? addRoom(roomData) : editRoom(roomData)
}
function editRoom(editedRoom: Room): void {
  ax.patch<Room>(`/rooms/${editedRoom.id}/`, {
    name: editedRoom.name,
    address: editedRoom.address,
    description: editedRoom.description,
    responsible: editedRoom.responsible
  })
    .then((res: AxiosResponse<Room>) => {
      notification.success({
        message: '',
        description: t('dataSavedSuccessfully'),
      })
      globalStore.changeRoom(editedRoom.id, res.data)
      closeRoomForm()
      getRooms()
    })
    .catch(() => {
      notification.error({
        message: '',
        description: t('dataCannotBeSaved'),
      })
    })
}
function addRoom(roomData: Room): void {
  ax.post('/rooms/', {
    ...roomData
  }).then((res: AxiosResponse<Room>) => {
    notification.success({
      message: '',
      description: t('dataSavedSuccessfully'),
    })
    globalStore.addRoom(res.data)
    closeRoomForm()
    getRooms()
  }).catch((e: AxiosError<{ name: string[] }>) => {
    sameNameError.value = !!e.response?.data.name.length
    
    if (!sameNameError.value) {
      notification.error({
        message: '',
        description: t('dataCannotBeSaved'),
      })
    }
  })
}
function onFilterChange(roomFilter: Record<string, number[]>): void {
  goToFirstPage()
  currentFilter.value = _.cloneDeep(roomFilter)
}
function handleResizeColumn(width: number, column: any): void {
  column.width = width
}
function onClickHeaderCell(column: TableDataType): void {
  const key = column.key as string
  if (sort.value.includes(key)) {
    sort.value = sort.value.at(0) === '-' ? key : `-${key}`
  } else {
    sort.value = key
  }
}
const getRooms = _.debounce(() => {
  const handleRequest = (r: AxiosResponse<Room[]>) => {
    roomsDataSource.value = []
    const rawData: RoomDataItem[] = r.data
    rawData.forEach(room => {
      room.devices.forEach((d: Device) => {
        switch (d.type?.id) {
          case 1:
            room.camCount = room.camCount ? room.camCount + 1 : 1
            break
          case 2:
            room.screenCount = room.screenCount ? room.screenCount + 1 : 1
            break
          case 3:
            room.simCount = room.simCount ? room.simCount + 1 : 1
            break
        }
      })
      roomsDataSource.value.push(room)
    })
    total.value = +r.headers.count
    loading.value = false
  }

  loading.value = true

  if (sort.value && page.value) {
    const limit = pageSize.value
    const offset = pageSize.value * (page.value - 1)
    const ordering = sort.value === 'responsible' ? 'responsible__name' : sort.value
    const params = {
      name: `[${currentFilter.value.name?.join(',')}]`,
      responsible: `[${currentFilter.value.responsible?.join(',')}]`,
      ordering,
      limit,
      offset,
    }
    ax.get<Room[]>('/rooms/', { params }).then(handleRequest)
  }
}, 300)

function goToFirstPage() {
  page.value = 1
}

watch(page, getRooms)
watch(currentFilter, getRooms)
watch(sort, (v, o) => {
  goToFirstPage()
  v && setSort(v)
})

function setSort(sort: string) {
  router.push(`/rooms/${sort}/`)
  getRooms()
}

onBeforeMount(() => {
  const routeSort = route.params.sort === 'responsible__name' ? 'responsible' : route.params.sort
  sort.value = (routeSort ?? 'name') as string
})

</script>

<template>
  <eos-card 
    :title="t('roomList')" 
    class="room-list"
  >
    <room-form
      ref="roomForm"
      :open="isRoomFormOpen"
      :room-to-edit="roomToEdit"
      :same-name-error="sameNameError"
      @submit="onSubmitRoomForm"
      @close="closeRoomForm"
    />
    <template #extra>
      <div class="room-list-btns">
        <room-filter @change="onFilterChange" />

        <has-permission :permissions="[PermissionEnum.CAN_CREATE_ROOMS]">
          <eos-button
            type="primary"
            style="width: 112px;"
            @click="openRoomForm('create')"
          >
            {{ t('add') }}
          </eos-button>
        </has-permission>
      </div>
    </template>

    <eos-table
      class="room-list-table"
      :fullHeight="true"
      column-drag
      v-model:page="page"
      v-model:pageSize="pageSize"
      :sort="sort"
      :total="total"
      :loading="loading"
      :columns="columns"
      :dataSource="roomsDataSource"
      :serverSidePagination="true"
      :scroll="{ y: 'calc(100vh - 237px)' }"
      @resizeColumn="handleResizeColumn"
    >
      <template #headerCell="{ title, column }">
        <div class="room-list-table-header-cell" @click="onClickHeaderCell(column)">
          <div class="room-list-table-header-cell-text">
            {{ title }}
          </div>
          <div v-if="sort.includes(column.key)" class="room-list-table-sort-icon">
            <arrow-icon :style="{ 
              transform: sort.at(0) === '-' ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.5s'
            }" />
          </div>
        </div>
      </template>
      <template #bodyCell="{ column, record: room }">
        <a
          v-if="column.key === 'name' && hasPermission([PermissionEnum.CAN_READ_ROOM])"
          target="_blank"
          class="room-list-table-link"
          :href="`/room/${room.id}`"
        >
          {{ room.name }}
        </a>

        <span v-else-if="column.key === 'name'">
          {{ room.name }}
        </span>

        <div v-else-if="column.key === 'device_count'" class="room-list-table__devices-cell">
          <template v-if="room.camCount">
            <div class="room-list-table__devices-cell__item">
              <cams-icon />
              <span class="devices-count">{{ room.camCount }}</span>
            </div>
          </template>
          <template v-if="room.screenCount">
            <div class="room-list-table__devices-cell__item">
              <screen-capture-icon />
              <span class="devices-count">{{ room.screenCount }}</span>
            </div>
          </template>
          <template v-if="room.simCount">
            <div class="room-list-table__devices-cell__item">
              <simulator-icon />
              <span class="devices-count">{{ room.simCount }}</span>
            </div>
          </template>
        </div>

        <div v-if="column.key === 'actions'" class="room-list-table__actions">
          <has-permission :permissions="[PermissionEnum.CAN_UPDATE_ROOMS]">
            <eos-button
              type="secondary"
              class="room-list-table__action"
              @click="openRoomForm('edit', room)"
            >
              <edit-icon />
            </eos-button>
          </has-permission>

          <has-permission :permissions="[PermissionEnum.CAN_UPDATE_ROOMS]">
            <archive-room 
              class="room-list-table__action"
              :room="room"
              @archive="getRooms"
            />
          </has-permission>
        </div>
      </template>
    </eos-table>
  </eos-card>
</template>

<style lang="scss">
.room-list {
  &-btns {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  &-table {
    &-header-cell {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &-header-cell-text {
      font-size: 17px;
      font-weight: 800;
      line-height: 28px;
      cursor: pointer;
    }
    &__sort-icon {
      height: 32px;
      width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    &-link {
      color: inherit;

      &:hover {
        color: inherit;
        text-decoration: underline;
      }
    }
    &__actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    &__action {
      width: 44px;
      opacity: 0;
      pointer-events: none;
    }
    &__devices-cell {
      display: flex;
      align-items: center;
      gap: 14px;
      &__item {
        display: flex;
        align-items: center;
        gap: 6px
      }
    }
  }
  .ant-table-cell-row-hover {
    .room-list-table-link {
      color: var(--sc-base-7);
    }
    .room-list-table__action {
      opacity: 1;
      pointer-events: all;
    }
  }
  // .ant-pagination-item {
  //   display: inline-flex;
  //   justify-content: center;
  //   align-items: center;
  //   border-radius: 8px;
  //   background-color: var(--sc-base-6);
  // }
  // .ant-pagination-item-link {
  //   height: 100%;
  //   width: 100%;
  //   display: flex;
  //   justify-content: center;
  //   align-items: center;
  //   background-color: var(--sc-base-6) !important;
  //   border-radius: 8px !important;
  // }

  // .ant-pagination-item-container {
  //   width: 100%;
  // }

  // .ant-pagination-jump-prev,
  // .ant-pagination-jump-next {
  //   display: inline-flex;
  // }
}
</style>
