import axios from 'axios';
import type {
  TaskInfo,
  ModelInfo,
  TrainingJobCreate,
  TrainingJobResponse,
  TrainingMetrics,
  ModelComparisonResponse,
  TaskType,
} from '../types/aiLearning';

const api = axios.create({
  baseURL: '/services/user/api/v1/ai-learning',
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

export const aiLearningApi = {
  // 获取任务列表
  listTasks: (taskType?: TaskType) =>
    api.get<TaskInfo[]>('/tasks', { params: taskType ? { task_type: taskType } : {} }),

  // 获取任务详情
  getTask: (taskId: string) =>
    api.get<TaskInfo>(`/tasks/${taskId}`),

  // 获取模型列表
  listModels: (taskId?: string) =>
    api.get<ModelInfo[]>('/models', { params: taskId ? { task_id: taskId } : {} }),

  // 获取模型详情
  getModel: (modelId: string) =>
    api.get<ModelInfo>(`/models/${modelId}`),

  // 获取训练任务列表
  listJobs: (limit = 50) =>
    api.get<TrainingJobResponse[]>('/jobs', { params: { limit } }),

  // 获取训练任务详情
  getJob: (jobId: string) =>
    api.get<TrainingJobResponse>(`/jobs/${jobId}`),

  // 获取任务的所有训练记录
  getTaskJobs: (taskId: string) =>
    api.get<TrainingJobResponse[]>(`/tasks/${taskId}/jobs`),

  // 创建训练任务
  createTrainingJob: (data: TrainingJobCreate) =>
    api.post<TrainingJobResponse>('/train', data),

  // 获取训练指标
  getJobMetrics: (jobId: string) =>
    api.get<TrainingMetrics>(`/train/${jobId}/metrics`),

  // 对比模型
  compareModels: (taskId: string) =>
    api.get<ModelComparisonResponse>(`/compare/${taskId}`),
};

export default api;
