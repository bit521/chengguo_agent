# 对话日志模块开发计划

> 本文档基于 `docs/PROJECT_SPEC.md` 和 `docs/spec/PROJECT_SPEC_V2.md` 编写，用于指导对话日志模块的后端实现与前端对接开发。

---

## 一、模块概述

### 1.1 模块定位
对话日志模块提供 Agent 对话记录的查询、分析与标注能力，包括：
- 对话列表查询（按 Agent、时间、用户筛选）
- 对话详情查看（包含完整的多轮对话）
- 对话链路追踪（展示 Agent 内部执行步骤）
- 对话标注与导出

### 1.2 当前状态
| 层级 | 状态 |
|------|------|
| 后端 Model/Schema/Repository/Service/Api | ❌ 待创建 |
| 前端 UI/Mock 数据 | ✅ 已实现 |
| 前后端接口对接 | ❌ 待实现 |

### 1.3 权限要求
本次 PRD V2 明确将对话日志列为"本次不设权限"的模块，仅要求登录可见。

---

## 二、数据模型

### 2.1 建议 ORM 模型
文件：`src/modules/conversation/model.py`

**Conversation 表（conversations）**
```python
class Conversation(BaseModel):
    agent_id: int                          # 关联 Agent ID
    agent_name: str                        # Agent 名称（冗余存储）
    user_id: int | None                    # 用户 ID
    title: str | None                      # 对话标题（自动生成）
    turn_count: int                        # 对话轮数
    total_tokens: int                      # 总 Token 数
    total_cost: float                      # 总费用
    satisfaction: float | None             # 满意度评分（0-5）
    status: str = "active"                 # 状态: active/archived/deleted
```

**ConversationTurn 表（conversation_turns）**
```python
class ConversationTurn(BaseModel):
    conversation_id: int                   # 所属对话 ID
    role: str                              # 角色: user/assistant/system
    content: str                           # 对话内容
    input_tokens: int                      # 输入 Token 数
    output_tokens: int                     # 输出 Token 数
    model_id: int | None                   # 使用的模型 ID
    latency_ms: int                        # 响应延迟（ms）
    trace: dict | None                     # 执行链路（JSON）
```

**ConversationAnnotation 表（conversation_annotations）**
```python
class ConversationAnnotation(BaseModel):
    conversation_id: int                   # 所属对话 ID
    user_id: int                           # 标注者 ID
    rating: int                            # 评分（1-5）
    comment: str | None                    # 备注
    is_helpful: bool | None                # 是否有帮助
```

---

## 三、API 接口规范

### 3.1 接口清单

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/api/v1/conversations` | 仅需登录 | 对话列表（分页） |
| GET | `/api/v1/conversations/{id}` | 仅需登录 | 对话详情 |
| POST | `/api/v1/conversations/{id}/annotate` | 仅需登录 | 标注对话 |
| POST | `/api/v1/conversations/export` | 仅需登录 | 导出对话 |
| DELETE | `/api/v1/conversations/{id}` | 仅需登录 | 删除对话 |

### 3.2 请求/响应格式

**对话列表查询参数**
```typescript
interface ConversationListParams {
  page?: number
  pageSize?: number
  keyword?: string           // 搜索关键词
  agent_id?: number          // 按 Agent 筛选
  user_id?: number           // 按用户筛选
  start_date?: string        // 开始日期
  end_date?: string          // 结束日期
}
```

**对话详情响应体**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "agent_id": 1,
    "agent_name": "客服助手",
    "user_id": 2,
    "title": "退款咨询",
    "turn_count": 5,
    "total_tokens": 1250,
    "total_cost": 0.025,
    "satisfaction": null,
    "created_at": "2026-03-20T10:00:00Z",
    "turns": [
      {
        "id": 1,
        "role": "user",
        "content": "我想退款",
        "input_tokens": 10,
        "output_tokens": 0,
        "created_at": "2026-03-20T10:00:00Z"
      },
      {
        "id": 2,
        "role": "assistant",
        "content": "您好，请告诉我订单号...",
        "input_tokens": 0,
        "output_tokens": 25,
        "model_id": 1,
        "latency_ms": 1200,
        "trace": {
          "steps": [
            {"type": "receive", "content": "我想退款"},
            {"type": "llm_call", "model": "gpt-4o", "tokens": 25}
          ]
        },
        "created_at": "2026-03-20T10:00:01Z"
      }
    ]
  }
}
```

**标注请求体**
```json
{
  "rating": 5,
  "comment": "回复很准确",
  "is_helpful": true
}
```

---

## 四、业务逻辑规则

### 4.1 对话记录规则
1. 每次 Agent 调用完成后，自动创建对话记录和对话轮次
2. 对话标题从第一条用户消息中截取前 20 个字符
3. Token 数和费用实时统计

### 4.2 对话筛选规则
1. 支持按 Agent、用户、时间范围筛选
2. 支持关键词搜索（匹配对话内容）
3. 默认按创建时间倒序排列

### 4.3 对话标注规则
1. 每个对话只能标注一次
2. 标注包含评分（1-5）、备注、是否有帮助
3. 标注数据用于效果评估统计

### 4.4 对话导出规则
1. 支持导出为 JSON 格式
2. 导出包含完整对话内容和链路追踪
3. 单次导出最多 100 条对话

---

## 五、Service 层设计

### 5.1 ConversationService 方法签名
```python
class ConversationService:
    def __init__(self, db: AsyncSession)
    
    async def list_conversations(self, params: PageParams, filters: dict) -> PageResult[ConversationRead]
    async def get_conversation(self, conversation_id: int) -> ConversationDetailRead
    async def annotate_conversation(self, conversation_id: int, data: AnnotationCreate, user_id: int) -> AnnotationRead
    async def export_conversations(self, conversation_ids: list[int]) -> bytes
    async def delete_conversation(self, conversation_id: int) -> None
    
    # 内部方法
    async def record_conversation(self, agent_id: int, agent_name: str, turns: list[dict], tokens: int, cost: float) -> Conversation
```

---

## 六、前端对接要求

### 6.1 服务层文件
文件：`app/src/services/api/conversation.ts`

```typescript
export const apiConversationService = {
  getConversationList: (params: ConversationListParams) => Promise<PaginatedResponse<Conversation>>
  getConversation: (id: number) => Promise<ConversationDetail>
  annotateConversation: (id: number, data: AnnotationCreate) => Promise<AnnotationRead>
  exportConversations: (ids: number[]) => Promise<Blob>
  deleteConversation: (id: number) => Promise<void>
}
```

### 6.2 页面组件要求
| 页面 | 路由 | 功能点 |
|------|------|--------|
| ConversationList | `/conversations` | 列表、搜索、分页、筛选 |
| ConversationDetail | `/conversations/:id` | 对话内容、链路追踪、标注 |

---

## 七、测试要求

### 7.1 单元测试
文件：`test/test_conversation_service.py`

```python
async def test_list_conversations_with_filters():
    # 测试带筛选条件的列表查询
    
async def test_get_conversation_with_turns():
    # 测试获取对话详情包含所有轮次
    
async def test_annotate_conversation():
    # 测试对话标注功能
    
async def test_export_conversations():
    # 测试对话导出功能
```

---

## 八、实现步骤

### Phase 1：后端基础实现
- [ ] 创建 `src/modules/conversation/` 模块目录
- [ ] 实现 `model.py`（ORM 模型定义）
- [ ] 实现 `schema.py`（Pydantic Schema）
- [ ] 实现 `repository.py`（数据访问层）
- [ ] 实现 `service.py`（业务逻辑层）
- [ ] 实现 `api.py`（路由层）
- [ ] 在 `main.py` 中注册路由
- [ ] 生成并执行数据库迁移

### Phase 2：前端对接
- [ ] 完成 `services/api/conversation.ts` 接口调用封装
- [ ] 更新 ConversationList 页面使用真实 API
- [ ] 完成对话详情页面对接
- [ ] 实现标注功能

### Phase 3：测试验证
- [ ] 编写并运行单元测试
- [ ] 进行前后端联调测试
- [ ] 测试对话导出功能

---

## 九、风险与注意事项

| 风险 | 影响 | 应对 |
|------|------|------|
| 对话数据量大 | 查询性能下降 | 添加数据库索引，支持分页查询 |
| 链路追踪数据复杂 | 存储成本高 | 仅存储关键步骤，压缩 trace 数据 |
| 导出大文件内存溢出 | 服务不稳定 | 使用流式导出，限制单次导出数量 |

---

## 十、验收标准

- [ ] 所有 5 个 API 接口可正常调用
- [ ] 对话列表支持分页与筛选
- [ ] 对话详情包含完整链路追踪
- [ ] 标注功能正常工作
- [ ] 导出功能正常
- [ ] 前端页面数据展示正常
- [ ] Mock 模式保持可用

---

**计划版本**：V1.0  
**编写日期**：2026-11-01  
**基线文档**：`docs/PROJECT_SPEC.md`、`docs/spec/PROJECT_SPEC_V2.md`
