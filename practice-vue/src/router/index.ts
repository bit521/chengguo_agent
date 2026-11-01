import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

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
        meta: { title: 'Agent 管理' },
      },
      {
        path: 'agents/create',
        name: 'AgentCreate',
        component: () => import('@/pages/agent/Create.vue'),
        meta: { title: '创建 Agent' },
      },
      {
        path: 'agents/:id',
        name: 'AgentDetail',
        component: () => import('@/pages/agent/Detail.vue'),
        meta: { title: 'Agent 详情' },
      },
      {
        path: 'models',
        name: 'ModelList',
        component: () => import('@/pages/model/List.vue'),
        meta: { title: '模型管理' },
      },
      {
        path: 'prompts',
        name: 'PromptList',
        component: () => import('@/pages/prompt/List.vue'),
        meta: { title: 'Prompt 管理' },
      },
      {
        path: 'knowledge',
        name: 'KnowledgeList',
        component: () => import('@/pages/knowledge/List.vue'),
        meta: { title: '知识库管理' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/pages/settings/Index.vue'),
        meta: { title: '系统设置' },
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
  document.title = to.meta.title ? `${to.meta.title} - Vue 前端框架` : 'Vue 前端框架'

  // 检查是否需要登录
  const isAuthenticated = localStorage.getItem('token') !== null
  if (!to.meta.guest && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
