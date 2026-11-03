import type { Permission, Role, User, Identity } from './types'

// ============ 40条权限定义（与原型保持一致）============

export const PERMISSIONS: Permission[] = [
  // 用户模块 (4)
  { code: 'user:list', name: '查看用户', description: '用户列表、详情、用户角色查询', module: 'user', action: 'list' },
  { code: 'user:create', name: '创建用户', description: '新建用户', module: 'user', action: 'create' },
  { code: 'user:update', name: '修改用户', description: '预留；当前后端无编辑用户接口', module: 'user', action: 'update' },
  { code: 'user:delete', name: '删除用户', description: '删除用户', module: 'user', action: 'delete' },
  // 角色模块 (5)
  { code: 'role:list', name: '查看角色', description: '角色列表、详情、搜索', module: 'role', action: 'list' },
  { code: 'role:create', name: '创建角色', description: '新建角色', module: 'role', action: 'create' },
  { code: 'role:update', name: '修改角色', description: '编辑角色名称与描述', module: 'role', action: 'update' },
  { code: 'role:delete', name: '删除角色', description: '删除角色', module: 'role', action: 'delete' },
  { code: 'role:assign', name: '分配角色或权限', description: '给用户分配角色；给角色分配权限', module: 'role', action: 'assign' },
  // 权限模块 (4)
  { code: 'permission:list', name: '查看权限', description: '权限列表、详情、搜索', module: 'permission', action: 'list' },
  { code: 'permission:create', name: '创建权限', description: '新建权限', module: 'permission', action: 'create' },
  { code: 'permission:update', name: '修改权限', description: '编辑权限名称与描述；权限码不可改', module: 'permission', action: 'update' },
  { code: 'permission:delete', name: '删除权限', description: '删除权限并清理角色关联', module: 'permission', action: 'delete' },
  // Agent模块 (6)
  { code: 'agent:list', name: '查看Agent', description: '列表、详情、版本列表', module: 'agent', action: 'list' },
  { code: 'agent:create', name: '创建Agent', description: '新建Agent', module: 'agent', action: 'create' },
  { code: 'agent:update', name: '编辑Agent', description: '修改配置', module: 'agent', action: 'update' },
  { code: 'agent:delete', name: '删除Agent', description: '删除Agent', module: 'agent', action: 'delete' },
  { code: 'agent:publish', name: '发布Agent', description: '发布版本、回滚版本', module: 'agent', action: 'publish' },
  { code: 'agent:execute', name: '运行Agent', description: '启动、停止', module: 'agent', action: 'execute' },
  // 模型模块 (5)
  { code: 'model:list', name: '查看模型与供应商', description: '模型与供应商列表、详情', module: 'model', action: 'list' },
  { code: 'model:create', name: '添加模型与供应商', description: '新建模型或供应商', module: 'model', action: 'create' },
  { code: 'model:update', name: '编辑模型与供应商', description: '修改模型或供应商', module: 'model', action: 'update' },
  { code: 'model:delete', name: '删除模型与供应商', description: '删除模型或供应商', module: 'model', action: 'delete' },
  { code: 'model:test', name: '测试模型与供应商', description: '供应商连接测试', module: 'model', action: 'test' },
  // Prompt模块 (5)
  { code: 'prompt:list', name: '查看Prompt', description: '列表、详情、版本列表', module: 'prompt', action: 'list' },
  { code: 'prompt:create', name: '创建Prompt', description: '新建Prompt', module: 'prompt', action: 'create' },
  { code: 'prompt:update', name: '编辑Prompt', description: '修改内容与变量', module: 'prompt', action: 'update' },
  { code: 'prompt:delete', name: '删除Prompt', description: '删除Prompt', module: 'prompt', action: 'delete' },
  { code: 'prompt:publish', name: '发布Prompt', description: '发布版本、回滚版本', module: 'prompt', action: 'publish' },
  // 知识库模块 (6)
  { code: 'knowledge:list', name: '查看知识库', description: '知识库、文档、分段查询', module: 'knowledge', action: 'list' },
  { code: 'knowledge:create', name: '创建知识库', description: '新建知识库', module: 'knowledge', action: 'create' },
  { code: 'knowledge:update', name: '编辑知识库', description: '基本信息、分段与检索配置、编辑分段', module: 'knowledge', action: 'update' },
  { code: 'knowledge:delete', name: '删除知识库', description: '删除知识库、文档、分段', module: 'knowledge', action: 'delete' },
  { code: 'knowledge:upload', name: '上传文档', description: '上传文档、重试失败文档', module: 'knowledge', action: 'upload' },
  { code: 'knowledge:retrieval', name: '检索测试', description: '执行检索测试', module: 'knowledge', action: 'retrieval' },
  // 工具模块 (5)
  { code: 'tool:list', name: '查看工具', description: '列表、详情', module: 'tool', action: 'list' },
  { code: 'tool:create', name: '注册工具', description: '新建工具', module: 'tool', action: 'create' },
  { code: 'tool:update', name: '编辑工具', description: '修改配置、启用或禁用', module: 'tool', action: 'update' },
  { code: 'tool:delete', name: '删除工具', description: '删除工具', module: 'tool', action: 'delete' },
  { code: 'tool:test', name: '测试工具', description: '执行工具测试', module: 'tool', action: 'test' },
]

// ============ 角色定义 ============

export const ROLES: Role[] = [
  {
    code: 'admin',
    name: '超级管理员',
    builtin: true,
    description: '系统内置角色，持有全部权限，不可删除；权限码不可修改。',
    userCount: 2,
    permissions: ['*'],
  },
  {
    code: 'operator',
    name: '运营',
    builtin: true,
    description: '日常业务操作：可创建、编辑、上传与检索，不含删除、发布与系统管理。',
    userCount: 12,
    permissions: [
      'agent:list', 'agent:create', 'agent:update', 'agent:execute',
      'model:list',
      'prompt:list', 'prompt:create', 'prompt:update',
      'knowledge:list', 'knowledge:create', 'knowledge:update', 'knowledge:upload', 'knowledge:retrieval',
      'tool:list',
    ],
  },
  {
    code: 'auditor',
    name: '只读审计',
    builtin: false,
    description: '只读查看业务与系统目录，用于巡检与对接核验；不包含任何写操作。',
    userCount: 3,
    permissions: [
      'user:list', 'role:list', 'permission:list',
      'agent:list', 'model:list', 'prompt:list', 'knowledge:list', 'tool:list',
    ],
  },
  {
    code: 'kb_editor',
    name: '知识库维护',
    builtin: false,
    description: '只维护知识库内容与检索配置，不进入系统管理。',
    userCount: 4,
    permissions: [
      'knowledge:list', 'knowledge:create', 'knowledge:update', 'knowledge:upload', 'knowledge:retrieval',
    ],
  },
]

// ============ 用户数据 ============

export const USERS: User[] = [
  { id: 1, name: '林恪', account: 'admin', email: 'lin.ke@chenguang.ai', roles: ['admin'], status: 'on', lastLogin: '2026-10-25 09:41', initials: '林' },
  { id: 2, name: '张岚', account: 'zhang.lan', email: 'zhang.lan@chenguang.ai', roles: ['operator'], status: 'on', lastLogin: '2026-10-25 09:12', initials: '张' },
  { id: 3, name: '周宁', account: 'zhou.ning', email: 'zhou.ning@chenguang.ai', roles: ['auditor'], status: 'on', lastLogin: '2026-10-24 18:07', initials: '周' },
  { id: 4, name: '陈默', account: 'chen.mo', email: 'chen.mo@chenguang.ai', roles: [], status: 'on', lastLogin: '2026-10-23 15:22', initials: '陈' },
  { id: 5, name: '李云', account: 'li.yun', email: 'li.yun@chenguang.ai', roles: ['kb_editor'], status: 'on', lastLogin: '2026-10-22 10:05', initials: '李' },
  { id: 6, name: '王琪', account: 'wang.qi', email: 'wang.qi@chenguang.ai', roles: ['operator'], status: 'off', lastLogin: '2026-10-18 16:44', initials: '王' },
  { id: 7, name: '何松', account: 'he.song', email: 'he.song@chenguang.ai', roles: ['auditor'], status: 'on', lastLogin: '2026-10-25 08:30', initials: '何' },
]

// ============ 身份映射（模拟登录）============

export const IDENTITIES: Record<string, (account: string) => { identity: typeof import('./types').Identity; user: typeof USERS[0] }> = {
  admin: () => ({
    identity: { key: 'super', name: '林恪', account: 'admin', roleLabel: '超级管理员', roleCode: 'admin', superuser: true, permissions: ['*'] },
    user: USERS[0],
  }),
  'zhang.lan': () => ({
    identity: { key: 'operator', name: '张岚', account: 'zhang.lan', roleLabel: '运营', roleCode: 'operator', superuser: false, permissions: ROLES[1].permissions },
    user: USERS[1],
  }),
  'zhou.ning': () => ({
    identity: { key: 'auditor', name: '周宁', account: 'zhou.ning', roleLabel: '只读审计', roleCode: 'auditor', superuser: false, permissions: ROLES[2].permissions },
    user: USERS[2],
  }),
  'chen.mo': () => ({
    identity: { key: 'none', name: '陈默', account: 'chen.mo', roleLabel: '未分配角色', roleCode: null, superuser: false, permissions: [] },
    user: USERS[3],
  }),
}

// ============ 导航菜单 ============

export interface NavItem {
  key: string
  label: string
  href: string
  perm?: string
  superOnly?: boolean
  meta?: string
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: '总览',
    items: [
      { key: 'dashboard', label: '工作台', href: '/dashboard' },
    ],
  },
  {
    title: '业务',
    items: [
      { key: 'agents', label: 'Agent 管理', href: '/rbac/agents', perm: 'agent:list', meta: '8' },
      { key: 'models', label: '模型管理', href: '/rbac/models', perm: 'model:list' },
      { key: 'prompts', label: 'Prompt 管理', href: '/rbac/prompts', perm: 'prompt:list' },
      { key: 'knowledge', label: '知识库', href: '/rbac/knowledge', perm: 'knowledge:list' },
      { key: 'tools', label: '工具管理', href: '/rbac/tools', perm: 'tool:list' },
    ],
  },
  {
    title: '洞察',
    items: [
      { key: 'conversations', label: '对话日志', href: '/rbac/conversations', meta: '未设权限' },
      { key: 'analytics', label: '数据统计', href: '/rbac/analytics', meta: '未设权限' },
    ],
  },
  {
    title: '系统管理',
    items: [
      { key: 'users', label: '用户管理', href: '/rbac/users', perm: 'user:list' },
      { key: 'roles', label: '角色管理', href: '/rbac/roles', perm: 'role:list' },
      { key: 'permissions', label: '权限管理', href: '/rbac/permissions', perm: 'permission:list' },
      { key: 'api-keys', label: 'API 密钥', href: '/rbac/api-keys', superOnly: true },
      { key: 'audit', label: '审计日志', href: '/rbac/audit', superOnly: true },
      { key: 'alerts', label: '告警规则', href: '/rbac/alerts', superOnly: true },
      { key: 'settings', label: '系统配置', href: '/rbac/settings', superOnly: true },
    ],
  },
]
