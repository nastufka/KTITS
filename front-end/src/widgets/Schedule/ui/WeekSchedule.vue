<script setup lang="ts">
import type { Dayjs } from 'dayjs'
import { ref, onMounted } from 'vue'

import { hasPermission } from '@/features/auth/lib'
import type { Session } from '@/entities/session/model/types'
import { PermissionEnum } from '@/features/auth/model/permissions'

import type { ColorsGroupedByModule, SessionsGroupedByHour } from '../model/types'

import {
  getSessionRooms,
  getSessionPeriod,
  isSessionFinished,
  scrollToCurrentHour,
} from '../lib'

interface WeekScheduleEmits {
  (e: 'dateClick', date: Dayjs): void
  (e: 'sessionClick', session: Session): void
  (e: 'calendarClick', date: Dayjs, time?: Dayjs): void
}

export interface WeekScheduleProps {
  currentDate: Dayjs
  workingHours: Dayjs[]
  sessions: SessionsGroupedByHour
  colorsGroupedByModule: ColorsGroupedByModule
}

const emit = defineEmits<WeekScheduleEmits>()
defineProps<WeekScheduleProps>()

const hourRef = ref<HTMLElement[]>([])

function sessionClick(session: Session) {
  emit('sessionClick', session)
}

function calendarClick(date: Dayjs, time: Dayjs) {
  emit('calendarClick', date, time)
}

function dateClick(date: Dayjs) {
  emit('dateClick', date)
}

onMounted(() => {
  scrollToCurrentHour(hourRef.value)
})
</script>

<template>
  <div class="week-schedule">
    <div class="week-schedule__cell week-schedule__cell_hour"></div>
    <div
      v-for="day in 7"
      class="week-schedule__cell week-schedule__cell_day"
      @click="dateClick(currentDate.day(day))"
    >
      <span class="week-schedule__date">
        {{ currentDate.day(day).format('dd. DD.MM') }}
      </span>
    </div>

    <template v-for="(hour, i) in workingHours">
      <div
        ref="hourRef"
        class="week-schedule__cell week-schedule__cell_hour"
        :id="hour.hour().toString()"
      >
        {{ hour.format('HH:mm') }}
      </div>
      
      <div
        v-for="day in 7"
        class="week-schedule__sessions"
        :class="{
          'week-schedule__sessions_last-column': day === 7,
          'week-schedule__sessions_last-row': i === workingHours.length - 1
        }"
        @click="calendarClick(currentDate.day(day), hour)"
      >
        <div
          v-for="session in sessions[hour.hour()]"
          v-show="(session.start as Dayjs).day() === day"
          class="week-schedule__session"
          :style="{ background: colorsGroupedByModule[session.module] }"
          :class="{
            'week-schedule__session-finished': isSessionFinished(session),
            'week-schedule__session_no-click': !hasPermission([PermissionEnum.CAN_READ_SESSIONS]),
          }"
          @click.stop="hasPermission([PermissionEnum.CAN_READ_SESSIONS]) && sessionClick(session)"
        >
          <b class="week-schedule__session-time">
            {{ getSessionPeriod(session) }}
          </b>

          <span class="week-schedule__session-name">
            &nbsp;{{ session.module }}
          </span>

          <br><br>

          <div class="week-schedule__session-rooms">
            {{ getSessionRooms(session.rooms) }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
.week-schedule {
  display: grid;
  overflow: auto;
  height: 100%;
  grid-template-columns: .5fr repeat(7, 1fr);
  gap: 9px;

  &__cell {
    padding: 16px;
    background-color: var(--sc-base-6);
    position: relative;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;

    &::after {
      content: '';
      height: 100%;
      width: 100%;
      position: absolute;
      border-radius: 12px;
      border: 1px solid var(--sc-base-4);
      pointer-events: none;
    }

    &_hour,
    &_day {
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--sc-base-2);
      font-size: 19px;
      font-weight: 500;
      line-height: 26px;
    }

    &_day {
      position: sticky;
      top: 0;
      z-index: 1;
      cursor: pointer;

      &:hover {
        .week-schedule__date {
          background-color: var(--sc-base-13);
        }
      }
    }
  }

  &__date {
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
    color: inherit;
    padding: 0 4px;
    border-radius: 12px;
  }

  &__sessions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;

    &::after {
      content: '';
      width: 1px;
      height: calc(100% + 9px);
      background: var(--sc-base-4);
      position: absolute;
      right: -5px;
    }

    &_last-column {
      &::after {
        display: none;
      }
    }

    &_last-row {
      &::after {
        height: 100%;
      }
    }
  }

  &__session,
  &__session-time,
  &__session-name,
  &__session-rooms {
    font-size: 13px;
    line-height: 20px;
  }

  &__session {
    border-radius: 12px;
    padding: 12px;
    cursor: pointer;

    &_no-click {
      cursor: initial;
    }
  }

  &__session-rooms {
    color: var(--sc-base-2);
  }

  &__session-finished {
    opacity: 0.68;
  }
}
</style>
