import { USE_MOCK } from './config';
import { mockAgentService } from './mock/agent';
import { apiAgentService } from './api/agent';

export const agentService = USE_MOCK ? mockAgentService : apiAgentService;
