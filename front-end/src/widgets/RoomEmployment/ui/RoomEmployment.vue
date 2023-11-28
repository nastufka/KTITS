<script setup lang="ts">
import * as _ from 'lodash-es'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Dayjs } from 'dayjs'

import { dayjs } from '@/shared/api/common'
import { useGlobalStore } from '@/stores/globalStore'
import type { Room, RoomPeriod } from '@/entities/room/model/types'
import type { SystemSettings } from '@/entities/systemSettings/model/types'

export interface RoomEmploymentProps {
  rooms: Room[]
  date: Dayjs | null
}

interface TableRoom {
  name: string
  periodTime: TableRoomPeriod[]
}

interface TableRoomPeriod {
  title: string
  width: number
  occupied?: boolean
}

const { t } = useI18n({})
const globalStore = useGlobalStore()

const props = defineProps<RoomEmploymentProps>()

const cellWidth: number = 53
const cellGap: number = 2

const currentDay = computed<number>(() => props.date?.isoWeekday() || dayjs().isoWeekday())

const systemSettings = computed<SystemSettings | undefined>(() => globalStore.systemSettings)

const periods = computed(() => {
  return props.rooms.reduce<RoomPeriod[]>((periods, room) => [...periods, ...(room.periodTime || [])], [])
})

const startHour = computed<Dayjs>(() => {
  const defaultStart = dayjs().hour(0).minute(0)
  if (!props.date) {
    return defaultStart
  }
  const startFromSettings = systemSettings.value?.workingModes[currentDay.value].startWork
    ?.date(props.date.date())
    ?.month(props.date.month())
    ?.year(props.date.year())
  const periodStarts: Dayjs[] = periods.value.map(p => p.start)
  const min = startFromSettings
    ? _.minBy([...periodStarts, startFromSettings])
    : _.minBy(periodStarts)
  return min || defaultStart
})

const endHour = computed<Dayjs>(() => {
  const defaultEnd = dayjs().hour(23).minute(59)
  if (!props.date) {
    return defaultEnd
  }
  const endFromSettings = systemSettings.value?.workingModes[currentDay.value].endWork
    ?.date(props.date.date())
    ?.month(props.date.month())
    ?.year(props.date.year())
  const periodEnds: Dayjs[] = periods.value.map(p => p.end.minute() === 0 ? p.end.add(1, 'hour') : p.end)
  const max = endFromSettings
    ? _.maxBy([...periodEnds, endFromSettings])
    : _.maxBy(periodEnds)
  return max || defaultEnd
})

const workingHours = computed<Dayjs[]>(() => {
  const start = startHour.value.hour()
  const end = endHour.value.minute() === 0 ? endHour.value.hour() : endHour.value.hour() + 1
  return _.range(start, end === 0 ? 24 : end)
    .map(hour => dayjs().hour(hour).minute(0))
})

const table = computed<TableRoom[]>(() => {
  return props.rooms.map(room => {
    const periodTime: TableRoomPeriod[] = formatPeriodsForTable(room.periodTime || [])
    const tableRoom: TableRoom = { name: room.name, periodTime }
    return tableRoom
  })
})

function mergePeriods(periodTime: RoomPeriod[]): RoomPeriod[] {
  const result: RoomPeriod[] = []
  const merged: number[] = []

  for (let i = 0; i < periodTime.length; i++) {
    if (merged.includes(i)) {
      continue
    }

    const start = periodTime[i].start
    let end = periodTime[i].end

    for (let j = i + 1; j < periodTime.length; j++) {
      const nextStart = periodTime[j].start
      const nextEnd = periodTime[j].end
      if (nextStart.isSameOrBefore(end)) {
        if (nextEnd.isAfter(end)) {
          end = nextEnd
        }
        merged.push(j)
      }
    }

    result.push({ start, end })
  }

  return result
}

function formatPeriodsForTable(periodTime: RoomPeriod[]): TableRoomPeriod[] {
  let periods: TableRoomPeriod[] = []

  workingHours.value.forEach(hour => {
    const currentHour = hour.hour()
    const hourPeriods: RoomPeriod[] = mergePeriods(periodTime)
      .filter(p => p.start.hour() <= currentHour && p.end.hour() >= currentHour)

    if (hourPeriods.length) {
      periods = periods.concat(fillHourCell(hour, hourPeriods))
    } else {
      const emptyCell: TableRoomPeriod = createTableRoomPeriod(hour, hour.hour(hour.hour() + 1))
      periods.push(emptyCell)
    }
  })

  return periods
}

function fillHourCell(hour: Dayjs, hourPeriods: RoomPeriod[]): TableRoomPeriod[] {
  const cellPeriods: TableRoomPeriod[] = []

  hourPeriods.forEach((period, i) => {
    const isFirstPeriodInCell: boolean = i === 0
    const isLastPeriodInCell: boolean = i === hourPeriods.length - 1
    const periodEndsAtThisHour: boolean = period.end.hour() === hour.hour()
    const gapAtTheStart: boolean = period.start.hour() === hour.hour() && period.start.minute() > 0

    if (isFirstPeriodInCell && gapAtTheStart) {
      const gapFiller: TableRoomPeriod = createTableRoomPeriod(hour, period.start)
      cellPeriods.push(gapFiller)
    }

    if (periodEndsAtThisHour) {
      const tablePeriod: TableRoomPeriod = createTableRoomPeriod(period.start, period.end, true)
      cellPeriods.push(tablePeriod)

      if (isLastPeriodInCell) {
        const gapFiller: TableRoomPeriod = createTableRoomPeriod(period.end, hour.hour(hour.hour() + 1))
        cellPeriods.push(gapFiller)
      } else {
        const nextStart = hourPeriods[i + 1].start
        const gapBetweenPeriods: boolean = period.end.hour() === nextStart.hour() && period.end.minute() !== nextStart.minute()

        if (gapBetweenPeriods) {
          const gapFiller: TableRoomPeriod = createTableRoomPeriod(period.end, nextStart)
          cellPeriods.push(gapFiller)
        }
      } 
    }
  })

  return cellPeriods
}

function createTableRoomPeriod(start: Dayjs, end: Dayjs, occupied?: boolean): TableRoomPeriod {
  const title: string = `${start.format('HH:mm')}-${end.format('HH:mm')}`
  const baseWidth: number = ((end.hour() - start.hour()) + (end.minute() - start.minute()) / 60) * cellWidth
  const width: number = baseWidth < cellWidth ? baseWidth - (cellGap / 2) : baseWidth
  return { title, width, occupied }
}
</script>

<template>
  <div class="room-employment">
    <div
      v-if="table.length"
      class="room-employment__table"
    >
      <div
        class="room-employment__header"
        :style="{ gap: cellGap + 'px' }"
      >
        <div
          v-for="hour in workingHours"
          class="room-employment__header-cell"
          :style="{ width: cellWidth }"
        >
          {{ hour.format('HH:mm') }}
        </div>
      </div>

      <div
        class="room-employment__room"
        v-for="room in table"
        :style="{ gap: cellGap + 'px' }"
      >
        <div class="room-employment__room-name">
          {{ room.name }}
        </div>

        <div
          v-for="{ title, width, occupied } in room.periodTime"
          class="room-employment__period"
          :title="title"
          :style="{ width }"
          :class="{ 'room-employment__period_occupied': occupied }"
        ></div>
      </div>
    </div>

    <div
      v-else
      class="room-employment__empty"
    >
      {{ t('noEmploymentMessage') }}
    </div>
  </div>
</template>

<style lang="scss">
.room-employment {
  overflow: auto;

  &__table {
    gap: 8px;
    display: flex;
    flex-direction: column;
    width: fit-content;
  }

  &__header {
    display: flex;
  }

  &__header-cell {
    color: var(--sc-base-9);
    text-align: center;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }

  &__room {
    height: 33px;
    position: relative;
    display: flex;
  }

  &__room-name {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--sc-base-2);
    font-size: 13px;
    font-weight: 800;
    line-height: 20px;
    max-width: 131px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    pointer-events: none;
  }

  &__period {
    border-radius: 6px;
    background-color: var(--sc-base-5);
    height: 100%;

    &_occupied {
      background-color: #D6E1FF;
    }
  }

  &__empty {
    color: var(--sc-base-2);
    font-size: 15px;
    font-weight: 500;
    line-height: 24px;
  }
}
</style>
