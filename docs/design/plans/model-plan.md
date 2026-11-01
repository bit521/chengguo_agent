# 模型管理模块开发计划

> 本文档基于 `docs/PROJECT_SPEC.md` 和 `docs/spec/PROJECT_SPEC_V2.md` 编写，用于指导模型管理模块的后端与前端对接开发。

---

## 一、模块概述

### 1.1 模块定位
模型管理模块提供大语言模型的注册、配置与管理能力，包括：
- 模型 CRUD 操作（添加、编辑、删除、查询）
- 供应商（Provider）管理（注册、连接测试）
- 模型定价与上下文长度配置
- 模型能力标签管理

### 1.2 当前状态
| 层级 | 状态 |
|------|------|
| 后端 Model/Schema/Repository | ✅ 已实现 |
| 后端 Service | ✅ 已实现 |
| 后端 Api | ✅ 已实现（待加权限校验） |
| 前端 UI/Mock 数据 | ✅ 已实现 |
| 前后端接口对接 | ❌ 待实现 |

### 1.3 权限要求（V2）
| 操作 | 权限码 |
|------|--------|
| 查看列表/详情 | `model:list` |
| 添加模型/供应商 | `model:create` |
| 编辑模型/供应商 | `model:update` |
| 删除模型/供应商 | `model:delete` |
| 测试供应商连接 | `model:test` |

---

## 二、数据模型

### 2.1 ORM 模型
文件：`src/modules/model/model.py`

**LLMModel 表（models）**
```python
class LLMModel(BaseModel):
    name: str                          # 模型显示名称（如 GPT-4o）
    model_id: str                      # 模型标识符（如 gpt-4o），唯一
    provider_id: int                   # 所属供应商 ID（外键）
    capabilities: str                  # 能力标签，逗号分隔（如 function_call,vision）
    context_length: int                # 上下文窗口大小
    status: str                        # 状态: available/unavailable/rate_limited
    input_price: float                 # 输入价格（每1K tokens）
    output_price: float                # 输出价格（每1K tokens）
    currency: str                      # 货币单位，默认 USD
    is_default: bool                   # 是否为默认模型
    description: str | None            # 描述
```

**ModelProvider 表（model_providers）**
```python
class ModelProvider(BaseModel):
    name: str                          # 供应商名称（如 OpenAI）
    type: str                          # 类型: openai/anthropic/aliyun/azure/local/custom
    status: str                        # 连接状态: connected/disconnected/error
    endpoint: str                      # API 端点地址
    api_key: str | None                # API 密钥（加密存储）
    description: str | None            # 描述
```

### 2.2 字段约束
- `model_id`：全局唯一，不可重复
- `name`：必填，最大 100 字符
- `type`：枚举值，限制为 `openai/anthropic/aliyun/azure/local/custom`
- `status`：枚举值，限制为 `available/unavailable/rate_limited`
- `currency`：默认 `USD`
- `input_price`/`output_price`：精度 6 位小数

---

## 三、API 接口规范

### 3.1 接口清单

#### 模型接口
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/v1/models` | `model:create` | 添加模型 |
| GET | `/api/v1/models` | `model:list` | 模型列表（分页） |
| GET | `/api/v1/models/{id}` | `model:list` | 模型详情 |
| PUT | `/api/v1/models/{id}` | `model:update` | 更新模型 |
| DELETE | `/api/v1/models/{id}` | `model:delete` | 删除模型 |

#### 供应商接口
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/v1/providers` | `model:create` | 添加供应商 |
| GET | `/api/v1/providers` | `model:list` | 供应商列表 |
| GET | `/api/v1/providers/{id}` | `model:list` | 供应商详情 |
| PUT | `/api/v1/providers/{id}` | `model:update` | 更新供应商 |
| DELETE | `/api/v1/providers/{id}` | `model:delete` | 删除供应商 |
| POST | `/api/v1/providers/{id}/test` | `model:test` | 测试连接 |

### 3.2 请求/响应格式

**创建模型请求体**
```json
{
  "name": "GPT-4o",
  "model_id": "gpt-4o",
  "provider_id": 1,
  "capabilities": ["function_call", "vision", "streaming"],
  "context_length": 128000,
  "input_price": 2.5,
  "output_price": 10.0,
  "currency": "USD",
  "is_default": false,
  "description": "OpenAI 最新多模态模型"
}
```

**创建供应商请求体**
```json
{
  "name": "OpenAI",
  "type": "openai",
  "endpoint": "https://api.openai.com/v1",
  "api_key": "sk-xxxx",
  "description": "OpenAI 官方 API"
}
```

**列表查询参数**
```typescript
interface ModelListParams {
  page?: number
  pageSize?: number
  keyword?: string
  provider_id?: number  // 按供应商筛选
}
```

**供应商测试响应**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "connected",
    "message": "连接成功",
    "latency_ms": 150
  }
}
```

### 3.3 错误码定义

| 错误码 | HTTP 状态 | 含义 |
|--------|-----------|------|
| 401 | 401 | 未登录或 token 过期 |
| 403 | 403 | 无权限执行此操作 |
| 41001 | 200 | 模型 ID 已存在 |
| 41002 | 200 | 供应商不存在 |
| 41003 | 200 | 模型不存在 |

---

## 四、业务逻辑规则

### 4.1 模型创建规则
1. `model_id` 全局唯一，重复时拒绝创建
2. 必须先存在对应的供应商记录
3. 若设为默认模型，自动取消其他模型的默认标记
4. `capabilities` 转换为逗号分隔字符串存储

### 4.2 模型更新规则
1. 不允许修改 `model_id` 和 `provider_id`
2. 支持部分字段更新（Pydantic Optional 字段）
3. 更新默认模型时，原默认模型自动取消

### 4.3 模型删除规则
1. 删除前检查是否有 Agent 引用该模型
2. 若存在引用，拒绝删除并提示
3. 删除后不可恢复

### 4.4 供应商测试规则
1. 向供应商 endpoint 发送简单请求验证连通性
2. 记录测试结果（状态、延迟、错误信息）
3. 测试失败不改变供应商状态，仅返回错误信息

---

## 五、Service 层设计

### 5.1 ModelService 方法签名
```python
class ModelService:
    def __init__(self, db: AsyncSession)
    
    async def create_model(self, data: ModelCreate, current_user: str) -> ModelRead
    async def get_model(self, model_id: int) -> ModelRead
    async def list_models(self, params: PageParams, provider_id: int | None = None) -> PageResult[ModelRead]
    async def update_model(self, model_id: int, data: ModelUpdate) -> ModelRead
    async def delete_model(self, model_id: int) -> None
```

### 5.2 ProviderService 方法签名
```python
class ProviderService:
    def __init__(self, db: AsyncSession)
    
    async def create_provider(self, data: ProviderCreate) -> ProviderRead
    async def get_provider(self, provider_id: int) -> ProviderRead
    async def list_providers(self) -> list[ProviderRead]
    async def update_provider(self, provider_id: int, data: ProviderUpdate) -> ProviderRead
    async def delete_provider(self, provider_id: int) -> None
    async def test_connection(self, provider_id: int) -> dict
```

### 5.3 内部方法
```python
def _to_read(self, model: LLMModel) -> ModelRead    # ORM → Schema 转换
def _parse_capabilities(self, capabilities: str) -> list[str]  # 逗号分隔转列表
def _format_capabilities(self, capabilities: list[str]) -> str  # 列表转逗号分隔
```

---

## 六、前端对接要求

### 6.1 服务层文件
文件：`app/src/services/api/model.ts`

```typescript
export const apiModelService = {
  // 模型管理
  getModelList: (params: PaginationParams & { provider_id?: number }) => Promise<PaginatedResponse<Model>>
  getModel: (id: number) => Promise<Model>
  createModel: (data: ModelCreate) => Promise<Model>
  updateModel: (id: number, data: ModelUpdate) => Promise<Model>
  deleteModel: (id: number) => Promise<void>
  
  // 供应商管理
  getProviderList: () => Promise<ModelProvider[]>
  createProvider: (data: ProviderCreate) => Promise<ModelProvider>
  updateProvider: (id: number, data: ProviderUpdate) => Promise<ModelProvider>
  deleteProvider: (id: number) => Promise<void>
  testProviderConnection: (id: number) => Promise<{ status: string; latency_ms: number }>
}
```

### 6.2 页面组件要求
| 页面 | 路由 | 功能点 |
|------|------|--------|
| ModelList | `/models` | 模型列表、搜索、分页、状态筛选 |
| ModelCreate | `/models/create` | 添加模型表单 |
| ModelDetail | `/models/:id` | 模型详情、编辑 |
| ModelProviders | `/models/providers` | 供应商列表、测试连接 |
| ProviderCreate | `/models/providers/create` | 添加供应商表单 |

---

## 七、测试要求

### 7.1 单元测试
文件：`test/test_model_service.py`

```python
async def test_create_model_success():
    # 测试正常创建模型
    
async def test_create_model_duplicate_id():
    # 测试重复 model_id 拒绝创建
    
async def test_create_model_invalid_provider():
    # 测试供应商不存在时拒绝创建
    
async def test_set_default_model():
    # 测试设置默认模型并取消原默认
    
async def test_delete_model_with_references():
    # 测试有引用时拒绝删除
```

### 7.2 集成测试
文件：`test/test_model_api.py`

```python
async def test_create_model_requires_permission(client, operator_user):
    # 测试无 model:create 权限返回 403
    
async def test_test_provider_connection_success(client):
    # 测试供应商连接测试
```

---

## 八、实现步骤

### Phase 1：权限校验完善
- [ ] 为所有模型接口添加 `Depends(get_current_user)` 权限校验
- [ ] 为所有供应商接口添加权限校验
- [ ] 实现 `model:test` 接口的连接测试逻辑

### Phase 2：前端对接
- [ ] 完成 `services/api/model.ts` 接口调用封装
- [ ] 更新 `ModelList` 页面使用真实 API
- [ ] 完成供应商管理页面对接
- [ ] 实现连接测试功能

### Phase 3：测试验证
- [ ] 编写并运行单元测试
- [ ] 进行前后端联调测试
- [ ] 验证权限控制逻辑

---

## 九、风险与注意事项

| 风险 | 影响 | 应对 |
|------|------|------|
| API Key 安全存储 | 密钥泄露风险 | 使用加密存储，不在日志中输出 |
| 连接测试超时 | 用户体验差 | 设置合理超时时间（5秒），异步处理 |
| 默认模型冲突 | 数据不一致 | 使用事务保证原子性 |

---

## 十、验收标准

- [ ] 所有模型 API 接口可正常调用
- [ ] 所有供应商 API 接口可正常调用
- [ ] 连接测试功能正常工作
- [ ] 权限控制生效
- [ ] 前端页面数据展示正常
- [ ] Mock 模式保持可用

---

**计划版本**：V1.0  
**编写日期**：2026-11-01  
**基线文档**：`docs/PROJECT_SPEC.md`、`docs/spec/PROJECT_SPEC_V2.md`
