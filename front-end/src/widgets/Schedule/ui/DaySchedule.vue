<script setup lang="ts">
import type { Dayjs } from 'dayjs'
import { useI18n } from 'vue-i18n'
import { ref, onMounted } from 'vue'

import type { Session } from '@/entities/session/model/types'

import type { ColorsGroupedByModule, SessionsGroupedByHour } from '../model/types'

import {
  getSessionDate,
  getSessionRooms,
  getSessionPeriod,
  isSessionFinished,
  scrollToCurrentHour,
} from '../lib'
import { hasPermission } from '@/features/auth/lib'
import { PermissionEnum } from '@/features/auth/model/permissions'

interface DayScheduleEmits {
  (e: 'sessionClick', session: Session): void
  (e: 'calendarClick', date: Dayjs, time?: Dayjs): void
}

export interface DayScheduleProps {
  currentDate: Dayjs
  workingHours: Dayjs[]
  sessions: SessionsGroupedByHour
  colorsGroupedByModule: ColorsGroupedByModule
}

const { t } = useI18n({})

const emit = defineEmits<DayScheduleEmits>()
const props = defineProps<DayScheduleProps>()

const hourRef = ref<HTMLElement[]>([])

function sessionClick(session: Session) {
  emit('sessionClick', session)
}

function calendarClick(time: Dayjs) {
  emit('calendarClick', props.currentDate, time)
}

function getSessionType(session: Session): string {
  return t(session.type.name)
}

function getSessionGroups(session: Session): string {
  return session.groups.map(g => g.name).join(', ')
}

onMounted(() => {
  scrollToCurrentHour(hourRef.value)
})
</script>

<template>
  <div class="day-schedule__rows">
    <div class="day-schedule__header">
      <div class="day-schedule__header-empty"></div>
      <div class="day-schedule__header-columns">
        <div class="day-schedule__header-date-time">{{ t('dateAndTime') }}</div>
        <div class="day-schedule__header-type">{{ t('sessionType') }}</div>
        <div class="day-schedule__header-name">{{ t('nameOfTheLearningModule') }}</div>
        <div class="day-schedule__header-groups">{{ t('group') }}</div>
        <div class="day-schedule__header-room">{{ t('room') }}</div>
      </div>
    </div>

    <div
      v-for="hour in workingHours"
      class="day-schedule__row"
      @click="calendarClick(hour)"
    >
      <div
        ref="hourRef"
        class="day-schedule__cell day-schedule__cell_hour"
        :id="hour.hour().toString()"
      >
        {{ hour.format('HH:mm') }}
      </div>

      <div class="day-schedule__sessions">
        <div
          v-for="session in sessions[hour.hour()]"
          class="day-schedule__cell day-schedule__cell_session"
          :class="{ 'day-schedule__cell_no-click': !hasPermission([PermissionEnum.CAN_READ_SESSIONS]) }"
          @click.stop="hasPermission([PermissionEnum.CAN_READ_SESSIONS]) && sessionClick(session)"
        >
          <div
            class="day-schedule__session-color"
            :style="{ background: colorsGroupedByModule[session.module] }"
          ></div>

          <div class="day-schedule__session-date-time">
            <div
              class="day-schedule__session-date"
              :class="{ 'day-schedule__session-finished': isSessionFinished(session) }"
            >
              {{ getSessionDate(session) }}
            </div>

            <div
              class="day-schedule__session-time"
              :class="{ 'day-schedule__session-finished': isSessionFinished(session) }"
            >
              {{ getSessionPeriod(session) }}
            </div>
          </div>

          <div
            class="day-schedule__session-type"
            :class="{ 'day-schedule__session-finished': isSessionFinished(session) }"
          >
            {{ getSessionType(session) }}
          </div>

          <div
            class="day-schedule__session-name"
            :class="{ 'day-schedule__session-finished': isSessionFinished(session) }"
          >
            {{ session.module }}
          </div>

          <div
            class="day-schedule__session-groups"
            :class="{ 'day-schedule__session-finished': isSessionFinished(session) }"
          >
            {{ getSessionGroups(session) }}
          </div>

          <div
            class="day-schedule__session-rooms"
            :class="{ 'day-schedule__session-finished': isSessionFinished(session) }"
          >
            {{ getSessionRooms(session.rooms) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.day-schedule {
  &__header {
    display: flex;
    margin-bottom: 8px;
    position: sticky;
    top: 0;
    z-index: 3;
    background: var(--sc-base-6);
  }

  &__header-empty {
    margin-right: 12px;
    width: 100px;
  }

  &__header-columns {
    display: flex;
    flex: 1;
  }

  &__header-date-time,
  &__session-date-time {
    width: 18%;
  }

  &__header-type,
  &__session-type {
    width: 10%;
  }

  &__session-date {
    width: 46%;
  }

  &__session-time {
    width: 54%;
  }

  &__header-name,
  &__session-name {
    width: 40%;
  }

  &__header-groups,
  &__session-groups {
    width: 13%;
  }

  &__header-room,
  &__session-rooms {
    width: 21%;
  }

  &__header-date-time,
  &__header-type,
  &__header-name,
  &__header-room,
  &__header-groups {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 13px;
    font-weight: 800;
    line-height: 20px; 
  }

  &__cell {
    color: var(--sc-base-2);
    font-size: 19px;
    font-weight: 500;
    line-height: 28px;
    min-height: 44px;
    display: flex;
    align-items: center;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    padding: 10px 0;

    &::after {
      content: '';
      height: 100%;
      width: 100%;
      position: absolute;
      left: 0;
      border: 1px solid var(--sc-base-4);
      border-radius: 12px;
      pointer-events: none;
    }

    &_hour {
      width: 100px;
      margin-right: 12px;
      justify-content: center;
      z-index: 2;
    }

    &_session {
      width: 100%;
      margin-bottom: 8px;
      position: relative;
      cursor: pointer;

      &:last-child {
        margin-bottom: 0;
      }

      &:not(.day-schedule__cell_no-click):hover {
        background: var(--sc-base-5);

        .day-schedule__session-name {
          color: var(--sc-base-7);
          text-decoration-line: underline;
        }
      }
    }

    &_no-click {
      cursor: initial;
    }
  }

  &__rows {
    overflow: auto;
    height: 100%;
  }

  &__row {
    display: flex;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__sessions {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &__session-color {
    position: absolute;
    left: 0;
    width: 6px;
    border-radius: 12px 0px 0px 12px;
    height: 100%;
    z-index: 1;
  }

  &__session-date,
  &__session-time,
  &__session-name,
  &__session-rooms {
    font-size: 15px;
    line-height: 24px;
    padding: 0 16px;
  }

  &__session-date-time {
    display: flex;
  }

  &__session-date {
    color: var(--sc-base-2);
    font-weight: 800;
    padding-left: 22px;
  }

  &__session-time {
    font-weight: 800;
  }

  &__session-finished {
    color: var(--sc-base-2);
  }
}
</style>
