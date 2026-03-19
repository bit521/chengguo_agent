import { apiClient } from './client';
import type { KnowledgeBase, Document, Segment, PaginatedResponse } from '../types/common';

export const apiKnowledgeService = {
  async getKnowledgeBases(params?: any): Promise<PaginatedResponse<KnowledgeBase>> {
    return apiClient.get('/knowledge-bases', { params });
  },

  async getKnowledgeBase(id: string): Promise<KnowledgeBase> {
    return apiClient.get(`/knowledge-bases/${id}`);
  },

  async createKnowledgeBase(data: Partial<KnowledgeBase>): Promise<KnowledgeBase> {
    return apiClient.post('/knowledge-bases', data);
  },

  async updateKnowledgeBase(id: string, data: Partial<KnowledgeBase>): Promise<KnowledgeBase> {
    return apiClient.put(`/knowledge-bases/${id}`, data);
  },

  async deleteKnowledgeBase(id: string): Promise<void> {
    return apiClient.delete(`/knowledge-bases/${id}`);
  },

  async getDocuments(knowledgeBaseId: string, params?: any): Promise<PaginatedResponse<Document>> {
    return apiClient.get(`/knowledge-bases/${knowledgeBaseId}/documents`, { params });
  },

  async uploadDocument(knowledgeBaseId: string, file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/knowledge-bases/${knowledgeBaseId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async deleteDocument(id: string): Promise<void> {
    return apiClient.delete(`/documents/${id}`);
  },

  async getSegments(documentId: string, params?: any): Promise<PaginatedResponse<Segment>> {
    return apiClient.get(`/documents/${documentId}/segments`, { params });
  },

  async testRetrieval(knowledgeBaseId: string, query: string): Promise<any> {
    return apiClient.post(`/knowledge-bases/${knowledgeBaseId}/test`, { query });
  },
};
