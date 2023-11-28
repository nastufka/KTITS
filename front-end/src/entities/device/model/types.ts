import type { Room } from '@/entities/room/model/types'

export interface Device {
  id: number,
  name?: string,
  rooms?: Room[],
  login?: string,
  password?: string,
  ip?: string,
  port?: string,
  control?: boolean,
  type?: DeviceType,
  voice?: boolean,
  sound?: boolean,
  path?: string,
  isConnect?: boolean,
}

export interface DeviceType {
  id: number,
  name: string
}

export interface DeviceStatus {
  isLoading: boolean
  isConnect: boolean
}

export enum DeviceTypes {
  Camera = 1,
  ScreenCapture = 2,
  Simulator = 3,
}
