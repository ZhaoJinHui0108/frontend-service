<template>
  <div class="page-container">
    <div class="page-header">
      <h1>AI Learning</h1>
      <div class="view-tabs">
        <button
          v-for="tab in viewTabs"
          :key="tab.value"
          :class="['tab-btn', { active: viewMode === tab.value }]"
          @click="viewMode = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Search and Filter Bar -->
    <div v-if="viewMode === 'training'" class="filter-bar">
      <UiInput
        v-model="jobSearch"
        type="search"
        placeholder="搜索任务名称、模型名称、Job ID..."
        class="search-input"
      />
      <UiSelect
        v-model="statusFilter"
        :options="statusOptions"
        class="status-select"
      />
      <span class="result-count">共 {{ filteredJobs.length }} 条记录</span>
    </div>

    <!-- Tasks View -->
    <div v-if="viewMode === 'tasks'" class="tasks-grid">
      <div v-if="loading" class="loading-state">加载中...</div>
      <template v-else>
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-card"
          @click="selectTask(task)"
        >
          <div class="task-icon">{{ getTaskIcon(task.task_type) }}</div>
          <div class="task-info">
            <h3>{{ task.name }}</h3>
            <p>{{ task.description }}</p>
          </div>
          <UiBadge :variant="getTaskVariant(task.task_type)">
            {{ task.task_type }}
          </UiBadge>
        </div>
      </template>
    </div>

    <!-- Models View -->
    <div v-if="viewMode === 'models'" class="models-grid">
      <div v-if="!selectedTask" class="empty-state">
        <p>请先选择一个任务以查看模型</p>
      </div>
      <template v-else>
        <div
          v-for="model in models"
          :key="model.id"
          class="model-card"
          @click="selectModel(model)"
        >
          <div class="model-icon">🤖</div>
          <div class="model-info">
            <h3>{{ model.name }}</h3>
            <p>{{ model.framework }}</p>
          </div>
        </div>
      </template>
    </div>

    <!-- Training View -->
    <div v-if="viewMode === 'training'" class="training-view">
      <div v-if="filteredJobs.length === 0" class="empty-state">
        <p>暂无训练记录</p>
      </div>
      <div v-else class="training-table-wrapper">
        <table class="training-table">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>任务名称</th>
              <th>模型</th>
              <th>状态</th>
              <th>进度</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in filteredJobs" :key="job.job_id">
              <td>{{ job.job_id.substring(0, 8) }}...</td>
              <td>{{ job.task_name }}</td>
              <td>{{ job.model_name }}</td>
              <td>
                <UiBadge :variant="getJobStatusVariant(job.status)">
                  {{ job.status }}
                </UiBadge>
              </td>
              <td>{{ job.progress ? `${job.progress}%` : '-' }}</td>
              <td>{{ formatDate(job.created_at) }}</td>
              <td>
                <div style="display: flex; gap: 4px;">
                  <UiButton variant="secondary" size="small" @click="viewJobDetails(job)">
                    查看
                  </UiButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { UiInput, UiSelect, UiButton, UiBadge, UiCard } from '@/components/ui'
import { useTasks } from '@/composables/useTasks'
import type { TaskInfo, ModelInfo, TrainingJobResponse, TaskType } from '@/services/aiLearningService'

const route = useRoute()
const { tasks, models, jobs, loading, loadTasks, loadModels, loadJobs } = useTasks()

const viewMode = ref<'tasks' | 'models' | 'config' | 'training' | 'results'>('tasks')
const selectedTask = ref<TaskInfo | null>(null)
const selectedModel = ref<ModelInfo | null>(null)
const currentTrainingJob = ref<TrainingJobResponse | null>(null)
const jobSearch = ref('')
const statusFilter = ref('all')
const filteredJobs = ref<TrainingJobResponse[]>([])

const viewTabs = [
  { label: '任务', value: 'tasks' as const },
  { label: '模型', value: 'models' as const },
  { label: '训练', value: 'training' as const }
]

const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '等待中', value: 'pending' },
  { label: '执行中', value: 'running' },
  { label: '已完成', value: 'completed' },
  { label: '失败', value: 'failed' }
]

const filteredTasks = computed(() => {
  if (route.query.type) {
    return tasks.value.filter(t => t.task_type === route.query.type)
  }
  return tasks.value
})

watch([jobs, jobSearch, statusFilter], () => {
  let result = jobs.value
  
  if (statusFilter.value !== 'all') {
    result = result.filter(job => job.status === statusFilter.value)
  }
  
  if (jobSearch.value.trim()) {
    const search = jobSearch.value.toLowerCase()
    result = result.filter(job =>
      job.task_name?.toLowerCase().includes(search) ||
      job.model_name?.toLowerCase().includes(search) ||
      job.job_id?.toLowerCase().includes(search)
    )
  }
  
  filteredJobs.value = result
}, { immediate: true })

const selectTask = (task: TaskInfo) => {
  selectedTask.value = task
  loadModels(task.id)
  viewMode.value = 'models'
}

const selectModel = (model: ModelInfo) => {
  selectedModel.value = model
}

const viewJobDetails = (job: TrainingJobResponse) => {
  currentTrainingJob.value = job
  viewMode.value = 'results'
}

const getTaskIcon = (type: TaskType): string => {
  const icons: Record<TaskType, string> = {
    classification: '📊',
    regression: '📈',
    clustering: '🎯',
    object_detection: '🔍',
    semantic_segmentation: '🖼️',
    sequence_generation: '📝',
    question_answering: '❓',
    recommendation: '⭐'
  }
  return icons[type] || '🤖'
}

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted'

const getTaskVariant = (type: TaskType): BadgeVariant => {
  const variants: Record<TaskType, BadgeVariant> = {
    classification: 'primary',
    regression: 'success',
    clustering: 'warning',
    object_detection: 'error',
    semantic_segmentation: 'secondary',
    sequence_generation: 'muted',
    question_answering: 'muted',
    recommendation: 'muted'
  }
  return variants[type] || 'primary'
}

const getJobStatusVariant = (status: string): BadgeVariant => {
  const variants: Record<string, BadgeVariant> = {
    pending: 'muted',
    running: 'primary',
    completed: 'success',
    failed: 'error'
  }
  return variants[status] || 'muted'
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadTasks()
  loadJobs()
  if (route.query.type) {
    viewMode.value = 'tasks'
  }
})
</script>
