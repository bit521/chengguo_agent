# Agent 管理模块开发计划

> 本文档基于 `docs/PROJECT_SPEC.md` 和 `docs/spec/PROJECT_SPEC_V2.md` 编写，用于指导 Agent 管理模块的后端与前端对接开发。

---

## 一、模块概述

### 1.1 模块定位
Agent 管理模块提供 Agent 的全生命周期管理能力，包括：
- Agent 的创建、编辑、删除、查询
- Agent 配置管理（模型参数、Prompt、知识库检索、工具编排）
- Agent 版本管理与回滚
- Agent 运行状态控制（启动/停止）
- Agent 测试与监控

### 1.2 当前状态
| 层级 | 状态 |
|------|------|
| 后端 Model/Schema/Repository | ✅ 已实现 |
| 后端 Service/Api | ✅ 已实现 |
| 前端 UI/Mock 数据 | ✅ 已实现 |
| 前后端接口对接 | ❌ 待实现 |

### 1.3 权限要求（V2）
| 操作 | 权限码 |
|------|--------|
| 查看列表/详情/版本 | `agent:list` |
| 创建 Agent | `agent:create` |
| 编辑 Agent | `agent:update` |
| 删除 Agent | `agent:delete` |
| 发布/回滚版本 | `agent:publish` |
| 启动/停止 | `agent:execute` |

---

## 二、数据模型

### 2.1 已有 ORM 模型
文件：`src/modules/agent/model.py`

**Agent 表（agents）**
```python
class Agent(BaseModel):
    name: str                          # Agent 名称
    description: str | None            # 描述
    type: str                          # 类型: conversation/tool/analysis/creative/workflow
    status: str                        # 状态: active/inactive/error/draft
    model_id: int | None               # 关联模型 ID
    config: dict | None                # 完整配置（JSON）
    success_rate: float                # 成功率 %
    call_count_7d: int                 # 近7天调用次数
    version: str                       # 当前版本号
    created_by: str | None             # 创建者
```

**AgentVersion 表（agent_versions）**
```python
class AgentVersion(BaseModel):
    agent_id: int                      # 所属 Agent ID
    version: str                       # 版本号
    config: dict | None                # 配置快照
    changelog: str | None              # 变更说明
    is_current: bool                   # 是否为当前版本
    published_by: str | None           # 发布者
    published_at: datetime | None      # 发布时间
```

### 2.2 字段约束
- `name`：必填，最大 200 字符
- `type`：枚举值，限制为 `conversation/tool/analysis/creative/workflow`
- `status`：枚举值，限制为 `active/inactive/error/draft`
- `version`：语义化版本，默认 `v0.1`
- `config`：JSON 结构，包含 model/prompt/rag/tools/advanced 五个子节点

---

## 三、API 接口规范

### 3.1 接口清单

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/v1/agents` | `agent:create` | 创建 Agent |
| GET | `/api/v1/agents` | `agent:list` | Agent 列表（分页） |
| GET | `/api/v1/agents/{id}` | `agent:list` | Agent 详情 |
| PUT | `/api/v1/agents/{id}` | `agent:update` | 更新 Agent |
| DELETE | `/api/v1/agents/{id}` | `agent:delete` | 删除 Agent |
| POST | `/api/v1/agents/{id}/start` | `agent:execute` | 启动 Agent |
| POST | `/api/v1/agents/{id}/stop` | `agent:execute` | 停止 Agent |
| POST | `/api/v1/agents/{id}/publish` | `agent:publish` | 发布版本 |
| GET | `/api/v1/agents/{id}/versions` | `agent:list` | 版本列表 |
| POST | `/api/v1/agents/{id}/rollback` | `agent:publish` | 回滚版本 |

### 3.2 请求/响应格式

**创建 Agent 请求体**
```json
{
  "name": "客服助手",
  "description": "处理用户咨询的 AI 助手",
  "type": "conversation",
  "model_id": 1,
  "config": {
    "model": { "modelId": 1, "temperature": 0.7 },
    "prompt": { "systemPrompt": "你是一个专业的客服..." },
    "rag": { "enabled": false },
    "tools": { "enabled": false },
    "advanced": { "welcomeMessage": "你好！有什么可以帮你？" }
  }
}
```

**创建 Agent 响应体**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "客服助手",
    "description": "处理用户咨询的 AI 助手",
    "type": "conversation",
    "status": "draft",
    "model_id": 1,
    "config": { ... },
    "success_rate": 0,
    "call_count_7d": 0,
    "version": "v0.1",
    "created_by": "admin",
    "created_at": "2026-03-20T10:00:00Z",
    "updated_at": "2026-03-20T10:00:00Z"
  }
}
```

**列表查询参数**
```typescript
interface AgentListParams {
  page?: number          // 默认 1
  pageSize?: number      // 默认 20
  keyword?: string       // 搜索关键词（匹配 name/description）
}
```

**列表响应体**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "page_size": 20
  }
}
```

**发布版本请求体**
```json
{
  "changelog": "修复了客服回复超时的问题"
}
```

**回滚版本请求体**
```json
{
  "version_id": 5
}
```

### 3.3 错误码定义

| 错误码 | HTTP 状态 | 含义 |
|--------|-----------|------|
| 401 | 401 | 未登录或 token 过期 |
| 403 | 403 | 无权限执行此操作 |
| 45001 | 200 | Agent 不存在 |
| 45002 | 200 | 版本号格式错误 |
| 45003 | 200 | 无法回滚到当前版本 |

---

## 四、业务逻辑规则

### 4.1 Agent 创建规则
1. 名称不可为空，不可重复（同用户下）
2. 类型必须为枚举值之一
3. 创建后默认状态为 `draft`
4. 初始版本号为 `v0.1`
5. 自动记录 `created_by` 为当前登录用户

### 4.2 Agent 更新规则
1. 仅允许更新非只读字段（name/description/type/model_id/config）
2. 更新不改变版本号
3. 不允许修改 `status`（通过专用的启动/停止接口控制）

### 4.3 Agent 删除规则
1. 删除前检查是否存在关联版本记录
2. 使用级联删除（CASCADE）自动清理版本记录
3. 删除后不可恢复，需二次确认

### 4.4 版本管理规则
1. 发布时创建版本快照，保存当前 config
2. 版本号递增规则：`v{x}.{y}` → `v{x}.{y+1}`
3. 发布时将原当前版本标记为 `is_current=false`
4. 新版本标记为 `is_current=true`
5. 回滚时读取目标版本的 config，覆盖当前配置
6. 回滚后版本号不变，创建新的版本快照记录

### 4.5 启动/停止规则
1. 启动：将状态从 `draft`/`inactive`/`error` 改为 `active`
2. 停止：将状态改为 `inactive`
3. 启动失败时状态设为 `error`
4. 每次调用更新 `call_count_7d` 统计

---

## 五、Service 层设计

### 5.1 AgentService 方法签名
```python
class AgentService:
    def __init__(self, db: AsyncSession)
    
    async def create_agent(self, data: AgentCreate, current_user: str) -> AgentRead
    async def get_agent(self, agent_id: int) -> AgentRead
    async def list_agents(self, params: PageParams) -> PageResult[AgentRead]
    async def update_agent(self, agent_id: int, data: AgentUpdate) -> AgentRead
    async def delete_agent(self, agent_id: int) -> None
    async def start_agent(self, agent_id: int) -> AgentRead
    async def stop_agent(self, agent_id: int) -> AgentRead
    async def publish(self, agent_id: int, data: PublishRequest) -> AgentRead
    async def get_versions(self, agent_id: int) -> list[AgentVersionRead]
    async def rollback(self, agent_id: int, data: RollbackRequest) -> AgentRead
```

### 5.2 内部方法
```python
def _to_read(self, agent: Agent) -> AgentRead    # ORM → Schema 转换
def _generate_version(self, current: str) -> str  # 版本号生成
```

---

## 六、Repository 层设计

### 6.1 AgentRepository 方法签名
```python
class AgentRepository(BaseRepository[Agent]):
    SEARCH_FIELDS = ["name", "description"]
    
    async def get_with_versions(self, agent_id: int) -> Agent | None
    async def find_by_name(self, name: str, exclude_id: int | None = None) -> Agent | None
```

### 6.2 AgentVersionRepository 方法签名
```python
class AgentVersionRepository(BaseRepository[AgentVersion]):
    async def get_latest(self, agent_id: int) -> AgentVersion | None
    async def get_by_version(self, agent_id: int, version: str) -> AgentVersion | None
```

---

## 七、前端对接要求

### 7.1 服务层文件
文件：`app/src/services/api/agent.ts`

```typescript
export const apiAgentService = {
  // 列表
  getAgentList: (params: PaginationParams & { keyword?: string }) => Promise<PaginatedResponse<Agent>>
  
  // 详情
  getAgent: (id: number) => Promise<Agent>
  
  // 创建
  createAgent: (data: AgentCreate) => Promise<Agent>
  
  // 更新
  updateAgent: (id: number, data: AgentUpdate) => Promise<Agent>
  
  // 删除
  deleteAgent: (id: number) => Promise<void>
  
  // 启动/停止
  startAgent: (id: number) => Promise<Agent>
  stopAgent: (id: number) => Promise<Agent>
  
  // 版本管理
  publishAgent: (id: number, changelog: string) => Promise<Agent>
  getAgentVersions: (id: number) => Promise<AgentVersion[]>
  rollbackAgent: (id: number, versionId: number) => Promise<Agent>
}
```

### 7.2 页面组件要求
| 页面 | 路由 | 功能点 |
|------|------|--------|
| AgentList | `/agents` | 列表、搜索、分页、状态筛选 |
| AgentCreate | `/agents/create` | 创建表单、配置编辑器 |
| AgentCreate | `/agents/:id/edit` | 编辑表单、配置编辑器 |
| AgentDetail | `/agents/:id` | 基本信息、配置展示、统计卡片 |
| AgentVersions | `/agents/:id/versions` | 版本列表、回滚操作 |
| AgentTest | `/agents/:id/test` | 对话测试界面 |
| AgentMonitor | `/agents/:id/monitor` | 运行监控图表 |

### 7.3 权限控制
```typescript
// 页面级权限守卫
const canCreate = hasPermission('agent:create')
const canUpdate = hasPermission('agent:update')
const canDelete = hasPermission('agent:delete')
const canPublish = hasPermission('agent:publish')
const canExecute = hasPermission('agent:execute')

// 按钮显示控制
<Button disabled={!canCreate}>新建 Agent</Button>
<Button disabled={!canUpdate}>编辑</Button>
<Popconfirm onConfirm={handleDelete} disabled={!canDelete}>删除</Popconfirm>
```

---

## 八、测试要求

### 8.1 单元测试
文件：`test/test_agent_service.py`

```python
async def test_create_agent_success():
    # 测试正常创建 Agent
    
async def test_create_agent_duplicate_name():
    # 测试同名 Agent 拒绝创建
    
async def test_get_agent_not_found():
    # 测试不存在的 Agent ID
    
async def test_publish_agent_creates_version():
    # 测试发布创建版本快照
    
async def test_rollback_agent():
    # 测试回滚恢复配置
    
async def test_list_agents_with_pagination():
    # 测试分页查询
```

### 8.2 集成测试
文件：`test/test_agent_api.py`

```python
async def test_create_agent_requires_login(client):
    # 测试未登录返回 401
    
async def test_create_agent_requires_permission(client, operator_user):
    # 测试无权限返回 403
    
async def test_list_agents_success(client, authenticated_user):
    # 测试列表查询成功
```

---

## 九、实现步骤

### Phase 1：后端接口完善
- [ ] 补充 `AgentService` 中缺失的方法实现
- [ ] 添加权限校验依赖 `Depends(get_current_user)` 到所有接口
- [ ] 实现版本号自动生成逻辑
- [ ] 实现版本快照创建与回滚逻辑
- [ ] 添加接口异常处理与错误码

### Phase 2：前端对接
- [ ] 完成 `services/api/agent.ts` 接口调用封装
- [ ] 更新 `AgentList` 页面使用真实 API
- [ ] 更新 `AgentCreate` 页面支持创建/编辑模式
- [ ] 更新 `AgentDetail` 页面展示真实数据
- [ ] 完成版本管理页面对接

### Phase 3：测试验证
- [ ] 编写并运行单元测试
- [ ] 进行前后端联调测试
- [ ] 验证权限控制逻辑
- [ ] 测试边界条件与异常情况

---

## 十、风险与注意事项

| 风险 | 影响 | 应对 |
|------|------|------|
| config JSON 结构复杂 | 前后端字段对齐困难 | 统一使用 Pydantic Schema 定义，前后端共用类型 |
| 版本回滚冲突 | 并发编辑导致数据丢失 | 添加乐观锁或版本号校验 |
| 启动/停止状态机 | 状态流转不规范 | 明确定义状态转换规则，添加前置校验 |
| 大数据量分页性能 | 列表查询慢 | 添加数据库索引，优化查询语句 |

---

## 十一、验收标准

- [ ] 所有 10 个 API 接口可正常调用
- [ ] 列表查询支持分页与关键词搜索
- [ ] 创建/编辑/删除操作符合预期
- [ ] 版本发布与回滚逻辑正确
- [ ] 权限控制生效（无权限返回 403）
- [ ] 前端页面数据展示正常
- [ ] Mock 模式保持可用
- [ ] 单元测试覆盖率 ≥ 80%

---

**计划版本**：V1.0  
**编写日期**：2026-11-01  
**基线文档**：`docs/PROJECT_SPEC.md`、`docs/spec/PROJECT_SPEC_V2.md`
