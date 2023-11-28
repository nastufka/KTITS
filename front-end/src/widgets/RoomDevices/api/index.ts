import { ax } from '@/shared/api/common'
import type { AxiosResponse } from 'axios'
import type { Room } from '@/entities/room/model/types'
import type { Camera } from '@/entities/camera/model/types'

interface RoomsResponse {
  rooms: Room
}

export const getDeviceList = async (roomId: number): Promise<Camera[]> => {
  const res: AxiosResponse<RoomsResponse> = await ax.get(`/rooms/${roomId}/`)
  return res.data.rooms.devices
}

export const removeDevice = async (roomId: number, deviceId: number): Promise<void> => {
  return await ax.delete(`/rooms/${roomId}/devices/`, { data: { device: deviceId } })
}