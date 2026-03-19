import { apiClient } from './client';
import type { Tool, PaginatedResponse } from '../types/common';

export const apiToolService = {
  async getTools(params?: any): Promise<PaginatedResponse<Tool>> {
    return apiClient.get('/tools', { params });
  },

  async getTool(id: string): Promise<Tool> {
    return apiClient.get(`/tools/${id}`);
  },

  async createTool(data: Partial<Tool>): Promise<Tool> {
    return apiClient.post('/tools', data);
  },

  async updateTool(id: string, data: Partial<Tool>): Promise<Tool> {
    return apiClient.put(`/tools/${id}`, data);
  },

  async deleteTool(id: string): Promise<void> {
    return apiClient.delete(`/tools/${id}`);
  },

  async testTool(id: string, input: Record<string, any>): Promise<any> {
    return apiClient.post(`/tools/${id}/test`, { input });
  },
};
