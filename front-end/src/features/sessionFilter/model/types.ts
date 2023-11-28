export interface SessionFilter {
  rooms?: number[]
  groups?: number[]
  users?: number[]
  type?: number[]
  status?: number[]
  startDate?: string
  startTime?: string
  endDate?: string
  endTime?: string
  isClear?: boolean
}
