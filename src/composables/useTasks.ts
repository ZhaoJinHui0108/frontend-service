import { ref } from 'vue'
import { aiLearningApi, type TaskInfo, type ModelInfo, type TrainingJobResponse, type TaskType, type TrainingJobCreate, type TrainingMetrics } from '@/services/aiLearningService'

export function useTasks() {
  const tasks = ref<TaskInfo[]>([])
  const models = ref<ModelInfo[]>([])
  const jobs = ref<TrainingJobResponse[]>([])
  const loading = ref(false)
  const error = ref('')

  const loadTasks = async (taskType?: TaskType) => {
    loading.value = true
    error.value = ''
    try {
      const { data } = await aiLearningApi.listTasks(taskType)
      tasks.value = data
    } catch (err: any) {
      error.value = err.message || '加载任务失败'
    } finally {
      loading.value = false
    }
  }

  const loadModels = async (taskId?: string) => {
    loading.value = true
    error.value = ''
    try {
      const { data } = await aiLearningApi.listModels(taskId)
      models.value = data
    } catch (err: any) {
      error.value = err.message || '加载模型失败'
    } finally {
      loading.value = false
    }
  }

  const loadJobs = async () => {
    try {
      const { data } = await aiLearningApi.listJobs()
      jobs.value = data
    } catch (err: any) {
      console.error('加载任务记录失败:', err)
    }
  }

  const createTrainingJob = async (data: TrainingJobCreate): Promise<TrainingJobResponse> => {
    const { data: job } = await aiLearningApi.createTrainingJob(data)
    await loadJobs()
    return job
  }

  const getJobMetrics = async (jobId: string): Promise<TrainingMetrics> => {
    const { data } = await aiLearningApi.getJobMetrics(jobId)
    return data
  }

  return {
    tasks,
    models,
    jobs,
    loading,
    error,
    loadTasks,
    loadModels,
    loadJobs,
    createTrainingJob,
    getJobMetrics
  }
}
