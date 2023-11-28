<script setup lang="ts">
import * as _ from 'lodash-es'
import { useI18n } from 'vue-i18n'
import type { Dayjs } from 'dayjs'
import { ref, watch, computed, onBeforeMount } from 'vue'

import EosCard from '@/shared/ui/EosCard'
import EosRadio from '@/shared/ui/EosRadio'
import EosButton from '@/shared/ui/EosButton'
import EosSearch from '@/shared/ui/EosSearch'
import SessionForm from '@/features/sessionForm/ui'
import { hasPermission } from '@/features/auth/lib'
import { useGlobalStore } from '@/stores/globalStore'
import type { User } from '@/entities/user/model/types'
import { UserRoles } from '@/features/auth/model/roles'
import sessionColors from '@/entities/session/model/colors'
import ArrowIconLeft from '@/shared/icons/ArrowIconLeft.vue'
import { useUserStore } from '@/entities/user/model/userStore'
import { ax, dayjs, scheduleModeKey } from '@/shared/api/common'
import HasPermission from '@/features/auth/ui/HasPermission.vue'
import { PermissionEnum } from '@/features/auth/model/permissions'
import type { Session, SessionData } from '@/entities/session/model/types'
import type { SystemSettings } from '@/entities/systemSettings/model/types'

import DaySchedule from './DaySchedule.vue'
import WeekSchedule from './WeekSchedule.vue'
import MonthSchedule from './MonthSchedule.vue'
import type {
  ScheduleEmits,
  ColorsGroupedByModule,
  SessionsGroupedByHour,
  SessionsGroupedByDate,
} from '../model/types'

enum Mode {
 Day = 'day',
 Week = 'week',
 Month = 'month'
}

interface ResponseData {
  sessions: Session[]
}

const { t } = useI18n({})
const userStore = useUserStore()
const globalStore = useGlobalStore()

const emit = defineEmits<ScheduleEmits>()

const search = ref<string>('')
const mode = ref<Mode>(Mode.Day)
const sessions = ref<Session[]>([])
const showSearch = ref<boolean>(false)
const currentDate = ref<Dayjs>(dayjs())
const newSessionData = ref<SessionData>({})
const isSessionFormOpen = ref<boolean>(false)
const abortController = ref<AbortController>()

const currentUser = computed<User>(() => userStore.currentUser)

const systemSettings = computed<SystemSettings | undefined>(() => globalStore.systemSettings)

const startHour = computed<Dayjs>(() => {
  const defaultStart = dayjs().hour(0).minute(0)
  if (mode.value === Mode.Day) {
    const currentDay: number = currentDate.value.isoWeekday()
    const startFromSettings = systemSettings.value?.workingModes[currentDay].startWork
      ?.date(currentDate.value.date())
      ?.month(currentDate.value.month())
      ?.year(currentDate.value.year())
    const sessionStarts: Dayjs[] = sessions.value.map(s => s.start) as Dayjs[]
    const min = startFromSettings
      ? _.minBy([...sessionStarts, startFromSettings])
      : _.minBy(sessionStarts)
    return min || defaultStart
  } else if (mode.value === Mode.Week) {
    const sessionStarts: Dayjs[] = sessions.value.map(s => s.start as Dayjs)
    const settingStarts: Dayjs[] = Object.values(systemSettings.value?.workingModes || {}).map(m => m.startWork as Dayjs)
    return _.minBy([...sessionStarts, ...settingStarts], s => s.date(dayjs().date()).valueOf()) as Dayjs || defaultStart
  } else {
    return defaultStart
  }
})

const endHour = computed<Dayjs>(() => {
  const defaultEnd = dayjs().hour(23).minute(59)
  if (mode.value === Mode.Day) {
    const currentDay: number = currentDate.value.isoWeekday()
    const endFromSettings = systemSettings.value?.workingModes[currentDay].endWork
      ?.date(currentDate.value.date())
      ?.month(currentDate.value.month())
      ?.year(currentDate.value.year())
    const sessionStarts: Dayjs[] = sessions.value
      .map(s => {
        const start = s.start as Dayjs
        return start.minute() === 0 ? start.add(1, 'hour') : s.start as Dayjs
      })
    const max = endFromSettings
      ? _.maxBy([...sessionStarts, endFromSettings])
      : _.maxBy(sessionStarts)
    return max || defaultEnd
  } else if (mode.value === Mode.Week) {
    const sessionStarts: Dayjs[] = sessions.value.map(s => s.start as Dayjs)
    const settingEnds: Dayjs[] = Object.values(systemSettings.value?.workingModes || {}).map(m => m.endWork as Dayjs)
    return _.maxBy([...sessionStarts, ...settingEnds], s => s.date(dayjs().date()).valueOf()) as Dayjs || defaultEnd
  } else {
    return defaultEnd
  }
})

const title = computed<string>(() => {
  if (showSearch.value) {
    return t('search')
  } else {
    if (mode.value === Mode.Day) {
      return currentDate.value.format('DD MMMM YYYY')
    } else {
      return _.capitalize(currentDate.value.format('MMMM YYYY'))
    }
  }
})

const workingHours = computed<Dayjs[]>(() => {
  const start = startHour.value.hour()
  const end = endHour.value.minute() === 0 ? endHour.value.hour() : endHour.value.hour() + 1
  return _.range(start, end === 0 ? 24 : end)
    .map(hour => dayjs().hour(hour).minute(0))
})

const filteredSessions = computed<Session[]>(() => {
  const searchByName = (s: Session): boolean => s.module.toLowerCase().includes(search.value.toLowerCase())
  return search.value
   ? sessions.value.filter(searchByName)
   : sessions.value
})

const sessionsGroupedByHour = computed<SessionsGroupedByHour>(() => {
  return _.groupBy(filteredSessions.value, ({ start }) => (start as Dayjs).hour())
})

const sessionsGroupedByDate = computed<SessionsGroupedByDate>(() => {
  return _.groupBy(filteredSessions.value, ({ start }) => (start as Dayjs).format('DD.MM.YYYY'))
})

const colorsGroupedByModule = computed<ColorsGroupedByModule>(() => {
  const colorsGroupedByModule: ColorsGroupedByModule = {}

  _.uniqBy(sessions.value, session => session.module)
    .forEach(({ module }, i) => {
      colorsGroupedByModule[module] = sessionColors[i % sessionColors.length]
    })

  return colorsGroupedByModule
})

const daysOfMonth = computed<Dayjs[]>(() => {
  const daysOfMonth: Dayjs[] = []
  const firstDay: Dayjs = currentDate.value.startOf('month')
  const firstWeek: number = firstDay.isoWeek()
  const lastWeek = firstWeek + 6

  for (let week = firstWeek; week < lastWeek; week++) {
    for (let day = 1; day < 8; day++) {
      daysOfMonth.push(firstDay.isoWeek(week).isoWeekday(day))
    }
  }

  return daysOfMonth
})

function formatSessions(sessions: Session[]): Session[] {
  return sessions
    .map(({ start, end, ...session }) => ({
      ...session,
      start: dayjs(start),
      end: dayjs(end)
    }))
}

function getMode(value: string | null): Mode | null {
  const key = Object.keys(Mode)
    .find(key => Mode[key as keyof typeof Mode] === value)
  return key ? Mode[key as keyof typeof Mode] : null
}

function syncMode() {
  const savedMode = getMode(localStorage.getItem(scheduleModeKey))
  
  if (savedMode) {
    mode.value = savedMode
  } else {
    saveMode(mode.value)
  }
}

function saveMode(mode: Mode) {
  localStorage.setItem(scheduleModeKey, mode)
}

function getData() {
  sessions.value = []
  abortController.value?.abort()

  const controller = new AbortController()
  abortController.value = controller
  const signal = controller.signal

  let startDate: string
  let endDate: string

  if (mode.value === Mode.Day) {
    startDate = currentDate.value.format('YYYY-MM-DD')
    endDate = currentDate.value.format('YYYY-MM-DD')
  } else if (mode.value === Mode.Week) {
    startDate = currentDate.value.startOf(mode.value).format('YYYY-MM-DD')
    endDate = currentDate.value.endOf(mode.value).format('YYYY-MM-DD')
  } else {
    startDate = daysOfMonth.value[0].format('YYYY-MM-DD')
    endDate = daysOfMonth.value[daysOfMonth.value.length - 1].format('YYYY-MM-DD')
  }

  ax<ResponseData>('/sessions/start/', {
    method: 'post',
    data: {
      startDate,
      endDate,
    },
    signal
  })
    .then(r => {
      const sessionsToFormat = currentUser.value.role?.id === UserRoles.Teacher
        ? r.data.sessions.filter(s => s.users.map(u => u.id).includes(currentUser.value.id))
        : r.data.sessions
      sessions.value = formatSessions(sessionsToFormat)
    })
}

function openSessionForm(sessionData?: SessionData) {
  sessionData && (newSessionData.value = sessionData)
  isSessionFormOpen.value = true
}

function closeSessionForm() {
  isSessionFormOpen.value = false
  newSessionData.value = {}
}

function changeDate(delta: number) {
  currentDate.value = currentDate.value.add(delta, mode.value)
  getData()
}

function handleSessionClick(session: Session) {
  emit('sessionClick', session)
}

function handleCalendarClick(date: Dayjs, time?: Dayjs) {
  let start, end

  if (time) {
    start = date.hour(time.hour()).minute(time.minute())
    end = date.hour(time.hour() + 1).minute(time.minute())
  } else {
    start = date.hour(dayjs().hour()).minute(0)
    end = date.hour(dayjs().hour() + 1).minute(0)
  }
  
  hasPermission([PermissionEnum.CAN_CREATE_SESSIONS]) && openSessionForm({ start, end })
}

function handleDateClick(date: Dayjs) {
  mode.value = Mode.Day
  currentDate.value = date
}

watch(mode, mode => {
  saveMode(mode)
  getData()
})

onBeforeMount(() => {
  syncMode()
  getData()
})

defineExpose({ getData })
</script>

<template>
  <eos-card
    class="schedule"
    :hideHeadBorder="true"
    :title="`${t('schedule')}:`"
  >
    <template #extra>
      <div class="schedule__header">
        <div class="schedule__title">&nbsp;{{ title }}</div>

        <div v-show="!showSearch" class="schedule__nav-btns">
          <eos-button class="schedule__nav-btn schedule__nav-btn_left" @click="changeDate(-1)">
            <arrow-icon-left />
          </eos-button>

          <eos-button class="schedule__nav-btn schedule__nav-btn_right" @click="changeDate(+1)">
            <arrow-icon-left />
          </eos-button>
        </div>

        <eos-search
          v-model:value="search"
          v-model:show="showSearch"
          class="schedule__search"
        />

        <eos-radio
          v-model:value="mode"
          type="button"
          name="schedule-mode"
          flex-direction="row"
          :options="Object.values(Mode)"
          :label-getter="value => t(value)"
        ></eos-radio>
        
        <has-permission :permissions="[PermissionEnum.CAN_CREATE_SESSIONS]">
          <eos-button
            type="primary"
            class="schedule__create-btn"
            @click="() => openSessionForm()"
          >
            {{ t('create') }}
          </eos-button>
        </has-permission>
      </div>
    </template>

    <session-form
      v-model:open="isSessionFormOpen"
      :session="newSessionData"
      @submit="getData"
      @close="closeSessionForm"
    />
    
    <day-schedule
      v-show="mode === Mode.Day"
      :currentDate="currentDate"
      :workingHours="workingHours"
      :sessions="sessionsGroupedByHour"
      :colorsGroupedByModule="colorsGroupedByModule"
      @session-click="handleSessionClick"
      @calendar-click="handleCalendarClick"
    />

    <week-schedule
      v-show="mode === Mode.Week"
      :currentDate="currentDate"
      :workingHours="workingHours"
      :sessions="sessionsGroupedByHour"
      :colorsGroupedByModule="colorsGroupedByModule"
      @date-click="handleDateClick"
      @session-click="handleSessionClick"
      @calendar-click="handleCalendarClick"
    />

    <month-schedule
      v-show="mode === Mode.Month"
      :daysOfMonth="daysOfMonth"
      :currentDate="currentDate"
      :sessions="sessionsGroupedByDate"
      :colorsGroupedByModule="colorsGroupedByModule"
      @date-click="handleDateClick"
      @session-click="handleSessionClick"
      @calendar-click="handleCalendarClick"
    />
  </eos-card>
</template>

<style lang="scss">
.schedule {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    color: var(--sc-base-7);
    font-size: 24px;
    font-weight: 800;
    line-height: 28px;
  }

  &__nav-btn {
    &_left {
      margin-left: 10px;
    }

    &_right {
      transform: rotate(180deg);
      margin-left: 12px;
    }
  }

  &__search {
    flex: 1;
    margin: 0 16px;
  }

  &__create-btn {
    width: 112px;
    margin-left: 14px;
  }

  .ant-card-head-title {
    flex: initial;
  }

  .ant-card-extra {
    flex: 1;
  }
}
</style>
