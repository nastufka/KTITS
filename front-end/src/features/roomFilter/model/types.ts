import type { User } from '@/entities/user/model/types'
import type { RoomNames } from '@/entities/room/model/types'
import type { LabeledValue } from 'ant-design-vue/es/select'

export interface RoomFilter {
  roomNames: (number | string)[]
  responsibleUsers: (number | string)[]
}