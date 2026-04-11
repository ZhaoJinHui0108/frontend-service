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

// Task type labels
export const TaskTypeLabels: Record<TaskType, string> = {
  classification: '分类',
  regression: '回归',
  clustering: '聚类',
  object_detection: '目标检测',
  semantic_segmentation: '语义分割',
  sequence_generation: '序列生成',
  question_answering: '问答系统',
  recommendation: '推荐系统'
}

// Task type icons
export const TaskTypeIcons: Record<TaskType, string> = {
  classification: '🏷️',
  regression: '📈',
  clustering: '🎯',
  object_detection: '🔍',
  semantic_segmentation: '🖼️',
  sequence_generation: '📝',
  question_answering: '❓',
  recommendation: '⭐'
}

export interface TaskInfo {
  id: string
  name: string
  description: string
  task_type: TaskType
  dataset_name: string
  input_shape: number[]
  num_classes?: number
  supported_models: string[]
}

export interface ModelParamConfig {
  param_name: string
  param_type: 'int' | 'float' | 'string' | 'bool' | 'choice' | 'list'
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
  task_type: TaskType
  framework: 'sklearn' | 'pytorch'
  description: string
  params: ModelParamConfig[]
}

export interface TrainingConfig {
  epochs: number
  batch_size: number
  learning_rate: number
  test_split: number
  random_seed: number
}

export interface TrainingJobCreate {
  task_id: string
  model_id: string
  model_params: Record<string, any>
  training_config: TrainingConfig
}

export interface TrainingMetrics {
  train_loss: number[]
  val_loss: number[]
  train_accuracy: number[]
  val_accuracy: number[]
  final_metrics: Record<string, number | string>
}

export interface TrainingJobResponse {
  job_id: string
  task_id: string
  task_name: string
  model_id: string
  model_name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  model_params: Record<string, any>
  training_config: TrainingConfig
  metrics?: TrainingMetrics
  training_time?: number
  created_at: string
  started_at?: string
  completed_at?: string
  error?: string
}

export interface ModelComparisonItem {
  model_id: string
  model_name: string
  job_id: string
  status: string
  metrics?: Record<string, number | string>
}

export interface ModelComparisonResponse {
  task_id: string
  task_name: string
  results: ModelComparisonItem[]
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
