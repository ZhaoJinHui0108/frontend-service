import axios from 'axios'

const api = axios.create({
  baseURL: '/services/user/api/v1/ai-learning',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Error interceptor to clean up error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.detail) {
      error.message = error.response.data.detail
    } else if (error.message) {
      error.message = error.message.replace(/http:\/\/[^/]+\/services\/user\/api\/v1\//g, '')
    }
    return Promise.reject(error)
  }
)

export type TaskType =
  | 'classification'
  | 'regression'
  | 'clustering'
  | 'object_detection'
  | 'semantic_segmentation'
  | 'sequence_generation'
  | 'question_answering'
  | 'recommendation'

export interface TaskInfo {
  id: string
  name: string
  task_type: TaskType
  description: string
  created_at: string
}

export interface ModelParam {
  param_name: string
  param_type: 'string' | 'int' | 'float' | 'bool' | 'choice' | 'list'
  default: any
  min_value?: number
  max_value?: number
  step?: number
  choices?: any[]
  description: string
}

export interface ModelInfo {
  id: string
  name: string
  framework: string
  description: string
  params: ModelParam[]
  created_at: string
}

export interface TrainingJobCreate {
  task_id: string
  model_id: string
  params: Record<string, any>
}

export interface TrainingJobResponse {
  job_id: string
  task_id: string
  task_name: string
  model_id: string
  model_name: string
  params: Record<string, any>
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress?: number
  result?: any
  error?: string
  created_at: string
  started_at?: string
  completed_at?: string
}

export interface TrainingMetrics {
  epochs?: number
  batch_size?: number
  learning_rate?: number
  train_loss?: number
  val_loss?: number
  accuracy?: number
  precision?: number
  recall?: number
  f1?: number
  confusion_matrix?: number[][]
  feature_importance?: Record<string, number>
  predictions?: any[]
  actual?: any[]
}

export interface ModelComparisonResponse {
  task_id: string
  models: Array<{
    model_id: string
    model_name: string
    metrics: TrainingMetrics
  }>
}

export const aiLearningApi = {
  listTasks: (taskType?: TaskType) =>
    api.get<TaskInfo[]>('/tasks', { params: taskType ? { task_type: taskType } : {} }),

  getTask: (taskId: string) =>
    api.get<TaskInfo>(`/tasks/${taskId}`),

  listModels: (taskId?: string) =>
    api.get<ModelInfo[]>('/models', { params: taskId ? { task_id: taskId } : {} }),

  getModel: (modelId: string) =>
    api.get<ModelInfo>(`/models/${modelId}`),

  listJobs: (limit = 50) =>
    api.get<TrainingJobResponse[]>('/jobs', { params: { limit } }),

  getJob: (jobId: string) =>
    api.get<TrainingJobResponse>(`/jobs/${jobId}`),

  getTaskJobs: (taskId: string) =>
    api.get<TrainingJobResponse[]>(`/tasks/${taskId}/jobs`),

  createTrainingJob: (data: TrainingJobCreate) =>
    api.post<TrainingJobResponse>('/train', data),

  getJobMetrics: (jobId: string) =>
    api.get<TrainingMetrics>(`/train/${jobId}/metrics`),

  compareModels: (taskId: string) =>
    api.get<ModelComparisonResponse>(`/compare/${taskId}`)
}

export default api
