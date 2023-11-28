import { ax } from '@/shared/api/common'
import type { AxiosResponse } from 'axios'

export const getDevices = async (): Promise<AxiosResponse> => {
  return await ax.get('/devices/')
}
export const addDevicesToRoom = async (roomId: number, devices: number[]): Promise<AxiosResponse> => {
  return await ax.post(`/rooms/${roomId}/devices/`, { devices })
}