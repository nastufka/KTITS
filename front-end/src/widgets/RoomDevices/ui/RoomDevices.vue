<script setup lang="ts">
import * as _ from 'lodash-es'
import { useI18n } from 'vue-i18n'
import { ref, computed, onMounted } from 'vue'

import EosCard from '@/shared/ui/EosCard'
import EosModal from '@/shared/ui/EosModal'
import EosButton from '@/shared/ui/EosButton'
import DeviceItem from '@/entities/device/ui'
import { getDeviceList, removeDevice } from '../api'
import { useGlobalStore } from '@/stores/globalStore'
import type { Room } from '@/entities/room/model/types'
import RefreshIcon from '@/shared/icons/RefreshIcon.vue'
import { checkDeviceStatus } from '@/entities/device/api'
import AddDeviceToRoom from '@/features/addDeviceToRoom/ui'
import type { Camera } from '@/entities/camera/model/types'
import formatObjectKeys from '@/shared/lib/formatObjectKeys'
import HasPermission from '@/features/auth/ui/HasPermission.vue'
import { PermissionEnum } from '@/features/auth/model/permissions'
import type { Device, DeviceStatus } from '@/entities/device/model/types'
import DeviceSettingsModal from '@/features/DevicesSettings/ui/DeviceSettingsModal.vue'

const props = defineProps<{
  roomId: number
}>()
const { t } = useI18n({})

const globalStore = useGlobalStore()
const openRemoveModal = ref<boolean>(false)
const currentDevice = ref<Device>({ id: 0 })
const openAddDeviceModal = ref<boolean>(false)
const dumpyDevice: Device = currentDevice.value
const isOpenDeviceSettings = ref<boolean>(false)
const deviceStatus = ref<{ [id: number]: DeviceStatus }>({})
const devices = computed<Device[]>(() => {
  const rawDevices = globalStore.roomList.find((r: Room) => r.id === props.roomId)?.devices
  return rawDevices?.map((d: Device & Camera) => {
    d.volume = 1
    return formatObjectKeys(d, _.camelCase)
  } )
})

function openDeviceForm() {
  openAddDeviceModal.value = true
}
function closeDeviceForm() {
  openAddDeviceModal.value = false
}
async function refreshDeviceList(): Promise<void> {
  const deviceList = await getDeviceList(props.roomId)
  globalStore.setRoomDevices(props.roomId, deviceList)
  closeDeviceSettings()
}
function checkRemove(device: Device) {
  currentDevice.value = device
  openRemoveModal.value = true
}
function cancelRemoving(): void {
  currentDevice.value = dumpyDevice
  openRemoveModal.value = false
}
async function removeDeviceFromList(): Promise<void> {
  await removeDevice(props.roomId, <number>currentDevice.value?.id)
  refreshDeviceList()
  cancelRemoving()
}
function openDeviceSettings(device: Device) {
  currentDevice.value = device
  isOpenDeviceSettings.value = true
}
function closeDeviceSettings() {
  currentDevice.value = dumpyDevice
  isOpenDeviceSettings.value = false
}
async function checkDevice({ id, type }: Device) {
  deviceStatus.value[id] = {
    isLoading: true,
    isConnect: false
  }
  deviceStatus.value[id] = await checkDeviceStatus(id, type)
}

const updateDeviceStatus = _.debounce(() => {
  devices.value.forEach(device => checkDevice(device))
}, 300)

function addScript(src: string): void {
  const script = document.createElement("script")
  script.src = src
  document.getElementsByTagName("head")[0].appendChild(script)
}

onMounted(() => {
  addScript(new URL('/src/entities/camera/api/adapter.js', import.meta.url).href)
  addScript(new URL('/src/entities/camera/api/jsVideoPlugin.js', import.meta.url).href)
  addScript(new URL('/src/shared/api/common/jquery-3.4.1.min.js', import.meta.url).href)
  //updateDeviceStatus()
})
</script>

<template>
  <eos-card class="room-devices" :title="t('connectedDevices')" :body-style="{ padding: '24px 0' }">
    <template #extra>
      <div class="room-devices__extra">
        <eos-button type="outline">
          <RefreshIcon color="#999999" @click="updateDeviceStatus" />
        </eos-button>
        <has-permission :permissions="[PermissionEnum.CAN_UPDATE_ROOMS]">
          <eos-button
            type="primary"
            @click="openDeviceForm"
          >
            {{ t('add') }}
          </eos-button>
        </has-permission>
      </div>
    </template>
    <div class="room-devices__content">
      <device-item
        v-for="device in devices" 
        :key="device.id"
        :device="device"
        :status="deviceStatus[device.id] || { isConnect: device.isConnect }"
        style="width: calc(100% - 48px); margin-top: 8px;"
        @on-settings="openDeviceSettings"
        @on-remove="checkRemove"
      />
    </div>
    <add-device-to-room
      :open="openAddDeviceModal"
      :room-id="roomId"
      :own-devices="devices"
      @close="closeDeviceForm"
    />
    <eos-modal
      v-model:open="openRemoveModal"
      :title="t('attention')"
      centered
      width="582px"
      :ok-text="t('delete')"
      @ok="removeDeviceFromList"
      @cancel="cancelRemoving()"
    > 
      <p>
        <span class="room-devices__remove-modal-text">{{ t('removeDeviceMessage', 1) }}</span>
        <span class="room-devices__remove-modal-text bold">&nbsp;{{ currentDevice?.name }}&nbsp;</span>
        <span class="room-devices__remove-modal-text">{{ t('removeDeviceMessage', 2) }}</span>
      </p>
      <p>
        <span class="room-devices__remove-modal-text">{{ t('deleteConfirm') }}</span>
      </p>
    </eos-modal>
    <device-settings-modal 
      :open="isOpenDeviceSettings"
      :device="currentDevice"
      :room-id="roomId"
      @close="closeDeviceSettings"
      @saved="refreshDeviceList"
    />
  </eos-card>
</template>

<style lang="scss">
.room-devices {
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
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--sc-base-6);
    height: calc(100% - 8px);
    flex: 1;
    overflow-y: auto;
    margin-bottom: 8px;
  }
  &__remove-modal-text {
    color: var(--sc_base-1);
    font-size: 17px;
    font-weight: 500;
    line-height: 28px;
    &.bold {
      font-weight: 800;
    }
  }
}
</style>
