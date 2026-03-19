import { USE_MOCK } from './config';
import { mockKnowledgeService } from './mock/knowledge';
import { apiKnowledgeService } from './api/knowledge';

export const knowledgeService = USE_MOCK ? mockKnowledgeService : apiKnowledgeService;
