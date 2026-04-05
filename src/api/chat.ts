import axios from './index';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  api_key_name?: string;
  model: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatResponse {
  content: string;
  reasoning_details?: Array<{ text: string }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export interface ApiKeyInfo {
  key: string;
  description: string;
  provider: string;
}

export interface ApiKeysResponse {
  api_keys: ApiKeyInfo[];
}

export interface ModelInfo {
  id: string;
  provider: string;
  name: string;
}

export interface ModelsResponse {
  models: ModelInfo[];
}

export const chatApi = {
  listApiKeys: async (): Promise<ApiKeysResponse> => {
    const { data } = await axios.get<ApiKeysResponse>('/chat/api-keys');
    return data;
  },

  listModels: async (): Promise<ModelsResponse> => {
    const { data } = await axios.get<ModelsResponse>('/chat/models');
    return data;
  },

  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const { data } = await axios.post<ChatResponse>('/chat/', {
      messages: request.messages,
      api_key_name: request.api_key_name,
      model: request.model,
      temperature: request.temperature || 0.7,
      max_tokens: request.max_tokens || 2048,
    });
    return data;
  },
};
