import type {
  AssistantPermissionScopeKey,
  AssistantToolCall,
} from '@/types/assistant';

export type AIProviderType = 'ollama' | 'openai' | 'gemini' | 'cloudflare';

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

export interface AIChatRequest {
  conversationId: string;
  messages: AIChatMessage[];
  permissionScopes: AssistantPermissionScopeKey[];
  attachedPhoto?: {
    fileName: string;
    mimeType: string;
    analysisPurpose: string;
    metadataStripped: boolean;
    dataUrl?: string;
  };
  contextData?: {
    userName?: string;
    locale?: string;
    allowedTasks?: Array<{ id: string; title: string; status: string }>;
    allowedCalendar?: Array<{ id: string; title: string; date: string }>;
    allowedFamily?: Array<{ id: string; name: string; relation: string }>;
    allowedFinanceSummary?: { thisMonthTotal: string; topCategory: string };
  };
}

export interface AIChatResponse {
  providerId: string;
  providerName: string;
  model: string;
  content: string;
  status: 'success' | 'offline' | 'unconfigured' | 'error';
  error?: string;
  errorMessage?: string;
  suggestedToolCalls?: AssistantToolCall[];
}

export interface AIProviderHealth {
  isAvailable: boolean;
  status: 'online' | 'offline' | 'unconfigured';
  message: string;
  providerId: string;
  providerName: string;
  activeModel: string;
  availableModels?: string[];
}

export interface AIChatProvider {
  readonly id: AIProviderType;
  readonly name: string;
  checkHealth(): Promise<AIProviderHealth>;
  generateChat(request: AIChatRequest): Promise<AIChatResponse>;
}
