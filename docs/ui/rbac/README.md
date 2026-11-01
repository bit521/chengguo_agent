# 辰光 Agent 平台 · RBAC 授权界面原型

基于 [`docs/spec/PROJECT_SPEC_V2.md`](../../spec/PROJECT_SPEC_V2.md) 的静态界面原型，覆盖前端授权链路：登录加载权限、菜单过滤、路由 403、按钮级控制、用户/角色/权限管理与 Mock 身份对照。

- 技术：HTML + CSS + JavaScript，无构建、无外部依赖、无网络请求
- 页面：9 个原型页 + 1 个模块占位页
- 图片：19 张，位于 [`images/`](images/)
- 说明书：[`docs/design/ui/RBAC-UI-Design-Spec.md`](../../design/ui/RBAC-UI-Design-Spec.md)

## 快速打开

直接双击 [`index.html`](index.html)（推荐 Chrome / Edge）即可。也可以在当前目录启动静态服务器：

```bash
python -m http.server 8000
# 打开 http://localhost:8000/
```

原型使用 `file://` 也能正常运行。应用脚本会在进入页面时把 `?as=`、`?annotate=` 从地址栏移除，避免刷新时覆盖身份切换。

## 演示控制条

每个应用页顶部有一条深色的「原型控制条」，它不是产品界面的一部分：

| 操作 | 作用 |
|---|---|
| 林恪 · 超级管理员 | `is_superuser=true`，绕过权限判定，全部菜单与操作可见 |
| 张岚 · 运营 | 14 项权限；可创建/编辑/运行/上传/检索，不含删除、发布与系统管理 |
| 周宁 · 只读审计 | 8 项只读权限；系统目录可见但全部为只读 |
| 陈默 · 未分配角色 | 0 项权限；业务菜单隐藏，直达业务页显示 403 |
| 标注受限操作 | 用虚线显示当前身份看不到的按钮/菜单，并标注所需权限码；不可点击 |
| 原型说明 | 返回 `index.html` |

切换身份会重载当前页面，并按新身份重新执行路由守卫。无权限的页面会跳转到 403。

## 演示账号（登录页）

| 账号 | 身份 | 说明 |
|---|---|---|
| `admin` | 超级管理员 | 密码任意 |
| `zhang.lan` | 运营 | 密码任意 |
| `zhou.ning` | 只读审计 | 密码任意 |
| `chen.mo` | 无角色 | 密码任意 |

验证码按图中字符输入。已登录时访问登录页会自动回到工作台；评审时使用 `login.html?stay=1` 停留在登录页。

## URL 参数

| 参数 | 取值 | 说明 |
|---|---|---|
| `?as=` | `super` / `operator` / `auditor` / `none` | 以指定身份打开，写入 `sessionStorage` 后从地址栏移除 |
| `?annotate=1` | — | 开启标注模式 |
| `?role=` | `admin` / `operator` / `auditor` / `kb_editor` | 角色管理默认选中的角色 |
| `?stay=1` | — | 登录页停留在表单，不自动跳转 |
| `?from=&need=&title=` | — | 403 页的来源、所需权限与页面名；通常由路由守卫生成 |

## 文件结构

```text
docs/ui/rbac/
├─ index.html                 # 原型导览（封面、页面清单、身份对照、令牌）
├─ login.html                 # 登录（验证码 + 身份映射）
├─ dashboard.html             # 工作台（访问范围面板、最近活动、空态）
├─ agents.html                # Agent 管理（按钮级权限、标注模式）
├─ users.html                 # 用户管理（分配角色、创建用户、删除）
├─ roles.html                 # 角色管理（8×10 权限矩阵、admin 保护、只读态）
├─ permissions.html           # 权限管理（40 条目录、权限码不可改、删除影响面）
├─ forbidden.html             # 403（印章、所需权限、返回工作台）
├─ styleguide.html            # 样式规范（令牌与组件）
├─ module-stub.html           # 本次未覆盖模块的占位页
├─ assets/
│  ├─ css/app.css             # 设计令牌与全部组件样式
│  └─ js/
│     ├─ data.js              # 导航、身份、40 条权限、角色、用户、Agent mock
│     └─ app.js               # 身份、菜单过滤、路由守卫、按钮门禁、标注、对话框
└─ images/                    # 19 张页面截图
```

## 页面与权限

| 页面 | 文件 | 所需权限 | 演示重点 |
|---|---|---|---|
| 原型导览 | `index.html` | 仅登录 | 页面清单、四种身份可见性对照、视觉令牌 |
| 登录 | `login.html` | 公开 | 验证码 + JWT 登录后的权限加载入口 |
| 工作台 | `dashboard.html` | 仅登录 | 「你的访问范围」按身份变化；无角色空态 |
| Agent 管理 | `agents.html` | `agent:list` | 新建/编辑/发布/运行/删除按钮逐项过滤 |
| 用户管理 | `users.html` | `user:list` | 分配角色、创建用户；只读身份隐藏整列操作 |
| 角色管理 | `roles.html` | `role:list` | 权限矩阵；`role:assign` 决定可编辑；`admin` 保护 |
| 权限管理 | `permissions.html` | `permission:list` | 40 条权限目录；权限码不可修改；删除影响面提示 |
| 403 | `forbidden.html` | 仅登录 | 越权直达、保留登录态、返回工作台 |
| 样式规范 | `styleguide.html` | 仅登录 | 颜色、字体、组件、状态、可访问性 |

模型、Prompt、知识库、工具、对话日志、数据统计使用 `module-stub.html` 承接：菜单可见性按权限生效，页面内容沿用 `docs/ui/v1–v9` 原型，不在本次范围。

## 图片产物

所有截图位于 [`images/`](images/)，桌面尺寸 1440×1200（长页面为整页），移动端 390×844 @2x。

| 图片 | 内容 |
|---|---|
| `00-cover.png` | 原型导览整页 |
| `01-login.png` | 登录页 |
| `02-dashboard-super.png` | 超管工作台（全部访问范围） |
| `03-dashboard-operator.png` | 运营工作台（14 项权限、无系统管理） |
| `04-dashboard-no-role.png` | 无角色工作台空态 |
| `05-agents-admin.png` | 超管 Agent 列表（查看/编辑/发布/运行/删除） |
| `06-agents-operator.png` | 运营 Agent 列表（发布/删除隐藏） |
| `07-agents-annotate.png` | 标注模式（虚线显示隐藏操作与权限码） |
| `08-users-list.png` | 用户列表 |
| `09-users-assign-role.png` | 分配角色对话框 |
| `10-users-readonly.png` | 只读审计的用户管理（操作列整体隐藏） |
| `11-roles-matrix.png` | 角色权限矩阵（运营，14/40） |
| `11b-roles-readonly.png` | 只读身份下的矩阵（无 `role:assign`） |
| `12-roles-admin-locked.png` | `admin` 角色的 `*` 通配只读矩阵 |
| `13-permissions-catalog.png` | 权限目录（系统管理部分） |
| `14-permissions-business.png` | 权限目录（业务部分与默认角色授予） |
| `15-forbidden-403.png` | 运营直达用户管理的 403 |
| `16-styleguide.png` | 样式规范整页 |
| `17-mobile-dashboard.png` | 移动端工作台 |

## 实现落地

设计说明书第 9 节给出了 React 落地建议：`PermissionProvider`、`usePermission`、`PermissionGate`、路由守卫、401/403 客户端行为、Mock 身份与令牌映射。核心原则：

1. 前端权限只决定「看不看得见」，后端始终独立校验。
2. 无权限时隐藏，不显示后点击报错；整列操作都无权时隐藏整列。
3. 权限声明集中配置，不在页面里散落硬编码。
4. 权限变更下一次请求生效；前端刷新后更新，不做实时推送。

## 边界说明

- 原型不调用后端、不写数据库。新建/保存/删除只更新当前页面的内存数据并弹出提示，刷新即重置。
- 验证码、JWT、401 过期/禁用为演示表达，没有真实 token 与接口。
- 角色与权限数据是 mock，但权限码、默认角色矩阵与 `PROJECT_SPEC_V2` §5.5 / §9.3 一致。
- 移动端表格横向滚动，未改为卡片式布局。
- 顶部原型控制条与标注模式仅用于评审，不应进入生产界面（可作为开发环境的调试开关）。
