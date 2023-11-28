import { ax } from '@/shared/api/common'

export const getRoles = async() => {
  const res = await ax.get(`/roles/`)
  return res
}