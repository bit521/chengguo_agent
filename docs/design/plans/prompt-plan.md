# Prompt 管理模块开发计划

> 本文档基于 `docs/PROJECT_SPEC.md` 和 `docs/spec/PROJECT_SPEC_V2.md` 编写，用于指导 Prompt 管理模块的后端与前端对接开发。

---

## 一、模块概述

### 1.1 模块定位
Prompt 管理模块提供 Prompt 模板的全生命周期管理能力，包括：
- Prompt 的创建、编辑、删除、查询
- Prompt 版本管理与回滚
- Prompt 发布流程
- Prompt 变量定义与管理

### 1.2 当前状态
| 层级 | 状态 |
|------|------|
| 后端 Model/Schema/Repository | ✅ 已实现 |
| 后端 Service/Api | ✅ 已实现（待加权限校验） |
| 前端 UI/Mock 数据 | ✅ 已实现 |
| 前后端接口对接 | ❌ 待实现 |

### 1.3 权限要求（V2）
| 操作 | 权限码 |
|------|--------|
| 查看列表/详情/版本 | `prompt:list` |
| 创建 Prompt | `prompt:create` |
| 编辑 Prompt | `prompt:update` |
| 删除 Prompt | `prompt:delete` |
| 发布/回滚版本 | `prompt:publish` |

---

## 二、数据模型

### 2.1 ORM 模型
文件：`src/modules/prompt/model.py`

**Prompt 表（prompts）**
```python
class Prompt(BaseModel):
    name: str                          # Prompt 名称
    description: str | None            # 描述
    category: str                      # 分类，默认 general
    tags: dict | None                  # 标签列表（JSON 数组）
    content: str                       # Prompt 正文内容
    variables: dict | None             # 变量定义（JSON 数组）
    version: str                       # 当前版本号
    status: str                        # 状态: draft/published
    created_by: str | None             # 创建者
```

**PromptVersion 表（prompt_versions）**
```python
class PromptVersion(BaseModel):
    prompt_id: int                     # 所属 Prompt ID
    version: str                       # 版本号
    content: str                       # 内容快照
    changelog: str | None              # 变更说明
    is_current: bool                   # 是否为当前版本
    published_by: str | None           # 发布者
    published_at: datetime | None      # 发布时间
```

### 2.2 Pydantic Schema
文件：`src/modules/prompt/schema.py`

```python
class PromptVariableSchema(BaseModel):
    name: str
    type: str = "string"               # string / number / boolean / text
    description: str = ""
    default_value: str | None = None
    required: bool = True

class PromptCreate(BaseModel):
    name: str
    description: str | None = None
    category: str = "general"
    tags: list[str] = []
    content: str
    variables: list[PromptVariableSchema] = []

class PromptUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    content: str | None = None
    variables: list[PromptVariableSchema] | None = None

class PromptRead(BaseModel):
    id: int
    name: str
    description: str | None
    category: str
    tags: list[str]
    content: str
    variables: list[PromptVariableSchema]
    version: str
    status: str
    created_by: str | None

class PromptVersionRead(BaseModel):
    id: int
    prompt_id: int
    version: str
    content: str
    changelog: str | None
    is_current: bool
    published_by: str | None
    published_at: datetime | None
```

---

## 三、API 接口规范

### 3.1 接口清单

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/v1/prompts` | `prompt:create` | 创建 Prompt |
| GET | `/api/v1/prompts` | `prompt:list` | Prompt 列表（分页） |
| GET | `/api/v1/prompts/{id}` | `prompt:list` | Prompt 详情 |
| PUT | `/api/v1/prompts/{id}` | `prompt:update` | 更新 Prompt |
| DELETE | `/api/v1/prompts/{id}` | `prompt:delete` | 删除 Prompt |
| POST | `/api/v1/prompts/{id}/publish` | `prompt:publish` | 发布版本 |
| GET | `/api/v1/prompts/{id}/versions` | `prompt:list` | 版本列表 |
| POST | `/api/v1/prompts/{id}/rollback` | `prompt:publish` | 回滚版本 |

### 3.2 请求/响应格式

**创建 Prompt 请求体**
```json
{
  "name": "客服回复模板",
  "description": "用于客服场景的标准回复模板",
  "category": "customer_service",
  "tags": ["客服", "回复"],
  "content": "您好！我是您的智能客服助手。{{greeting}}\n\n请问有什么可以帮到您？",
  "variables": [
    {
      "name": "greeting",
      "type": "string",
      "description": "欢迎语",
      "default_value": "很高兴为您服务",
      "required": true
    }
  ]
}
```

**发布版本请求体**
```json
{
  "changelog": "优化了客服回复的语气"
}
```

**回滚版本请求体**
```json
{
  "version_id": 3
}
```

### 3.3 错误码定义

| 错误码 | HTTP 状态 | 含义 |
|--------|-----------|------|
| 401 | 401 | 未登录或 token 过期 |
| 403 | 403 | 无权限执行此操作 |
| 42001 | 200 | Prompt 不存在 |

---

## 四、业务逻辑规则

### 4.1 Prompt 创建规则
1. 名称不可为空
2. 创建后默认状态为 `draft`
3. 初始版本号为 `v0.1`
4. 变量定义使用 JSON 数组存储

### 4.2 Prompt 更新规则
1. 支持部分字段更新
2. 更新不改变版本号
3. 不允许修改 `status`（通过发布接口控制）

### 4.3 版本管理规则
1. 发布时创建内容快照
2. 版本号递增：`v{x}.{y}` → `v{x}.{y+1}`
3. 发布时将原当前版本标记为 `is_current=false`
4. 回滚时读取目标版本内容，覆盖当前 content
5. 回滚后创建新版本快照，版本号不变

---

## 五、Service 层设计

### 5.1 PromptService 方法签名
```python
class PromptService:
    def __init__(self, db: AsyncSession)
    
    async def create_prompt(self, data: PromptCreate, current_user: str) -> PromptRead
    async def get_prompt(self, prompt_id: int) -> PromptRead
    async def list_prompts(self, params: PageParams) -> PageResult[PromptRead]
    async def update_prompt(self, prompt_id: int, data: PromptUpdate) -> PromptRead
    async def delete_prompt(self, prompt_id: int) -> None
    async def publish(self, prompt_id: int, data: PublishRequest, current_user: str) -> PromptRead
    async def get_versions(self, prompt_id: int) -> list[PromptVersionRead]
    async def rollback(self, prompt_id: int, data: RollbackRequest) -> PromptRead
```

---

## 六、前端对接要求

### 6.1 服务层文件
文件：`app/src/services/api/prompt.ts`

```typescript
export const apiPromptService = {
  getPromptList: (params: PaginationParams & { keyword?: string }) => Promise<PaginatedResponse<Prompt>>
  getPrompt: (id: number) => Promise<Prompt>
  createPrompt: (data: PromptCreate) => Promise<Prompt>
  updatePrompt: (id: number, data: PromptUpdate) => Promise<Prompt>
  deletePrompt: (id: number) => Promise<void>
  publishPrompt: (id: number, changelog: string) => Promise<Prompt>
  getPromptVersions: (id: number) => Promise<PromptVersion[]>
  rollbackPrompt: (id: number, versionId: number) => Promise<Prompt>
}
```

### 6.2 页面组件要求
| 页面 | 路由 | 功能点 |
|------|------|--------|
| PromptList | `/prompts` | 列表、搜索、分页、分类筛选 |
| PromptCreate | `/prompts/create` | 创建表单、变量编辑器 |
| PromptCreate | `/prompts/:id/edit` | 编辑表单、变量编辑器 |
| PromptDetail | `/prompts/:id` | 基本信息、内容展示 |
| PromptVersions | `/prompts/:id/versions` | 版本列表、回滚操作 |

---

## 七、测试要求

### 7.1 单元测试
文件：`test/test_prompt_service.py`

```python
async def test_create_prompt_success():
    # 测试正常创建 Prompt
    
async def test_publish_creates_version():
    # 测试发布创建版本快照
    
async def test_rollback_prompt():
    # 测试回滚恢复内容
```

---

## 八、实现步骤

### Phase 1：权限校验完善
- [ ] 为所有 Prompt 接口添加权限校验
- [ ] 实现版本号自动生成逻辑
- [ ] 实现版本快照创建与回滚逻辑

### Phase 2：前端对接
- [ ] 完成 `services/api/prompt.ts` 接口调用封装
- [ ] 更新 PromptList 页面使用真实 API
- [ ] 完成版本管理页面对接

### Phase 3：测试验证
- [ ] 编写并运行单元测试
- [ ] 进行前后端联调测试
- [ ] 验证权限控制逻辑

---

## 九、验收标准

- [ ] 所有 8 个 API 接口可正常调用
- [ ] 列表查询支持分页与关键词搜索
- [ ] 版本发布与回滚逻辑正确
- [ ] 权限控制生效
- [ ] 前端页面数据展示正常
- [ ] Mock 模式保持可用

---

**计划版本**：V1.0  
**编写日期**：2026-11-01  
**基线文档**：`docs/PROJECT_SPEC.md`、`docs/spec/PROJECT_SPEC_V2.md`
