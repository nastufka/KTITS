import type { Dayjs } from 'dayjs'

interface WorkingMode {
  isWorking?: boolean
  startWork?: Dayjs
  endWork?: Dayjs
  startLunch?: Dayjs
  endLunch?: Dayjs
  noLunch?: boolean
}

export interface SystemSettings {
  centerName: string
  workingModes: {
    [key: string | number]: WorkingMode
  }
}

interface WorkingModeResponse {
  is_working: boolean
  start_work: string
  end_work: string
  start_lunch: string
  end_lunch: string
  no_lunch: boolean
}

export interface SystemSettingsResponse {
  center_name: string
  working_modes: {
    [key: string]: WorkingModeResponse
  }
}
