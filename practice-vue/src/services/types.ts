import type { PaginatedResponse, RequestParams } from '@/apis'

// ============ 类型定义 ============

export interface User {
  id: number
  username: string
  name: string
  email: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Agent {
  id: number
  name: string
  description: string
  type: 'conversation' | 'tool' | 'analysis' | 'creative'
  status: 'active' | 'inactive' | 'draft'
  modelId: number
  createdAt: string
  updatedAt: string
}

export interface Model {
  id: number
  name: string
  provider: string
  contextLength: number
  status: 'active' | 'inactive'
  isDefault: boolean
  createdAt: string
}

export interface Prompt {
  id: number
  name: string
  description: string
  category: string
  content: string
  status: 'draft' | 'published'
  usageCount: number
  createdAt: string
  updatedAt: string
}

export interface KnowledgeBase {
  id: number
  name: string
  description: string
  documentCount: number
  segmentCount: number
  status: 'ready' | 'indexing' | 'error'
  createdAt: string
}

// ============ 服务接口 ============

export interface UserService {
  getList(params: RequestParams): Promise<PaginatedResponse<User>>
  getById(id: number): Promise<User>
  create(data: Partial<User>): Promise<User>
  update(id: number, data: Partial<User>): Promise<User>
  delete(id: number): Promise<void>
}

export interface AgentService {
  getList(params: RequestParams): Promise<PaginatedResponse<Agent>>
  getById(id: number): Promise<Agent>
  create(data: Partial<Agent>): Promise<Agent>
  update(id: number, data: Partial<Agent>): Promise<Agent>
  delete(id: number): Promise<void>
}

export interface ModelService {
  getList(params: RequestParams): Promise<PaginatedResponse<Model>>
  getById(id: number): Promise<Model>
  create(data: Partial<Model>): Promise<Model>
  update(id: number, data: Partial<Model>): Promise<Model>
  delete(id: number): Promise<void>
}

export interface PromptService {
  getList(params: RequestParams): Promise<PaginatedResponse<Prompt>>
  getById(id: number): Promise<Prompt>
  create(data: Partial<Prompt>): Promise<Prompt>
  update(id: number, data: Partial<Prompt>): Promise<Prompt>
  delete(id: number): Promise<void>
}

export interface KnowledgeService {
  getList(params: RequestParams): Promise<PaginatedResponse<KnowledgeBase>>
  getById(id: number): Promise<KnowledgeBase>
  create(data: Partial<KnowledgeBase>): Promise<KnowledgeBase>
  update(id: number, data: Partial<KnowledgeBase>): Promise<KnowledgeBase>
  delete(id: number): Promise<void>
}
