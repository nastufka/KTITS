import { ax } from '@/shared/api/common'
import type { AxiosResponse } from 'axios'

export interface Period {
  start?: string
  end?: string 
}

export const getWorkloadData = async <T>(roomId: number, period: Period): Promise<T> => {
  const res: AxiosResponse<T> = await ax.get(`/rooms/${roomId}/study_workload/`, { params: period })
  return await res.data
}