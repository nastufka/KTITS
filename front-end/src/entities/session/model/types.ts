import type { Dayjs } from 'dayjs'

import type { Room } from '@/entities/room/model/types'
import type { User } from '@/entities/user/model/types'
import type { Group } from '@/entities/group/model/types'

export interface Session {
  id: number,
  type: SessionType,
  start: string | Dayjs,
  end: string | Dayjs,
  status: SessionStatus,
  module: string,
  rooms: Room[],
  groups: Group[],
  users: User[],
}

export type SessionData = Partial<Session>

export interface SessionType {
  id: number
  name: string
}

export interface SessionStatus {
  id: number
  name: string
}

export type SessionDisplayTypes = 'page' | 'widget'

export enum SessionStatusEnum {
  Planned = 1,
  Going,
  Completed,
  Canceled,
}
