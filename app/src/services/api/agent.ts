import { apiClient } from './client'
import type { Agent, AgentVersion, AgentStats } from '../types/agent'
import type { PaginatedResponse } from '../types/common'

export const apiAgentService = {
  async getAgentList(params?: {
    page?: number
    pageSize?: number
    keyword?: string
    type?: string
    status?: string
  }): Promise<PaginatedResponse<Agent>> {
    return apiClient.get('/agents', { params })
  },

  async getAgentDetail(id: string): Promise<Agent> {
    return apiClient.get(`/agents/${id}`)
  },

  async getAgentVersions(id: string): Promise<AgentVersion[]> {
    return apiClient.get(`/agents/${id}/versions`)
  },

  async getAgentStats(id: string): Promise<AgentStats> {
    return apiClient.get(`/agents/${id}/stats`)
  },

  async createAgent(data: Partial<Agent>): Promise<Agent> {
    return apiClient.post('/agents', data)
  },

  async updateAgent(id: string, data: Partial<Agent>): Promise<Agent> {
    return apiClient.put(`/agents/${id}`, data)
  },

  async deleteAgent(id: string): Promise<void> {
    return apiClient.delete(`/agents/${id}`)
  },

  async startAgent(id: string): Promise<void> {
    return apiClient.post(`/agents/${id}/start`)
  },

  async stopAgent(id: string): Promise<void> {
    return apiClient.post(`/agents/${id}/stop`)
  },
};
