import type { Dayjs } from 'dayjs'

import type { Session } from '@/entities/session/model/types'

export interface SessionsGroupedByHour {
  [key: number]: Session[]
}

export interface SessionsGroupedByDate {
  [key: string]: Session[]
}

export interface ColorsGroupedByModule {
  [key: string]: string
}

export interface ScheduleEmits {
  (e: 'sessionClick', session: Session): void
}

export interface ScheduleModeEmits extends ScheduleEmits {
  (e: 'calendarClick', date: Dayjs, time?: Dayjs): void
}

export interface EmitDateClick {
  (e: 'dateClick', date: Dayjs): void
}

export interface MonthScheduleEmits extends ScheduleModeEmits, EmitDateClick {}
