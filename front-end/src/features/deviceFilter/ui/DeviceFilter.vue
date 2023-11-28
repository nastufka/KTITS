<script setup lang="ts">
import * as _ from 'lodash-es'
import { useI18n } from 'vue-i18n'
import type { AxiosError } from 'axios'
import { useRoute, useRouter } from 'vue-router'
import type { SelectProps } from 'ant-design-vue'
import { ref, computed, onBeforeMount } from 'vue'

import { ax } from '@/shared/api/common'
import EosModal from '@/shared/ui/EosModal'
import EosButton from '@/shared/ui/EosButton'
import EosSelect from '@/shared/ui/EosSelect'
import EosFormItem from '@/shared/ui/EosFormItem'
import { useGlobalStore } from '@/stores/globalStore'
import FilterIcon from '@/shared/icons/FilterIcon.vue'
import type { Room } from '@/entities/room/model/types'
import EosButtonCheckbox from '@/shared/ui/EosButtonCheckbox'
import type { Device, DeviceType } from '@/entities/device/model/types'
import type { EosButtonCheckboxOption } from '@/shared/ui/EosButtonCheckbox'

interface DeviceFilterEmits {
  (e: 'filter'): void
}

type Options = SelectProps['options']

interface DeviceFilter {
  types: number[]
  names: number[]
  rooms: number[]
}

const route = useRoute()
const router = useRouter()
const { t } = useI18n({})
const globalStore = useGlobalStore()

const emit = defineEmits<DeviceFilterEmits>()

const initialValues: DeviceFilter = {
  types: [],
  names: [],
  rooms: [],
}

const isOpen = ref<boolean>(false)
const nameOptions = ref<Options>([])
const filter = ref<DeviceFilter>({ ...initialValues })
const filterState = ref<DeviceFilter>({ ...initialValues })

const roomList = computed<Room[]>(() => globalStore.roomList)
const deviceTypeList = computed<DeviceType[]>(() => globalStore.deviceTypeList)
const isFilterApplied = computed<boolean>(() => !_.isEqual(filterState.value, initialValues))
const roomOptions = computed<Options>(() => roomList.value.map(r => ({ value: r.id, label: r.name })))
const deviceTypeOptions = computed<EosButtonCheckboxOption[]>(() => deviceTypeList.value.map(d => ({ value: d.id, label: t(d.name) })))

function applyFilterState() {
  filter.value = { ...filterState.value }
}

function updateFilterState() {
  filterState.value = { ...filter.value }
}

function openModal() {
  applyFilterState()
  isOpen.value = true
  getDevices()
}

function closeModal() {
  isOpen.value = false
}

function readQuery() {
  const { types, names, rooms } = route.query
  types && (filter.value.types = JSON.parse(types as string))
  names && (filter.value.names = JSON.parse(names as string))
  rooms && (filter.value.rooms = JSON.parse(rooms as string))
  updateFilterState()
}

function applyFilter() {
  updateFilterState()
  const query = { ...route.query }
  query.types = JSON.stringify(filter.value.types)
  query.names = JSON.stringify(filter.value.names)
  query.rooms = JSON.stringify(filter.value.rooms)
  router.push({ name: 'devices', query })
  emit('filter')
}

function clearAll() {
  filter.value = ({ ...initialValues })
  applyFilter()
  closeModal()
}

function submit() {
  applyFilter()
  closeModal()
}

function handleError(e: AxiosError) {
  if (e.response) {
    router.push({ name: 'error', params: { status: e.response.status }})
  }
}

function getDevices() {
  !nameOptions.value?.length && ax.get<Device[]>('/devices/')
    .then(r => {
      nameOptions.value = r.data.map(({ name }) => ({ label: name, value: name }))
    })
    .catch(handleError)
}

onBeforeMount(() => {
  readQuery()
})
</script>

<template>
  <eos-button :type="isFilterApplied ? 'primary' : 'secondary'" @click="openModal">
    <FilterIcon :active="isFilterApplied" />
  </eos-button>

  <eos-modal
    v-model:open="isOpen"
    width="578px"
    :title="t('filters')"
  >
    <a-form
      name="device-filter"
      :model="filter"
    >
      <eos-form-item
        name="sessionType"
        :label="t('sessionType')"
      >
        <eos-button-checkbox
          v-model:value="filter.types"
          size="large"
          :options="deviceTypeOptions"
        ></eos-button-checkbox>
      </eos-form-item>

      <eos-form-item
        name="deviceName"
        :label="t('deviceName')"
      >
        <eos-select
          v-model:value="filter.names"
          mode="tags"
          size="large"
          style="width: 529px;"
          :allowClear="true"
          :options="nameOptions"
        ></eos-select>
      </eos-form-item>

      <eos-form-item
        name="room"
        :label="t('room')"
      >
        <eos-select
          v-model:value="filter.rooms"
          size="large"
          mode="multiple"
          style="width: 529px;"
          optionFilterProp="label"
          :allowClear="true"
          :options="roomOptions"
        ></eos-select>
      </eos-form-item>
    </a-form>

    <template #footer>
      <eos-button type="primary" size="large" @click="submit">{{ t('applyFilter') }}</eos-button>
      <eos-button size="large" @click="clearAll">{{ t('clearAll') }}</eos-button>
    </template>
  </eos-modal>
</template>
