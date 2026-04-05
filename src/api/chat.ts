import axios from './index';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
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

export interface ModelInfo {
  id: string;
  provider: string;
}

export interface ModelsResponse {
  models: ModelInfo[];
}

export const chatApi = {
  listModels: async (): Promise<ModelsResponse> => {
    const { data } = await axios.get<ModelsResponse>('/chat/models');
    return data;
  },

  sendMessage: async (messages: ChatMessage[], model: string): Promise<ChatResponse> => {
    const { data } = await axios.post<ChatResponse>('/chat/', {
      messages,
      model,
      temperature: 0.7,
      max_tokens: 2048,
    });
    return data;
  },
};
