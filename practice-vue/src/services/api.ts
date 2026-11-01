import { api } from '@/apis'
import type {
  User, Agent, Model, Prompt, KnowledgeBase,
  UserService, AgentService, ModelService, PromptService, KnowledgeService,
  PaginatedResponse, RequestParams,
} from './types'

// ============ User API ============

export const apiUserService: UserService = {
  getList: (params: RequestParams) => api.get<PaginatedResponse<User>>('/users', params),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: Partial<User>) => api.post<User>('/users', data),
  update: (id: number, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete<void>(`/users/${id}`),
}

// ============ Agent API ============

export const apiAgentService: AgentService = {
  getList: (params: RequestParams) => api.get<PaginatedResponse<Agent>>('/agents', params),
  getById: (id: number) => api.get<Agent>(`/agents/${id}`),
  create: (data: Partial<Agent>) => api.post<Agent>('/agents', data),
  update: (id: number, data: Partial<Agent>) => api.put<Agent>(`/agents/${id}`, data),
  delete: (id: number) => api.delete<void>(`/agents/${id}`),
}

// ============ Model API ============

export const apiModelService: ModelService = {
  getList: (params: RequestParams) => api.get<PaginatedResponse<Model>>('/models', params),
  getById: (id: number) => api.get<Model>(`/models/${id}`),
  create: (data: Partial<Model>) => api.post<Model>('/models', data),
  update: (id: number, data: Partial<Model>) => api.put<Model>(`/models/${id}`, data),
  delete: (id: number) => api.delete<void>(`/models/${id}`),
}

// ============ Prompt API ============

export const apiPromptService: PromptService = {
  getList: (params: RequestParams) => api.get<PaginatedResponse<Prompt>>('/prompts', params),
  getById: (id: number) => api.get<Prompt>(`/prompts/${id}`),
  create: (data: Partial<Prompt>) => api.post<Prompt>('/prompts', data),
  update: (id: number, data: Partial<Prompt>) => api.put<Prompt>(`/prompts/${id}`, data),
  delete: (id: number) => api.delete<void>(`/prompts/${id}`),
}

// ============ Knowledge API ============

export const apiKnowledgeService: KnowledgeService = {
  getList: (params: RequestParams) => api.get<PaginatedResponse<KnowledgeBase>>('/knowledge-bases', params),
  getById: (id: number) => api.get<KnowledgeBase>(`/knowledge-bases/${id}`),
  create: (data: Partial<KnowledgeBase>) => api.post<KnowledgeBase>('/knowledge-bases', data),
  update: (id: number, data: Partial<KnowledgeBase>) => api.put<KnowledgeBase>(`/knowledge-bases/${id}`, data),
  delete: (id: number) => api.delete<void>(`/knowledge-bases/${id}`),
}
