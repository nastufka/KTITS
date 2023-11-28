<script setup lang="ts">
import * as _ from 'lodash-es'
import { useI18n } from 'vue-i18n'
import type { AxiosError } from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { ref, watch, onBeforeMount, onMounted } from 'vue'
import type { ColumnsType } from 'ant-design-vue/es/table/interface'

import { ax } from '@/shared/api/common'
import EosCard from '@/shared/ui/EosCard'
import EosTable from '@/shared/ui/EosTable'
import EosButton from '@/shared/ui/EosButton'
import EosSignal from '@/shared/ui/EosSignal'
import DeviceForm from '@/features/deviceForm/ui'
import DeviceFilter from '@/features/deviceFilter/ui'
import ArchiveDevice from '@/features/archiveDevice/ui'
import type { Room } from '@/entities/room/model/types'
import ControlIcon from '@/shared/icons/ControlIcon.vue'
import RefreshIcon from '@/shared/icons/RefreshIcon.vue'
import formatObjectKeys from '@/shared/lib/formatObjectKeys'
import VolumeIconMini from '@/shared/icons/VolumeIconMini.vue'
import EosSort, { type EosSortOption } from '@/shared/ui/EosSort'
import SettingsCardIcon from '@/shared/icons/SettingsCardIcon.vue'
import MicrophoneIconMini from '@/shared/icons/MicrophoneIconMini.vue'
import type { Device, DeviceType, DeviceStatus } from '@/entities/device/model/types'
import DeviceSettingsModal from '@/features/DevicesSettings/ui/DeviceSettingsModal.vue'

const { t } = useI18n({})
const route = useRoute()
const router = useRouter()

const columns: ColumnsType = [
  {
    title: t('deviceType'),
    dataIndex: 'type',
    key: 'type__name',
  },
  {
    title: t('deviceName'),
    dataIndex: 'name',
    key: 'name',
  },
  {
    dataIndex: 'deviceInfo',
    key: 'deviceInfo',
    width: 124,
  },
  {
    title: t('status'),
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: t('room'),
    dataIndex: 'rooms',
    key: 'rooms__name',
  },
  {
    key: 'actions',
    width: 184,
  },
]

const deviceTypesToCheck: DeviceType['id'][] = [1, 2]

const page = ref<number>(1)
const total = ref<number>(0)
const sort = ref<string>('name')
const pageSize = ref<number>(100)
const deviceToEdit = ref<Device>()
const loading = ref<boolean>(false)
const dataSource = ref<Device[]>([])
const isDeviceFormOpen = ref<boolean>(false)
const isDeviceSettingModalOpen = ref<boolean>(false)
const deviceStatus = ref<{ [id: number]: DeviceStatus }>({})
const sortOptions = ref<EosSortOption[]>([
  { label: t('deviceType'), value: 'type__name' },
  { label: t('name'), value: 'name' },
])

function formatRooms(rooms: Room[]): string {
  return rooms.map(r => r.name).join(', ')
}

function readQuery() {
  const ordering = route.query.ordering as string
  const limit = route.query.limit
  const offset = route.query.offset

  if (ordering) {
    sort.value = ordering
  }

  if (limit && offset) {
    page.value = Math.floor(+offset / +limit) + 1
  }
}

function setQuery([ordering, page]: [string | undefined, number | undefined]) {
  const query = {
    ...route.query,
    ordering,
    limit: page ? pageSize.value : page,
    offset: page ? pageSize.value * (page - 1) : page,
  }
  router.push({ name: 'devices', query })
}

function handleError(e: AxiosError) {
  if (e.response) {
    router.push({ name: 'error', params: { status: e.response.status }})
  }
}

const getData = _.debounce(() => {
  if (route.name === 'devices') {
    loading.value = true

    const minimalQuery = route.query.ordering !== undefined
      && route.query.offset !== undefined
      && route.query.limit !== undefined

    if (!minimalQuery) {
      setQuery([sort.value, 1])
    }
      
    minimalQuery && ax.get<Device[]>(route.fullPath)
      .then(r => {
        loading.value = false
        dataSource.value = r.data.map(d => formatObjectKeys(d, _.camelCase))
        total.value = +r.headers.count
      })
      .catch(handleError)
  }
}, 300)

function checkDevice({ id, type, isConnect }: Device, checkConnection: boolean) {
  if (deviceTypesToCheck.includes(type!.id)) {
    if (checkConnection) {
      deviceStatus.value[id].isLoading = true

      ax.post<boolean>(`/devices/${id}/check`)
        .then(r => {
          deviceStatus.value[id] = {
            isLoading: false,
            isConnect: r.data
          }
        })
        .catch(() => {
          deviceStatus.value[id] = {
            isLoading: false,
            isConnect: false
          }
        })
    } else {
      deviceStatus.value[id] = {
        isLoading: false,
        isConnect: isConnect as boolean
      }
    }
  } else {
    deviceStatus.value[id] = {
      isLoading: false,
      isConnect: true
    }
  }
}

const updateDeviceStatus = _.debounce((dataSource: Device[], checkConnection: boolean) => {
  dataSource.forEach(device => checkDevice(device, checkConnection))
}, 300)

function openDeviceForm() {
  isDeviceFormOpen.value = true
}

function openDeviceSettingsModal(device: Device) {
  deviceToEdit.value = _.omit(device, ['rooms'])
  isDeviceSettingModalOpen.value = true
}

function closeDeviceSettingsModal() {
  isDeviceSettingModalOpen.value = false
  deviceToEdit.value = undefined
}

function onDeviceSettingsSaved() {
  closeDeviceSettingsModal()
  getData()
}

function addScript(src: string): void {
  const script = document.createElement('script')
  script.src = src
  document.getElementsByTagName('head')[0].appendChild(script)
}

function goToFirstPage() {
  page.value = 1
}

watch(sort, goToFirstPage)
watch([sort, page], setQuery)
watch(route, getData)
watch(dataSource, v => updateDeviceStatus(v, false))
onBeforeMount(() => {
  readQuery()
})

onMounted(() => {
  addScript(new URL('/src/entities/camera/api/adapter.js', import.meta.url).href)
  addScript(new URL('/src/entities/camera/api/jsVideoPlugin.js', import.meta.url).href)
  addScript(new URL('/src/shared/api/common/jquery-3.4.1.min.js', import.meta.url).href)
  getData()
})
</script>

<template>
  <eos-card
    class="device-list"
    :title="t('deviceList')"
  >
    <device-form 
      v-model:open="isDeviceFormOpen"
      @submit="getData"
    />

    <device-settings-modal
      :device="deviceToEdit"
      :open="isDeviceSettingModalOpen"
      :room-id="deviceToEdit?.rooms && deviceToEdit?.rooms[0]?.id"
      @close="closeDeviceSettingsModal"
      @saved="onDeviceSettingsSaved"
    />

    <template #extra>
      <div class="device-list__btns">
        <device-filter @filter="goToFirstPage" />

        <eos-sort
          v-model:sort="sort"
          :options="sortOptions"
        />

        <eos-button type="secondary" @click="updateDeviceStatus(dataSource, true)">
          <refresh-icon color="var(--sc-base-9)" />
        </eos-button>

        <eos-button type="primary" :style="{ width: 122 }" @click="openDeviceForm">
          {{ t('add') }}
        </eos-button>
      </div>
    </template>

    <eos-table
      v-model:page="page"
      v-model:pageSize="pageSize"
      :sort="sort"
      :total="total"
      :loading="loading"
      :columns="columns"
      :fullHeight="true"
      :dataSource="dataSource"
      :serverSidePagination="true"
      :scroll="{ y: 'calc(100vh - 227px)' }"
    >
      <template #bodyCell="{ column, record: device }">
        <div v-if="column.key === 'type__name'">
          {{ t(device.type.name) }}
        </div>

        <div v-if="column.key === 'deviceInfo'">
          <div class="device-list__device-info">
            <control-icon
              :title="t('controlCam')"
              :class="{ 'device-list__invisible': !device.control }"
            />

            <volume-icon-mini
              :title="t('haveSpeaker')"
              :class="{ 'device-list__invisible': !device.sound }"
            />

            <microphone-icon-mini
              :title="t('haveMicro')"
              :class="{ 'device-list__invisible': !device.voice }"
            />
          </div>
        </div>

        <div v-if="column.key === 'status'">
          <eos-signal
            :isLoading="deviceStatus[device.id]?.isLoading"
            :isConnect="deviceStatus[device.id]?.isConnect"
          />
        </div>

        <div v-if="column.key === 'rooms__name'">
          {{ formatRooms(device.rooms) }}
        </div>

        <div v-if="column.key === 'actions'" class="device-list__actions">
          <archive-device
            class="device-list__action"
            :device="device"
            @archive="getData"
          />

          <eos-button
            v-if="deviceTypesToCheck.includes(device.type.id)"
            type="secondary"
            class="device-list__action"
            @click="checkDevice(device, true)"
          >
            <refresh-icon color="var(--sc-base-9)" />
          </eos-button>

          <eos-button
            type="secondary"
            class="device-list__action"
            @click="openDeviceSettingsModal(device)"
          >
            <settings-card-icon />
          </eos-button>
        </div>
      </template>
    </eos-table>
  </eos-card>
</template>

<style lang="scss">
.device-list {
  &__btns {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__device-info {
    display: flex;
    justify-content: space-between;
  }

  &__invisible {
    opacity: 0;
    pointer-events: none;
  }
  
  &__actions {
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
  }

  &__action {
    width: 44px;
    opacity: 0;
    pointer-events: none;
    margin-left: 10px;

    &:last-child {
      margin-left: 0;
    }
  }

  .ant-table-cell-row-hover {
    .device-list__action {
      opacity: 1;
      pointer-events: all;
    }
  }
}
</style>
