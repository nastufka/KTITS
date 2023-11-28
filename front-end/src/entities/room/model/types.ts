import type { Dayjs } from 'dayjs'
import type { Camera } from '@/entities/camera/model/types'
import type { AnnotationItem } from '@/features/annotations/model/types'

export interface Room {
  id: number,
  name: string,
  cams?: Camera[],
  devices?: any,
  recording?: boolean,
  time?: number,
  intervalId?: number,
  studentID?: number,
  recordId?: number,
  playStatus?: PlayStatus,
  records?: RecordFile[],
  annotations?: any[],
  periodTime?: RoomPeriod[],
  videoDuration?: number,
  gridModeId?: number,
  longestRecordFileId?: number,
  devicesQuantity?: number,
  responsible?: any,
  description?: string,
  address?: string,
}

export type PlayStatus = 'play' | 'pause' | 'reset'

export interface RecordFile {
  id: number
  date: string
  userId: number
  userName: string
  userRole: number
  videos: Camera[]
  annotations: AnnotationItem[]
  video?: string[]
  hasCaptures?: boolean
}
export interface RoomPeriod {
  start: Dayjs
  end: Dayjs
}

export type RoomNames = {
  id: number,
  name: string,
  recording?: boolean
}

export interface Session {
  module: string,
  type: number,
  groups: Group[],
  users: User[],
  start: string,
  end: string,
  typeName: string
}

export interface Group {
  id: number,
  name: string,
  speciality?: string,
  teacher?: number,
  users: User[]
}

export interface User {
  id: number,
  name: string,
  email: string,
  role: number,
}

export interface DeviceType {
  id: number
  name: string
}

export type ActiveRecord = Record<string, number | null> | null
