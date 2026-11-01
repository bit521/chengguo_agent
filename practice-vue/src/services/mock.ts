import type {
  User, Agent, Model, Prompt, KnowledgeBase,
  UserService, AgentService, ModelService, PromptService, KnowledgeService,
  PaginatedResponse, RequestParams,
} from './types'
import { api } from '@/apis'

// ============ Mock 数据 ============

const mockUsers: User[] = [
  { id: 1, username: 'admin', name: '管理员', email: 'admin@example.com', role: 'admin', status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 2, username: 'user1', name: '张三', email: 'zhangsan@example.com', role: 'user', status: 'active', createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z' },
  { id: 3, username: 'user2', name: '李四', email: 'lisi@example.com', role: 'user', status: 'inactive', createdAt: '2024-01-03T00:00:00Z', updatedAt: '2024-01-03T00:00:00Z' },
]

const mockAgents: Agent[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `Agent ${i + 1}`,
  description: `这是第 ${i + 1} 个 Agent 的描述`,
  type: (['conversation', 'tool', 'analysis', 'creative'] as const)[i % 4],
  status: (['active', 'inactive', 'draft'] as const)[i % 3],
  modelId: (i % 5) + 1,
  createdAt: `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
  updatedAt: `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
}))

const mockModels: Model[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Model ${i + 1}`,
  provider: ['OpenAI', 'Anthropic', 'Azure'][i % 3],
  contextLength: [4096, 8192, 16384, 32768][i % 4],
  status: i === 0 ? 'active' : 'active',
  isDefault: i === 0,
  createdAt: `2024-01-0${i + 1}T00:00:00Z`,
}))

const mockPrompts: Prompt[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Prompt ${i + 1}`,
  description: `这是第 ${i + 1} 个 Prompt`,
  category: ['general', 'coding', 'writing', 'analysis'][i % 4],
  content: '# 系统提示词\n\n请帮我完成以下任务...',
  status: (['draft', 'published'] as const)[i % 2],
  usageCount: Math.floor(Math.random() * 1000),
  createdAt: `2024-01-0${i + 1}T00:00:00Z`,
  updatedAt: `2024-01-0${i + 1}T00:00:00Z`,
}))

const mockKnowledgeBases: KnowledgeBase[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `知识库 ${i + 1}`,
  description: `这是第 ${i + 1} 个知识库`,
  documentCount: Math.floor(Math.random() * 50) + 5,
  segmentCount: Math.floor(Math.random() * 500) + 50,
  status: (['ready', 'indexing', 'error'] as const)[i % 3],
  createdAt: `2024-01-0${i + 1}T00:00:00Z`,
}))

// ============ 通用工具函数 ============

function paginate<T>(items: T[], params: RequestParams): PaginatedResponse<T> {
  let filtered = items
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = items.filter(item => JSON.stringify(item).toLowerCase().includes(kw))
  }
  const page = params.page || 1
  const pageSize = params.pageSize || 10
  const total = filtered.length
  const start = (page - 1) * pageSize
  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
  }
}

// ============ Mock 服务实现 ============

export const mockUserService: UserService = {
  async getList(params: RequestParams) {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
    return paginate(mockUsers, params)
  },
  async getById(id: number) {
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))
    const user = mockUsers.find(u => u.id === id)
    if (!user) throw new Error(`User ${id} not found`)
    return user
  },
  async create(data: Partial<User>) {
    await new Promise(resolve => setTimeout(resolve, 100))
    const newUser: User = {
      id: mockUsers.length + 1,
      username: data.username || '',
      name: data.name || '',
      email: data.email || '',
      role: data.role || 'user',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockUsers.push(newUser)
    return newUser
  },
  async update(id: number, data: Partial<User>) {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockUsers.findIndex(u => u.id === id)
    if (index === -1) throw new Error(`User ${id} not found`)
    mockUsers[index] = { ...mockUsers[index], ...data, updatedAt: new Date().toISOString() }
    return mockUsers[index]
  },
  async delete(id: number) {
    await new Promise(resolve => setTimeout(resolve, 50))
    const index = mockUsers.findIndex(u => u.id === id)
    if (index !== -1) mockUsers.splice(index, 1)
  },
}

export const mockAgentService: AgentService = {
  async getList(params: RequestParams) {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
    return paginate(mockAgents, params)
  },
  async getById(id: number) {
    await new Promise(resolve => setTimeout(resolve, 50))
    const agent = mockAgents.find(a => a.id === id)
    if (!agent) throw new Error(`Agent ${id} not found`)
    return agent
  },
  async create(data: Partial<Agent>) {
    await new Promise(resolve => setTimeout(resolve, 100))
    const newAgent: Agent = {
      id: mockAgents.length + 1,
      name: data.name || '',
      description: data.description || '',
      type: data.type || 'conversation',
      status: 'draft',
      modelId: data.modelId || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockAgents.push(newAgent)
    return newAgent
  },
  async update(id: number, data: Partial<Agent>) {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockAgents.findIndex(a => a.id === id)
    if (index === -1) throw new Error(`Agent ${id} not found`)
    mockAgents[index] = { ...mockAgents[index], ...data, updatedAt: new Date().toISOString() }
    return mockAgents[index]
  },
  async delete(id: number) {
    await new Promise(resolve => setTimeout(resolve, 50))
    const index = mockAgents.findIndex(a => a.id === id)
    if (index !== -1) mockAgents.splice(index, 1)
  },
}

export const mockModelService: ModelService = {
  async getList(params: RequestParams) {
    await new Promise(resolve => setTimeout(resolve, 100))
    return paginate(mockModels, params)
  },
  async getById(id: number) {
    await new Promise(resolve => setTimeout(resolve, 50))
    const model = mockModels.find(m => m.id === id)
    if (!model) throw new Error(`Model ${id} not found`)
    return model
  },
  async create(data: Partial<Model>) {
    await new Promise(resolve => setTimeout(resolve, 100))
    const newModel: Model = {
      id: mockModels.length + 1,
      name: data.name || '',
      provider: data.provider || 'OpenAI',
      contextLength: data.contextLength || 4096,
      status: 'active',
      isDefault: false,
      createdAt: new Date().toISOString(),
    }
    mockModels.push(newModel)
    return newModel
  },
  async update(id: number, data: Partial<Model>) {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockModels.findIndex(m => m.id === id)
    if (index === -1) throw new Error(`Model ${id} not found`)
    mockModels[index] = { ...mockModels[index], ...data }
    return mockModels[index]
  },
  async delete(id: number) {
    await new Promise(resolve => setTimeout(resolve, 50))
    const index = mockModels.findIndex(m => m.id === id)
    if (index !== -1) mockModels.splice(index, 1)
  },
}

export const mockPromptService: PromptService = {
  async getList(params: RequestParams) {
    await new Promise(resolve => setTimeout(resolve, 100))
    return paginate(mockPrompts, params)
  },
  async getById(id: number) {
    await new Promise(resolve => setTimeout(resolve, 50))
    const prompt = mockPrompts.find(p => p.id === id)
    if (!prompt) throw new Error(`Prompt ${id} not found`)
    return prompt
  },
  async create(data: Partial<Prompt>) {
    await new Promise(resolve => setTimeout(resolve, 100))
    const newPrompt: Prompt = {
      id: mockPrompts.length + 1,
      name: data.name || '',
      description: data.description || '',
      category: data.category || 'general',
      content: data.content || '',
      status: 'draft',
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockPrompts.push(newPrompt)
    return newPrompt
  },
  async update(id: number, data: Partial<Prompt>) {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockPrompts.findIndex(p => p.id === id)
    if (index === -1) throw new Error(`Prompt ${id} not found`)
    mockPrompts[index] = { ...mockPrompts[index], ...data, updatedAt: new Date().toISOString() }
    return mockPrompts[index]
  },
  async delete(id: number) {
    await new Promise(resolve => setTimeout(resolve, 50))
    const index = mockPrompts.findIndex(p => p.id === id)
    if (index !== -1) mockPrompts.splice(index, 1)
  },
}

export const mockKnowledgeService: KnowledgeService = {
  async getList(params: RequestParams) {
    await new Promise(resolve => setTimeout(resolve, 100))
    return paginate(mockKnowledgeBases, params)
  },
  async getById(id: number) {
    await new Promise(resolve => setTimeout(resolve, 50))
    const kb = mockKnowledgeBases.find(k => k.id === id)
    if (!kb) throw new Error(`KnowledgeBase ${id} not found`)
    return kb
  },
  async create(data: Partial<KnowledgeBase>) {
    await new Promise(resolve => setTimeout(resolve, 100))
    const newKb: KnowledgeBase = {
      id: mockKnowledgeBases.length + 1,
      name: data.name || '',
      description: data.description || '',
      documentCount: 0,
      segmentCount: 0,
      status: 'ready',
      createdAt: new Date().toISOString(),
    }
    mockKnowledgeBases.push(newKb)
    return newKb
  },
  async update(id: number, data: Partial<KnowledgeBase>) {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockKnowledgeBases.findIndex(k => k.id === id)
    if (index === -1) throw new Error(`KnowledgeBase ${id} not found`)
    mockKnowledgeBases[index] = { ...mockKnowledgeBases[index], ...data }
    return mockKnowledgeBases[index]
  },
  async delete(id: number) {
    await new Promise(resolve => setTimeout(resolve, 50))
    const index = mockKnowledgeBases.findIndex(k => k.id === id)
    if (index !== -1) mockKnowledgeBases.splice(index, 1)
  },
}

// ============ 导出 ============

export { mockUsers, mockAgents, mockModels, mockPrompts, mockKnowledgeBases }
