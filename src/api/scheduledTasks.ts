import axios from 'axios';
import type {
  ScheduledTask,
  ScheduledTaskCreate,
  ScheduledTaskUpdate,
  TaskExecutionHistory,
  TaskStatus,
  ScheduleType,
} from '../types/scheduledTask';

const api = axios.create({
  baseURL: '/services/user/api/v1/scheduled-tasks',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error interceptor to clean up error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.detail) {
      // Use only the detail message, not the full URL path
      error.message = error.response.data.detail;
    } else if (error.message) {
      // Remove URL paths from error message if present
      error.message = error.message.replace(/http:\/\/[^/]+\/services\/user\/api\/v1\//g, '');
    }
    return Promise.reject(error);
  }
);

export const scheduledTasksApi = {
  // 任务列表
  listTasks: (params?: { skip?: number; limit?: number; enabled_only?: boolean }) =>
    api.get<ScheduledTask[]>('/tasks', { params }),

  // 获取单个任务
  getTask: (taskId: number) =>
    api.get<ScheduledTask>(`/tasks/${taskId}`),

  // 创建任务
  createTask: (data: ScheduledTaskCreate) =>
    api.post<ScheduledTask>('/tasks', data),

  // 更新任务
  updateTask: (taskId: number, data: ScheduledTaskUpdate) =>
    api.put<ScheduledTask>(`/tasks/${taskId}`, data),

  // 删除任务
  deleteTask: (taskId: number) =>
    api.delete(`/tasks/${taskId}`),

  // 立即执行
  executeNow: (taskId: number) =>
    api.post<TaskExecutionHistory>(`/tasks/${taskId}/execute`),

  // 暂停任务
  pauseTask: (taskId: number) =>
    api.post(`/tasks/${taskId}/pause`),

  // 恢复任务
  resumeTask: (taskId: number) =>
    api.post(`/tasks/${taskId}/resume`),

  // 执行历史
  getHistory: (params?: { skip?: number; limit?: number }) =>
    api.get<TaskExecutionHistory[]>('/history', { params }),

  // 任务执行历史
  getTaskHistory: (taskId: number, params?: { skip?: number; limit?: number }) =>
    api.get<TaskExecutionHistory[]>(`/tasks/${taskId}/history`, { params }),

  // Cron 表达式预览
  getCronNextRuns: (expression: string, count?: number) =>
    api.get<{ expression: string; next_runs: string[] }>('/cron/next-runs', {
      params: { expression, count },
    }),

  // 预设调度
  getPresets: () =>
    api.get<{ presets: Array<{ name: string; expression: string; description: string }> }>('/presets'),

  // 可用的 AI 任务
  getAITasks: () =>
    api.get<{
      tasks: Array<{
        id: string;
        name: string;
        description: string;
        task_type: string;
        supported_models: string[];
      }>;
    }>('/ai-tasks'),

  // AI 任务的模型
  getAITaskModels: (taskId: string) =>
    api.get<{
      task: { id: string; name: string; description: string };
      models: Array<{
        id: string;
        name: string;
        framework: string;
        description: string;
        params: Array<{
          param_name: string;
          param_type: string;
          default: any;
          min_value?: number;
          max_value?: number;
          step?: number;
          choices?: any[];
          description: string;
        }>;
      }>;
    }>(`/ai-tasks/${taskId}/models`),
};

export default api;
