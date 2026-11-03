// ============ 类型定义 ============

export interface Permission {
  code: string
  name: string
  description: string
  module: string
  action: string
}

export interface Role {
  code: string
  name: string
  builtin: boolean
  description: string
  userCount: number
  permissions: string[]
}

export interface User {
  id: number
  name: string
  account: string
  email: string
  roles: string[]
  status: 'on' | 'off'
  lastLogin: string
  initials: string
}

export interface Identity {
  key: string
  name: string
  account: string
  roleLabel: string
  roleCode: string | null
  superuser: boolean
  permissions: string[]
}

export interface ServiceResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface RequestParams {
  page?: number
  pageSize?: number
  keyword?: string
}

export interface PaginationParams extends RequestParams {
  sort?: string
  order?: 'asc' | 'desc'
}

// ============ 权限检查 ============

export function hasPermission(permissions: string[], permission: string): boolean {
  if (permissions.includes('*')) return true
  if (permissions.includes(permission)) return true
  const [module] = permission.split(':')
  return permissions.includes(`${module}:*`)
}

export function canEditMatrix(userPermissions: string[], rolePermissions: string[]): boolean {
  return hasPermission(userPermissions, 'role:assign') && !rolePermissions.includes('*')
}

export function getModulePermissions(permissions: string[], module: string): string[] {
  return permissions.filter(p => p.startsWith(`${module}:`) || p === '*')
}
