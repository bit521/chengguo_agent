import { apiClient } from './client';
import type { Prompt, PromptVersion, PaginatedResponse } from '../types/common';

export const apiPromptService = {
  async getPrompts(params?: any): Promise<PaginatedResponse<Prompt>> {
    return apiClient.get('/prompts', { params });
  },

  async getPrompt(id: string): Promise<Prompt> {
    return apiClient.get(`/prompts/${id}`);
  },

  async createPrompt(data: Partial<Prompt>): Promise<Prompt> {
    return apiClient.post('/prompts', data);
  },

  async updatePrompt(id: string, data: Partial<Prompt>): Promise<Prompt> {
    return apiClient.put(`/prompts/${id}`, data);
  },

  async deletePrompt(id: string): Promise<void> {
    return apiClient.delete(`/prompts/${id}`);
  },

  async getPromptVersions(promptId: string): Promise<PromptVersion[]> {
    return apiClient.get(`/prompts/${promptId}/versions`);
  },

  async testPrompt(id: string, variables: Record<string, string>): Promise<{ output: string }> {
    return apiClient.post(`/prompts/${id}/test`, { variables });
  },
};
