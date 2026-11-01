import { describe, it, expect, vi } from 'vitest'
import { mockAgentService, mockModelService, mockPromptService, mockKnowledgeService, mockUserService } from '../src/services/mock'

describe('Mock Services - Agent', () => {
  it('should return paginated agents', async () => {
    const result = await mockAgentService.getList({ page: 1, pageSize: 10 })
    expect(result.items).toHaveLength(10)
    expect(result.total).toBeGreaterThan(0)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(10)
  })

  it('should return agent by id', async () => {
    const agent = await mockAgentService.getById(1)
    expect(agent).toBeDefined()
    expect(agent.id).toBe(1)
  })

  it('should throw error for non-existent agent', async () => {
    await expect(mockAgentService.getById(9999)).rejects.toThrow('not found')
  })

  it('should create a new agent', async () => {
    const newAgent = await mockAgentService.create({ name: 'Test Agent', description: 'Test', type: 'conversation' })
    expect(newAgent).toBeDefined()
    expect(newAgent.name).toBe('Test Agent')
  })

  it('should delete an agent', async () => {
    await expect(mockAgentService.delete(9999)).resolves.toBeUndefined()
  })
})

describe('Mock Services - Model', () => {
  it('should return paginated models', async () => {
    const result = await mockModelService.getList({ page: 1, pageSize: 10 })
    expect(result.items).toHaveLength(10)
    expect(result.total).toBeGreaterThan(0)
  })

  it('should return model by id', async () => {
    const model = await mockModelService.getById(1)
    expect(model).toBeDefined()
    expect(model.id).toBe(1)
  })
})

describe('Mock Services - Prompt', () => {
  it('should return paginated prompts', async () => {
    const result = await mockPromptService.getList({ page: 1, pageSize: 10 })
    expect(result.items).toHaveLength(10)
    expect(result.total).toBeGreaterThan(0)
  })

  it('should return prompt by id', async () => {
    const prompt = await mockPromptService.getById(1)
    expect(prompt).toBeDefined()
    expect(prompt.id).toBe(1)
  })
})

describe('Mock Services - KnowledgeBase', () => {
  it('should return paginated knowledge bases', async () => {
    const result = await mockKnowledgeService.getList({ page: 1, pageSize: 10 })
    expect(result.items).toHaveLength(8)
    expect(result.total).toBeGreaterThan(0)
  })

  it('should return knowledge base by id', async () => {
    const kb = await mockKnowledgeService.getById(1)
    expect(kb).toBeDefined()
    expect(kb.id).toBe(1)
  })
})

describe('Mock Services - User', () => {
  it('should return paginated users', async () => {
    const result = await mockUserService.getList({ page: 1, pageSize: 10 })
    expect(result.items).toHaveLength(3)
    expect(result.total).toBe(3)
  })

  it('should return user by id', async () => {
    const user = await mockUserService.getById(1)
    expect(user).toBeDefined()
    expect(user.id).toBe(1)
  })
})
