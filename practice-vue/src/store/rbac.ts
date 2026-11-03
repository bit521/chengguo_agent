import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Identity, User, Role, Permission, NavGroup } from '@/services/rbac/types'
import {
  authService, userService, roleService, permissionService,
  checkPermission, NAV_GROUPS, PERMISSIONS, ROLES,
} from '@/services/rbac'

export const useRbacStore = defineStore('rbac', () => {
  // State
  const identity = ref<Identity | null>(null)
  const currentUser = ref<User | null>(null)
  const roles = ref<Role[]>([])
  const permissions = ref<Permission[]>([])
  const isLoading = ref(false)
  const isSuperuser = computed(() => identity.value?.superuser ?? false)

  // Getters
  const isLoggedIn = computed(() => !!identity.value)
  const roleLabel = computed(() => identity.value?.roleLabel ?? '')
  const roleCode = computed(() => identity.value?.roleCode ?? null)
  const userPermissions = computed(() => identity.value?.permissions ?? [])
  const permissionCount = computed(() => userPermissions.value.length)

  // 权限检查
  const hasPerm = (perm: string) => checkPermission(userPermissions.value, perm)
  const hasRole = (roleCode: string) => identity.value?.roles?.includes(roleCode) ?? false

  // 菜单过滤
  const filteredNavGroups = computed<NavGroup[]>(() => {
    return NAV_GROUPS
      .map(group => ({
        ...group,
        items: group.items.filter(item => {
          if (item.superOnly) return isSuperuser.value
          if (item.perm) return hasPerm(item.perm)
          return true
        }),
      }))
      .filter(group => group.items.length > 0)
  })

  // Actions
  async function login(username: string, password: string) {
    isLoading.value = true
    try {
      const result = await authService.mockLogin({ username, password })
      identity.value = result.identity
      currentUser.value = result.user
      localStorage.setItem('token', result.token)
      sessionStorage.setItem('cg_rbac_identity', JSON.stringify(result.identity))
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    identity.value = null
    currentUser.value = null
    localStorage.removeItem('token')
    sessionStorage.removeItem('cg_rbac_identity')
  }

  async function init() {
    const token = localStorage.getItem('token')
    if (!token) return
    isLoading.value = true
    try {
      const result = await authService.mockGetCurrentUser(token)
      identity.value = result.identity
      currentUser.value = result.user
      // 加载角色和权限数据
      const [rolesRes, permsRes] = await Promise.all([
        roleService.list(),
        permissionService.list(),
      ])
      roles.value = rolesRes.items
      permissions.value = permsRes.items
    } catch {
      await logout()
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUsers(params?: Parameters<typeof userService.list>[0]) {
    const result = await userService.list(params)
    return result
  }

  async function fetchRoles(params?: Parameters<typeof roleService.list>[0]) {
    const result = await roleService.list(params)
    return result
  }

  async function fetchPermissions(params?: Parameters<typeof permissionService.list>[0]) {
    const result = await permissionService.list(params)
    return result
  }

  async function assignUserRoles(userId: number, roles: string[]) {
    return userService.assignRoles(userId, roles)
  }

  async function assignRolePermissions(roleCode: string, permissions: string[]) {
    return roleService.assignPermissions(roleCode, permissions)
  }

  return {
    identity,
    currentUser,
    roles,
    permissions,
    isLoading,
    isLoggedIn,
    isSuperuser,
    roleLabel,
    roleCode,
    userPermissions,
    permissionCount,
    hasPerm,
    hasRole,
    filteredNavGroups,
    login,
    logout,
    init,
    fetchUsers,
    fetchRoles,
    fetchPermissions,
    assignUserRoles,
    assignRolePermissions,
  }
})
