<script setup lang="ts">
import { ref } from 'vue'
import * as _ from 'lodash-es'
import type { Dayjs } from 'dayjs'

import { dayjs } from '@/shared/api/common'
import type { Session } from '@/entities/session/model/types'

import MonthScheduleCell from './MonthScheduleCell.vue'

import type {
  MonthScheduleEmits,
  SessionsGroupedByDate,
  ColorsGroupedByModule,
} from '../model/types'


export interface MonthScheduleProps {
  currentDate: Dayjs
  daysOfMonth: Dayjs[]
  sessions: SessionsGroupedByDate
  colorsGroupedByModule: ColorsGroupedByModule
}

const emit = defineEmits<MonthScheduleEmits>()
defineProps<MonthScheduleProps>()

const sessionHeight: number = 26

const currentlyExpandedDay = ref<Dayjs>()

function dateClick(date: Dayjs) {
  emit('dateClick', date)
}

function sessionClick(session: Session) {
  emit('sessionClick', session)
}

function calendarClick(date: Dayjs) {
  emit('calendarClick', date)
}

function handleExpand(day: Dayjs) {
  currentlyExpandedDay.value = day
}
</script>

<template>
  <div class="month-schedule">
    <div v-for="day in 7" class="month-schedule__header-cell">
      <div class="month-schedule__day" :style="{ height: sessionHeight }">
        {{ _.capitalize(dayjs().day(day).format('dddd')) }}
      </div>
    </div>

    <month-schedule-cell
      v-for="(day, i) in daysOfMonth"
      :day="day"
      :sessions="sessions"
      :currentDate="currentDate"
      :sessionHeight="sessionHeight"
      :style="{ zIndex: daysOfMonth.length - i }"
      :currentlyExpandedDay="currentlyExpandedDay"
      :colorsGroupedByModule="colorsGroupedByModule"
      @expand="handleExpand"
      @date-click="dateClick"
      @session-click="sessionClick"
      @calendar-click="calendarClick"
    />
  </div>
</template>

<style lang="scss">
.month-schedule {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;

  &__header-cell {
    display: flex;
    align-items: center;
    flex-direction: column;
    min-height: 60px;
    background: var(--sc-base-6);
    position: relative;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    position: sticky;
    top: 0;
    z-index: 53;
    justify-content: center;

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
  }

  &__day {
    font-size: 19px;
    font-weight: 500;
    line-height: 28px;
    color: var(--sc-base-2);
    border-radius: 12px;
    padding: 0 4px;
  }
}
</style>
