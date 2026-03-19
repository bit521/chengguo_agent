import type { Agent, AgentVersion, AgentStats } from '../types/agent'
import type { PaginatedResponse } from '../types/common'
import { mockAgents, mockAgentVersions } from './data/agents'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockAgentService = {
  async getAgentList(params?: {
    page?: number
    pageSize?: number
    keyword?: string
    type?: string
    status?: string
  }): Promise<PaginatedResponse<Agent>> {
    await delay(300 + Math.random() * 200)

    let filtered = [...mockAgents]

    if (params?.keyword) {
      filtered = filtered.filter(a =>
        a.name.includes(params.keyword!) ||
        a.description.includes(params.keyword!)
      )
    }
    if (params?.type) {
      filtered = filtered.filter(a => a.type === params.type)
    }
    if (params?.status) {
      filtered = filtered.filter(a => a.status === params.status)
    }

    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)

    return {
      data: items,
      total: filtered.length,
      page,
      pageSize,
    }
  },

  async getAgentDetail(id: string): Promise<Agent> {
    await delay(200)
    const agent = mockAgents.find(a => a.id === id)
    if (!agent) throw new Error('Agent not found')
    return agent
  },

  async getAgentVersions(id: string): Promise<AgentVersion[]> {
    await delay(250)
    return mockAgentVersions[id] || []
  },

  async getAgentStats(id: string): Promise<AgentStats> {
    await delay(200)
    const agent = mockAgents.find(a => a.id === id)
    if (!agent) throw new Error('Agent not found')
    
    return {
      todayCalls: Math.floor(agent.callCount7d / 7),
      successRate: agent.successRate,
      avgLatency: 1.2 + Math.random() * 2,
      tokenUsage: Math.floor(agent.callCount7d * 180)
    }
  },

  async createAgent(data: Partial<Agent>): Promise<Agent> {
    await delay(500)
    const newAgent: Agent = {
      id: String(mockAgents.length + 1),
      name: data.name || '',
      description: data.description || '',
      type: data.type || 'conversation',
      status: 'draft',
      modelId: data.modelId || 'gpt-4',
      modelName: data.modelName || 'GPT-4',
      config: data.config || {} as any,
      successRate: 0,
      callCount7d: 0,
      lastRun: '从未运行',
      version: 'v1.0',
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    mockAgents.push(newAgent)
    return newAgent
  },

  async updateAgent(id: string, data: Partial<Agent>): Promise<Agent> {
    await delay(400)
    const index = mockAgents.findIndex(a => a.id === id)
    if (index === -1) throw new Error('Agent not found')
    
    mockAgents[index] = {
      ...mockAgents[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    return mockAgents[index]
  },

  async deleteAgent(id: string): Promise<void> {
    await delay(300)
    const index = mockAgents.findIndex(a => a.id === id)
    if (index === -1) throw new Error('Agent not found')
    mockAgents.splice(index, 1)
  },

  async startAgent(id: string): Promise<void> {
    await delay(200)
    const agent = mockAgents.find(a => a.id === id)
    if (!agent) throw new Error('Agent not found')
    agent.status = 'active'
  },

  async stopAgent(id: string): Promise<void> {
    await delay(200)
    const agent = mockAgents.find(a => a.id === id)
    if (!agent) throw new Error('Agent not found')
    agent.status = 'inactive'
  },
};
