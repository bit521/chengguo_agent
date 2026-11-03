import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useRbacStore } from '@/store/rbac'
import { hasPermission } from '@/services/rbac/types'
import type { Identity } from '@/services/rbac/types'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/pages/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/pages/Dashboard.vue'),
        meta: { title: '工作台' },
      },
      {
        path: 'agents',
        name: 'AgentList',
        component: () => import('@/pages/agent/List.vue'),
        meta: { title: 'Agent 管理', perm: 'agent:list' },
      },
      {
        path: 'agents/create',
        name: 'AgentCreate',
        component: () => import('@/pages/agent/Create.vue'),
        meta: { title: '创建 Agent', perm: 'agent:create' },
      },
      {
        path: 'agents/:id',
        name: 'AgentDetail',
        component: () => import('@/pages/agent/Detail.vue'),
        meta: { title: 'Agent 详情', perm: 'agent:list' },
      },
      {
        path: 'models',
        name: 'ModelList',
        component: () => import('@/pages/model/List.vue'),
        meta: { title: '模型管理', perm: 'model:list' },
      },
      {
        path: 'prompts',
        name: 'PromptList',
        component: () => import('@/pages/prompt/List.vue'),
        meta: { title: 'Prompt 管理', perm: 'prompt:list' },
      },
      {
        path: 'knowledge',
        name: 'KnowledgeList',
        component: () => import('@/pages/knowledge/List.vue'),
        meta: { title: '知识库管理', perm: 'knowledge:list' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/pages/settings/Index.vue'),
        meta: { title: '系统设置' },
      },
      // RBAC 模块路由
      {
        path: 'rbac',
        component: () => import('@/pages/rbac/Layout.vue'),
        redirect: '/rbac/dashboard',
        children: [
          {
            path: 'dashboard',
            name: 'RbacDashboard',
            component: () => import('@/pages/rbac/Dashboard.vue'),
            meta: { title: '工作台' },
          },
          {
            path: 'users',
            name: 'RbacUsers',
            component: () => import('@/pages/rbac/Users.vue'),
            meta: { title: '用户管理', perm: 'user:list' },
          },
          {
            path: 'roles',
            name: 'RbacRoles',
            component: () => import('@/pages/rbac/Roles.vue'),
            meta: { title: '角色管理', perm: 'role:list' },
          },
          {
            path: 'permissions',
            name: 'RbacPermissions',
            component: () => import('@/pages/rbac/Permissions.vue'),
            meta: { title: '权限管理', perm: 'permission:list' },
          },
          {
            path: 'agents',
            name: 'RbacAgents',
            component: () => import('@/pages/rbac/Agents.vue'),
            meta: { title: 'Agent 管理', perm: 'agent:list' },
          },
          {
            path: 'models',
            name: 'RbacModels',
            component: () => import('@/pages/rbac/Models.vue'),
            meta: { title: '模型管理', perm: 'model:list' },
          },
          {
            path: 'prompts',
            name: 'RbacPrompts',
            component: () => import('@/pages/rbac/Prompts.vue'),
            meta: { title: 'Prompt 管理', perm: 'prompt:list' },
          },
          {
            path: 'knowledge',
            name: 'RbacKnowledge',
            component: () => import('@/pages/rbac/Knowledge.vue'),
            meta: { title: '知识库管理', perm: 'knowledge:list' },
          },
          {
            path: 'tools',
            name: 'RbacTools',
            component: () => import('@/pages/rbac/Tools.vue'),
            meta: { title: '工具管理', perm: 'tool:list' },
          },
          {
            path: 'forbidden',
            name: 'RbacForbidden',
            component: () => import('@/pages/rbac/Forbidden.vue'),
            meta: { title: '权限不足' },
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: { title: '登录', guest: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 辰光 Agent 平台` : '辰光 Agent 平台'

  // 检查是否需要登录
  const isAuthenticated = localStorage.getItem('token') !== null
  const store = useRbacStore()

  if (!to.meta.guest && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // 检查权限
  if (to.meta.perm && isAuthenticated) {
    const token = localStorage.getItem('token') || ''
    // 在 mock 模式下，需要先从 session 获取身份
    const storedIdentity = sessionStorage.getItem('cg_rbac_identity')
    if (storedIdentity) {
      const identity = JSON.parse(storedIdentity) as Identity
      if (!hasPermission(identity.permissions, to.meta.perm as string)) {
        next({ name: 'RbacForbidden', query: { from: to.fullPath, need: to.meta.perm, title: to.meta.title } })
        return
      }
    } else if (store.isLoggedIn && !store.hasPerm(to.meta.perm as string)) {
      next({ name: 'RbacForbidden', query: { from: to.fullPath, need: to.meta.perm, title: to.meta.title } })
      return
    }
  }

  next()
})

export default router
