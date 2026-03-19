import type { PaginatedResponse } from '../types/common';
import type { Model, ModelProvider } from '../types/model';
import { mockModels, mockProviders } from './data/models';

export const mockModelService = {
  // 获取模型列表
  async getModels(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    provider?: string;
    status?: string;
  }): Promise<PaginatedResponse<Model>> {
    let filtered = [...mockModels];

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.description.toLowerCase().includes(search)
      );
    }

    if (params?.provider) {
      filtered = filtered.filter((m) => m.provider === params.provider);
    }

    if (params?.status) {
      filtered = filtered.filter((m) => m.status === params.status);
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

  // 获取模型详情
  async getModel(id: string): Promise<Model> {
    const model = mockModels.find((m) => m.id === id);
    if (!model) {
      throw new Error('模型不存在');
    }
    return model;
  },

  // 获取提供商列表
  async getProviders(): Promise<ModelProvider[]> {
    return mockProviders;
  },

  // 测试模型
  async testModel(id: string, input: string): Promise<{ output: string; latency: number }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      output: `这是模型 ${id} 对输入 "${input}" 的测试响应`,
      latency: Math.random() * 2000 + 500,
    };
  },
};
