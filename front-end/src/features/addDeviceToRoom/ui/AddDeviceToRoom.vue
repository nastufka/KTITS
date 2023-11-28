<script setup lang="ts">
import * as _ from 'lodash-es'
import { useI18n } from 'vue-i18n'
import type { AxiosResponse } from 'axios'
import { computed, onMounted, ref } from 'vue'

import EosModal from '@/shared/ui/EosModal'
import EosInput from '@/shared/ui/EosInput'
import EosButton from '@/shared/ui/EosButton'
import DeviceItem from '@/entities/device/ui'
import EosFormItem from '@/shared/ui/EosFormItem'
import { useGlobalStore } from '@/stores/globalStore'
import SearchIcon from '@/shared/icons/SearchIcon.vue'
import { checkDeviceStatus } from '@/entities/device/api'
import notification from '@/shared/api/common/notification'
import formatObjectKeys from '@/shared/lib/formatObjectKeys'
import EosButtonCheckbox from '@/shared/ui/EosButtonCheckbox'
import type { Device, DeviceStatus } from '@/entities/device/model/types'
import type { EosButtonCheckboxOption } from '@/shared/ui/EosButtonCheckbox'

import { getDevices, addDevicesToRoom } from '../api/'

interface TypeItem {
  id: number,
  name: string
}
interface AddDeviceEmits {
  (e: 'close'): void
}
interface AddDevicesResponse {
  id: number
  devices: Device[]
}
type DeviceWithStatus = Device & {
  status?: DeviceStatus
}
const emit = defineEmits<AddDeviceEmits>()
const props = defineProps<{
  open: boolean,
  roomId: number
  ownDevices: Device[]
}>()
const { t } = useI18n({})

const globalStore = useGlobalStore()
const deviceType = ref<number[]>([])
const search = ref<string>('')
const devices = ref<DeviceWithStatus[]>([])
const newDevices = ref<Set<number>>(new Set<number>())
const deviceItems = ref<typeof DeviceItem[]>()
const typeOptions = computed<EosButtonCheckboxOption[]>(() => {
  return globalStore.deviceTypeList.map((typeItem: TypeItem) => { return { value: typeItem.id, label: t(typeItem.name) } })
})
const filteredDevices = computed<DeviceWithStatus[]>(() => {
  return devices.value.filter((device: DeviceWithStatus) => {
    if (!search.value && !deviceType.value.length) {
      return true
    }
    if (search.value && deviceType.value.length) {
      return typeof device.type?.id === 'number' && deviceType.value.includes(device.type.id) 
        && device.name?.toLocaleLowerCase()?.includes(search.value.toLocaleLowerCase())
    }
    if (search.value) {
      return device.name?.toLocaleLowerCase()?.includes(search.value.toLocaleLowerCase())
    }
    if (deviceType.value.length) {
      return device.type?.id && deviceType.value.includes(device.type?.id)
    } else {
      return true
    }
  })
})

async function addDevices() {
  try {
    const res: AxiosResponse<AddDevicesResponse> = await addDevicesToRoom(props.roomId, Array.from(newDevices.value))
    close()
    notification.success({
      message: '',
      description: t('dataSavedSuccessfully')
    })
    globalStore.setRoomDevices(props.roomId, res.data.devices)
  } catch {
    notification.error({
      message: '',
      description: t('dataCannotBeSaved')
    })
  }
}
function close() {
  newDevices.value = new Set<number>()
  resetCheckedDevices()
  emit('close')
}
function onChangeChecked(value: boolean, deviceId: number): void {
  if (value) {
    newDevices.value.add(deviceId)
  } else {
    newDevices.value.delete(deviceId)
  }
}
function resetCheckedDevices(): void {
  Array.isArray(deviceItems.value) && deviceItems.value.forEach(deviceItem => {
    deviceItem.resetChecked()
  })
}
const updateDeviceStatus = _.debounce(() => {
  devices.value.forEach(async (device) => {
    device.status = {
      isLoading: true,
      isConnect: false
    }
    device.status = await checkDeviceStatus(device.id, device.type)
  })
}, 300)

onMounted(() => {
  getDevices().then((res: AxiosResponse<Device[]>) => {
    const ownDeviceIds = props.ownDevices?.map(d => d.id)
    devices.value = res.data
      .filter(d => !ownDeviceIds?.includes(d.id))
      .map((d: Device) => formatObjectKeys(d, _.camelCase))
    //updateDeviceStatus()
  })
})
</script>

<template>
  <eos-modal
    :open="open"
    width="720px"
    centered
    class="add-device"
    :title="t('filters')"
    @cancel="close"
  >
    <a-form
      name="add-device"
    >
      <eos-form-item
        name="deviceType"
        :label="t('deviceType')"
      >
        <eos-button-checkbox
          v-model:value="deviceType"
          size="large"
          :options="typeOptions"
        ></eos-button-checkbox>
      </eos-form-item>

      <eos-form-item>
        <eos-input
          v-model:value="search"
          allowClear
          size="large"
          :placeholder="t('search')"
        >
          <template #prefix>
            <search-icon />
          </template>
        </eos-input>
      </eos-form-item>

      <div class="add-device__list">
        <device-item
          v-for="device in filteredDevices" 
          :key="device.id"
          :device="device"
          :status="{ isConnect: !!device.isConnect, isLoading: false }"
          ref="deviceItems"
          mode="add"
          style="width: 100%;"
          @onChangeChecked="onChangeChecked"
        />
      </div>
    </a-form>

    <template #footer>
      <eos-button type="primary" size="large" @click="addDevices">{{ t('add') }}</eos-button>
      <eos-button size="large" @click="close">{{ t('cancel') }}</eos-button>
    </template>
  </eos-modal>
</template>

<style lang="scss">
.add-device {
  &__list {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    gap: 8px;
    max-height: 456px;
    overflow: auto;
    border-radius: 12px;
    background: var(--sc-base-13);
  }
}
</style>