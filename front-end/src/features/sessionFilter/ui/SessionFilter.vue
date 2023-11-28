<script setup lang="ts">
// todo: починить фильтр

import * as _ from 'lodash-es'
import { useI18n } from 'vue-i18n'
import type { Dayjs } from 'dayjs'
import { ref, computed, watch } from 'vue'

import EosModal from '@/shared/ui/EosModal'
import EosButton from '@/shared/ui/EosButton'
import EosSelect from '@/shared/ui/EosSelect'
import EosFormItem from '@/shared/ui/EosFormItem'
import EosTimePicker from '@/shared/ui/EosTimePicker'
import { useGlobalStore } from '@/stores/globalStore'
import FilterIcon from '@/shared/icons/FilterIcon.vue'
import EosRangePicker from '@/shared/ui/EosRangePicker'
import EosButtonCheckbox from '@/shared/ui/EosButtonCheckbox'
import type { EosButtonCheckboxOption } from '@/shared/ui/EosButtonCheckbox'

import type { SessionFilter } from '../model/types'
import type { Room } from '@/entities/room/model/types'
import type { User } from '@/entities/user/model/types'
import type { Group } from '@/entities/group/model/types'
import type { SessionStatus, SessionType, SessionDisplayTypes } from '@/entities/session/model/types'

interface _SessionFilter {
  date: Dayjs[] | null,
  start: Dayjs | null,
  end: Dayjs | null,
  type: number[],
  rooms: number[],
  users: number[],
  status: number[],
  groups: number[],
}

const { t } = useI18n({})
const globalStore = useGlobalStore()

const props = withDefaults(defineProps<{
  type?: SessionDisplayTypes,
  roomId?: number | undefined
}>(), {
  type: 'page',
  roomId: undefined
})
const emit = defineEmits<{
  (e: 'change', sessionFilter: SessionFilter): void
}>()

const fieldNames = { label: 'name', value: 'id' }

const initialValues: _SessionFilter = {
  type: [],
  date: null,
  start: null,
  end: null,
  rooms: props.type === 'page' ? [] : [<number>props.roomId],
  users: [],
  status: [],
  groups: [],
}

const isOpen = ref<boolean>(false)
const isFilterApplied = ref<boolean>(false)
const filterState = ref<_SessionFilter>({ ...initialValues })
const sessionFilter = ref<_SessionFilter>({ ...initialValues })

const roomList = computed<Room[]>(() => globalStore.roomList)
const groupList = computed<Group[]>(() => globalStore.groupList)
const teacherList = computed<User[]>(() => globalStore.teacherList)
const typeList = computed<SessionType[]>(() => globalStore.typeList)
const isFilterEmpty = computed<boolean>(() => _.isEqual(sessionFilter.value, initialValues))
const statusList = computed<SessionStatus[]>(() => globalStore.statusList.map(s => ({ ...s, name: t(s.name) })))
const typeOptions = computed<EosButtonCheckboxOption[]>(() => typeList.value.map(type => ({ value: type.id, label: t(type.name) })))

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

function getPreparedData(): SessionFilter {
  const { type, date, start, end, rooms, status, groups, users }: _SessionFilter = sessionFilter.value
  return {
    type,
    startDate: date ? date[0].utc(false).format('YYYY-MM-DD') : '',
    endDate: date ? date[1].utc(false).format('YYYY-MM-DD') : '',
    startTime: start?.utc(false).format('HH:mm') || '',
    endTime: end?.utc(false).format('HH:mm') || '',
    rooms,
    status,
    groups,
    users,
  }
}

function updateFilterState() {
  filterState.value = Object.assign(filterState.value, sessionFilter.value)
  isFilterApplied.value = !isFilterEmpty.value
}

function applyFilterState() {
  sessionFilter.value = Object.assign(sessionFilter.value, filterState.value)
}

function clearAll() {
  sessionFilter.value = Object.assign(sessionFilter.value, initialValues)
  updateFilterState()
  emit('change', getPreparedData())
  closeModal()
}

async function submit() {
  updateFilterState()
  console.log(getPreparedData())
  emit('change', getPreparedData())
  closeModal()
}
</script>

<template>
  <eos-button
    :active="isOpen"
    :type="isFilterApplied ? 'primary' : 'secondary'"
    @click="openModal"
  >
    <FilterIcon :active="isFilterApplied" />
  </eos-button>

  <eos-modal
    v-model:open="isOpen"
    width="578px"
    class="session-filter"
    :title="t('filters')"
    @ok="handleOk"
  >
    <a-form
      name="session-filter"
      :model="sessionFilter"
      style="max-height: 536px; overflow: auto;"
    >
      <eos-form-item
        name="sessionType"
        :label="t('sessionType')"
      >
        <eos-button-checkbox
          v-model:value="sessionFilter.type"
          size="large"
          :options="typeOptions"
        ></eos-button-checkbox>
      </eos-form-item>

      <eos-form-item
        name="date"
        :label="t('sessionDate')"
      >
        <eos-range-picker
          v-model:value="sessionFilter.date"
          style="width: 299px"
        />
      </eos-form-item>

      <a-row>
        <eos-form-item
        name="start"
        :label="t('start')"
        >
          <eos-time-picker
            v-model:value="sessionFilter.start"
          ></eos-time-picker>
        </eos-form-item>

        <eos-form-item
          name="end"
          :label="t('end')"
          style="margin-left: 24px;"
        >
          <eos-time-picker
            v-model:value="sessionFilter.end"
          ></eos-time-picker>
        </eos-form-item>
      </a-row>

      <eos-form-item
        v-if="props.type === 'page'"
        name="room"
        :label="t('room')"
      >
        <eos-select
          v-model:value="sessionFilter.rooms"
          size="large"
          mode="multiple"
          style="width: 529px"
          optionFilterProp="name"
          :allowClear="true"
          :options="roomList"
          :fieldNames="fieldNames"
        ></eos-select>
      </eos-form-item>

      <eos-form-item
        name="status"
        :label="t('status')"
      >
        <eos-select
          v-model:value="sessionFilter.status"
          size="large"
          mode="multiple"
          style="width: 529px"
          optionFilterProp="name"
          :allowClear="true"
          :options="statusList"
          :fieldNames="fieldNames"
        ></eos-select>
      </eos-form-item>

      <eos-form-item
        name="groups"
        :label="t('learningGroup')"
      >
        <eos-select
          v-model:value="sessionFilter.groups"
          size="large"
          mode="multiple"
          style="width: 529px"
          optionFilterProp="name"
          :allowClear="true"
          :options="groupList"
          :fieldNames="fieldNames"
        ></eos-select>
      </eos-form-item>

      <eos-form-item
        name="users"
        :label="t('teacher')"
      >
        <eos-select
          v-model:value="sessionFilter.users"
          size="large"
          mode="multiple"
          style="width: 529px"
          optionFilterProp="name"
          :allowClear="true"
          :options="teacherList"
          :fieldNames="fieldNames"
        ></eos-select>
      </eos-form-item>
    </a-form>

    <template #footer>
      <eos-button type="primary" size="large" @click="submit">{{ t('applyFilter') }}</eos-button>
      <eos-button size="large" @click="clearAll">{{ t('clearAll') }}</eos-button>
    </template>
  </eos-modal>
</template>

<style lang="scss">
.session-filter {
  .ant-modal-header {
    margin-right: -10px;
  }

  .ant-modal-content {
    padding-right: 10;
  }
}
</style>
