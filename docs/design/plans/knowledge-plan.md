# 知识库管理模块开发计划

> 本文档基于 `docs/PROJECT_SPEC.md` 和 `docs/spec/PROJECT_SPEC_V2.md` 编写，用于指导知识库管理模块的后端与前端对接开发。

---

## 一、模块概述

### 1.1 模块定位
知识库管理模块提供 RAG（检索增强生成）知识库的全流程管理能力，包括：
- 知识库 CRUD 操作
- 文档上传与处理（MinIO 存储 + 异步分段）
- 分段管理（查看、编辑、删除）
- 检索策略配置
- 检索测试

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
| 查看列表/详情/文档/分段 | `knowledge:list` |
| 创建知识库 | `knowledge:create` |
| 编辑知识库/配置 | `knowledge:update` |
| 删除知识库/文档/分段 | `knowledge:delete` |
| 上传/重试文档 | `knowledge:upload` |
| 检索测试 | `knowledge:retrieval` |

---

## 二、数据模型

### 2.1 ORM 模型
文件：`src/modules/knowledge/model.py`

**KnowledgeBase 表（knowledge_bases）**
```python
class KnowledgeBase(BaseModel):
    name: str                          # 知识库名称
    description: str | None            # 描述
    status: str                        # 状态: ready/indexing/error/empty
    document_count: int                # 文档数量
    segment_count: int                 # 分段数量
    embedding_model: str               # 向量化模型
    chunk_method: str                  # 分段方式: fixed/sentence/paragraph
    chunk_size: int                    # 分段大小（tokens）
    chunk_overlap: int                 # 重叠大小（tokens）
    retrieval_strategy: str            # 检索策略: vector/fulltext/hybrid
    top_k: int                         # 返回结果数
    similarity_threshold: float        # 相似度阈值
    created_by: str | None             # 创建者
```

**Document 表（documents）**
```python
class Document(BaseModel):
    knowledge_base_id: int             # 所属知识库 ID
    file_name: str                     # 文件名
    file_type: str                     # 文件类型: pdf/docx/md/txt/html/csv
    file_size: str | None              # 文件大小
    minio_path: str | None             # MinIO 存储路径
    status: str                        # 状态: pending/processing/completed/failed
    segment_count: int                 # 分段数量
    word_count: int                    # 字数
    error_message: str | None          # 错误信息
    uploaded_by: str | None            # 上传者
    processed_at: datetime | None      # 处理完成时间
```

**Segment 表（segments）**
```python
class Segment(BaseModel):
    knowledge_base_id: int             # 所属知识库 ID
    document_id: int                   # 所属文档 ID
    content: str                       # 分段内容
    word_count: int                    # 字数
    token_count: int                   # Token 数量
    keywords: list[str]                # 关键词（JSON 数组）
    hit_count: int                     # 命中次数
    vector: list[float] | None         # 向量表示
```

### 2.2 Pydantic Schema
文件：`src/modules/knowledge/schema.py`

```python
class KnowledgeBaseCreate(BaseModel):
    name: str
    description: str | None = None
    embedding_model: str = "text-embedding-ada-002"
    chunk_method: str = "fixed"
    chunk_size: int = 500
    chunk_overlap: int = 50
    retrieval_strategy: str = "hybrid"
    top_k: int = 5
    similarity_threshold: float = 0.7

class KnowledgeBaseConfigUpdate(BaseModel):
    embedding_model: str | None = None
    chunk_method: str | None = None
    chunk_size: int | None = Field(default=None, ge=100, le=2000)
    chunk_overlap: int | None = Field(default=None, ge=0, le=500)
    retrieval_strategy: str | None = None
    top_k: int | None = Field(default=None, ge=1, le=20)
    similarity_threshold: float | None = Field(default=None, ge=0.0, le=1.0)

class RetrievalTestRequest(BaseModel):
    query: str

class RetrievalTestResult(BaseModel):
    query: str
    results: list[dict]
    elapsed_ms: float
```

---

## 三、API 接口规范

### 3.1 接口清单

#### 知识库接口
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/v1/knowledge-bases` | `knowledge:create` | 创建知识库 |
| GET | `/api/v1/knowledge-bases` | `knowledge:list` | 知识库列表（分页） |
| GET | `/api/v1/knowledge-bases/{id}` | `knowledge:list` | 知识库详情 |
| PUT | `/api/v1/knowledge-bases/{id}` | `knowledge:update` | 更新基本信息 |
| PUT | `/api/v1/knowledge-bases/{id}/config` | `knowledge:update` | 更新分段/检索配置 |
| DELETE | `/api/v1/knowledge-bases/{id}` | `knowledge:delete` | 删除知识库 |

#### 文档接口
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/api/v1/knowledge-bases/{kb_id}/documents` | `knowledge:list` | 文档列表 |
| POST | `/api/v1/knowledge-bases/{kb_id}/documents` | `knowledge:upload` | 上传文档 |
| DELETE | `/api/v1/knowledge-bases/{kb_id}/documents/{doc_id}` | `knowledge:delete` | 删除文档 |
| POST | `/api/v1/knowledge-bases/{kb_id}/documents/{doc_id}/retry` | `knowledge:upload` | 重试失败文档 |

#### 分段接口
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/api/v1/knowledge-bases/{kb_id}/segments` | `knowledge:list` | 分段列表 |
| GET | `/api/v1/knowledge-bases/{kb_id}/documents/{doc_id}/segments` | `knowledge:list` | 按文档查询分段 |
| PUT | `/api/v1/knowledge-bases/{kb_id}/segments/{seg_id}` | `knowledge:update` | 编辑分段 |
| DELETE | `/api/v1/knowledge-bases/{kb_id}/segments/{seg_id}` | `knowledge:delete` | 删除分段 |

#### 检索测试接口
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/v1/knowledge-bases/{kb_id}/retrieval-test` | `knowledge:retrieval` | 检索测试 |

### 3.2 请求/响应格式

**创建知识库请求体**
```json
{
  "name": "产品手册",
  "description": "公司产品使用手册知识库",
  "embedding_model": "text-embedding-ada-002",
  "chunk_method": "fixed",
  "chunk_size": 500,
  "chunk_overlap": 50,
  "retrieval_strategy": "hybrid",
  "top_k": 5,
  "similarity_threshold": 0.7
}
```

**上传文档响应（异步处理）**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "file_name": "手册.pdf",
    "status": "pending",
    "message": "文档已接收，正在处理"
  }
}
```

**检索测试结果**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "query": "如何退款",
    "results": [
      {
        "content": "退款需在7天内申请...",
        "score": 0.85,
        "document_name": "售后政策.md"
      }
    ],
    "elapsed_ms": 120
  }
}
```

### 3.3 错误码定义

| 错误码 | HTTP 状态 | 含义 |
|--------|-----------|------|
| 401 | 401 | 未登录或 token 过期 |
| 403 | 403 | 无权限执行此操作 |
| 43001 | 200 | 知识库不存在 |
| 43002 | 200 | 文档不存在 |
| 43003 | 200 | 分段不存在 |
| 43004 | 200 | 文件类型不支持 |
| 43005 | 200 | MinIO 存储错误 |

---

## 四、业务逻辑规则

### 4.1 知识库创建规则
1. 名称不可为空，同一用户下不可重复
2. 创建后默认状态为 `empty`
3. 分段策略和检索策略可在创建时配置

### 4.2 文档上传规则
1. 支持的文件类型：pdf/docx/md/txt/html/csv
2. 文件大小限制：单文件最大 50MB
3. 上传后状态为 `pending`，异步处理
4. 处理流程：存储到 MinIO → 文本提取 → 分段 → 向量化 → 存储

### 4.3 分段管理规则
1. 分段内容不可为空
2. 编辑分段时同步更新向量索引
3. 删除分段时同步删除向量记录

### 4.4 检索测试规则
1. 对查询文本进行向量化
2. 根据检索策略（vector/fulltext/hybrid）执行检索
3. 返回 Top-K 结果及相似度分数
4. 记录检索耗时

---

## 五、Service 层设计

### 5.1 KnowledgeService 方法签名
```python
class KnowledgeService:
    def __init__(self, db: AsyncSession)
    
    async def create_kb(self, data: KnowledgeBaseCreate, current_user: str) -> KnowledgeBaseRead
    async def get_kb(self, kb_id: int) -> KnowledgeBaseRead
    async def list_kbs(self, params: PageParams) -> PageResult[KnowledgeBaseRead]
    async def update_kb(self, kb_id: int, data: KnowledgeBaseUpdate) -> KnowledgeBaseRead
    async def update_kb_config(self, kb_id: int, data: KnowledgeBaseConfigUpdate) -> KnowledgeBaseRead
    async def delete_kb(self, kb_id: int) -> None
    
    async def upload_document(self, kb_id: int, file: UploadFile, background_tasks: BackgroundTasks, current_user: str) -> DocumentRead
    async def list_documents(self, kb_id: int, params: PageParams) -> PageResult[DocumentRead]
    async def delete_document(self, kb_id: int, doc_id: int) -> None
    async def retry_document(self, kb_id: int, doc_id: int) -> DocumentRead
    
    async def list_segments(self, kb_id: int, params: PageParams, document_id: int | None = None) -> PageResult[SegmentRead]
    async def get_document_segments(self, kb_id: int, doc_id: int, params: PageParams) -> PageResult[SegmentRead]
    async def update_segment(self, kb_id: int, seg_id: int, data: SegmentUpdate) -> SegmentRead
    async def delete_segment(self, kb_id: int, seg_id: int) -> None
    
    async def test_retrieval(self, kb_id: int, data: RetrievalTestRequest) -> RetrievalTestResult
```

---

## 六、前端对接要求

### 6.1 服务层文件
文件：`app/src/services/api/knowledge.ts`

```typescript
export const apiKnowledgeService = {
  // 知识库管理
  getKnowledgeList: (params: PaginationParams & { keyword?: string }) => Promise<PaginatedResponse<KnowledgeBase>>
  getKnowledge: (id: number) => Promise<KnowledgeBase>
  createKnowledge: (data: KnowledgeBaseCreate) => Promise<KnowledgeBase>
  updateKnowledge: (id: number, data: KnowledgeBaseUpdate) => Promise<KnowledgeBase>
  updateKnowledgeConfig: (id: number, data: KnowledgeBaseConfigUpdate) => Promise<KnowledgeBase>
  deleteKnowledge: (id: number) => Promise<void>
  
  // 文档管理
  uploadDocument: (kbId: number, file: File) => Promise<Document>
  getDocumentList: (kbId: number, params: PaginationParams) => Promise<PaginatedResponse<Document>>
  deleteDocument: (kbId: number, docId: number) => Promise<void>
  retryDocument: (kbId: number, docId: number) => Promise<Document>
  
  // 分段管理
  getSegmentList: (kbId: number, params: PaginationParams & { document_id?: number }) => Promise<PaginatedResponse<Segment>>
  updateSegment: (kbId: number, segId: number, data: SegmentUpdate) => Promise<Segment>
  deleteSegment: (kbId: number, segId: number) => Promise<void>
  
  // 检索测试
  testRetrieval: (kbId: number, query: string) => Promise<RetrievalTestResult>
}
```

### 6.2 页面组件要求
| 页面 | 路由 | 功能点 |
|------|------|--------|
| KnowledgeList | `/knowledge` | 知识库列表、搜索、分页 |
| KnowledgeCreate | `/knowledge/create` | 创建知识库表单 |
| KnowledgeDetail | `/knowledge/:id` | 概览、文档管理、配置编辑 |
| KnowledgeDocuments | `/knowledge/:id/documents` | 文档列表、上传、分段预览 |
| KnowledgeSegments | `/knowledge/:id/segments` | 分段列表、编辑、删除 |
| KnowledgeTest | `/knowledge/:id/test` | 检索测试界面 |

---

## 七、测试要求

### 7.1 单元测试
文件：`test/test_knowledge_service.py`

```python
async def test_create_kb_success():
    # 测试正常创建知识库
    
async def test_upload_document():
    # 测试文档上传与异步处理
    
async def test_retrieval_test():
    # 测试检索功能
    
async def test_delete_kb_cascades():
    # 测试级联删除文档和分段
```

---

## 八、实现步骤

### Phase 1：权限校验完善
- [ ] 为所有知识库接口添加权限校验
- [ ] 为文档上传接口添加权限校验
- [ ] 为检索测试接口添加权限校验

### Phase 2：前端对接
- [ ] 完成 `services/api/knowledge.ts` 接口调用封装
- [ ] 更新 KnowledgeList 页面使用真实 API
- [ ] 实现文档上传功能（multipart/form-data）
- [ ] 完成检索测试页面对接

### Phase 3：测试验证
- [ ] 编写并运行单元测试
- [ ] 进行前后端联调测试
- [ ] 验证文件上传与异步处理
- [ ] 验证权限控制逻辑

---

## 九、风险与注意事项

| 风险 | 影响 | 应对 |
|------|------|------|
| 大文件上传超时 | 用户体验差 | 使用 BackgroundTasks 异步处理，返回即时响应 |
| MinIO 存储故障 | 文档丢失 | 添加重试机制，记录错误日志 |
| 向量化服务不可用 | 检索失败 | 添加降级策略，支持纯文本检索 |
| 并发上传冲突 | 数据不一致 | 使用数据库事务保证原子性 |

---

## 十、验收标准

- [ ] 所有知识库 API 接口可正常调用
- [ ] 文档上传功能正常工作
- [ ] 分段管理与检索测试功能正常
- [ ] 权限控制生效
- [ ] 前端页面数据展示正常
- [ ] Mock 模式保持可用

---

**计划版本**：V1.0  
**编写日期**：2026-11-01  
**基线文档**：`docs/PROJECT_SPEC.md`、`docs/spec/PROJECT_SPEC_V2.md`
