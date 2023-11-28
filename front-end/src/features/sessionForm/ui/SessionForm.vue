<script setup lang="ts">
import * as _ from 'lodash-es'
import { useI18n } from 'vue-i18n'
import type { Dayjs } from 'dayjs'
import { useRouter } from 'vue-router'
import { ref, watch, computed } from 'vue'
import type { AxiosError, AxiosResponse } from 'axios'

import EosModal from '@/shared/ui/EosModal'
import EosInput from '@/shared/ui/EosInput'
import EosRadio from '@/shared/ui/EosRadio'
import EosSteps from '@/shared/ui/EosSteps'
import EosButton from '@/shared/ui/EosButton'
import EosSelect from '@/shared/ui/EosSelect'
import { ax, dayjs } from '@/shared/api/common'
import EosFormItem from '@/shared/ui/EosFormItem'
import type { Rule } from 'ant-design-vue/es/form'
import EosDatePicker from '@/shared/ui/EosDatePicker'
import EosTimePicker from '@/shared/ui/EosTimePicker'
import { useGlobalStore } from '@/stores/globalStore'
import type { User } from '@/entities/user/model/types'
import RoomEmployment from '@/widgets/RoomEmployment/ui'
import type { Group } from '@/entities/group/model/types'
import notification from '@/shared/api/common/notification'
import type { Room, RoomPeriod } from '@/entities/room/model/types'
import type { SystemSettings } from '@/entities/systemSettings/model/types'
import { timeValidator, getDisabledTimes } from '@/shared/lib/timeValidation'
import type { SessionData, SessionType } from '@/entities/session/model/types'

interface SessionFormEmits {
  (e: 'submit'): void
  (e: 'update:open', open: boolean): void
}

export interface SessionFormProps {
  open?: boolean
  session?: SessionData
}

interface RequestData {
  rooms: number[]
  users: number[]
  groups: number[]
  type: number
  module: string
  start: string
  end: string
}

interface ResponseData {
  id: number
  module: string
  type: number
  start: string
  end: string
  groups: number[]
  rooms: number[]
  users: number[]
}

interface RoomData extends Omit<Room, 'periodTime'> {
  period_time: Array<{
    start: string
    end: string
  }>
}

interface FirstStepData {
  type?: number
  module: string
  users: number[]
  groups: number[]
}

interface SecondStepData {
  rooms: number[]
  date: Dayjs | null
  start: Dayjs | null
  end: Dayjs | null
}

const router = useRouter()
const { t } = useI18n({})
const globalStore = useGlobalStore()

const emit = defineEmits<SessionFormEmits>()
const props = defineProps<SessionFormProps>()

const fieldNames = { label: 'name', value: 'id' }

const firstStepInitialValues: FirstStepData = {
  type: undefined,
  module: '',
  users: [],
  groups: [],
}

const secondStepInitialValues: SecondStepData = {
  rooms: [],
  date: null,
  start: null,
  end: null,
}

const required = { required: true, message: t('theFieldIsRequired') }

const step = ref<number>(0)
const isOpen = ref<boolean>(false)
const roomEmployment = ref<Room[]>([])
const firstStepData = ref<FirstStepData>({ ...firstStepInitialValues })
const secondStepData = ref<SecondStepData>({ ...secondStepInitialValues })

const roomList = computed<Room[]>(() => globalStore.roomList)
const isEditing = computed<boolean>(() => !!props.session?.id)
const groupList = computed<Group[]>(() => globalStore.groupList)
const teacherList = computed<User[]>(() => globalStore.teacherList)
const typeList = computed<SessionType[]>(() => globalStore.typeList)
const systemSettings = computed<SystemSettings | undefined>(() => globalStore.systemSettings)

const firstStepRules = computed(() => {
  return {
    type: [required],
    module: [required],
    users: [required],
    groups: [required],
  }
})

const secondStepRules = computed(() => {
  return {
    date: [{ validator: dateValidator }],
    rooms: [required],
    start: [required, { validator: timeValidator(disabledStartTime(), t('incorrectTime')) }],
    end: [required, { validator: timeValidator(disabledEndTime(), t('incorrectTime')) }],
  }
})

function handleError() {
  notification.error({
    message: '',
    description: t('dataCannotBeSaved'),
  })
}

const getRoomEmployment = _.debounce(() => {
  const rooms = secondStepData.value.rooms?.join(',')
  rooms
    ? ax.get<RoomData[]>(`/rooms/employment/?rooms=[${rooms}]`)
      .then(r => roomEmployment.value = formatRoomEmployment(r.data))
      .catch(handleError)
    : roomEmployment.value = []
})

watch(() => props.open, v => isOpen.value = v)
watch(() => props.session, session => {
  if (session) {
    const { type, module = '', users = [], groups = [], rooms = [], start, end } = session

    firstStepData.value = {
      ...firstStepInitialValues,
      type: type?.id,
      module,
      users: users.map(u => u.id),
      groups: groups.map(g => g.id),
    }

    secondStepData.value = {
      ...secondStepInitialValues,
      rooms: rooms.map(r => r.id),
      date: dayjs(start),
      start: dayjs(start),
      end: dayjs(end),
    }
  } else {
    clearForm()
  }
})
watch(() => secondStepData.value.date, getRoomEmployment)
watch(() => secondStepData.value.rooms, getRoomEmployment)
watch(isOpen, v => {
  emit('update:open', v)
  if (!v) {
    clearForm()
  }
})

function close() {
  isOpen.value = false
}

function clearForm() {
  firstStepData.value = Object.assign(firstStepData.value, firstStepInitialValues)
  secondStepData.value = Object.assign(secondStepData.value, secondStepInitialValues)
  step.value = 0
  roomEmployment.value = []
}

function onFinish() {
  step.value === 0 ? next() : send()
}

function formatRoomEmployment(data: RoomData[]): Room[] {
  return data
    .map(({
      id,
      name,
      period_time
    }) => ({
      id,
      name,
      periodTime: sortPeriod(filterPeriod(formatPeriod(period_time)))
    }))
}

function sortPeriod(periodData: RoomPeriod[]): RoomPeriod[] {
  return periodData
    .sort((a, b) => a.start.isBefore(b.start) ? -1 : a.start.isAfter(b.start) ? 1 : 0)
}

function filterPeriod(periodData: RoomPeriod[]): RoomPeriod[] {
  return periodData
    .filter(({ start, end }) => {
      const format = 'DD.MM.YYYY'
      const currentDay = secondStepData.value.date?.format(format)
      return start.format(format) === currentDay && end.format(format) === currentDay
    })
}

function formatPeriod(periodData: RoomData['period_time']): RoomPeriod[] {
  return periodData
    .map(p => ({
      start: dayjs(p.start),
      end: dayjs(p.end)
    }))
}

function send() {
  const { module, groups, type, users, rooms, date, start: startTime, end: endTime } = {
    ...firstStepData.value,
    ...secondStepData.value
  }
  const makeRequest = isEditing.value ? ax.put : ax.post
  const path = isEditing.value ? `/sessions/${props.session!.id}/` : '/sessions/new/'
  const start: string = date!.hour(startTime!.hour()).minute(startTime!.minute()).second(0).toISOString()
  const end: string = date!.hour(endTime!.hour()).minute(endTime!.minute()).second(0).toISOString()
  const params: RequestData = {
    module,
    type: type as number,
    users,
    rooms,
    start,
    end,
    groups,
  }

  makeRequest<ResponseData, AxiosResponse<ResponseData, RequestData>, RequestData>(path, params)
    .then(() => {
      notification.success({
        message: '',
        description: t('dataSavedSuccessfully'),
      })
      emit('submit')
      close()
    })
    .catch(handleError)
}

function back() {
  step.value === 1 && step.value--
}

function next() {
  step.value === 0 && step.value++
}

function disabledStartTime() {
  const day = secondStepData.value.date?.isoWeekday().toString()
  if (systemSettings.value && day) {
    const startTime = secondStepData.value.date?.date() === dayjs().date()
      ? _.max([systemSettings.value.workingModes[day].startWork, dayjs()])
      : systemSettings.value.workingModes[day].startWork
    const endTime = secondStepData.value.end || systemSettings.value.workingModes[day].endWork

    if (startTime && endTime) {
      return getDisabledTimes(startTime, endTime)
    } else {
      return {}
    }
  } else {
    return {}
  }
}

function disabledEndTime() {
  const day = secondStepData.value.date?.isoWeekday().toString()
  if (systemSettings.value && day) {
    const startTime = secondStepData.value.start || systemSettings.value.workingModes[day].startWork
    const endTime = systemSettings.value.workingModes[day].endWork

    if (startTime && endTime) {
      return getDisabledTimes(startTime, endTime)
    } else {
      return {}
    }
  } else {
    return {}
  }
}

function disabledDate(current: Dayjs) {
  return current && current < dayjs().subtract(1, 'day').endOf('day')
}

function dateValidator(_rule: Rule, value: Dayjs) {
  return new Promise<void>((resolve, reject) => {
    if (disabledDate(value)) {
      reject(t('incorrectDate'))
    } else {
      resolve()
    }
  })
}
</script>

<template>
  <eos-modal
    v-model:open="isOpen"
    destroyOnClose
    width="761px"
    dropdown-class-name="session-form"
    :footer="null"
    :title="session?.module || t('sessionCreation')"
    @cancel="close"
  >
    <eos-steps
      class="session-form__steps"
      :current="step"
      :items="[
        { title: t('basicData') },
        { title: t('sessionTime') },
      ]"
    ></eos-steps>

    <a-form
      v-show="step === 0"
      class="session-form__step"
      name="session-form-first-step"
      :model="firstStepData"
      :rules="firstStepRules"
      @finish="next"
    >
      <eos-form-item
        name="type"
        :label="t('lessonType')"
      >
        <eos-radio
          v-model:value="firstStepData.type"
          flex-direction="row"
          name="session-type"
          :options="typeList"
          :value-getter="t => t?.id"
        >
          <template v-slot:label="{ active, value }">
            <eos-button
              size="large"
              :type="active ? 'primary' : 'outline'"
            >
              {{ t(value.name) }}
            </eos-button>
          </template>
        </eos-radio>
      </eos-form-item>

      <eos-form-item
        name="module"
        :label="t('module')"
      >
        <eos-input
          v-model:value="firstStepData.module"
          size="large"
          style="width: 713px;"
          :placeholder="t('enterTheNameOfTheLearningModule')"
        />
      </eos-form-item>

      <eos-form-item
        v-if="firstStepData.type !== 1"
        name="groups"
        :label="t('learningGroup')"
      >
        <eos-select
          v-model:value="firstStepData.groups"
          size="large"
          mode="multiple"
          style="width: 713px;"
          optionFilterProp="name"
          :allowClear="true"
          :options="groupList"
          :field-names="fieldNames"
        />
      </eos-form-item>

      <eos-form-item
        name="users"
        :label="t('teacher')"
      >
        <eos-select
          v-model:value="firstStepData.users"
          size="large"
          mode="multiple"
          style="width: 713px;"
          optionFilterProp="name"
          :allowClear="true"
          :options="teacherList"
          :field-names="fieldNames"
        />
      </eos-form-item>

      <eos-button
        size="large"
        type="primary"
        html-type="submit"
        style="margin-right: 24px; width: 131px;"
      >
        {{ t('continue') }}
      </eos-button>

      <eos-button
        size="large"
        type="outline"
        style="width: 106px;"
        @click="close"
      >
        {{ t('cancel') }}
      </eos-button>
    </a-form>

    <a-form
      v-show="step === 1"
      class="session-form__step"
      name="session-form-second-step"
      :model="secondStepData"
      :rules="secondStepRules"
      @finish="onFinish"
    >
      <eos-form-item
        name="date"
        :label="t('sessionDate')"
      >
        <eos-date-picker
          v-model:value="secondStepData.date"
          style="width: 380px;"
          :disabledDate="disabledDate"
        />
      </eos-form-item>

      <eos-form-item
        name="rooms"
        :label="t('room')"
      >
        <eos-select
          v-model:value="secondStepData.rooms"
          size="large"
          mode="multiple"
          style="width: 720px;"
          optionFilterProp="name"
          :allowClear="true"
          :options="roomList"
          :field-names="fieldNames"
        />
      </eos-form-item>

      <eos-form-item :label="t('roomEmployment')">
        <RoomEmployment
          :rooms="roomEmployment"
          :date="secondStepData.date"
        />
      </eos-form-item>

      <eos-form-item :label="t('sessionStartAndEndTime')">
        <a-row>
          <eos-form-item
            name="start"
            class="session-form__time-picker"
          >
            <eos-time-picker
              v-model:value="secondStepData.start"
              :disabledTime="disabledStartTime"
            ></eos-time-picker>
          </eos-form-item>

          <eos-form-item
            name="end"
            class="session-form__time-picker"
          >
            <eos-time-picker
              v-model:value="secondStepData.end"
              :disabledTime="disabledEndTime"
            ></eos-time-picker>
          </eos-form-item>
        </a-row>
      </eos-form-item>

      <eos-button
        size="large"
        type="primary"
        html-type="submit"
        style="margin-right: 24px; width: 131px;"
      >
        {{ t('save') }}
      </eos-button>

      <eos-button
        size="large"
        type="outline"
        style="width: 106px;"
        @click="back"
      >
        {{ t('back') }}
      </eos-button>
    </a-form>
  </eos-modal>
</template>

<style lang="scss">
.session-form {
  &__steps {
    width: 435px;
    margin: 0 auto 24px;
  }

  &__time-picker {
    width: 136px;
    margin-right: 24px;

    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
