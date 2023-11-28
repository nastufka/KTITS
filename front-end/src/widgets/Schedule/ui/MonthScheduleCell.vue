<script setup lang="ts">
import{ ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Dayjs } from 'dayjs'

import CloseIcon from '@/shared/icons/CloseIcon.vue'
import { hasPermission } from '@/features/auth/lib'
import type { Session } from '@/entities/session/model/types'
import { PermissionEnum } from '@/features/auth/model/permissions'

import { getSessionPeriod } from '../lib'
import type { ColorsGroupedByModule, SessionsGroupedByDate } from '../model/types'

interface MonthScheduleCellEmits {
  (e: 'expand', date: Dayjs): void
  (e: 'dateClick', date: Dayjs): void
  (e: 'sessionClick', session: Session): void
  (e: 'calendarClick', date: Dayjs, time?: Dayjs): void
}

interface MonthScheduleCellProps {
  day: Dayjs
  currentDate: Dayjs
  sessionHeight: number
  currentlyExpandedDay?: Dayjs
  sessions: SessionsGroupedByDate
  colorsGroupedByModule: ColorsGroupedByModule
}

const { t } = useI18n({})

const emit = defineEmits<MonthScheduleCellEmits>()
const props = defineProps<MonthScheduleCellProps>()

const cellPadding: number = 8
const sessionMarginTop: number = 1
const initialCellHeight: number = 60
const sessionsTop: number = cellPadding * 2 + props.sessionHeight + sessionMarginTop

const collapsed = ref<boolean>(true)

const cellSessions = computed<Session[]>(() => props.sessions[props.day.format('DD.MM.YYYY')] || [])

const sessionsHeight = computed<number>(() => {
  return cellSessions.value.length === 0
    ? 0
    : cellSessions.value.length === 1
      ? sessionMarginTop + props.sessionHeight
      : (sessionMarginTop + props.sessionHeight) * 3
})

const showMoreButton = computed<boolean>(() => cellSessions.value.length > 2)

const minCellHeight = computed<number>(() => {
  return cellSessions.value.length === 0
    ? initialCellHeight
    : props.sessionHeight + cellPadding * 3 + sessionsHeight.value
})

const isInCurrentMonth = computed<boolean>(() => {
  return props.currentDate.month() === props.day.month()
})

watch(() => props.currentDate, collapse)
watch(() => props.currentlyExpandedDay, currentlyExpandedDay => {
  if (currentlyExpandedDay && !props.day.isSame(currentlyExpandedDay)) {
    collapse()
  }
})

function dateClick(date: Dayjs) {
  emit('dateClick', date)
}

function sessionClick(session: Session) {
  emit('sessionClick', session)
}

function calendarClick(date: Dayjs) {
  emit('calendarClick', date)
}

function expand() {
  collapsed.value = false
  emit('expand', props.day)
}

function collapse() {
  collapsed.value = true
}
</script>

<template>
  <div
    class="month-schedule-cell"
    :class="{ 'month-schedule-cell_collapsed': collapsed }"
    :style="{
      padding: `${cellPadding * 2}px ${cellPadding}px ${cellPadding}px`,
      minHeight: minCellHeight,
    }"
    @click="calendarClick(day)"
  >
    <div
      class="month-schedule-cell__day"
      @click.stop="dateClick(day)"
      :style="{
        height: sessionHeight,
        opacity: isInCurrentMonth ? 1 : .64,
      }"
    >
      {{ day.format('DD.MM.YYYY') }}
    </div>
    
    <div
      v-show="!collapsed"
      class="month-schedule-cell__close"
      :style="{ top: cellPadding * 2, right: cellPadding }"
      @click.stop="collapse"
    >
      <close-icon />
    </div>

    <div
      class="month-schedule-cell__sessions"
      :style="{
        top: sessionsTop,
        zIndex: collapsed ? 0 : 2,
        height: collapsed ? sessionsHeight : 'auto',
        padding: `0 ${cellPadding}px ${cellPadding}px`
      }"
    >
      <div
        v-for="(session, i) in cellSessions"
        v-show="!collapsed || i < 2"
        class="month-schedule-cell__session"
        :class="{ 'month-schedule-cell__session_no-click': !hasPermission([PermissionEnum.CAN_READ_SESSIONS]) }"
        :title="session.module"
        :style="{
          height: sessionHeight,
          marginTop: sessionMarginTop,
          opacity: isInCurrentMonth ? 1 : .64,
          background: colorsGroupedByModule[session.module]
        }"
        @click.stop="hasPermission([PermissionEnum.CAN_READ_SESSIONS]) && sessionClick(session)"
      >
        <b>{{ getSessionPeriod(session) }}</b>
        {{ session.module }}
      </div>

      <div
        v-if="showMoreButton && collapsed"
        class="month-schedule-cell__more"
        :style="{
          opacity: isInCurrentMonth ? 1 : .64,
        }"
        @click.stop="expand"
      >
        {{ `${t('more')} ${cellSessions.length - 2}` }}
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.month-schedule-cell {
  display: flex;
  align-items: center;
  flex-direction: column;
  min-height: 60px;
  background: var(--sc-base-6);
  position: relative;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;

  &::after {
    content: '';
    position: absolute;
    height: 100%;
    width: 100%;
    border: 1px solid var(--sc-base-4);
    border-radius: 12px;
    pointer-events: none;
    top: 0;
    left: 0;
    z-index: 1;
  }

  &_collapsed {
    .month-schedule-cell__sessions::after {
      display: none;
    }
  }

  &_header {
    position: sticky;
    top: 0;
    z-index: 2;
    justify-content: center;
  }
  
  &__day {
    font-size: 19px;
    font-weight: 500;
    line-height: 28px;
    color: var(--sc-base-2);
    border-radius: 12px;
    padding: 0 4px;
    cursor: pointer;

    &:hover {
      background-color: var(--sc-base-13);
    }
  }

  &__close {
    position: absolute;
    height: 24px;
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.16);
    cursor: pointer;

    path {
      fill: var(--sc-base-6);
    }
  }

  &__sessions {
    overflow: hidden;
    position: absolute;
    width: 100%;
    background: var(--sc-base-6);
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      height: 100%;
      width: 100%;
      border-left: 1px solid var(--sc-base-4);
      border-right: 1px solid var(--sc-base-4);
      border-bottom: 1px solid var(--sc-base-4);
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
      pointer-events: none;
      top: 0;
      left: 0;
    }
  }

  &__session {
    padding: 3px 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: 12px;
    cursor: pointer;

    &, b {
      font-size: 13px;
      line-height: 20px;
    }

    &_no-click {
      cursor: initial;
    }
  }

  &__more {
    cursor: pointer;
    font-size: 13px;
    font-weight: 800;
    line-height: 20px;
    margin-top: 1px;
    padding: 3px 4px;
    width: fit-content;
  }
}
</style>
