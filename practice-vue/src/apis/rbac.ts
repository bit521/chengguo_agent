import type { AxiosResponse } from 'axios'
import axios from 'axios'
import { config } from '../config'

// Mock axios adapter for testing
const mockAdapter = {
  request: async (config: any) => {
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))
    return { data: { code: 200, message: 'success', data: null } } as AxiosResponse
  },
}

export const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.timeout,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
