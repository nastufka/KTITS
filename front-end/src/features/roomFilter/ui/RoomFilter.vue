<script setup lang="ts">
import * as _ from 'lodash-es'
import { useI18n } from 'vue-i18n'
import { ref, computed, watch } from 'vue'
import type { RoomFilter } from '../model/types'
import type { SelectProps } from 'ant-design-vue'
import { useGlobalStore } from '@/stores/globalStore'
import type { User } from '@/entities/user/model/types'
import type { RoomNames } from '@/entities/room/model/types'

import EosModal from '@/shared/ui/EosModal'
import EosButton from '@/shared/ui/EosButton'
import EosSelect from '@/shared/ui/EosSelect'
import EosFormItem from '@/shared/ui/EosFormItem'
import FilterIcon from '@/shared/icons/FilterIcon.vue'



interface RoomFilterEmits {
  (e: 'change', roomFilter: { name: number[], responsible: number[] }): void
}

type Options = SelectProps['options']

const { t } = useI18n({})
const emit = defineEmits<RoomFilterEmits>()

const globalStore = useGlobalStore()
const initialValues: RoomFilter = {
  roomNames: [],
  responsibleUsers: [],
}
const isOpen = ref<boolean>(false)
const roomNames = computed<RoomNames[]>(() => globalStore.roomNames)
const responsibleUsers = computed<User[]>(() => globalStore.responsibleList)
const roomFilter = ref<RoomFilter>({ ...initialValues })
const filterState = ref<RoomFilter>({ ...initialValues })
const isFilterApplied = ref<boolean>(false)
const fieldNames = { label: 'name', value: 'id' }
const isFilterEmpty = computed<boolean>(() => _.isEqual(roomFilter.value, initialValues))

watch(isOpen, isOpen => isOpen && applyFilterState())

function openModal() {
  isOpen.value = true
}

function closeModal() {
  isOpen.value = false
}

function handleOk() {
  closeModal()
}

function updateFilterState(value: boolean | null = null) {
  filterState.value = Object.assign(filterState.value, roomFilter.value)
  isFilterApplied.value = value === null ? !isFilterEmpty.value : value
}

function applyFilterState() {
  roomFilter.value = Object.assign(roomFilter.value, filterState.value)
}

function clearAll() {
  roomFilter.value = { ...initialValues } as RoomFilter
  updateFilterState(false)
  emit('change', { name: [], responsible: [] })
  closeModal()
}

const getOptionsIds = (options: (string | number)[], entity: 'rooms' | 'responsibleUsers'): number[] => {
  const dict = entity === 'rooms' ? roomNames.value : responsibleUsers.value
  const ids: Set<number> = new Set()
  options.forEach(option => {
    if (typeof option === 'number') {
      ids.add(option)
    } else {
      //@ts-ignore
      const rawIds: number[] = dict.filter(o => o.name.toLowerCase().includes(option.toLowerCase())).map(o => o.id)
      rawIds.forEach(id => ids.add(id))
    }
  })
  return [...ids]
}

async function submit() {
  updateFilterState()
  const roomIds = getOptionsIds(roomFilter.value.roomNames, 'rooms')
  const responsibleIds = getOptionsIds(roomFilter.value.responsibleUsers, 'responsibleUsers')
  emit('change', { name: roomIds, responsible: responsibleIds })
  closeModal()
}
</script>

<template>
  <div>
    <eos-button :type="isFilterApplied ? 'primary' : 'secondary'" @click="openModal">
      <FilterIcon :active="isFilterApplied" />
    </eos-button>

    <eos-modal
      v-model:open="isOpen"
      width="640px"
      :title="t('filters')"
      @ok="handleOk"
    >
      <a-form
        name="room-filter"
        :model="roomFilter"
      >
        <eos-form-item
          name="roomName"
          :label="t('roomName')"
        >
          <eos-select
            v-model:value="roomFilter.roomNames"
            size="large"
            mode="tags"
            optionFilterProp="name"
            style="width: 592px;"
            :options="roomNames"
            :allowClear="true"
            :fieldNames="fieldNames"
          ></eos-select>
        </eos-form-item>

        <eos-form-item
          name="responsible"
          :label="t('responsible')"
        >
          <eos-select
            v-model:value="roomFilter.responsibleUsers"
            size="large"
            mode="tags"
            optionFilterProp="name"
            style="width: 592px;"
            :options="responsibleUsers"
            :allowClear="true"
            :fieldNames="fieldNames"
          ></eos-select>
        </eos-form-item>
      </a-form>

      <template #footer>
        <eos-button type="primary" size="large" @click="submit">{{ t('applyFilter') }}</eos-button>
        <eos-button size="large" @click="clearAll">{{ t('clearAll') }}</eos-button>
      </template>
    </eos-modal>
  </div>
</template>
