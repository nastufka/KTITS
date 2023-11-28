import type { Dayjs } from 'dayjs'

import { dayjs } from '@/shared/api/common'
import type { Room } from '@/entities/room/model/types'
import type { Session } from '@/entities/session/model/types'

export function isSessionFinished(session: Session): boolean {
  const COMPLETED_STATUS_ID = 3
  const CANCELED_STATUS_ID = 4
  return session.status.id === COMPLETED_STATUS_ID || session.status.id === CANCELED_STATUS_ID
}

export function getSessionDate(session: Session): string {
  const start = session.start as Dayjs
  return start.format('DD.MM.YYYY')
}

export function getSessionPeriod(session: Session): string {
  return `${dayjs(session.start).format('HH:mm')} - ${dayjs(session.end).format('HH:mm')}`
}

export function getSessionRooms(rooms: Room[]): string {
  return rooms.map(r => r.name).join(', ')
}

export function scrollToCurrentHour(hourElements: HTMLElement[]) {
  const currentHour = dayjs().hour().toString()
  const hourElement = hourElements.find(el => el.id === currentHour)
  hourElement?.scrollIntoView({ behavior: 'smooth' })
}
