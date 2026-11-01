# 工具管理模块开发计划

> 本文档基于 `docs/PROJECT_SPEC.md` 和 `docs/spec/PROJECT_SPEC_V2.md` 编写，用于指导工具管理模块的后端与前端对接开发。

---

## 一、模块概述

### 1.1 模块定位
工具管理模块提供 AI Agent 可调用工具的注册与管理能力，包括：
- 工具注册（HTTP API、自定义函数）
- 工具 CRUD 操作
- 工具启用/禁用
- 工具测试
- 工具调用日志

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
| 查看列表/详情 | `tool:list` |
| 注册工具 | `tool:create` |
| 编辑工具/启用禁用 | `tool:update` |
| 删除工具 | `tool:delete` |
| 测试工具 | `tool:test` |

---

## 二、数据模型

### 2.1 ORM 模型
文件：`src/modules/tool/model.py`

**Tool 表（tools）**
```python
class Tool(BaseModel):
    name: str                          # 工具名称
    description: str | None            # 描述
    type: str                          # 类型: http_api/custom_function/builtin
    status: str                        # 状态: active/inactive
    config: dict | None                # 工具配置（JSON）
    function_definition: dict | None   # OpenAI 函数定义格式
    call_count: int                    # 总调用次数
    success_count: int                 # 成功调用次数
    avg_latency: float                 # 平均响应时间（ms）
    created_by: str | None             # 创建者
```

### 2.2 Pydantic Schema
文件：`src/modules/tool/schema.py`

```python
class HttpApiConfig(BaseModel):
    url: str
    method: str = "POST"
    headers: dict = {}
    body_template: str | None = None

class CustomFunctionConfig(BaseModel):
    code: str                          # Python 代码
    parameters: list[dict] = []        # 参数定义

class ToolCreate(BaseModel):
    name: str
    description: str | None = None
    type: str                          # http_api/custom_function
    config: HttpApiConfig | CustomFunctionConfig

class ToolUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    config: dict | None = None

class ToolRead(BaseModel):
    id: int
    name: str
    description: str | None
    type: str
    status: str
    config: dict | None
    function_definition: dict | None
    call_count: int
    success_count: int
    avg_latency: float
    created_by: str | None

class ToolTestRequest(BaseModel):
    parameters: dict = {}

class ToolTestResponse(BaseModel):
    success: bool
    result: dict | None
    error: str | None
    latency_ms: float
```

---

## 三、API 接口规范

### 3.1 接口清单

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/v1/tools` | `tool:create` | 注册工具 |
| GET | `/api/v1/tools` | `tool:list` | 工具列表（分页） |
| GET | `/api/v1/tools/{id}` | `tool:list` | 工具详情 |
| PUT | `/api/v1/tools/{id}` | `tool:update` | 更新工具 |
| DELETE | `/api/v1/tools/{id}` | `tool:delete` | 删除工具 |
| POST | `/api/v1/tools/{id}/enable` | `tool:update` | 启用工具 |
| POST | `/api/v1/tools/{id}/disable` | `tool:update` | 禁用工具 |
| POST | `/api/v1/tools/{id}/test` | `tool:test` | 测试工具 |

### 3.2 请求/响应格式

**注册 HTTP API 工具请求体**
```json
{
  "name": "天气查询",
  "description": "查询指定城市的天气信息",
  "type": "http_api",
  "config": {
    "url": "https://api.weather.com/v1/current",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer ${API_KEY}"
    },
    "body_template": "{\"city\": \"{{city}}\"}"
  }
}
```

**测试工具请求体**
```json
{
  "parameters": {
    "city": "北京"
  }
}
```

**测试工具响应体**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "success": true,
    "result": {
      "temperature": 25,
      "condition": "晴"
    },
    "error": null,
    "latency_ms": 150
  }
}
```

### 3.3 错误码定义

| 错误码 | HTTP 状态 | 含义 |
|--------|-----------|------|
| 401 | 401 | 未登录或 token 过期 |
| 403 | 403 | 无权限执行此操作 |
| 44001 | 200 | 工具不存在 |
| 44002 | 200 | 工具名称已存在 |
| 44003 | 200 | 工具测试失败 |

---

## 四、业务逻辑规则

### 4.1 工具注册规则
1. 名称不可为空，同一用户下不可重复
2. 根据类型（http_api/custom_function）验证 config 结构
3. 创建时自动生成 OpenAI 兼容的 function_definition
4. 默认状态为 `active`

### 4.2 工具启用/禁用规则
1. 启用：将状态改为 `active`
2. 禁用：将状态改为 `inactive`
3. 禁用后的工具不可被 Agent 调用

### 4.3 工具测试规则
1. 根据工具类型执行不同的测试逻辑
2. HTTP API 工具：发送测试请求到配置的 URL
3. 自定义函数工具：执行 Python 代码
4. 记录调用次数、成功次数、响应时间
5. 测试失败不影响工具状态

### 4.4 工具删除规则
1. 删除前检查是否有 Agent 引用该工具
2. 若存在引用，拒绝删除并提示
3. 删除后不可恢复

---

## 五、Service 层设计

### 5.1 ToolService 方法签名
```python
class ToolService:
    def __init__(self, db: AsyncSession)
    
    async def create_tool(self, data: ToolCreate, current_user: str) -> ToolRead
    async def get_tool(self, tool_id: int) -> ToolRead
    async def list_tools(self, params: PageParams) -> PageResult[ToolRead]
    async def update_tool(self, tool_id: int, data: ToolUpdate) -> ToolRead
    async def delete_tool(self, tool_id: int) -> None
    async def enable_tool(self, tool_id: int) -> ToolRead
    async def disable_tool(self, tool_id: int) -> ToolRead
    async def test_tool(self, tool_id: int, data: ToolTestRequest) -> ToolTestResponse
```

### 5.2 内部方法
```python
def _generate_function_definition(self, tool: Tool) -> dict  # 生成 OpenAI function definition
def _execute_http_test(self, config: dict, params: dict) -> dict  # 执行 HTTP 测试
def _execute_function_test(self, config: dict, params: dict) -> dict  # 执行函数测试
```

---

## 六、前端对接要求

### 6.1 服务层文件
文件：`app/src/services/api/tool.ts`

```typescript
export const apiToolService = {
  getToolList: (params: PaginationParams & { keyword?: string }) => Promise<PaginatedResponse<Tool>>
  getTool: (id: number) => Promise<Tool>
  createTool: (data: ToolCreate) => Promise<Tool>
  updateTool: (id: number, data: ToolUpdate) => Promise<Tool>
  deleteTool: (id: number) => Promise<void>
  enableTool: (id: number) => Promise<Tool>
  disableTool: (id: number) => Promise<Tool>
  testTool: (id: number, parameters: record<string, any>) => Promise<ToolTestResult>
}
```

### 6.2 页面组件要求
| 页面 | 路由 | 功能点 |
|------|------|--------|
| ToolList | `/tools` | 工具列表、搜索、分页、状态筛选 |
| ToolCreate | `/tools/create` | 注册工具表单 |
| ToolDetail | `/tools/:id` | 工具详情、配置展示、测试 |

---

## 七、测试要求

### 7.1 单元测试
文件：`test/test_tool_service.py`

```python
async def test_create_tool_success():
    # 测试正常注册工具
    
async def test_create_tool_duplicate_name():
    # 测试同名工具拒绝创建
    
async def test_test_http_tool():
    # 测试 HTTP 工具测试功能
    
async def test_enable_disable_tool():
    # 测试启用/禁用功能
```

---

## 八、实现步骤

### Phase 1：权限校验完善
- [ ] 为所有工具接口添加权限校验
- [ ] 实现工具测试逻辑（HTTP + 自定义函数）
- [ ] 实现 function_definition 自动生成

### Phase 2：前端对接
- [ ] 完成 `services/api/tool.ts` 接口调用封装
- [ ] 更新 ToolList 页面使用真实 API
- [ ] 完成工具测试功能对接

### Phase 3：测试验证
- [ ] 编写并运行单元测试
- [ ] 进行前后端联调测试
- [ ] 验证权限控制逻辑

---

## 九、风险与注意事项

| 风险 | 影响 | 应对 |
|------|------|------|
| 自定义函数执行安全风险 | 代码注入 | 使用沙箱环境执行，限制系统调用 |
| HTTP 测试超时 | 用户体验差 | 设置合理超时（10秒），异步处理 |
| 工具被 Agent 引用 | 删除失败 | 添加引用检查，提示用户 |

---

## 十、验收标准

- [ ] 所有 8 个 API 接口可正常调用
- [ ] 工具测试功能正常工作
- [ ] 启用/禁用状态切换正常
- [ ] 权限控制生效
- [ ] 前端页面数据展示正常
- [ ] Mock 模式保持可用

---

**计划版本**：V1.0  
**编写日期**：2026-11-01  
**基线文档**：`docs/PROJECT_SPEC.md`、`docs/spec/PROJECT_SPEC_V2.md`
