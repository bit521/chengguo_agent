# 辰光 Agent 平台 PRD V2 — RBAC 授权功能

> 文档定位：在 `docs/PROJECT_SPEC.md`（V1）基础上，仅定义 **RBAC 授权功能** 的需求增量。
> 未在本文中提及的模块、页面、接口、数据表，均保持 V1 现状不变。

| 项目 | 内容 |
|---|---|
| 文档版本 | V2.0 |
| 文档状态 | 需求对齐稿 |
| 编写日期 | 2026-10-25 |
| 基线文档 | `docs/PROJECT_SPEC.md` |
| 本次范围 | 后端接口鉴权 + 前端权限控制 + 权限目录补齐 |
| 明确不做 | 不写代码、不新增业务功能、不做数据权限/多租户/审计等扩展 |

---

## 1. 背景与问题

平台已经具备 RBAC 的“数据”和“管理界面”，但权限还没有成为“规则”：

- 已有用户、角色、权限三张主表及两张关联表；
- 已有登录（验证码 + JWT）、用户/角色/权限 CRUD、给用户分配角色、给角色分配权限；
- 前后端已经有系统管理页面和真实接口联调。

当前缺口是：**权限只被存储，没有被用于请求判定，也没有被前端消费**。具体表现为：

1. 除 `GET /users/me` 和知识库上传接口外，Agent、模型、Prompt、知识库、工具等接口均不校验登录，更不校验权限；
2. 登录只返回 token，`GET /users/me` 不返回角色和权限，前端无法判断“能不能看/能不能点”；
3. 前端 `AuthGuard` 只判断 token 是否存在，侧边栏菜单和所有操作按钮对所有登录用户一致；
4. 权限种子只有 12 条，且粗细不一致（用户模块细到 `user:create`，业务模块是 `agent:*` 通配），无法支撑页面/按钮级控制；
5. 认证/授权失败没有区分 401（未登录）与 403（已登录但无权限）。

本次要做的，就是把已有的权限数据接入“认证之后、业务之前”的授权链路，并让前端按权限渲染。**不新增任何业务功能。**

---

## 2. 需求对齐结论

### 2.1 目标

| 编号 | 目标 |
|---|---|
| G1 | 后端：所有非公开接口先认证、再按权限码授权；未显式放行的接口默认拒绝。 |
| G2 | 前端：登录后加载当前用户角色与权限；菜单、路由、操作按钮按权限显示；无权限直达返回 403 页面。 |
| G3 | 不改登录方式（验证码 + JWT），不改现有 RBAC 表结构，不新增业务模块。 |
| G4 | 角色/权限变更在下一次请求生效，无需重新登录；前端界面在刷新或重新进入后生效。 |
| G5 | 保持现有接口响应格式、Mock 开发模式和既有页面功能可用。 |

### 2.2 本次范围

**包含：**

- 已实现业务模块的接口鉴权：Agent、模型（含供应商）、Prompt、知识库、工具；
- 系统管理模块的接口鉴权：用户、角色、权限；
- 登录后当前用户信息补全（角色、权限码、是否超管）；
- 统一 401/403 语义；
- 权限目录补齐、默认角色权限矩阵、存量数据补齐方案；
- 前端菜单/路由/按钮权限控制、403 页面、Mock 模式适配。

**不包含：**

- 对话日志、数据统计、API Key、审计日志、告警规则、系统配置等后端尚未实现模块的授权；
- 任何新的业务接口、页面或数据表；
- 数据权限、多租户、角色继承、ABAC、SSO、Token 刷新/黑名单等扩展能力。

### 2.3 关键决策与默认假设

以下为本次需求分析中采用的默认决策；如与预期不符，应在开发前纠正。

| 编号 | 决策 | 理由 |
|---|---|---|
| D1 | 授权范围覆盖 **后端接口 + 前端菜单/路由/按钮** | 只做后端会导致用户看到大量点不动的入口，授权体验不完整；只做前端则可被绕过。 |
| D2 | 权限码采用 `模块:动作`，支持 `模块:*` 与 `*` 通配 | 兼容现有 `agent:*` 等种子数据，同时允许细粒度控制；不需要改表。 |
| D3 | 不新增数据表、不新增角色字段 | 现有 5 张 RBAC 表已足够表达用户—角色—权限关系；`is_superuser` 已存在。 |
| D4 | 权限不写入 JWT，每次请求从数据库读取 | 保证角色/权限变更立即生效，避免 token 内的权限快照过期。 |
| D5 | 认证失败用 HTTP 401，授权失败用 HTTP 403，响应体仍为 `{code,message,data}` | 与前端现有 401 跳转逻辑兼容，同时让 403 可被明确识别。 |
| D6 | 保留 `admin`、`operator` 两个默认角色，不新增内置角色 | 满足“最小改动”；需要只读角色时由管理员在页面上自行创建。 |
| D7 | 未实现后端接口的页面（对话日志、数据统计等）不纳入本次授权 | 没有后端可保护的接口，纳入只会制造空权限；保持现状。 |
| D8 | Mock 模式返回超级管理员身份与全部权限 | 保证 `VITE_USE_MOCK=true` 时现有页面开发体验不变。 |

### 2.4 非目标

- 不做数据权限（本人/本部门/全部数据范围）；
- 不做多租户隔离；
- 不做角色继承、权限组、条件权限（ABAC）；
- 不做 API Key 的权限范围与鉴权；
- 不做审计日志（记录谁在何时改了什么）；
- 不做 SSO / OAuth2 / LDAP；
- 不做 Token 刷新、主动失效、黑名单、单点登出；
- 不补全用户编辑、重置密码、启用/禁用等既有缺口；
- 不改动现有登录、验证码、密码策略；
- 不新增前端表单校验、图表等既有待办。

---

## 3. 现状分析

### 3.1 已有能力

| 能力 | 现状 | 位置 |
|---|---|---|
| 登录认证 | 验证码 + 用户名密码，成功返回 JWT（30 分钟） | `src/modules/auth/` |
| 当前用户解析 | 从 Bearer token 解析 `sub`，查询用户并校验启用状态 | `src/core/deps.py` |
| RBAC 数据模型 | 用户 M:N 角色 M:N 权限，两张关联表 | `src/modules/user/model.py`、`role/model.py`、`permission/model.py` |
| 角色/权限管理 | 用户、角色、权限 CRUD；用户分配角色；角色分配权限 | `src/modules/{user,role,permission}/api.py` |
| 权限种子 | 2 个角色、12 条权限、1 个超级管理员 | `init_data.py` |
| 前端系统管理页 | 用户/角色/权限页面已对接真实接口 | `app/src/pages/system/` |
| 前端登录态 | token 存 `localStorage`；401 自动跳登录；路由守卫只判断 token | `app/src/services/api/client.ts`、`components/AuthGuard.tsx` |

### 3.2 缺口清单

| 编号 | 缺口 | 证据 |
|---|---|---|
| P1 | 业务接口未要求登录 | Agent/模型/Prompt/知识库（除上传）/工具共 50 余个接口均未注入 `get_current_user` |
| P2 | 没有权限校验依赖 | 全局搜索无 `require_permission` / `has_permission` / 权限判定逻辑 |
| P3 | 当前用户信息不含角色与权限 | `UserRead` 仅含 id/username/email/is_active；`/users/me` 返回该结构 |
| P4 | 登录响应只有 token | `TokenResponse` 仅含 `access_token`、`token_type` |
| P5 | 前端无权限状态 | 无权限 Context、Hook 或本地缓存；菜单与按钮不读取权限 |
| P6 | 菜单/按钮全部可见 | `DashboardLayout` 的菜单项没有权限字段；页面操作按钮无权限判断 |
| P7 | 401/403 未区分 | 认证失败抛 `BizException(code=401)`，但统一按 HTTP 200 返回；无 403 语义 |
| P8 | 权限目录不完整、粒度不一致 | 仅 12 条；`user:*` 细到动作，业务模块只有 `agent:*` 等通配；无角色/权限的 create/update/delete |
| P9 | 无角色的普通用户行为未定义 | 新建用户默认无角色，登录后既不报错也没有任何权限提示 |

### 3.3 影响面

**后端：**

- `src/core/deps.py`：新增权限校验依赖；
- `src/core/exceptions.py`：401/403 的 HTTP 状态与响应体约定；
- `src/modules/user/schema.py`、`user/api.py`：扩展 `/users/me`；
- `src/modules/*/api.py`：所有非公开接口挂载认证与权限校验；
- `src/main.py`：确认路由注册与公开白名单；
- `init_data.py`：权限目录与默认角色矩阵补齐；
- 存量数据库：需要一次性补齐缺失权限，不新增表。

**前端：**

- `app/src/services/api/client.ts`：区分 401/403；
- `app/src/services/api/auth.ts`、`services/auth.ts`、`services/mock/auth.ts`：当前用户与权限加载；
- `app/src/components/AuthGuard.tsx`：增加权限守卫；
- `app/src/App.tsx`：403 路由与受保护路由；
- `app/src/layouts/DashboardLayout.tsx`：菜单按权限过滤；
- `app/src/pages/**`：创建/编辑/删除/发布/执行等按钮按权限显示；
- 新增权限上下文/Hook 与 403 页面。

---

## 4. 用户与场景

### 4.1 用户类型

| 用户 | 角色 | 权限特征 | 典型行为 |
|---|---|---|---|
| 超级管理员 | `admin` + `is_superuser=true` | 绕过所有权限校验 | 初始化平台、管理所有用户与角色 |
| 管理员 | `admin` 角色，非超管 | 拥有 `*` 全部权限 | 日常系统管理，但不能绕过系统保护规则 |
| 运营人员 | `operator` | 业务读写，不能删除/发布，不能进系统管理 | 维护 Agent、Prompt、知识库 |
| 普通用户 | 无角色或自定义角色 | 仅登录后可见的页面/操作 | 按管理员授予的权限使用平台 |

### 4.2 关键场景

1. **登录**：用户输入用户名、密码、验证码；成功后拿到 token；前端随后加载当前用户权限。
2. **正常访问**：有权限的菜单可见，页面可进入，操作按钮可见；接口放行。
3. **越权直达**：用户在地址栏直接输入无权限页面，前端展示 403，不渲染页面内容。
4. **越权操作**：用户通过接口/按钮触发无权限操作，后端返回 403，前端提示且不改变数据。
5. **权限调整**：管理员修改角色权限或用户角色；受影响用户下一次请求即按新权限判定；前端刷新后菜单/按钮更新。
6. **未登录/过期**：无 token 或 token 过期，返回 401；前端清除 token 并跳转登录，登录后回到原页面。
7. **账号禁用**：已登录用户被禁用后，下一次请求返回 401，前端退出登录。
8. **Mock 开发**：`VITE_USE_MOCK=true` 时，前端以超级管理员身份运行，全部页面可访问。

---

## 5. 权限模型

### 5.1 模型定义

沿用现有 RBAC：

- 用户与角色多对多（`user_roles`）；
- 角色与权限多对多（`role_permissions`）；
- 用户的有效权限 = 其所有角色的权限并集；
- 角色之间没有继承关系；
- 没有“拒绝”规则，只有“允许”；
- 超级管理员（`is_superuser=true`）跳过权限判定；
- 未匹配到任何权限时默认拒绝。

### 5.2 权限码规范

**格式：** `模块:动作`

- 模块：小写字母开头，可含小写字母、数字、下划线，例如 `user`、`knowledge`、`api_key`；
- 动作：小写字母开头，可含小写字母、数字、下划线；
- 通配：
  - `模块:*` 表示该模块下全部动作；
  - `*` 表示全部权限，仅允许分配给 `admin` 角色，不作为普通权限使用；
- 权限码全局唯一；
- 权限码创建后不可修改，名称和描述可修改；
- 模块与动作均区分语义，不做大小写转换以外的自动纠错。

**推荐动作词：**

| 动作 | 含义 |
|---|---|
| `list` | 列表、详情、版本列表等只读查询 |
| `create` | 新建 |
| `update` | 编辑、配置、启用/禁用 |
| `delete` | 删除 |
| `publish` | 发布、回滚 |
| `execute` | 启动、停止、测试、调用 |
| `assign` | 分配角色或权限 |
| `upload` | 上传文档、重试文档处理 |
| `retrieval` | 检索测试 |
| `test` | 连接测试、工具测试 |

> 说明：`list` 同时覆盖“列表”和“详情”，不单独设置 `read`，以兼容现有 `user:list`、`role:list`、`permission:list`。

### 5.3 判定规则

后端对每个受保护请求按以下顺序判定：

1. 提取 `Authorization: Bearer <token>`；缺失、非法、过期 → **401**；
2. 根据 token 中的用户 ID 查询用户；用户不存在或 `is_active=false` → **401**；
3. 若 `is_superuser=true` → **放行**；
4. 计算用户有效权限集合（所有角色的权限并集）；
5. 若存在 `*` → **放行**；
6. 若存在 `模块:*` 或与接口要求完全一致的权限码 → **放行**；
7. 否则 → **403**。

补充规则：

- 公开接口不进入上述判定；
- 同一接口只要求一个权限码，不要求“全部满足”；
- 权限判定以数据库当前数据为准，不读取 JWT 内的权限快照；
- 权限码比较为精确匹配，不做前缀匹配（`agent:list` 不等于 `agent:list_all`）。

### 5.4 超级管理员与系统角色

| 规则 | 说明 |
|---|---|
| 超管绕过 | `is_superuser=true` 的用户不受角色/权限限制 |
| `admin` 角色保护 | `code=admin` 的角色不可删除；`code` 不可修改；其权限集合可编辑 |
| `*` 权限 | 仅允许分配给 `admin` 角色；超管本身不依赖该权限 |
| 默认角色 | 保留 `admin`、`operator`，不新增内置角色 |
| 普通用户 | 新建用户默认无角色；无角色用户可登录，但除“工作台/个人资料/设置”外无业务权限 |

### 5.5 权限目录

权限目录按“已实现后端接口”定义，避免为不存在的功能造权限。

#### 系统管理

| 权限码 | 名称 | 说明 |
|---|---|---|
| `user:list` | 查看用户 | 用户列表、详情、用户角色查询 |
| `user:create` | 创建用户 | 新建用户 |
| `user:update` | 修改用户 | 预留；当前后端无编辑用户接口 |
| `user:delete` | 删除用户 | 删除用户 |
| `role:list` | 查看角色 | 角色列表、详情、搜索 |
| `role:create` | 创建角色 | 新建角色 |
| `role:update` | 修改角色 | 编辑角色名称/描述 |
| `role:delete` | 删除角色 | 删除角色 |
| `role:assign` | 分配角色/权限 | 给用户分配角色；给角色分配权限 |
| `permission:list` | 查看权限 | 权限列表、详情、搜索 |
| `permission:create` | 创建权限 | 新建权限 |
| `permission:update` | 修改权限 | 编辑权限名称/描述 |
| `permission:delete` | 删除权限 | 删除权限 |

#### Agent 管理

| 权限码 | 名称 | 说明 |
|---|---|---|
| `agent:list` | 查看 Agent | 列表、详情、版本列表 |
| `agent:create` | 创建 Agent | 新建 |
| `agent:update` | 编辑 Agent | 修改配置 |
| `agent:delete` | 删除 Agent | 删除 |
| `agent:publish` | 发布 Agent | 发布版本、回滚版本 |
| `agent:execute` | 运行 Agent | 启动、停止 |

#### 模型与供应商

| 权限码 | 名称 | 说明 |
|---|---|---|
| `model:list` | 查看模型/供应商 | 模型与供应商列表、详情 |
| `model:create` | 添加模型/供应商 | 新建模型或供应商 |
| `model:update` | 编辑模型/供应商 | 修改模型或供应商 |
| `model:delete` | 删除模型/供应商 | 删除模型或供应商 |
| `model:test` | 测试模型/供应商 | 供应商连接测试 |

#### Prompt 管理

| 权限码 | 名称 | 说明 |
|---|---|---|
| `prompt:list` | 查看 Prompt | 列表、详情、版本列表 |
| `prompt:create` | 创建 Prompt | 新建 |
| `prompt:update` | 编辑 Prompt | 修改内容与变量 |
| `prompt:delete` | 删除 Prompt | 删除 |
| `prompt:publish` | 发布 Prompt | 发布版本、回滚版本 |

#### 知识库管理

| 权限码 | 名称 | 说明 |
|---|---|---|
| `knowledge:list` | 查看知识库 | 知识库、文档、分段查询 |
| `knowledge:create` | 创建知识库 | 新建知识库 |
| `knowledge:update` | 编辑知识库 | 修改基本信息、分段/检索配置、编辑分段 |
| `knowledge:delete` | 删除知识库 | 删除知识库、文档、分段 |
| `knowledge:upload` | 上传文档 | 上传文档、重试失败文档 |
| `knowledge:retrieval` | 检索测试 | 执行检索测试 |

#### 工具管理

| 权限码 | 名称 | 说明 |
|---|---|---|
| `tool:list` | 查看工具 | 列表、详情 |
| `tool:create` | 注册工具 | 新建工具 |
| `tool:update` | 编辑工具 | 修改配置、启用/禁用 |
| `tool:delete` | 删除工具 | 删除 |
| `tool:test` | 测试工具 | 执行工具测试 |

> 兼容说明：现有种子中的 `agent:*`、`model:*`、`prompt:*`、`knowledge:*`、`tool:*` 继续有效，可一次性授予整模块权限。新增权限使用动作级编码，不再新增未列出的通配权限。

---

## 6. 功能需求

### FR-01 登录与会话

- 登录接口 `POST /api/v1/auth/login` 的请求与响应结构保持不变；
- 登录成功后，前端仍将 `access_token` 存入 `tokenStorage`；
- 登录成功后，前端必须加载当前用户权限（见 FR-02），加载完成后再进入受保护页面；
- 登录失败（验证码、用户不存在、密码错误、账号禁用）保持现有业务码与提示，不改为 401/403；
- 已登录用户再次访问登录页时，按现有逻辑跳转工作台。

**验收：** 现有登录流程、验证码刷新、错误提示不变；登录后能拿到角色与权限。

### FR-02 当前用户信息

扩展 `GET /api/v1/users/me` 的响应，保持既有字段不变，新增：

| 字段 | 类型 | 说明 |
|---|---|---|
| `is_superuser` | boolean | 是否超级管理员 |
| `roles` | array | 当前用户角色列表；每项含 `id`、`code`、`name` |
| `permissions` | string[] | 当前用户有效权限码并集，已去重；包含通配码时原样返回 |

响应中不得包含 `hashed_password`、`last_login` 等敏感或非必要字段。

**验收：** 超级管理员返回 `is_superuser=true`；拥有 `agent:*` 的角色返回 `permissions` 中含 `agent:*`；无角色用户返回空数组。

### FR-03 后端接口鉴权

- 所有非公开接口必须要求登录，并按第 7.3 节挂载对应权限码；
- 未登录、token 非法/过期、用户不存在、账号禁用 → 401；
- 已登录但缺少权限 → 403；
- 公开接口仅限第 7.2 节白名单；
- 不允许出现“忘记挂权限”的接口：新增接口必须同时声明所需权限，并在接口清单中登记；
- 权限校验失败不得执行业务逻辑，不得产生数据变更；
- 权限校验失败不得在响应中暴露内部权限码、角色列表或用户信息。

**验收：** 逐一验证第 7.3 节映射表；无 token 调用任一受保护接口均返回 401；无权限调用返回 403。

### FR-04 权限变更生效

- 角色权限、用户角色变更后，下一次请求立即按新权限判定；
- 不要求用户重新登录；
- 前端菜单/按钮在刷新页面或重新登录后更新；
- 本次不实现实时推送，不要求多标签页同步。

**验收：** 管理员移除某角色的 `agent:list` 后，该角色用户下一次请求 `GET /agents` 返回 403，无需重新登录。

### FR-05 前端菜单与路由

- 侧边栏菜单项增加权限声明，按当前用户权限过滤；
- 无权限的菜单项不显示；
- 直接访问无权限路由时展示 403 页面，不渲染目标页面内容；
- 无任何系统管理权限时，“系统管理”分组整体隐藏；
- 工作台、个人资料、账户设置对已登录用户开放，不要求额外权限；
- 403 页面提供“返回工作台”入口，不自动跳转。

**验收：** 仅拥有 `agent:list` 的用户只看到工作台与 Agent 管理；地址栏访问 `/system/users` 显示 403。

### FR-06 前端操作按钮

- 页面内的创建、编辑、删除、发布、回滚、启动/停止、测试、上传、分配等操作，按权限显示；
- 无权限时默认 **隐藏** 按钮，而不是显示后点击报错；
- 隐藏按钮不得影响页面其他信息的展示；
- 列表页的批量操作同样按权限控制；
- 前端控制只用于体验，不能替代后端校验。

**验收：** 仅拥有 `agent:list` 的用户进入 Agent 列表，看不到“新建 Agent”“删除”等按钮；直接调用创建接口仍返回 403。

### FR-07 401 / 403 处理

| 场景 | 后端 | 前端 |
|---|---|---|
| 无 token | HTTP 401，`code=401` | 清除本地 token，跳转登录，登录后回到原页面 |
| token 过期/非法 | HTTP 401，`code=401` | 同上 |
| 账号禁用 | HTTP 401，`code=401` | 同上，提示“账号已被禁用” |
| 已登录无权限 | HTTP 403，`code=403` | 路由级展示 403 页面；操作级提示“无权限执行此操作”，保留当前页面与登录态 |
| 其他业务错误 | 保持 HTTP 200 + 业务码 | 保持现有错误提示 |

- 401 不得在前端造成死循环跳转；
- 403 不得清除 token；
- 登录页、验证码接口不参与 401 跳转。

**验收：** 手动删除 localStorage 中的 token 后访问任意页面 → 跳登录；无权限用户点击越权操作 → 提示且不退出登录。

### FR-08 角色与权限管理约束

- 权限码创建后不可修改；名称、描述可修改；
- 权限码必须符合 5.2 节格式；
- 删除权限时，若已被角色引用，前端必须二次确认，并提示会影响哪些角色；后端按现有外键级联删除关联关系；
- `admin` 角色不可删除，`code` 不可修改；
- 给角色分配权限时，只允许选择权限目录中存在的权限；
- 给用户分配角色时，只允许选择已存在的角色。

**验收：** 尝试删除 `admin` 角色被拒绝并提示；删除被引用的权限后，关联角色不再包含该权限。

### FR-09 默认数据与存量迁移

- 初次初始化（空库）时，按第 5.5 节创建完整权限目录；
- `admin` 角色获得 `*`；
- `operator` 角色按 9.3 节默认矩阵获得业务读写权限，不含删除、发布和系统管理；
- 超级管理员用户保持 `is_superuser=true`；
- 已有数据库：提供一次性、可重复执行的补齐逻辑，只新增缺失权限并给 `admin` 角色补 `*`，不覆盖管理员已自定义的 `operator` 或其他角色权限；
- 迁移不新增表、不修改表结构。

**验收：** 在已有 12 条权限的数据库上执行补齐后，权限目录完整；自定义角色权限不被覆盖；重复执行不产生重复数据。

### FR-10 Mock 模式

- `VITE_USE_MOCK=true` 时，Mock 认证返回超级管理员身份，权限为 `*`；
- 菜单、路由、按钮控制全部放行，保持现有 Mock 开发体验；
- Mock 系统服务继续返回现有模拟数据；
- 切换到真实后端时，权限控制自动生效，页面代码无需分叉。

**验收：** Mock 模式下所有页面可正常访问；`VITE_USE_MOCK=false` 时按真实权限显示。

---

## 7. 接口需求

### 7.1 变更接口

| 接口 | 变更 |
|---|---|
| `GET /api/v1/users/me` | 响应新增 `is_superuser`、`roles`、`permissions`；原字段保留 |
| `POST /api/v1/auth/login` | 不变 |
| 其他业务接口 | 路径、请求、响应结构不变，仅增加认证与权限校验 |

本次**不新增**授权相关接口。角色/权限的授权操作继续使用现有的用户分配角色、角色分配权限接口。

### 7.2 公开接口白名单

| 接口 | 说明 |
|---|---|
| `GET /health` | 健康检查 |
| `GET /api/v1/captcha` | 获取验证码 |
| `POST /api/v1/captcha` | 校验验证码 |
| `POST /api/v1/auth/login` | 登录 |
| `/docs`、`/redoc`、`/openapi.json` | 开发环境接口文档；生产环境是否开放由部署配置决定，不纳入本次改造 |

除上述接口外，所有接口均要求登录。

### 7.3 接口—权限映射

#### 用户

| 方法 | 路径 | 所需权限 |
|---|---|---|
| POST | `/api/v1/users` | `user:create` |
| GET | `/api/v1/users/search` | `user:list` |
| GET | `/api/v1/users` | `user:list` |
| GET | `/api/v1/users/{user_id}` | `user:list` |
| GET | `/api/v1/users/{user_id}/roles` | `user:list` |
| PUT | `/api/v1/users/{user_id}/roles` | `role:assign` |
| DELETE | `/api/v1/users/{user_id}` | `user:delete` |
| GET | `/api/v1/users/me` | 仅需登录 |

#### 角色

| 方法 | 路径 | 所需权限 |
|---|---|---|
| POST | `/api/v1/roles` | `role:create` |
| GET | `/api/v1/roles/search` | `role:list` |
| GET | `/api/v1/roles` | `role:list` |
| GET | `/api/v1/roles/{role_id}` | `role:list` |
| PUT | `/api/v1/roles/{role_id}` | `role:update` |
| DELETE | `/api/v1/roles/{role_id}` | `role:delete` |
| PUT | `/api/v1/roles/{role_id}/permissions` | `role:assign` |

#### 权限

| 方法 | 路径 | 所需权限 |
|---|---|---|
| POST | `/api/v1/permissions` | `permission:create` |
| GET | `/api/v1/permissions/search` | `permission:list` |
| GET | `/api/v1/permissions` | `permission:list` |
| GET | `/api/v1/permissions/{permission_id}` | `permission:list` |
| PUT | `/api/v1/permissions/{permission_id}` | `permission:update` |
| DELETE | `/api/v1/permissions/{permission_id}` | `permission:delete` |

#### Agent

| 方法 | 路径 | 所需权限 |
|---|---|---|
| POST | `/api/v1/agents` | `agent:create` |
| GET | `/api/v1/agents` | `agent:list` |
| GET | `/api/v1/agents/{agent_id}` | `agent:list` |
| GET | `/api/v1/agents/{agent_id}/versions` | `agent:list` |
| PUT | `/api/v1/agents/{agent_id}` | `agent:update` |
| DELETE | `/api/v1/agents/{agent_id}` | `agent:delete` |
| POST | `/api/v1/agents/{agent_id}/start` | `agent:execute` |
| POST | `/api/v1/agents/{agent_id}/stop` | `agent:execute` |
| POST | `/api/v1/agents/{agent_id}/publish` | `agent:publish` |
| POST | `/api/v1/agents/{agent_id}/rollback` | `agent:publish` |

#### 模型与供应商

| 方法 | 路径 | 所需权限 |
|---|---|---|
| POST | `/api/v1/models` | `model:create` |
| GET | `/api/v1/models` | `model:list` |
| GET | `/api/v1/models/{model_id}` | `model:list` |
| PUT | `/api/v1/models/{model_id}` | `model:update` |
| DELETE | `/api/v1/models/{model_id}` | `model:delete` |
| POST | `/api/v1/providers` | `model:create` |
| GET | `/api/v1/providers` | `model:list` |
| GET | `/api/v1/providers/{provider_id}` | `model:list` |
| PUT | `/api/v1/providers/{provider_id}` | `model:update` |
| DELETE | `/api/v1/providers/{provider_id}` | `model:delete` |
| POST | `/api/v1/providers/{provider_id}/test` | `model:test` |

#### Prompt

| 方法 | 路径 | 所需权限 |
|---|---|---|
| POST | `/api/v1/prompts` | `prompt:create` |
| GET | `/api/v1/prompts` | `prompt:list` |
| GET | `/api/v1/prompts/{prompt_id}` | `prompt:list` |
| GET | `/api/v1/prompts/{prompt_id}/versions` | `prompt:list` |
| PUT | `/api/v1/prompts/{prompt_id}` | `prompt:update` |
| DELETE | `/api/v1/prompts/{prompt_id}` | `prompt:delete` |
| POST | `/api/v1/prompts/{prompt_id}/publish` | `prompt:publish` |
| POST | `/api/v1/prompts/{prompt_id}/rollback` | `prompt:publish` |

#### 知识库

| 方法 | 路径 | 所需权限 |
|---|---|---|
| POST | `/api/v1/knowledge-bases` | `knowledge:create` |
| GET | `/api/v1/knowledge-bases` | `knowledge:list` |
| GET | `/api/v1/knowledge-bases/{kb_id}` | `knowledge:list` |
| GET | `/api/v1/knowledge-bases/{kb_id}/documents` | `knowledge:list` |
| GET | `/api/v1/knowledge-bases/{kb_id}/documents/{doc_id}/segments` | `knowledge:list` |
| GET | `/api/v1/knowledge-bases/{kb_id}/segments` | `knowledge:list` |
| PUT | `/api/v1/knowledge-bases/{kb_id}` | `knowledge:update` |
| PUT | `/api/v1/knowledge-bases/{kb_id}/config` | `knowledge:update` |
| PUT | `/api/v1/knowledge-bases/{kb_id}/segments/{seg_id}` | `knowledge:update` |
| DELETE | `/api/v1/knowledge-bases/{kb_id}` | `knowledge:delete` |
| DELETE | `/api/v1/knowledge-bases/{kb_id}/documents/{doc_id}` | `knowledge:delete` |
| DELETE | `/api/v1/knowledge-bases/{kb_id}/segments/{seg_id}` | `knowledge:delete` |
| POST | `/api/v1/knowledge-bases/{kb_id}/documents` | `knowledge:upload` |
| POST | `/api/v1/knowledge-bases/{kb_id}/documents/{doc_id}/retry` | `knowledge:upload` |
| POST | `/api/v1/knowledge-bases/{kb_id}/retrieval-test` | `knowledge:retrieval` |

#### 工具

| 方法 | 路径 | 所需权限 |
|---|---|---|
| POST | `/api/v1/tools` | `tool:create` |
| GET | `/api/v1/tools` | `tool:list` |
| GET | `/api/v1/tools/{tool_id}` | `tool:list` |
| PUT | `/api/v1/tools/{tool_id}` | `tool:update` |
| DELETE | `/api/v1/tools/{tool_id}` | `tool:delete` |
| POST | `/api/v1/tools/{tool_id}/enable` | `tool:update` |
| POST | `/api/v1/tools/{tool_id}/disable` | `tool:update` |
| POST | `/api/v1/tools/{tool_id}/test` | `tool:test` |

### 7.4 错误码与响应

| 场景 | HTTP 状态 | 响应体 `code` | 响应体 `message` 示例 |
|---|---|---|---|
| 未登录 / token 缺失 | 401 | 401 | 未登录或登录已过期 |
| token 非法/过期 | 401 | 401 | 未登录或登录已过期 |
| 用户不存在 / 账号禁用 | 401 | 401 | 账号不存在或已被禁用 |
| 已登录但无权限 | 403 | 403 | 无权限执行此操作 |
| 业务校验失败 | 200 | 现有业务码 | 保持现状 |
| 服务器异常 | 500 | 500 | 服务器内部错误 |

约定：

- 401/403 的响应体仍为 `{code, message, data}`，`data` 为 `null`；
- 业务异常（非 401/403）继续沿用 HTTP 200 + 业务码；
- 401/403 不得返回数据库结构、角色列表、权限码、堆栈等内部信息；
- 认证失败日志不得输出完整 token。

---

## 8. 前端需求

### 8.1 会话与权限加载

- 登录成功后，调用 `GET /users/me` 获取当前用户、角色、权限、`is_superuser`；
- 将权限状态放入 React Context（不引入新的全局状态库），供布局与页面消费；
- 页面刷新时，若存在 token，则重新拉取当前用户；拉取失败（401）则清除 token 并跳登录；
- 权限加载完成前，受保护页面显示加载态，避免先渲染全部菜单再闪回；
- 退出登录时清空 token 与权限状态。

### 8.2 菜单与路由映射

| 菜单/页面 | 路由 | 所需权限 | 无权限表现 |
|---|---|---|---|
| 工作台 | `/` | 仅需登录 | — |
| 个人资料 | `/profile` | 仅需登录 | — |
| 账户设置 | `/settings` | 仅需登录 | — |
| Agent 管理 | `/agents` 及其子路由 | `agent:list` | 菜单隐藏，直达 403 |
| 模型管理 | `/models`、`/models/providers` | `model:list` | 菜单隐藏，直达 403 |
| Prompt 管理 | `/prompts` | `prompt:list` | 菜单隐藏，直达 403 |
| 知识库 | `/knowledge` | `knowledge:list` | 菜单隐藏，直达 403 |
| 工具管理 | `/tools` | `tool:list` | 菜单隐藏，直达 403 |
| 对话日志 | `/conversations` | 本次不设权限 | 保持登录可见（后端未实现） |
| 数据统计 | `/analytics` | 本次不设权限 | 保持登录可见（后端未实现） |
| 用户管理 | `/system/users` | `user:list` | 菜单隐藏，直达 403 |
| 角色管理 | `/system/roles` | `role:list` | 菜单隐藏，直达 403 |
| 权限管理 | `/system/permissions` | `permission:list` | 菜单隐藏，直达 403 |
| API 密钥 | `/system/api-keys` | 本次不设权限 | 仅超级管理员可见 |
| 审计日志 | `/system/audit` | 本次不设权限 | 仅超级管理员可见 |
| 告警规则 | `/system/alerts` | 本次不设权限 | 仅超级管理员可见 |
| 系统配置 | `/system/settings` | 本次不设权限 | 仅超级管理员可见 |

规则：

- 有任一系统管理权限时，显示“系统管理”分组，组内按权限逐项过滤；
- 无任何系统管理权限时，整个分组隐藏；
- 未定义权限码的页面，除明确说明外，普通用户不可见；超级管理员可见。

### 8.3 操作按钮映射

| 页面 | 操作 | 所需权限 |
|---|---|---|
| Agent 列表/详情 | 新建 Agent | `agent:create` |
| Agent 列表/详情 | 编辑 | `agent:update` |
| Agent 列表/详情 | 删除 | `agent:delete` |
| Agent 详情 | 启动/停止 | `agent:execute` |
| Agent 详情/版本 | 发布/回滚 | `agent:publish` |
| 模型列表 | 添加模型/供应商 | `model:create` |
| 模型列表 | 编辑 | `model:update` |
| 模型列表 | 删除 | `model:delete` |
| 供应商列表 | 测试连接 | `model:test` |
| Prompt 列表/详情 | 新建 | `prompt:create` |
| Prompt 列表/详情 | 编辑 | `prompt:update` |
| Prompt 列表/详情 | 删除 | `prompt:delete` |
| Prompt 详情/版本 | 发布/回滚 | `prompt:publish` |
| 知识库列表 | 创建知识库 | `knowledge:create` |
| 知识库详情 | 编辑/配置 | `knowledge:update` |
| 知识库详情 | 删除 | `knowledge:delete` |
| 知识库文档 | 上传/重试 | `knowledge:upload` |
| 知识库检索测试 | 执行测试 | `knowledge:retrieval` |
| 工具列表 | 注册工具 | `tool:create` |
| 工具列表/详情 | 编辑/启用/禁用 | `tool:update` |
| 工具列表/详情 | 删除 | `tool:delete` |
| 工具详情 | 测试 | `tool:test` |
| 用户管理 | 创建用户 | `user:create` |
| 用户管理 | 删除用户 | `user:delete` |
| 用户管理 | 分配角色 | `role:assign` |
| 角色管理 | 创建角色 | `role:create` |
| 角色管理 | 编辑 | `role:update` |
| 角色管理 | 删除 | `role:delete` |
| 角色管理 | 分配权限 | `role:assign` |
| 权限管理 | 创建权限 | `permission:create` |
| 权限管理 | 编辑 | `permission:update` |
| 权限管理 | 删除 | `permission:delete` |

无权限时默认隐藏按钮；如页面布局必须保留占位，可显示禁用态并附“无权限”提示，但同一页面内应保持一致。

### 8.4 403 页面

- 新增 `/403` 路由，位于登录守卫之内；
- 展示“无权限访问该页面”、当前账号、返回工作台按钮；
- 不自动跳转，不自动退出登录；
- 直接访问无权限路由时渲染 403，不加载目标页面数据；
- 操作级 403 不跳转 403 页面，在当前页面提示即可。

### 8.5 API 客户端行为

| 响应 | 行为 |
|---|---|
| HTTP 401 | 清除 token 与权限状态；跳转 `/login` 并记录来源路径；避免重复跳转 |
| HTTP 403 | 保留 token；抛出可识别的无权限错误；路由级由守卫处理，操作级由页面提示 |
| HTTP 200 + 业务码 | 保持现有逻辑，抛出业务错误 |
| 其他 HTTP 错误 | 保持现有逻辑 |

### 8.6 Mock 模式

- Mock 登录后直接构造超级管理员用户：`is_superuser=true`、`permissions=['*']`；
- Mock 的 `getCurrentUser` 返回同一身份；
- 菜单、路由、按钮判断在 Mock 模式下全部放行；
- 现有 Mock 系统服务与业务 Mock 数据不改；
- 真实 API 模式与 Mock 模式共用同一套权限判断代码，不做页面分叉。

---

## 9. 数据需求

### 9.1 表结构

**不新增表、不新增字段、不修改现有字段。**

沿用：

- `users`：`is_active`、`is_superuser`；
- `roles`：`code` 唯一；
- `permissions`：`code` 唯一；
- `user_roles`：用户—角色；
- `role_permissions`：角色—权限。

### 9.2 权限数据

- 按 5.5 节补齐权限目录；
- 现有 12 条权限码全部保留；
- 新增权限码不得与现有码冲突；
- 删除权限时依赖现有外键级联清理 `role_permissions`；
- 权限码不可修改，避免已授权角色失效。

### 9.3 默认角色矩阵

| 权限 | `admin` | `operator` |
|---|---|---|
| `*` | ✅ | ❌ |
| `user:list` | ✅（含在 `*`） | ❌ |
| `user:create` | ✅ | ❌ |
| `user:update` | ✅ | ❌ |
| `user:delete` | ✅ | ❌ |
| `role:list` / `role:create` / `role:update` / `role:delete` / `role:assign` | ✅ | ❌ |
| `permission:list` / `permission:create` / `permission:update` / `permission:delete` | ✅ | ❌ |
| `agent:list` / `agent:create` / `agent:update` / `agent:execute` | ✅ | ✅ |
| `agent:delete` / `agent:publish` | ✅ | ❌ |
| `model:list` | ✅ | ✅ |
| `model:create` / `model:update` / `model:delete` / `model:test` | ✅ | ❌ |
| `prompt:list` / `prompt:create` / `prompt:update` | ✅ | ✅ |
| `prompt:delete` / `prompt:publish` | ✅ | ❌ |
| `knowledge:list` / `knowledge:create` / `knowledge:update` / `knowledge:upload` / `knowledge:retrieval` | ✅ | ✅ |
| `knowledge:delete` | ✅ | ❌ |
| `tool:list` | ✅ | ✅ |
| `tool:create` / `tool:update` / `tool:delete` / `tool:test` | ✅ | ❌ |

说明：

- `admin` 角色使用 `*`，无需逐条维护；
- `operator` 为“日常业务操作”，可创建/编辑/上传/检索，但不能删除、发布，也不能进入系统管理；
- 其他角色由管理员通过现有角色/权限页面自定义；
- 不新增只读内置角色；如需只读角色，由管理员创建并只勾选 `*:list` 类权限。

### 9.4 存量数据补齐

- 空库初始化：按 5.5 节与 9.3 节生成；
- 已有库：执行一次性补齐，新增缺失权限码，为 `admin` 角色补 `*`；
- 补齐逻辑必须可重复执行且幂等；
- 不覆盖已有角色权限，不删除现有权限；
- 不修改用户密码、不禁用用户、不改变 `is_superuser`；
- 补齐后，原有管理员账号仍可登录并拥有全部权限。

---

## 10. 非功能需求

### 10.1 安全

- 默认拒绝：未声明权限的受保护接口应拒绝，而不是放行；
- 不把权限码写入 JWT，避免权限快照过期；
- 401/403 响应不泄露内部实现细节；
- 认证失败日志不得输出完整 token；
- 前端权限控制只是体验层，后端必须独立校验；
- 不改变现有密码哈希、验证码、JWT 算法与有效期。

### 10.2 性能

- 每次受保护请求需要读取用户角色与权限；沿用现有 `lazy="selectin"` 立即加载，不新增缓存层；
- 不引入额外外部依赖；
- 权限判定不得导致 N+1 查询；
- 在现有数据规模下，授权判定不应成为接口主要耗时。

### 10.3 兼容性

- 现有接口路径、请求体、响应结构保持不变（`/users/me` 仅新增字段）；
- 现有前端 Mock 模式保持可用；
- 现有登录、验证码、系统管理 CRUD、业务 CRUD 流程不回归；
- 现有权限码继续有效；
- 不要求数据库迁移工具新增版本（仅数据补齐）。

### 10.4 可维护性

- 权限码集中登记在权限目录中，新增接口必须同步新增权限码与映射；
- 前端菜单与按钮的权限声明集中管理，避免散落硬编码；
- 权限判定逻辑只保留一处，后端不允许各模块自行实现；
- 403 页面与 401 跳转逻辑统一，不在各页面重复实现。

### 10.5 可用性

- 无权限时给出明确但不泄露细节的提示；
- 403 页面可返回工作台；
- 登录过期后回到原页面，减少重复操作；
- 权限加载期间不出现“菜单先全亮后消失”的闪烁。

---

## 11. 验收标准

| 编号 | 场景 | 操作 | 预期 |
|---|---|---|---|
| AC-01 | 未登录访问 | 不带 token 调用 `GET /api/v1/agents` | HTTP 401，`code=401`，无数据 |
| AC-02 | 非法 token | 带随机 token 调用任一受保护接口 | HTTP 401，`code=401` |
| AC-03 | 过期 token | 使用过期 token 调用接口 | HTTP 401，前端跳登录 |
| AC-04 | 禁用账号 | 禁用用户后使用其有效 token 调用接口 | HTTP 401，提示账号禁用 |
| AC-05 | 无权限读取 | 仅 `agent:list` 的用户调用 `POST /api/v1/agents` | HTTP 403，`code=403`，数据未创建 |
| AC-06 | 有权限读取 | 仅 `agent:list` 的用户调用 `GET /api/v1/agents` | 200，返回列表 |
| AC-07 | 通配权限 | 用户角色含 `agent:*`，调用 Agent 全部接口 | 全部放行 |
| AC-08 | 全量权限 | 用户角色含 `*` | 全部业务接口放行 |
| AC-09 | 超管绕过 | `is_superuser=true` 且无角色 | 所有受保护接口放行 |
| AC-10 | 权限即时生效 | 移除角色 `agent:list` 后，该角色用户直接再次请求 | 403，无需重新登录 |
| AC-11 | 角色即时生效 | 给用户新增含 `agent:list` 的角色后，再次请求 | 200，无需重新登录 |
| AC-12 | 当前用户信息 | 调用 `GET /api/v1/users/me` | 返回 `is_superuser`、`roles`、`permissions`，无敏感字段 |
| AC-13 | 菜单过滤 | 仅 `agent:list` 的用户登录 | 只显示工作台、Agent 管理、个人资料/设置 |
| AC-14 | 路由拦截 | 仅 `agent:list` 的用户直接访问 `/system/users` | 展示 403 页面，不加载用户列表 |
| AC-15 | 按钮过滤 | 仅 `agent:list` 的用户进入 Agent 列表 | 不显示新建/编辑/删除/发布按钮 |
| AC-16 | 操作级 403 | 仅 `agent:list` 的用户直接调用创建接口 | 提示无权限，保留登录态与当前页 |
| AC-17 | 401 跳转 | 清除 token 后访问任意受保护路由 | 跳转登录，登录后回到原路由 |
| AC-18 | 登录回归 | 使用 admin/123456 + 验证码登录 | 与现状一致，成功进入工作台 |
| AC-19 | 系统管理回归 | 超级管理员创建用户、创建角色、分配权限 | 与现状一致，全部成功 |
| AC-20 | 业务管理回归 | 超级管理员创建 Agent/Prompt/知识库/工具 | 与现状一致，全部成功 |
| AC-21 | Mock 模式 | `VITE_USE_MOCK=true` 启动 | 全部菜单/按钮可见，页面可访问 |
| AC-22 | 无角色用户 | 新用户不分配角色直接登录 | 可进入工作台/个人资料/设置；业务菜单隐藏；直达业务页 403 |
| AC-23 | 存量补齐 | 在已有 12 条权限的库上执行补齐 | 权限目录完整；自定义角色权限未被覆盖；重复执行不重复插入 |
| AC-24 | 保护规则 | 删除 `admin` 角色 | 被拒绝并提示不可删除 |
| AC-25 | 权限码不可改 | 编辑权限时尝试修改 `code` | 前端不可编辑；后端拒绝修改 |

---

## 12. 风险与依赖

| 编号 | 风险/依赖 | 影响 | 应对 |
|---|---|---|---|
| R1 | 前端默认 `VITE_API_BASE=http://localhost:8080/api`，后端实际前缀为 `/api/v1` | 真实模式联调 404，授权验收无法进行 | 联调前统一为 `http://localhost:8080/api/v1`；属于既有配置问题，不新增功能 |
| R2 | 存量数据库只有 12 条权限，且 `operator` 权限与 V2 默认矩阵不同 | 旧账号权限不足或行为变化 | 提供幂等补齐逻辑；只补 `admin`，不覆盖自定义角色；上线前备份 |
| R3 | 前端仍有对话日志、数据统计、API Key、审计、告警、系统配置等后端未实现页面 | 这些页面无法做真实授权 | 明确列为本次非目标；未定义权限码的页面按 8.2 节规则处理 |
| R4 | 现有接口统一 HTTP 200 返回业务异常 | 改为 401/403 可能影响前端错误处理 | 仅对认证/授权错误使用 401/403；业务错误保持现状；前端客户端同步适配 |
| R5 | 现有 `get_current_user` 与登录日志输出 token | 安全风险 | 本次授权改造中移除完整 token 日志；不扩展到密钥管理等其他安全问题 |
| R6 | 权限码由人工维护，可能与接口脱节 | 新增接口忘记挂权限 | 接口清单与权限目录同步评审；默认拒绝策略兜底 |
| R7 | 前端权限状态在刷新后更新，非实时 | 管理员改权限后用户界面短暂不一致 | 明确“下一次请求后端生效、前端刷新后生效”；不做实时推送 |
| R8 | 无角色用户默认无权限 | 新建用户登录后“什么都看不到” | 管理员创建用户后需分配角色；403 页面给出提示；不自动赋予默认角色 |

---

## 13. 交付与里程碑

> 本节仅定义后续实现阶段的拆分；本次任务只交付本 PRD，不写代码。

| 阶段 | 内容 | 完成标准 |
|---|---|---|
| M1 后端授权 | 权限目录与种子、权限校验依赖、全部接口挂载、`/users/me` 扩展、401/403 契约、存量补齐 | AC-01～AC-12、AC-23～AC-25 通过 |
| M2 前端授权 | 权限上下文、菜单/路由守卫、按钮控制、403 页面、API 客户端 401/403、Mock 适配 | AC-13～AC-17、AC-21、AC-22 通过 |
| M3 回归验收 | 登录、系统管理、业务 CRUD 回归；权限矩阵逐项验证 | AC-18～AC-20 通过，全部 AC 有记录 |

**本次任务交付物：**

- `docs/spec/PROJECT_SPEC_V2.md`（本文档）；
- 不包含代码、数据库变更、迁移脚本或页面改动。

---

## 14. 附录：术语

| 术语 | 说明 |
|---|---|
| 认证（Authentication） | 确认“你是谁”，对应登录与 token 校验 |
| 授权（Authorization） | 确认“你能做什么”，对应权限码判定 |
| 权限码 | `模块:动作` 形式的字符串，如 `agent:create` |
| 有效权限 | 用户所有角色权限的并集 |
| 通配权限 | `模块:*` 或 `*`，表示模块内全部或全部权限 |
| 默认拒绝 | 未明确授予的权限一律视为无权限 |
| 超管 | `is_superuser=true` 的用户，绕过权限判定 |
| 403 页面 | 已登录但无权限访问某路由时展示的页面 |

---

## 15. 变更记录

| 版本 | 日期 | 内容 |
|---|---|---|
| V2.0 | 2026-10-25 | 基于 V1 增加 RBAC 授权需求：后端接口鉴权、前端权限控制、权限目录、401/403 契约、默认角色矩阵与存量补齐 |
