import { ref } from 'vue'
import axios from 'axios'

const api = axios.create({
  baseURL: '/services/user/api/v1/scheduled-tasks',
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

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
export type ScheduleType = 'once' | 'cron' | 'interval'

export const ScheduleTypeLabels: Record<ScheduleType, string> = {
  once: '执行一次',
  cron: 'Cron 表达式',
  interval: '间隔执行'
}

export const TaskStatusLabels: Record<TaskStatus, string> = {
  pending: '等待中',
  running: '执行中',
  completed: '已完成',
  failed: '失败',
  cancelled: '已取消'
}

export interface ScheduledTask {
  id: number
  name: string
  description?: string
  schedule_type: ScheduleType
  execute_at?: string
  cron_expression?: string
  interval_seconds?: number
  ai_task_id: string
  ai_model_id: string
  ai_model_params: Record<string, any>
  ai_training_config: Record<string, any>
  enabled: boolean
  status: TaskStatus
  last_run_at?: string
  next_run_at?: string
  run_count: number
  created_at: string
  updated_at: string
}

export interface ScheduledTaskCreate {
  name: string
  description?: string
  schedule_type: ScheduleType
  execute_at?: string
  cron_expression?: string
  interval_seconds?: number
  ai_task_id: string
  ai_model_id: string
  ai_model_params: Record<string, any>
  ai_training_config: Record<string, any>
  enabled?: boolean
}

export interface ScheduledTaskUpdate {
  name?: string
  description?: string
  schedule_type?: ScheduleType
  execute_at?: string
  cron_expression?: string
  interval_seconds?: number
  ai_task_id?: string
  ai_model_id?: string
  ai_model_params?: Record<string, any>
  ai_training_config?: Record<string, any>
  enabled?: boolean
}

export interface TaskExecutionHistory {
  id: number
  task_id: number
  scheduled_task_name: string
  status: TaskStatus
  started_at: string
  completed_at?: string
  ai_job_id?: string
  ai_job_status?: string
  result?: Record<string, any>
  error?: string
}

export function useScheduledTasks() {
  const tasks = ref<ScheduledTask[]>([])
  const history = ref<TaskExecutionHistory[]>([])
  const loading = ref(false)
  const error = ref('')

  const loadTasks = async () => {
    loading.value = true
    error.value = ''
    try {
      const { data } = await api.get<ScheduledTask[]>('/', { params: { limit: 100 } })
      tasks.value = data
    } catch (err: any) {
      error.value = err.message || '加载任务失败'
    } finally {
      loading.value = false
    }
  }

  const loadHistory = async () => {
    try {
      const { data } = await api.get<TaskExecutionHistory[]>('/history', { params: { limit: 50 } })
      history.value = data
    } catch (err: any) {
      console.error('加载历史失败:', err)
    }
  }

  const createTask = async (task: ScheduledTaskCreate): Promise<ScheduledTask> => {
    const { data } = await api.post<ScheduledTask>('/', task)
    await loadTasks()
    return data
  }

  const updateTask = async (id: number, task: Partial<ScheduledTaskCreate>): Promise<ScheduledTask> => {
    const { data } = await api.put<ScheduledTask>(`/${id}`, task)
    await loadTasks()
    return data
  }

  const deleteTask = async (id: number) => {
    await api.delete(`/${id}`)
    await loadTasks()
  }

  const executeNow = async (id: number) => {
    await api.post(`/${id}/execute`)
    await loadHistory()
  }

  const pauseTask = async (id: number) => {
    await api.post(`/${id}/pause`)
    await loadTasks()
  }

  const resumeTask = async (id: number) => {
    await api.post(`/${id}/resume`)
    await loadTasks()
  }

  return {
    tasks,
    history,
    loading,
    error,
    loadTasks,
    loadHistory,
    createTask,
    updateTask,
    deleteTask,
    executeNow,
    pauseTask,
    resumeTask
  }
}
