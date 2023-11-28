import axios from 'axios'

import { getCookie } from './cookieConfig'

export const ax = axios.create({
  baseURL: import.meta.env.DEV ? import.meta.env.VITE_TEST_SERVER_URL : import.meta.env.VITE_API_URL,
})

ax.interceptors.request.use(
  config => {
    if (config.url !== '/login/') {
      config.headers['Authorization'] = `Token ${getCookie('authToken')}`
    }
    return config
  },
  function(error) {
    console.error(error)
  }
)
