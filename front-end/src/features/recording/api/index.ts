import { ax } from '@/shared/api/common'

export const recording = async<T>(
    sessionId: number,
    action: string,
    devices: T,
    room_id: number,
    record: number | undefined,
    user_id: number | string | undefined
  ) => {
  const res = await ax.post(`/sessions/${sessionId}/${action}`, { devices, room_id, record, user_id } )
  return res
}