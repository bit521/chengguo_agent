import { USE_MOCK } from './config';
import { mockPromptService } from './mock/prompt';
import { apiPromptService } from './api/prompt';

export const promptService = USE_MOCK ? mockPromptService : apiPromptService;
