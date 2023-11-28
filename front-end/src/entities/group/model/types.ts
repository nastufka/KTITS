import type { User } from "@/entities/user/model/types"

export interface Group {
  id: number
  name: string
  address?: string
  description?: string
  responsible?: number
  teacher?: User
  users?: User[]
  speciality?: string
}

export type GroupData = Partial<Group>

export type Speciality = string
