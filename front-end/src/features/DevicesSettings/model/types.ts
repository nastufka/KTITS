import type { Camera } from '@/entities/camera/model/types'

export type DeviceSettingsMode = 'control' | 'connectionSettings'

export interface DeviceItemSettingsProps {
  device: Camera
  mode?: 'collapse' | 'modal'
}