import type { PaginatedResponse } from '../types/common';
import type { Prompt, PromptVersion } from '../types/prompt';
import { mockPrompts } from './data/prompts';

export const mockPromptService = {
  // 获取Prompt列表
  async getPrompts(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
    status?: string;
  }): Promise<PaginatedResponse<Prompt>> {
    let filtered = [...mockPrompts];

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }

    if (params?.category) {
      filtered = filtered.filter((p) => p.category === params.category);
    }

    if (params?.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      pageSize,
    };
  },

  // 获取Prompt详情
  async getPrompt(id: string): Promise<Prompt> {
    const prompt = mockPrompts.find((p) => p.id === id);
    if (!prompt) {
      throw new Error('Prompt不存在');
    }
    return prompt;
  },

  // 创建Prompt
  async createPrompt(data: Partial<Prompt>): Promise<Prompt> {
    const newPrompt: Prompt = {
      id: `prompt-${Date.now()}`,
      name: data.name || '',
      description: data.description || '',
      category: data.category || 'general',
      content: data.content || '',
      variables: data.variables || [],
      status: 'draft',
      version: '1.0.0',
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      tags: data.tags || [],
    };
    return newPrompt;
  },

  // 更新Prompt
  async updatePrompt(id: string, data: Partial<Prompt>): Promise<Prompt> {
    const prompt = await this.getPrompt(id);
    return {
      ...prompt,
      ...data,
      updatedAt: new Date().toISOString(),
    };
  },

  // 删除Prompt
  async deletePrompt(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  // 获取Prompt版本列表
  async getPromptVersions(promptId: string): Promise<PromptVersion[]> {
    return [
      {
        version: '1.0.0',
        content: '这是版本1.0.0的内容',
        changelog: '初始版本',
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'user-001',
      },
      {
        version: '1.1.0',
        content: '这是版本1.1.0的内容',
        changelog: '优化提示词结构',
        createdAt: '2024-02-01T14:30:00Z',
        createdBy: 'user-002',
      },
    ];
  },

  // 测试Prompt
  async testPrompt(id: string, variables: Record<string, string>): Promise<{ output: string }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      output: `这是Prompt ${id} 的测试输出，变量：${JSON.stringify(variables)}`,
    };
  },
};
