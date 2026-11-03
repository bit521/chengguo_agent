import type { Permission, Role, User, Identity, RequestParams, ServiceResponse } from './types'
import { PERMISSIONS, ROLES, USERS, IDENTITIES } from './data'
import { hasPermission } from './types'

// ============ 深拷贝，避免修改原始数据 ============
function clone<T>(t: T): T {
  return JSON.parse(JSON.stringify(t))
}

let _permissions: Permission[] = clone(PERMISSIONS)
let _roles: Role[] = clone(ROLES)
let _users: User[] = clone(USERS)
let _mockIdentity: Identity | null = null

// ============ Mock 身份认证 ============

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResult {
  identity: Identity
  user: User
  token: string
}

export async function mockLogin({ username, password }: LoginRequest): Promise<LoginResult> {
  await delay(150 + Math.random() * 200)
  const factory = IDENTITIES[username]
  if (!factory) throw new Error(`账号 "${username}" 不存在`)
  const { identity, user } = factory(username)
  return {
    identity,
    user,
    token: `mock_token_${Date.now()}`,
  }
}

export async function mockGetCurrentUser(token: string): Promise<{ identity: Identity; user: User }> {
  await delay(80)
  if (!token.startsWith('mock_token_')) throw new Error('无效 token')
  // 从模块级变量中恢复身份（测试环境使用）
  if (_mockIdentity) {
    const user = _users.find(u => u.account === _mockIdentity!.account)
    if (user) return { identity: _mockIdentity, user }
  }
  // 默认超级管理员
  return IDENTITIES['admin']('admin')
}

// 测试用：设置模拟身份
export function setMockIdentity(identity: Identity) {
  _mockIdentity = identity
}

// ============ 权限检查 ============

export function checkPermission(permissions: string[], perm: string): boolean {
  return hasPermission(permissions, perm)
}

// ============ 分页工具 ============

function paginate<T>(items: T[], params: RequestParams): ServiceResponse<T> {
  let filtered = items
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = items.filter(item =>
      JSON.stringify(item).toLowerCase().includes(kw)
    )
  }
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const total = filtered.length
  const start = (page - 1) * pageSize
  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  }
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============ 用户服务 ============

export interface UserService {
  list(params?: RequestParams): Promise<ServiceResponse<User>>
  getById(id: number): Promise<User>
  create(data: Omit<User, 'id'>): Promise<User>
  update(id: number, data: Partial<User>): Promise<User>
  delete(id: number): Promise<void>
  assignRoles(userId: number, roles: string[]): Promise<User>
}

export const rbacUserService: UserService = {
  async list(params) {
    await delay(100 + Math.random() * 150)
    return paginate(_users, params ?? {})
  },
  async getById(id) {
    await delay(50)
    const user = _users.find(u => u.id === id)
    if (!user) throw new Error(`用户 ${id} 不存在`)
    return clone(user)
  },
  async create(data) {
    await delay(100)
    const newUser: User = {
      id: Math.max(..._users.map(u => u.id)) + 1,
      ...data,
      status: 'on' as const,
      lastLogin: '-',
      initials: data.name.charAt(0),
    }
    _users.push(newUser)
    return clone(newUser)
  },
  async update(id, data) {
    await delay(80)
    const idx = _users.findIndex(u => u.id === id)
    if (idx === -1) throw new Error(`用户 ${id} 不存在`)
    _users[idx] = { ..._users[idx], ...data }
    return clone(_users[idx])
  },
  async delete(id) {
    await delay(50)
    const idx = _users.findIndex(u => u.id === id)
    if (idx !== -1) _users.splice(idx, 1)
  },
  async assignRoles(userId, roles) {
    await delay(100)
    const idx = _users.findIndex(u => u.id === userId)
    if (idx === -1) throw new Error(`用户 ${userId} 不存在`)
    _users[idx] = { ..._users[idx], roles }
    return clone(_users[idx])
  },
}

// ============ 角色服务 ============

export interface RoleService {
  list(params?: RequestParams): Promise<ServiceResponse<Role>>
  getById(code: string): Promise<Role>
  create(data: Omit<Role, 'userCount'>): Promise<Role>
  update(code: string, data: Partial<Role>): Promise<Role>
  delete(code: string): Promise<void>
  assignPermissions(roleCode: string, permissions: string[]): Promise<Role>
}

export const rbacRoleService: RoleService = {
  async list(params) {
    await delay(80)
    return paginate(_roles, params ?? {})
  },
  async getById(code) {
    await delay(50)
    const role = _roles.find(r => r.code === code)
    if (!role) throw new Error(`角色 "${code}" 不存在`)
    return clone(role)
  },
  async create(data) {
    await delay(100)
    const newRole: Role = {
      ...data,
      builtin: false,
      userCount: 0,
    }
    _roles.push(newRole)
    return clone(newRole)
  },
  async update(code, data) {
    await delay(80)
    const idx = _roles.findIndex(r => r.code === code)
    if (idx === -1) throw new Error(`角色 "${code}" 不存在`)
    _roles[idx] = { ..._roles[idx], ...data }
    return clone(_roles[idx])
  },
  async delete(code) {
    await delay(50)
    const role = _roles.find(r => r.code === code)
    if (!role) throw new Error(`角色 "${code}" 不存在`)
    if (role.builtin) throw new Error('内置角色不可删除')
    const idx = _roles.findIndex(r => r.code === code)
    if (idx !== -1) _roles.splice(idx, 1)
  },
  async assignPermissions(roleCode, permissions) {
    await delay(100)
    const idx = _roles.findIndex(r => r.code === roleCode)
    if (idx === -1) throw new Error(`角色 "${roleCode}" 不存在`)
    _roles[idx] = { ..._roles[idx], permissions }
    return clone(_roles[idx])
  },
}

// ============ 权限服务 ============

export interface PermissionService {
  list(params?: RequestParams): Promise<ServiceResponse<Permission>>
  getById(code: string): Promise<Permission>
  create(data: Omit<Permission, 'module' | 'action'>): Promise<Permission>
  update(code: string, data: Pick<Permission, 'name' | 'description'>): Promise<Permission>
  delete(code: string): Promise<void>
  getByModule(module: string): Promise<Permission[]>
  getAffectedRoles(permissionCode: string): Promise<string[]>
}

export const rbacPermissionService: PermissionService = {
  async list(params) {
    await delay(80)
    return paginate(_permissions, params ?? {})
  },
  async getById(code) {
    await delay(50)
    const perm = _permissions.find(p => p.code === code)
    if (!perm) throw new Error(`权限 "${code}" 不存在`)
    return clone(perm)
  },
  async create(data) {
    await delay(100)
    const parts = data.code.split(':')
    const newPerm: Permission = {
      ...data,
      module: parts[0] ?? data.module,
      action: parts[1] ?? data.action,
    }
    _permissions.push(newPerm)
    return clone(newPerm)
  },
  async update(code, data) {
    await delay(80)
    const idx = _permissions.findIndex(p => p.code === code)
    if (idx === -1) throw new Error(`权限 "${code}" 不存在`)
    _permissions[idx] = { ..._permissions[idx], ...data }
    return clone(_permissions[idx])
  },
  async delete(code) {
    await delay(50)
    const idx = _permissions.findIndex(p => p.code === code)
    if (idx !== -1) _permissions.splice(idx, 1)
    // 同时从所有角色的权限列表中移除
    for (const role of _roles) {
      if (role.permissions.includes(code)) {
        role.permissions = role.permissions.filter(p => p !== code)
      }
    }
  },
  async getByModule(module) {
    await delay(50)
    return _permissions.filter(p => p.module === module).map(clone)
  },
  async getAffectedRoles(permissionCode) {
    await delay(50)
    return _roles
      .filter(r => r.permissions.includes(permissionCode) || r.permissions.includes('*'))
      .map(r => r.code)
  },
}
