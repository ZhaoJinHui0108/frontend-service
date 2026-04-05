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
}

export const chatApi = {
  sendMessage: async (messages: ChatMessage[]): Promise<ChatResponse> => {
    const { data } = await axios.post<ChatResponse>('/chat/', {
      messages,
      model: 'MiniMax-M2.7',
      temperature: 0.7,
      max_tokens: 2048,
    });
    return data;
  },
};
