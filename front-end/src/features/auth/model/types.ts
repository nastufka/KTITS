export interface LoginData {
  id: number
  token?: string
  name?: string
  role_id?: number
  role_name?: string
  error?: 'login' | 'password'
}
