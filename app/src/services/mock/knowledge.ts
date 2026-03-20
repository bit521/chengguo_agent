import type { KnowledgeBaseRead, DocumentRead, SegmentRead, PageResult } from '../api/knowledge';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockKBs: KnowledgeBaseRead[] = [
  { id: 1, name: '产品知识库', description: '产品相关文档', status: 'ready', document_count: 12, segment_count: 480, embedding_model: 'text-embedding-ada-002', created_by: 'admin', created_at: '2024-01-10T10:00:00Z', updated_at: '2024-03-01T08:00:00Z' },
  { id: 2, name: '技术文档库', description: '技术规范和API文档', status: 'ready', document_count: 8, segment_count: 320, embedding_model: 'text-embedding-ada-002', created_by: 'admin', created_at: '2024-01-20T10:00:00Z', updated_at: '2024-03-05T08:00:00Z' },
  { id: 3, name: '客服FAQ库', description: '常见问题解答', status: 'indexing', document_count: 5, segment_count: 150, embedding_model: 'text-embedding-3-small', created_by: 'admin', created_at: '2024-02-01T10:00:00Z', updated_at: '2024-03-10T08:00:00Z' },
  { id: 4, name: '法律合规库', description: '法律法规文件', status: 'ready', document_count: 20, segment_count: 1200, embedding_model: 'text-embedding-ada-002', created_by: 'admin', created_at: '2024-02-15T10:00:00Z', updated_at: '2024-03-08T08:00:00Z' },
  { id: 5, name: '培训材料库', description: '员工培训资料', status: 'empty', document_count: 0, segment_count: 0, embedding_model: 'text-embedding-ada-002', created_by: 'admin', created_at: '2024-03-01T10:00:00Z', updated_at: '2024-03-01T10:00:00Z' },
  { id: 6, name: '市场调研库', description: '市场分析报告', status: 'error', document_count: 3, segment_count: 0, embedding_model: 'text-embedding-3-small', created_by: 'admin', created_at: '2024-02-20T10:00:00Z', updated_at: '2024-03-12T08:00:00Z' },
];

const mockDocuments: DocumentRead[] = [
  { id: 1, knowledge_base_id: 1, file_name: '产品手册v2.pdf', file_type: 'pdf', file_size: '2.4MB', status: 'completed', segment_count: 45, word_count: 12000, uploaded_by: 'admin', uploaded_at: '2024-01-10T10:00:00Z' },
  { id: 2, knowledge_base_id: 1, file_name: '功能说明.docx', file_type: 'docx', file_size: '1.2MB', status: 'completed', segment_count: 30, word_count: 8000, uploaded_by: 'admin', uploaded_at: '2024-01-15T10:00:00Z' },
  { id: 3, knowledge_base_id: 2, file_name: 'API文档.md', file_type: 'md', file_size: '0.5MB', status: 'completed', segment_count: 60, word_count: 15000, uploaded_by: 'admin', uploaded_at: '2024-01-20T10:00:00Z' },
];

const mockSegments: SegmentRead[] = [
  { id: 1, knowledge_base_id: 1, document_id: 1, content: '产品概述：本产品是一款智能AI助手...', word_count: 200, token_count: 300, position: 1, hit_count: 15, created_at: '2024-01-10T10:00:00Z', updated_at: '2024-01-10T10:00:00Z' },
  { id: 2, knowledge_base_id: 1, document_id: 1, content: '主要功能：支持多轮对话、知识检索...', word_count: 180, token_count: 270, position: 2, hit_count: 8, created_at: '2024-01-10T10:00:00Z', updated_at: '2024-01-10T10:00:00Z' },
];

export const mockKnowledgeService = {
  async getKnowledgeBases(params?: { page?: number; page_size?: number; keyword?: string }): Promise<PageResult<KnowledgeBaseRead>> {
    await delay(300);
    let filtered = [...mockKBs];
    if (params?.keyword) {
      filtered = filtered.filter(kb => kb.name.includes(params.keyword!) || (kb.description || '').includes(params.keyword!));
    }
    const page = params?.page || 1;
    const page_size = params?.page_size || 10;
    const start = (page - 1) * page_size;
    return { items: filtered.slice(start, start + page_size), total: filtered.length, page, page_size };
  },

  async getKnowledgeBase(id: number): Promise<KnowledgeBaseRead> {
    await delay(200);
    const kb = mockKBs.find(k => k.id === id);
    if (!kb) throw new Error('知识库不存在');
    return kb;
  },

  async createKnowledgeBase(data: any): Promise<KnowledgeBaseRead> {
    await delay(400);
    const newKb: KnowledgeBaseRead = { id: mockKBs.length + 1, name: data.name, description: data.description || null, status: 'empty', document_count: 0, segment_count: 0, embedding_model: data.embedding_model || 'text-embedding-ada-002', created_by: 'admin', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    mockKBs.push(newKb);
    return newKb;
  },

  async updateKnowledgeBase(id: number, data: any): Promise<KnowledgeBaseRead> {
    await delay(300);
    const idx = mockKBs.findIndex(k => k.id === id);
    if (idx === -1) throw new Error('知识库不存在');
    mockKBs[idx] = { ...mockKBs[idx], ...data, updated_at: new Date().toISOString() };
    return mockKBs[idx];
  },

  async deleteKnowledgeBase(id: number): Promise<void> {
    await delay(300);
    const idx = mockKBs.findIndex(k => k.id === id);
    if (idx !== -1) mockKBs.splice(idx, 1);
  },

  async getDocuments(kbId: number, params?: { page?: number; page_size?: number; keyword?: string }): Promise<PageResult<DocumentRead>> {
    await delay(300);
    let filtered = mockDocuments.filter(d => d.knowledge_base_id === kbId);
    if (params?.keyword) {
      filtered = filtered.filter(d => d.file_name.includes(params.keyword!));
    }
    const page = params?.page || 1;
    const page_size = params?.page_size || 10;
    const start = (page - 1) * page_size;
    return { items: filtered.slice(start, start + page_size), total: filtered.length, page, page_size };
  },

  async uploadDocument(kbId: number, file: File): Promise<DocumentRead> {
    await delay(1500);
    const newDoc: DocumentRead = { id: mockDocuments.length + 1, knowledge_base_id: kbId, file_name: file.name, file_type: file.name.split('.').pop() || 'unknown', file_size: `${(file.size / 1024 / 1024).toFixed(1)}MB`, status: 'processing', segment_count: 0, word_count: 0, uploaded_by: 'admin', uploaded_at: new Date().toISOString() };
    mockDocuments.push(newDoc);
    return newDoc;
  },

  async deleteDocument(kbId: number, docId: number): Promise<void> {
    await delay(300);
    const idx = mockDocuments.findIndex(d => d.id === docId);
    if (idx !== -1) mockDocuments.splice(idx, 1);
  },

  async getSegments(kbId: number, params?: { page?: number; page_size?: number }): Promise<PageResult<SegmentRead>> {
    await delay(300);
    const filtered = mockSegments.filter(s => s.knowledge_base_id === kbId);
    const page = params?.page || 1;
    const page_size = params?.page_size || 10;
    const start = (page - 1) * page_size;
    return { items: filtered.slice(start, start + page_size), total: filtered.length, page, page_size };
  },

  async updateSegment(kbId: number, segId: number, data: any): Promise<SegmentRead> {
    await delay(300);
    const idx = mockSegments.findIndex(s => s.id === segId);
    if (idx === -1) throw new Error('分段不存在');
    mockSegments[idx] = { ...mockSegments[idx], ...data, updated_at: new Date().toISOString() };
    return mockSegments[idx];
  },
};
