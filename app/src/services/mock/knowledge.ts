import type { PaginatedResponse } from '../types/common';
import type { KnowledgeBase, Document, Segment } from '../types/knowledge';
import { mockKnowledgeBases, mockDocuments, mockSegments } from './data/knowledge';

export const mockKnowledgeService = {
  // 获取知识库列表
  async getKnowledgeBases(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: string;
    status?: string;
  }): Promise<PaginatedResponse<KnowledgeBase>> {
    let filtered = [...mockKnowledgeBases];

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (kb) =>
          kb.name.toLowerCase().includes(search) ||
          kb.description.toLowerCase().includes(search)
      );
    }

    if (params?.type) {
      filtered = filtered.filter((kb) => kb.type === params.type);
    }

    if (params?.status) {
      filtered = filtered.filter((kb) => kb.status === params.status);
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

  // 获取知识库详情
  async getKnowledgeBase(id: string): Promise<{ data: KnowledgeBase }> {
    const kb = mockKnowledgeBases.find((k) => k.id === id);
    if (!kb) {
      throw new Error('知识库不存在');
    }
    return { data: kb };
  },

  // 创建知识库
  async createKnowledgeBase(data: Partial<KnowledgeBase>): Promise<KnowledgeBase> {
    const newKb: KnowledgeBase = {
      id: `kb-${Date.now()}`,
      name: data.name || '',
      description: data.description || '',
      type: data.type || 'document',
      status: 'active',
      documentCount: 0,
      segmentCount: 0,
      vectorCount: 0,
      storageSize: 0,
      embeddingModel: data.embeddingModel || 'text-embedding-ada-002',
      chunkSize: data.chunkSize || 500,
      chunkOverlap: data.chunkOverlap || 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      tags: data.tags || [],
    };
    return newKb;
  },

  // 更新知识库
  async updateKnowledgeBase(id: string, data: Partial<KnowledgeBase>): Promise<KnowledgeBase> {
    const kb = await this.getKnowledgeBase(id);
    return {
      ...kb,
      ...data,
      updatedAt: new Date().toISOString(),
    };
  },

  // 删除知识库
  async deleteKnowledgeBase(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  // 获取文档列表
  async getDocuments(knowledgeBaseId: string, params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedResponse<Document>> {
    let filtered = mockDocuments.filter((d) => d.knowledgeBaseId === knowledgeBaseId);

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter((d) => d.fileName.toLowerCase().includes(search));
    }

    if (params?.status) {
      filtered = filtered.filter((d) => d.status === params.status);
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 100;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      pageSize,
    };
  },

  // 上传文档
  async uploadDocument(knowledgeBaseId: string, file: File): Promise<Document> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      knowledgeBaseId,
      name: file.name,
      type: file.name.split('.').pop() || 'unknown',
      size: file.size / (1024 * 1024),
      status: 'processing',
      segmentCount: 0,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'current-user',
    };
    return newDoc;
  },

  // 更新文档
  async updateDocument(id: string, data: Partial<Document>): Promise<Document> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const doc = mockDocuments.find((d) => d.id === id);
    if (!doc) {
      throw new Error('文档不存在');
    }
    return {
      ...doc,
      ...data,
      processedAt: new Date().toISOString(),
    };
  },

  // 删除文档
  async deleteDocument(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  // 获取文档片段
  async getSegments(documentId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Segment>> {
    let filtered = mockSegments.filter((s) => s.documentId === documentId);

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

  // 测试检索
  async testRetrieval(knowledgeBaseId: string, query: string): Promise<{
    results: Array<{ content: string; score: number; metadata?: any }>;
    latency: number;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      results: [
        {
          content: '这是检索到的第一条相关内容...',
          score: 0.92,
          metadata: { documentId: 'doc-001', page: 5 },
        },
        {
          content: '这是检索到的第二条相关内容...',
          score: 0.85,
          metadata: { documentId: 'doc-002', page: 12 },
        },
      ],
      latency: Math.random() * 500 + 200,
    };
  },
};
