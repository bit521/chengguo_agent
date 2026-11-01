import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { config } from '../config'

// 响应数据结构
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 分页数据结构
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// 请求参数
export interface RequestParams {
  page?: number
  pageSize?: number
  keyword?: string
}

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message, data } = response.data

    if (code === 200) {
      return data as Awaited<typeof data>
    }

    // 业务错误处理
    return Promise.reject(new Error(message || '请求失败'))
  },
  (error) => {
    const { response } = error

    if (response?.status === 401) {
      // Token 过期，清除并跳转登录
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

// 导出请求方法
export const api = {
  get: <T = unknown>(url: string, params?: Record<string, unknown>) =>
    request.get<ApiResponse<T>>(url, { params }).then((res) => res as T),

  post: <T = unknown>(url: string, data?: unknown) =>
    request.post<ApiResponse<T>>(url, data).then((res) => res as T),

  put: <T = unknown>(url: string, data?: unknown) =>
    request.put<ApiResponse<T>>(url, data).then((res) => res as T),

  delete: <T = unknown>(url: string) =>
    request.delete<ApiResponse<T>>(url).then((res) => res as T),
}

export default request
