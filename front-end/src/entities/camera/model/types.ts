import type { Room } from '@/entities/room/model/types'

export type LoginParams = {
  ip: string | undefined,
  port: number | string,
  login: string | undefined,
  password: string | undefined,
  protocol: number,
  camId: number,
  order?: number
}
export interface Camera {
  id: number,
  name?: string,
  room?: number,
  rooms?: Room[],
  login?: string,
  password?: string,
  ip?: string,
  port?: string,
  control?: boolean,
  created_at?: string,
  updated_at?: string,
  type?: DeviceType,
  active?: boolean,
  order?: number,
  volume?: number,
  muted?: boolean,
  image?: string,
  voice?: boolean,
  sound?: boolean,
  path?: string,
  src?: string,
  streamConnected?: boolean,
  pluginConnected?: boolean,
  streamObject?: any,
  serialNumber?: string,
}

interface DeviceType {
  id: number,
  name: string
}