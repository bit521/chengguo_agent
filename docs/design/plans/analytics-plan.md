# 数据统计模块开发计划

> 本文档基于 `docs/PROJECT_SPEC.md` 和 `docs/spec/PROJECT_SPEC_V2.md` 编写，用于指导数据统计模块的后端实现与前端对接开发。

---

## 一、模块概述

### 1.1 模块定位
数据统计模块提供平台运行数据的可视化分析能力，包括：
- 用量统计（对话次数、Token 消耗）
- 费用分析（按 Agent/模型/时间维度）
- 效果评估（满意度、成功率趋势）
- 排行榜（热门 Agent、热门模型）

### 1.2 当前状态
| 层级 | 状态 |
|------|------|
| 后端 Model/Schema/Repository/Service/Api | ❌ 待创建 |
| 前端 UI/Mock 数据 | ✅ 已实现 |
| 前后端接口对接 | ❌ 待实现 |

### 1.3 权限要求
本次 PRD V2 明确将数据统计列为"本次不设权限"的模块，仅要求登录可见。

---

## 二、数据模型

### 2.1 建议 ORM 模型
文件：`src/modules/analytics/model.py`

**DailyStats 表（daily_stats）**
```python
class DailyStats(BaseModel):
    date: date                             # 日期
    agent_id: int                          # Agent ID
    conversation_count: int                # 对话次数
    total_tokens: int                      # 总 Token 数
    total_cost: float                      # 总费用
    success_count: int                     # 成功次数
    avg_latency_ms: float                  # 平均延迟
```

**CostAnalysis 表（cost_analysis）**
```python
class CostAnalysis(BaseModel):
    agent_id: int                          # Agent ID
    model_id: int                          # 模型 ID
    month: str                             # 月份（YYYY-MM）
    input_tokens: int                      # 输入 Token
    output_tokens: int                     # 输出 Token
    total_cost: float                      # 总费用
```

---

## 三、API 接口规范

### 3.1 接口清单

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/api/v1/analytics/overview` | 仅需登录 | 统计概览 |
| GET | `/api/v1/analytics/daily` | 仅需登录 | 每日统计 |
| GET | `/api/v1/analytics/by-agent` | 仅需登录 | 按 Agent 统计 |
| GET | `/api/v1/analytics/by-model` | 仅需登录 | 按模型统计 |
| GET | `/api/v1/analytics/costs` | 仅需登录 | 费用分析 |
| GET | `/api/v1/analytics/evaluation` | 仅需登录 | 效果评估 |

### 3.2 请求/响应格式

**概览统计响应体**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total_conversations": 12500,
    "total_tokens": 2500000,
    "total_cost": 125.50,
    "avg_satisfaction": 4.2,
    "success_rate": 98.5,
    "trends": {
      "conversations": [100, 120, 150, 180, 200],
      "costs": [5.2, 6.1, 7.5, 8.2, 9.1]
    }
  }
}
```

**每日统计查询参数**
```typescript
interface DailyStatsParams {
  start_date: string   // 开始日期
  end_date: string     // 结束日期
  agent_id?: number    // 按 Agent 筛选
}
```

**每日统计响应体**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "date": "2026-03-01",
      "conversation_count": 150,
      "total_tokens": 30000,
      "total_cost": 1.50,
      "avg_latency_ms": 1200
    }
  ]
}
```

**效果评估响应体**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "avg_satisfaction": 4.2,
    "satisfaction_distribution": {
      "5": 45,
      "4": 30,
      "3": 15,
      "2": 5,
      "1": 5
    },
    "success_rate": 98.5,
    "error_rate": 1.5,
    "top_agents": [
      {"agent_id": 1, "agent_name": "客服助手", "conversation_count": 5000, "avg_satisfaction": 4.5}
    ]
  }
}
```

---

## 四、业务逻辑规则

### 4.1 统计聚合规则
1. 每日统计数据按日期 + Agent 维度聚合
2. 费用计算：`input_tokens * input_price + output_tokens * output_price`
3. 成功率 = 成功调用次数 / 总调用次数

### 4.2 趋势计算规则
1. 支持 7 天、30 天、自定义时间范围
2. 趋势数据按时间顺序排列
3. 空日期填充为 0

### 4.3 效果评估规则
1. 满意度分布按 1-5 分统计
2. 成功/失败基于对话状态判断
3. Top Agent 按对话次数排序

---

## 五、Service 层设计

### 5.1 AnalyticsService 方法签名
```python
class AnalyticsService:
    def __init__(self, db: AsyncSession)
    
    async def get_overview(self, days: int = 7) -> dict
    async def get_daily_stats(self, start_date: date, end_date: date, agent_id: int | None = None) -> list[dict]
    async def get_by_agent(self, days: int = 30) -> list[dict]
    async def get_by_model(self, days: int = 30) -> list[dict]
    async def get_cost_analysis(self, start_date: date, end_date: date) -> dict
    async def get_evaluation(self, days: int = 30) -> dict
    
    # 内部方法
    def _calculate_trends(self, data: list[dict], field: str) -> list[int]
```

---

## 六、前端对接要求

### 6.1 服务层文件
文件：`app/src/services/api/analytics.ts`

```typescript
export const apiAnalyticsService = {
  getOverview: (days?: number) => Promise<AnalyticsOverview>
  getDailyStats: (params: { start_date: string; end_date: string; agent_id?: number }) => Promise<DailyStat[]>
  getByAgent: (days?: number) => Promise<AgentStat[]>
  getByModel: (days?: number) => Promise<ModelStat[]>
  getCostAnalysis: (params: { start_date: string; end_date: string }) => Promise<CostAnalysis>
  getEvaluation: (days?: number) => Promise<EvaluationData>
}
```

### 6.2 页面组件要求
| 页面 | 路由 | 功能点 |
|------|------|--------|
| AnalyticsUsage | `/analytics` | 用量概览、趋势图表 |
| AnalyticsCosts | `/analytics/costs` | 费用分析、按维度统计 |
| AnalyticsEvaluation | `/analytics/evaluation` | 效果评估、满意度分布 |

---

## 七、测试要求

### 7.1 单元测试
文件：`test/test_analytics_service.py`

```python
async def test_get_overview():
    # 测试概览统计计算
    
async def test_get_daily_stats_with_date_range():
    # 测试按日期范围查询
    
async def test_get_evaluation_with_satisfaction():
    # 测试效果评估计算
```

---

## 八、实现步骤

### Phase 1：后端基础实现
- [ ] 创建 `src/modules/analytics/` 模块目录
- [ ] 实现 `model.py`（ORM 模型定义）
- [ ] 实现 `schema.py`（Pydantic Schema）
- [ ] 实现 `repository.py`（数据访问层，含聚合查询）
- [ ] 实现 `service.py`（业务逻辑层）
- [ ] 实现 `api.py`（路由层）
- [ ] 在 `main.py` 中注册路由
- [ ] 生成并执行数据库迁移

### Phase 2：图表集成
- [ ] 安装 Recharts 库
- [ ] 实现趋势图组件
- [ ] 实现柱状图组件
- [ ] 实现饼图组件

### Phase 3：前端对接
- [ ] 完成 `services/api/analytics.ts` 接口调用封装
- [ ] 更新 AnalyticsUsage 页面使用真实 API
- [ ] 完成费用分析和效果评估页面对接

### Phase 4：测试验证
- [ ] 编写并运行单元测试
- [ ] 进行前后端联调测试
- [ ] 验证图表渲染正常

---

## 九、风险与注意事项

| 风险 | 影响 | 应对 |
|------|------|------|
| 历史数据统计缺失 | 趋势图显示不全 | 提供数据回填脚本 |
| 大时间范围查询性能 | 接口响应慢 | 添加物化视图或缓存 |
| 实时统计延迟 | 数据不即时 | 采用 T+1 统计策略 |

---

## 十、验收标准

- [ ] 所有 6 个 API 接口可正常调用
- [ ] 概览统计数据准确
- [ ] 趋势图渲染正常
- [ ] 费用分析功能正常
- [ ] 效果评估功能正常
- [ ] 前端页面数据展示正常
- [ ] Mock 模式保持可用

---

**计划版本**：V1.0  
**编写日期**：2026-11-01  
**基线文档**：`docs/PROJECT_SPEC.md`、`docs/spec/PROJECT_SPEC_V2.md`
