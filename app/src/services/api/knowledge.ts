import { apiClient } from './client';

export interface KnowledgeBaseRead {
  id: number;
  name: string;
  description: string | null;
  status: string;
  document_count: number;
  segment_count: number;
  embedding_model: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentRead {
  id: number;
  knowledge_base_id: number;
  file_name: string;
  file_type: string;
  file_size: string | null;
  status: string;
  segment_count: number;
  word_count: number;
  error_message?: string | null;
  uploaded_by?: string | null;
  uploaded_at?: string | null;
  processed_at?: string | null;
}

export interface SegmentRead {
  id: number;
  knowledge_base_id: number;
  document_id: number;
  content: string;
  word_count: number;
  token_count: number;
  position: number;
  hit_count: number;
  created_at: string;
  updated_at: string;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export const apiKnowledgeService = {
  async getKnowledgeBases(params?: { page?: number; page_size?: number; keyword?: string }): Promise<PageResult<KnowledgeBaseRead>> {
    return apiClient.get('/knowledge-bases', { params });
  },

  async getKnowledgeBase(id: number): Promise<KnowledgeBaseRead> {
    return apiClient.get(`/knowledge-bases/${id}`);
  },

  async createKnowledgeBase(data: { name: string; description?: string; embedding_model?: string }): Promise<KnowledgeBaseRead> {
    return apiClient.post('/knowledge-bases', data);
  },

  async updateKnowledgeBase(id: number, data: Partial<{ name: string; description: string; embedding_model: string }>): Promise<KnowledgeBaseRead> {
    return apiClient.put(`/knowledge-bases/${id}`, data);
  },

  async deleteKnowledgeBase(id: number): Promise<void> {
    return apiClient.delete(`/knowledge-bases/${id}`);
  },

  async getDocuments(kbId: number, params?: { page?: number; page_size?: number; keyword?: string }): Promise<PageResult<DocumentRead>> {
    return apiClient.get(`/knowledge-bases/${kbId}/documents`, { params });
  },

  async uploadDocument(kbId: number, file: File): Promise<DocumentRead> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/knowledge-bases/${kbId}/documents`, formData);
  },

  async deleteDocument(kbId: number, docId: number): Promise<void> {
    return apiClient.delete(`/knowledge-bases/${kbId}/documents/${docId}`);
  },

  async getSegments(kbId: number, params?: { page?: number; page_size?: number }): Promise<PageResult<SegmentRead>> {
    return apiClient.get(`/knowledge-bases/${kbId}/segments`, { params });
  },

  async updateSegment(kbId: number, segId: number, data: Partial<{ content: string }>): Promise<SegmentRead> {
    return apiClient.put(`/knowledge-bases/${kbId}/segments/${segId}`, data);
  },
};
