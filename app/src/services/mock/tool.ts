import type { PaginatedResponse } from '../types/common';
import type { Tool } from '../types/tool';
import { mockTools } from './data/tools';

export const mockToolService = {
  // 获取工具列表
  async getTools(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: string;
    category?: string;
    status?: string;
  }): Promise<PaginatedResponse<Tool>> {
    let filtered = [...mockTools];

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search)
      );
    }

    if (params?.type) {
      filtered = filtered.filter((t) => t.type === params.type);
    }

    if (params?.category) {
      filtered = filtered.filter((t) => t.category === params.category);
    }

    if (params?.status) {
      filtered = filtered.filter((t) => t.status === params.status);
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

  // 获取工具详情
  async getTool(id: string): Promise<Tool> {
    const tool = mockTools.find((t) => t.id === id);
    if (!tool) {
      throw new Error('工具不存在');
    }
    return tool;
  },

  // 创建工具
  async createTool(data: Partial<Tool>): Promise<Tool> {
    const newTool: Tool = {
      id: `tool-${Date.now()}`,
      name: data.name || '',
      description: data.description || '',
      type: data.type || 'function',
      category: data.category || '其他',
      status: 'inactive',
      version: '1.0.0',
      callCount: 0,
      successRate: 0,
      avgResponseTime: 0,
      function: data.function || {
        name: '',
        description: '',
        parameters: { type: 'object', properties: {}, required: [] },
      },
      config: data.config || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      tags: data.tags || [],
    };
    return newTool;
  },

  // 更新工具
  async updateTool(id: string, data: Partial<Tool>): Promise<Tool> {
    const tool = await this.getTool(id);
    return {
      ...tool,
      ...data,
      updatedAt: new Date().toISOString(),
    };
  },

  // 删除工具
  async deleteTool(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  // 测试工具
  async testTool(id: string, input: Record<string, any>): Promise<{
    output: any;
    latency: number;
    status: 'success' | 'error';
    error?: string;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      output: { result: `工具 ${id} 执行成功`, data: input },
      latency: Math.random() * 2000 + 500,
      status: 'success',
    };
  },
};
