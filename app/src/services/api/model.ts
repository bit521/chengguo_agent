import { apiClient } from './client';
import type { Model, ModelProvider, PaginatedResponse } from '../types/common';

export const apiModelService = {
  async getModels(params?: any): Promise<PaginatedResponse<Model>> {
    return apiClient.get('/models', { params });
  },

  async getModel(id: string): Promise<Model> {
    return apiClient.get(`/models/${id}`);
  },

  async getProviders(): Promise<ModelProvider[]> {
    return apiClient.get('/models/providers');
  },

  async testModel(id: string, input: string): Promise<{ output: string; latency: number }> {
    return apiClient.post(`/models/${id}/test`, { input });
  },
};
