/* 辰光 Agent 平台 · RBAC 原型数据
   权限码与 PROJECT_SPEC_V2 §5.5 保持一致 */

const NAV_GROUPS = [
  {
    title: "总览",
    items: [
      { key: "dashboard", label: "工作台", icon: "sun", href: "dashboard.html" }
    ]
  },
  {
    title: "业务",
    items: [
      { key: "agents", label: "Agent 管理", icon: "bot", href: "agents.html", perm: "agent:list", meta: "8" },
      { key: "models", label: "模型管理", icon: "cube", href: "module-stub.html?page=models&label=模型管理&perm=model%3Alist", perm: "model:list" },
      { key: "prompts", label: "Prompt 管理", icon: "doc", href: "module-stub.html?page=prompts&label=Prompt%20%E7%AE%A1%E7%90%86&perm=prompt%3Alist", perm: "prompt:list" },
      { key: "knowledge", label: "知识库", icon: "book", href: "module-stub.html?page=knowledge&label=%E7%9F%A5%E8%AF%86%E5%BA%93&perm=knowledge%3Alist", perm: "knowledge:list" },
      { key: "tools", label: "工具管理", icon: "tool", href: "module-stub.html?page=tools&label=%E5%B7%A5%E5%85%B7%E7%AE%A1%E7%90%86&perm=tool%3Alist", perm: "tool:list" }
    ]
  },
  {
    title: "洞察",
    items: [
      { key: "conversations", label: "对话日志", icon: "chat", href: "module-stub.html?page=conversations&label=%E5%AF%B9%E8%AF%9D%E6%97%A5%E5%BF%97", meta: "未设权限" },
      { key: "analytics", label: "数据统计", icon: "chart", href: "module-stub.html?page=analytics&label=%E6%95%B0%E6%8D%AE%E7%BB%9F%E8%AE%A1", meta: "未设权限" }
    ]
  },
  {
    title: "系统管理",
    items: [
      { key: "users", label: "用户管理", icon: "users", href: "users.html", perm: "user:list" },
      { key: "roles", label: "角色管理", icon: "shield", href: "roles.html", perm: "role:list" },
      { key: "permissions", label: "权限管理", icon: "key", href: "permissions.html", perm: "permission:list" },
      { key: "api-keys", label: "API 密钥", icon: "key", href: "module-stub.html?page=api-keys&super=1&label=API%20%E5%AF%86%E9%92%A5", superOnly: true },
      { key: "audit", label: "审计日志", icon: "audit", href: "module-stub.html?page=audit&super=1&label=%E5%AE%A1%E8%AE%A1%E6%97%A5%E5%BF%97", superOnly: true },
      { key: "alerts", label: "告警规则", icon: "alert", href: "module-stub.html?page=alerts&super=1&label=%E5%91%8A%E8%AD%A6%E8%A7%84%E5%88%99", superOnly: true },
      { key: "settings", label: "系统配置", icon: "gear", href: "module-stub.html?page=settings&super=1&label=%E7%B3%BB%E7%BB%9F%E9%85%8D%E7%BD%AE", superOnly: true }
    ]
  }
];

/* 权限码、名称、说明 —— 共 40 条 */
const PERMISSION_ROWS = [
  ["user:list", "查看用户", "用户列表、详情、用户角色查询"],
  ["user:create", "创建用户", "新建用户"],
  ["user:update", "修改用户", "预留；当前后端无编辑用户接口"],
  ["user:delete", "删除用户", "删除用户"],
  ["role:list", "查看角色", "角色列表、详情、搜索"],
  ["role:create", "创建角色", "新建角色"],
  ["role:update", "修改角色", "编辑角色名称与描述"],
  ["role:delete", "删除角色", "删除角色"],
  ["role:assign", "分配角色或权限", "给用户分配角色；给角色分配权限"],
  ["permission:list", "查看权限", "权限列表、详情、搜索"],
  ["permission:create", "创建权限", "新建权限"],
  ["permission:update", "修改权限", "编辑权限名称与描述；权限码不可改"],
  ["permission:delete", "删除权限", "删除权限并清理角色关联"],
  ["agent:list", "查看 Agent", "列表、详情、版本列表"],
  ["agent:create", "创建 Agent", "新建 Agent"],
  ["agent:update", "编辑 Agent", "修改配置"],
  ["agent:delete", "删除 Agent", "删除 Agent"],
  ["agent:publish", "发布 Agent", "发布版本、回滚版本"],
  ["agent:execute", "运行 Agent", "启动、停止"],
  ["model:list", "查看模型与供应商", "模型与供应商列表、详情"],
  ["model:create", "添加模型与供应商", "新建模型或供应商"],
  ["model:update", "编辑模型与供应商", "修改模型或供应商"],
  ["model:delete", "删除模型与供应商", "删除模型或供应商"],
  ["model:test", "测试模型与供应商", "供应商连接测试"],
  ["prompt:list", "查看 Prompt", "列表、详情、版本列表"],
  ["prompt:create", "创建 Prompt", "新建 Prompt"],
  ["prompt:update", "编辑 Prompt", "修改内容与变量"],
  ["prompt:delete", "删除 Prompt", "删除 Prompt"],
  ["prompt:publish", "发布 Prompt", "发布版本、回滚版本"],
  ["knowledge:list", "查看知识库", "知识库、文档、分段查询"],
  ["knowledge:create", "创建知识库", "新建知识库"],
  ["knowledge:update", "编辑知识库", "基本信息、分段与检索配置、编辑分段"],
  ["knowledge:delete", "删除知识库", "删除知识库、文档、分段"],
  ["knowledge:upload", "上传文档", "上传文档、重试失败文档"],
  ["knowledge:retrieval", "检索测试", "执行检索测试"],
  ["tool:list", "查看工具", "列表、详情"],
  ["tool:create", "注册工具", "新建工具"],
  ["tool:update", "编辑工具", "修改配置、启用或禁用"],
  ["tool:delete", "删除工具", "删除工具"],
  ["tool:test", "测试工具", "执行工具测试"]
];

const MODULES = [
  { key: "user", name: "用户", group: "系统管理", actions: ["list", "create", "update", "delete"] },
  { key: "role", name: "角色", group: "系统管理", actions: ["list", "create", "update", "delete", "assign"] },
  { key: "permission", name: "权限", group: "系统管理", actions: ["list", "create", "update", "delete"] },
  { key: "agent", name: "Agent 管理", group: "业务", actions: ["list", "create", "update", "delete", "publish", "execute"] },
  { key: "model", name: "模型与供应商", group: "业务", actions: ["list", "create", "update", "delete", "test"] },
  { key: "prompt", name: "Prompt 管理", group: "业务", actions: ["list", "create", "update", "delete", "publish"] },
  { key: "knowledge", name: "知识库", group: "业务", actions: ["list", "create", "update", "delete", "upload", "retrieval"] },
  { key: "tool", name: "工具管理", group: "业务", actions: ["list", "create", "update", "delete", "test"] }
];

const ACTION_LABELS = {
  list: "查看",
  create: "创建",
  update: "编辑",
  delete: "删除",
  assign: "分配",
  publish: "发布",
  execute: "运行",
  upload: "上传",
  retrieval: "检索测试",
  test: "测试"
};

const ACTION_ORDER = ["list", "create", "update", "delete", "assign", "publish", "execute", "upload", "retrieval", "test"];

const PERMISSIONS = PERMISSION_ROWS.map(function (row) {
  var parts = row[0].split(":");
  return { code: row[0], name: row[1], desc: row[2], module: parts[0], action: parts[1] };
});

const ROLES = [
  {
    code: "admin",
    name: "超级管理员",
    builtin: true,
    desc: "系统内置角色，持有全部权限，不可删除；权限码不可修改。",
    users: 2,
    perms: ["*"]
  },
  {
    code: "operator",
    name: "运营",
    builtin: true,
    desc: "日常业务操作：可创建、编辑、上传与检索，不含删除、发布与系统管理。",
    users: 12,
    perms: [
      "agent:list", "agent:create", "agent:update", "agent:execute",
      "model:list",
      "prompt:list", "prompt:create", "prompt:update",
      "knowledge:list", "knowledge:create", "knowledge:update", "knowledge:upload", "knowledge:retrieval",
      "tool:list"
    ]
  },
  {
    code: "auditor",
    name: "只读审计",
    builtin: false,
    desc: "只读查看业务与系统目录，用于巡检与对接核验；不包含任何写操作。",
    users: 3,
    perms: [
      "user:list", "role:list", "permission:list",
      "agent:list", "model:list", "prompt:list", "knowledge:list", "tool:list"
    ]
  },
  {
    code: "kb_editor",
    name: "知识库维护",
    builtin: false,
    desc: "只维护知识库内容与检索配置，不进入系统管理。",
    users: 4,
    perms: [
      "knowledge:list", "knowledge:create", "knowledge:update", "knowledge:upload", "knowledge:retrieval"
    ]
  }
];

const IDENTITIES = {
  super: {
    key: "super",
    name: "林恪",
    account: "admin",
    roleLabel: "超级管理员",
    roleCode: "admin",
    superuser: true,
    permissions: ["*"]
  },
  operator: {
    key: "operator",
    name: "张岚",
    account: "zhang.lan",
    roleLabel: "运营",
    roleCode: "operator",
    superuser: false,
    permissions: ROLES[1].perms
  },
  auditor: {
    key: "auditor",
    name: "周宁",
    account: "zhou.ning",
    roleLabel: "只读审计",
    roleCode: "auditor",
    superuser: false,
    permissions: ROLES[2].perms
  },
  none: {
    key: "none",
    name: "陈默",
    account: "chen.mo",
    roleLabel: "未分配角色",
    roleCode: null,
    superuser: false,
    permissions: []
  }
};

const IDENTITY_ORDER = ["super", "operator", "auditor", "none"];

const USERS = [
  { name: "林恪", account: "admin", email: "lin.ke@chenguang.ai", roles: ["admin"], status: "on", last: "2026-10-25 09:41", initials: "林", tone: "brass" },
  { name: "张岚", account: "zhang.lan", email: "zhang.lan@chenguang.ai", roles: ["operator"], status: "on", last: "2026-10-25 09:12", initials: "张", tone: "" },
  { name: "周宁", account: "zhou.ning", email: "zhou.ning@chenguang.ai", roles: ["auditor"], status: "on", last: "2026-10-24 18:07", initials: "周", tone: "" },
  { name: "陈默", account: "chen.mo", email: "chen.mo@chenguang.ai", roles: [], status: "on", last: "2026-10-23 15:22", initials: "陈", tone: "stone" },
  { name: "李云", account: "li.yun", email: "li.yun@chenguang.ai", roles: ["kb_editor"], status: "on", last: "2026-10-22 10:05", initials: "李", tone: "" },
  { name: "王琪", account: "wang.qi", email: "wang.qi@chenguang.ai", roles: ["operator"], status: "off", last: "2026-10-18 16:44", initials: "王", tone: "stone" },
  { name: "何松", account: "he.song", email: "he.song@chenguang.ai", roles: ["auditor"], status: "on", last: "2026-10-25 08:30", initials: "何", tone: "" }
];

const AGENTS = [
  { name: "智能客服「听澜」", dept: "客户成功", version: "v2.4", state: "已发布", run: "运行中", today: "1,284", updated: "2026-10-25 09:38", owner: "张岚" },
  { name: "合同条款审阅", dept: "法务", version: "v1.8", state: "已发布", run: "已停止", today: "216", updated: "2026-10-24 17:02", owner: "林恪" },
  { name: "工单自动分级", dept: "运维", version: "v3.1", state: "已发布", run: "运行中", today: "3,402", updated: "2026-10-25 08:15", owner: "张岚" },
  { name: "营销文案生成器", dept: "市场", version: "v1.2", state: "草稿", run: "未运行", today: "—", updated: "2026-10-23 14:20", owner: "王琪" },
  { name: "内部知识问答", dept: "知识运营", version: "v2.0", state: "已发布", run: "运行中", today: "892", updated: "2026-10-25 07:50", owner: "李云" },
  { name: "财报摘要助手", dept: "财务", version: "v1.0", state: "已下线", run: "已停止", today: "—", updated: "2026-10-12 11:05", owner: "林恪" },
  { name: "招聘简历初筛", dept: "人力", version: "v1.4", state: "已发布", run: "运行中", today: "167", updated: "2026-10-24 20:11", owner: "张岚" },
  { name: "代码评审提示", dept: "研发", version: "v0.9", state: "草稿", run: "未运行", today: "—", updated: "2026-10-22 09:44", owner: "林恪" }
];

const ACTIVITIES = [
  { time: "09:41", actor: "林恪", action: "分配角色", target: "给「张岚」追加角色「运营」", code: "role:assign" },
  { time: "09:27", actor: "张岚", action: "发布版本", target: "智能客服「听澜」v2.4", code: "agent:publish" },
  { time: "09:12", actor: "李云", action: "上传文档", target: "产品知识库 · 3 个文档", code: "knowledge:upload" },
  { time: "08:54", actor: "林恪", action: "修改权限", target: "角色「只读审计」移除 tool:test", code: "role:assign" },
  { time: "08:30", actor: "何松", action: "登录", target: "只读审计 · 北京", code: "—" },
  { time: "08:15", actor: "张岚", action: "启动 Agent", target: "工单自动分级", code: "agent:execute" }
];

const IDENTITY_SUMMARY = {
  super: {
    scope: "6 / 6 业务模块 · 系统管理全部",
    note: "超级管理员绕过权限判定：即使不分配角色，也放行所有受保护接口。",
    count: "40 / 40"
  },
  operator: {
    scope: "业务 5 / 6 模块 · 无系统管理",
    note: "可创建、编辑、上传与检索；不可删除、发布，也看不到系统管理分组。",
    count: "14 / 40"
  },
  auditor: {
    scope: "只读 · 系统目录可见",
    note: "菜单只保留查看类入口；所有写操作按钮隐藏，接口层仍会校验。",
    count: "8 / 40"
  },
  none: {
    scope: "仅工作台、个人资料、设置",
    note: "没有角色就没有任何业务权限；业务菜单隐藏，直达业务页展示 403。",
    count: "0 / 40"
  }
};
