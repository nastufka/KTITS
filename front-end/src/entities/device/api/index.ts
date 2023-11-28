import { ax } from '@/shared/api/common'
import type { DeviceType, DeviceStatus } from '../model/types'

const deviceTypesToCheck: DeviceType['id'][] = [1, 2]

export const checkDeviceStatus = async (id: number, type: DeviceType | undefined): Promise<DeviceStatus> => {
  if (deviceTypesToCheck.includes(type!.id)) {
    try {
      const res = await ax.post<boolean>(`/devices/${id}/check`)
      return {
        isLoading: false,
        isConnect: res.data
      }
    } catch {
      return {
        isLoading: false,
        isConnect: false
      }
    }
    
  } else {
    return {
      isLoading: false,
      isConnect: true
    }
  }
}