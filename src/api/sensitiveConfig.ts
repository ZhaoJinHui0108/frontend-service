import axios from './index';

export interface SensitiveConfig {
  id: number;
  key: string;
  value: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SensitiveConfigCreate {
  key: string;
  value: string;
  description?: string;
}

export interface SensitiveConfigUpdate {
  value?: string;
  description?: string;
}

export const sensitiveConfigApi = {
  getConfigs: () => {
    return axios.get<SensitiveConfig[]>('/sensitive-configs');
  },

  getConfig: (id: number) => {
    return axios.get<SensitiveConfig>(`/sensitive-configs/${id}`);
  },

  createConfig: (data: SensitiveConfigCreate) => {
    return axios.post<SensitiveConfig>('/sensitive-configs', data);
  },

  updateConfig: (id: number, data: SensitiveConfigUpdate) => {
    return axios.put<SensitiveConfig>(`/sensitive-configs/${id}`, data);
  },

  deleteConfig: (id: number) => {
    return axios.delete(`/sensitive-configs/${id}`);
  },
};