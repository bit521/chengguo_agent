import { describe, it, expect } from 'vitest'
import { PERMISSIONS, ROLES, USERS, IDENTITIES } from '@/services/rbac/data'
import { rbacUserService, rbacRoleService, rbacPermissionService, mockLogin, mockGetCurrentUser, setMockIdentity } from '@/services/rbac/mock'
import { hasPermission, canEditMatrix, getModulePermissions } from '@/services/rbac/types'

// ============ 权限工具函数测试 ============

describe('Permission Utilities', () => {
  it('should return true for wildcard permission', () => {
    expect(hasPermission(['*'], 'user:list')).toBe(true)
    expect(hasPermission(['*'], 'agent:delete')).toBe(true)
  })

  it('should return true for exact permission match', () => {
    expect(hasPermission(['user:list'], 'user:list')).toBe(true)
    expect(hasPermission(['agent:delete'], 'agent:delete')).toBe(true)
  })

  it('should return true for module wildcard', () => {
    expect(hasPermission(['agent:*'], 'agent:list')).toBe(true)
    expect(hasPermission(['agent:*'], 'agent:create')).toBe(true)
    expect(hasPermission(['agent:*'], 'agent:delete')).toBe(true)
  })

  it('should return false for missing permission', () => {
    expect(hasPermission(['user:list'], 'agent:delete')).toBe(false)
    expect(hasPermission([], 'anything')).toBe(false)
  })

  it('should return false when no matching module wildcard', () => {
    expect(hasPermission(['user:*'], 'agent:list')).toBe(false)
  })
})

describe('canEditMatrix', () => {
  it('should allow editing when role has assign permission and no wildcard', () => {
    expect(canEditMatrix(['role:assign'], ['agent:list'])).toBe(true)
  })

  it('should deny editing when role has wildcard', () => {
    expect(canEditMatrix(['role:assign'], ['*'])).toBe(false)
  })

  it('should deny editing when user lacks role:assign', () => {
    expect(canEditMatrix([], ['agent:list'])).toBe(false)
  })
})

describe('getModulePermissions', () => {
  it('should return all permissions for a module', () => {
    const result = getModulePermissions(['agent:list', 'agent:create', 'model:list'], 'agent')
    expect(result).toEqual(['agent:list', 'agent:create'])
  })

  it('should include wildcard', () => {
    const result = getModulePermissions(['*'], 'agent')
    expect(result).toContain('*')
  })
})

// ============ Mock 数据验证 ============

describe('Mock Data', () => {
  it('should have exactly 40 permissions', () => {
    expect(PERMISSIONS).toHaveLength(40)
  })

  it('should have 4 roles', () => {
    expect(ROLES).toHaveLength(4)
  })

  it('should have admin with wildcard permission', () => {
    const admin = ROLES.find(r => r.code === 'admin')
    expect(admin).toBeDefined()
    expect(admin!.permissions).toEqual(['*'])
  })

  it('should have operator with 14 permissions', () => {
    const operator = ROLES.find(r => r.code === 'operator')
    expect(operator).toBeDefined()
    expect(operator!.permissions).toHaveLength(14)
  })

  it('should have auditor with 8 permissions', () => {
    const auditor = ROLES.find(r => r.code === 'auditor')
    expect(auditor).toBeDefined()
    expect(auditor!.permissions).toHaveLength(8)
  })

  it('should have users data', () => {
    expect(USERS).toHaveLength(7)
  })
})

// ============ Mock 认证服务测试 ============

describe('Mock Auth Service', () => {
  it('should login as admin and return superuser identity', async () => {
    const result = await mockLogin({ username: 'admin', password: 'any' })
    expect(result.identity.superuser).toBe(true)
    expect(result.identity.permissions).toContain('*')
    expect(result.token).toBeTruthy()
    expect(result.user.account).toBe('admin')
  })

  it('should login as operator', async () => {
    const result = await mockLogin({ username: 'zhang.lan', password: 'any' })
    expect(result.identity.superuser).toBe(false)
    expect(result.identity.roleCode).toBe('operator')
    expect(result.identity.permissions).toHaveLength(14)
  })

  it('should login as auditor', async () => {
    const result = await mockLogin({ username: 'zhou.ning', password: 'any' })
    expect(result.identity.superuser).toBe(false)
    expect(result.identity.roleCode).toBe('auditor')
    expect(result.identity.permissions).toHaveLength(8)
  })

  it('should login as none (no role)', async () => {
    const result = await mockLogin({ username: 'chen.mo', password: 'any' })
    expect(result.identity.superuser).toBe(false)
    expect(result.identity.roleCode).toBeNull()
    expect(result.identity.permissions).toHaveLength(0)
  })

  it('should throw error for non-existent user', async () => {
    await expect(mockLogin({ username: 'unknown', password: 'any' }))
      .rejects.toThrow('不存在')
  })

  it('should get current user with valid token', async () => {
    const { token } = await mockLogin({ username: 'admin', password: 'any' })
    // Store identity in module-level variable (not available in Node)
    setMockIdentity({ key: 'super', name: '林恪', account: 'admin', roleLabel: '超级管理员', roleCode: 'admin', superuser: true, permissions: ['*'] })
    const result = await mockGetCurrentUser(token)
    expect(result.identity.superuser).toBe(true)
  })

  it('should throw error for invalid token', async () => {
    await expect(mockGetCurrentUser('invalid_token')).rejects.toThrow('无效 token')
  })
})

// ============ Mock 用户服务测试 ============

describe('Mock User Service', () => {
  it('should list all users', async () => {
    const result = await rbacUserService.list()
    expect(result.items).toHaveLength(7)
    expect(result.total).toBe(7)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(20)
  })

  it('should paginate users', async () => {
    const result = await rbacUserService.list({ page: 1, pageSize: 3 })
    expect(result.items).toHaveLength(3)
    expect(result.total).toBe(7)
  })

  it('should search users by keyword', async () => {
    const result = await rbacUserService.list({ keyword: '张' })
    expect(result.items.some(u => u.name.includes('张'))).toBe(true)
    expect(result.total).toBeGreaterThan(0)
  })

  it('should get user by id', async () => {
    const user = await rbacUserService.getById(1)
    expect(user.id).toBe(1)
    expect(user.name).toBe('林恪')
  })

  it('should throw error for non-existent user', async () => {
    await expect(rbacUserService.getById(9999)).rejects.toThrow('不存在')
  })

  it('should create a new user', async () => {
    const newUser = await rbacUserService.create({
      name: '测试用户',
      account: 'test.user',
      email: 'test@example.com',
      roles: [],
    })
    expect(newUser.id).toBeGreaterThan(0)
    expect(newUser.name).toBe('测试用户')
    expect(newUser.status).toBe('on')
  })

  it('should update a user', async () => {
    const updated = await rbacUserService.update(1, { name: '更新后的名字' })
    expect(updated.name).toBe('更新后的名字')
  })

  it('should delete a user', async () => {
    const before = await rbacUserService.list()
    await rbacUserService.delete(before.items[before.items.length - 1].id)
    const after = await rbacUserService.list()
    expect(after.total).toBe(before.total - 1)
  })

  it('should assign roles to user', async () => {
    const updated = await rbacUserService.assignRoles(1, ['admin', 'operator'])
    expect(updated.roles).toEqual(['admin', 'operator'])
  })
})

// ============ Mock 角色服务测试 ============

describe('Mock Role Service', () => {
  it('should list all roles', async () => {
    const result = await rbacRoleService.list()
    expect(result.items).toHaveLength(4)
    expect(result.total).toBe(4)
  })

  it('should get role by code', async () => {
    const role = await rbacRoleService.getById('admin')
    expect(role.code).toBe('admin')
    expect(role.builtin).toBe(true)
  })

  it('should throw error for non-existent role', async () => {
    await expect(rbacRoleService.getById('nonexistent')).rejects.toThrow('不存在')
  })

  it('should create a new role', async () => {
    const newRole = await rbacRoleService.create({
      code: 'test_role',
      name: '测试角色',
      description: '用于测试的角色',
      permissions: ['agent:list'],
    })
    expect(newRole.code).toBe('test_role')
    expect(newRole.builtin).toBe(false)
    expect(newRole.userCount).toBe(0)
  })

  it('should update a role', async () => {
    const updated = await rbacRoleService.update('test_role', { name: '更新后的角色名' })
    expect(updated.name).toBe('更新后的角色名')
  })

  it('should not allow deleting builtin role', async () => {
    await expect(rbacRoleService.delete('admin')).rejects.toThrow('内置角色不可删除')
  })

  it('should delete a custom role', async () => {
    const before = await rbacRoleService.list()
    await rbacRoleService.delete('test_role')
    const after = await rbacRoleService.list()
    expect(after.total).toBe(before.total - 1)
  })

  it('should assign permissions to role', async () => {
    const updated = await rbacRoleService.assignPermissions('operator', ['agent:list', 'agent:create'])
    expect(updated.permissions).toContain('agent:list')
    expect(updated.permissions).toContain('agent:create')
  })
})

// ============ Mock 权限服务测试 ============

describe('Mock Permission Service', () => {
  it('should list all permissions', async () => {
    const result = await rbacPermissionService.list({ pageSize: 50 })
    expect(result.items).toHaveLength(40)
    expect(result.total).toBe(40)
  })

  it('should paginate permissions', async () => {
    const result = await rbacPermissionService.list({ page: 1, pageSize: 10 })
    expect(result.items).toHaveLength(10)
    expect(result.total).toBe(40)
  })

  it('should search permissions by keyword', async () => {
    const result = await rbacPermissionService.list({ keyword: '查看' })
    expect(result.total).toBeGreaterThan(0)
    expect(result.items.some(p => p.name.includes('查看'))).toBe(true)
  })

  it('should get permission by code', async () => {
    const perm = await rbacPermissionService.getById('agent:list')
    expect(perm.code).toBe('agent:list')
    expect(perm.module).toBe('agent')
    expect(perm.action).toBe('list')
  })

  it('should throw error for non-existent permission', async () => {
    await expect(rbacPermissionService.getById('nonexistent')).rejects.toThrow('不存在')
  })

  it('should create a new permission', async () => {
    const newPerm = await rbacPermissionService.create({
      code: 'test:test',
      name: '测试权限',
      description: '用于测试的权限',
    })
    expect(newPerm.code).toBe('test:test')
    expect(newPerm.module).toBe('test')
    expect(newPerm.action).toBe('test')
  })

  it('should update permission name and description', async () => {
    const updated = await rbacPermissionService.update('test:test', {
      name: '更新后的名称',
      description: '更新后的描述',
    })
    expect(updated.name).toBe('更新后的名称')
    expect(updated.description).toBe('更新后的描述')
  })

  it('should delete a permission', async () => {
    const before = await rbacPermissionService.list()
    await rbacPermissionService.delete('test:test')
    const after = await rbacPermissionService.list()
    expect(after.total).toBe(before.total - 1)
  })

  it('should get permissions by module', async () => {
    const perms = await rbacPermissionService.getByModule('agent')
    expect(perms.every(p => p.module === 'agent')).toBe(true)
    expect(perms.length).toBeGreaterThan(0)
  })

  it('should get affected roles for a permission', async () => {
    const roles = await rbacPermissionService.getAffectedRoles('agent:list')
    expect(roles.length).toBeGreaterThan(0)
    expect(roles).toContain('admin')
  })
})
