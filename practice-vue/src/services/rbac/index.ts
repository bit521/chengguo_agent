import { config } from '@/config'
import type {
  Permission, Role, User, Identity, RequestParams, ServiceResponse,
  LoginRequest, LoginResult,
} from './types'
import { hasPermission } from './types'
import {
  PERMISSIONS, ROLES, USERS, IDENTITIES, NAV_GROUPS,
} from './data'
import {
  rbacUserService, rbacRoleService, rbacPermissionService,
  mockLogin, mockGetCurrentUser, checkPermission,
} from './mock'

export { PERMISSIONS, ROLES, USERS, IDENTITIES, NAV_GROUPS, hasPermission, checkPermission }
export type { Permission, Role, User, Identity, RequestParams, ServiceResponse, LoginRequest, LoginResult }

// ============ 统一导出 ============

export const userService = rbacUserService
export const roleService = rbacRoleService
export const permissionService = rbacPermissionService
export const authService = { mockLogin, mockGetCurrentUser }

// ============ API 客户端（预留真实接口）============

export const apiClient = {
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
    if (config.useMock) {
      // Mock模式：直接返回数据
      await new Promise(r => setTimeout(r, 50 + Math.random() * 100))
      return null as T
    }
    throw new Error('Real API not yet implemented')
  },
  post: async <T>(url: string, data?: unknown): Promise<T> => {
    if (config.useMock) {
      await new Promise(r => setTimeout(r, 50 + Math.random() * 100))
      return null as T
    }
    throw new Error('Real API not yet implemented')
  },
}
