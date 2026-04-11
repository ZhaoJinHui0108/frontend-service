<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header flex-between">
      <h1>🤖 AI-Learing</h1>
      <div class="header-actions">
        <UiButton variant="secondary" @click="viewMode = 'training'">
          📊 训练记录
        </UiButton>
      </div>
    </div>

    <!-- Error Alert -->
    <UiAlert v-if="error" type="error" style="margin-bottom: 16px">
      {{ error }}
    </UiAlert>

    <!-- Tasks View -->
    <div v-if="viewMode === 'tasks'" class="tasks-view">
      <!-- Filter Tabs -->
      <div class="filter-tabs" style="margin-bottom: 24px; display: flex; gap: 8px; flex-wrap: wrap;">
        <UiButton
          :variant="activeFilter === 'all' ? 'primary' : 'secondary'"
          size="small"
          @click="handleFilterChange('all')"
        >
          全部
        </UiButton>
        <UiButton
          v-for="type in taskTypes"
          :key="type"
          :variant="activeFilter === type ? 'primary' : 'secondary'"
          size="small"
          @click="handleFilterChange(type)"
        >
          {{ getTaskIcon(type) }} {{ getTaskLabel(type) }}
        </UiButton>
      </div>

      <!-- Tasks Grid -->
      <div class="card-grid">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-card"
          @click="handleTaskSelect(task)"
        >
          <div class="task-header">
            <h3>{{ getTaskIcon(task.task_type) }} {{ task.name }}</h3>
            <UiBadge variant="muted">{{ getTaskLabel(task.task_type) }}</UiBadge>
          </div>
          <p class="task-description">{{ task.description }}</p>
          <div class="task-meta">
            <UiBadge variant="primary">{{ task.dataset_name }}</UiBadge>
            <UiBadge variant="muted">{{ task.supported_models.length }} 个模型</UiBadge>
          </div>
          <div class="task-footer">
            <span class="text-muted">
              输入形状: [{{ task.input_shape.join(', ') }}]
              <span v-if="task.num_classes"> | 类别数: {{ task.num_classes }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredTasks.length === 0 && !loading" class="empty-state-card">
        <p>暂无任务</p>
      </div>
    </div>

    <!-- Models View -->
    <div v-if="viewMode === 'models'" class="models-view">
      <div class="page-header">
        <h2>{{ selectedTask?.name }} - 选择模型</h2>
        <UiButton variant="secondary" @click="viewMode = 'tasks'">返回任务列表</UiButton>
      </div>

      <div class="card-grid">
        <div
          v-for="model in models"
          :key="model.id"
          class="task-card"
          @click="handleModelSelect(model)"
        >
          <div class="task-header">
            <h3>🤖 {{ model.name }}</h3>
            <UiBadge :variant="model.framework === 'pytorch' ? 'primary' : 'success'">
              {{ model.framework }}
            </UiBadge>
          </div>
          <p class="task-description">{{ model.description }}</p>
          <div class="task-footer">
            <span class="text-muted">{{ model.params.length }} 个参数</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Training View (Records) -->
    <div v-if="viewMode === 'training'" class="training-view">
      <div class="page-header flex-between">
        <h2>📊 训练记录</h2>
        <UiButton variant="secondary" @click="viewMode = 'tasks'">返回任务列表</UiButton>
      </div>

      <!-- Search and Filter -->
      <div class="filter-bar" style="margin-bottom: 20px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <UiInput
          v-model="jobSearch"
          type="search"
          placeholder="搜索任务名称、模型名称、Job ID..."
          style="flex: 1; min-width: 200px;"
        />
        <UiSelect
          v-model="statusFilter"
          :options="statusOptions"
          style="min-width: 120px;"
        />
        <span class="text-muted" style="font-size: 13px;">
          共 {{ filteredJobs.length }} 条记录
        </span>
      </div>

      <!-- Training Table -->
      <div v-if="filteredJobs.length > 0" class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>任务名称</th>
              <th>模型</th>
              <th>状态</th>
              <th>进度</th>
              <th>训练时间</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in filteredJobs" :key="job.job_id">
              <td><code class="job-id">{{ job.job_id.substring(0, 12) }}...</code></td>
              <td>{{ job.task_name }}</td>
              <td>{{ job.model_name }}</td>
              <td>
                <UiBadge :variant="getStatusVariant(job.status)">
                  {{ getStatusLabel(job.status) }}
                </UiBadge>
              </td>
              <td>
                <div v-if="job.status === 'running'" class="progress-bar">
                  <div class="progress-fill" style="width: 60%"></div>
                </div>
                <span v-else-if="job.status === 'completed'" class="text-success">✅ 完成</span>
                <span v-else-if="job.status === 'failed'" class="text-error">❌ 失败</span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>{{ job.training_time ? `${job.training_time.toFixed(1)}s` : '-' }}</td>
              <td>{{ formatDate(job.created_at) }}</td>
              <td>
                <div class="action-buttons">
                  <UiButton variant="secondary" size="small" @click="viewJobDetails(job)">
                    查看
                  </UiButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state-card">
        <p>暂无训练记录</p>
      </div>
    </div>

    <!-- Results View -->
    <div v-if="viewMode === 'results'" class="results-view">
      <div class="page-header flex-between">
        <h2>📈 训练结果</h2>
        <UiButton variant="secondary" @click="viewMode = 'training'">返回记录</UiButton>
      </div>
      <UiCard v-if="currentJob">
        <div class="result-header">
          <h3>{{ currentJob.task_name }} - {{ currentJob.model_name }}</h3>
          <UiBadge :variant="getStatusVariant(currentJob.status)">
            {{ getStatusLabel(currentJob.status) }}
          </UiBadge>
        </div>
        <div v-if="currentJob.error" class="error-message">
          {{ currentJob.error }}
        </div>
        <div v-else-if="currentJob.metrics" class="metrics-grid">
          <div v-for="(value, key) in currentJob.metrics.final_metrics" :key="key" class="metric-item">
            <span class="metric-label">{{ key }}</span>
            <span class="metric-value">{{ typeof value === 'number' ? value.toFixed(4) : value }}</span>
          </div>
        </div>
        <div v-else class="text-muted" style="padding: 20px; text-align: center;">
          正在训练中，请稍后查看...
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { UiInput, UiSelect, UiButton, UiBadge, UiCard, UiAlert } from '@/components/ui'
import { useTasks } from '@/composables/useTasks'
import { TaskTypeLabels, TaskTypeIcons, type TaskInfo, type ModelInfo, type TrainingJobResponse, type TaskType } from '@/services/aiLearningService'

type ViewMode = 'tasks' | 'models' | 'training' | 'results'

const route = useRoute()
const { tasks, models, jobs, loading, error, loadTasks, loadModels, loadJobs } = useTasks()

const viewMode = ref<ViewMode>('tasks')
const selectedTask = ref<TaskInfo | null>(null)
const selectedModel = ref<ModelInfo | null>(null)
const currentJob = ref<TrainingJobResponse | null>(null)
const activeFilter = ref<TaskType | 'all'>('all')
const jobSearch = ref('')
const statusFilter = ref('all')
const filteredJobs = ref<TrainingJobResponse[]>([])
const filteredTasks = ref<TaskInfo[]>([])

const taskTypes: TaskType[] = [
  'classification',
  'regression',
  'clustering',
  'object_detection',
  'semantic_segmentation',
  'sequence_generation',
  'question_answering',
  'recommendation'
]

const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '等待中', value: 'pending' },
  { label: '执行中', value: 'running' },
  { label: '已完成', value: 'completed' },
  { label: '失败', value: 'failed' }
]

const getTaskIcon = (type: TaskType): string => TaskTypeIcons[type]
const getTaskLabel = (type: TaskType): string => TaskTypeLabels[type]

watch([tasks, activeFilter], () => {
  if (activeFilter.value === 'all') {
    filteredTasks.value = tasks.value
  } else {
    filteredTasks.value = tasks.value.filter(t => t.task_type === activeFilter.value)
  }
}, { immediate: true })

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

const handleFilterChange = (type: TaskType | 'all') => {
  activeFilter.value = type
}

const handleTaskSelect = (task: TaskInfo) => {
  selectedTask.value = task
  selectedModel.value = null
  loadModels(task.id)
  viewMode.value = 'models'
}

const handleModelSelect = (model: ModelInfo) => {
  selectedModel.value = model
  viewMode.value = 'training'
}

const viewJobDetails = (job: TrainingJobResponse) => {
  currentJob.value = job
  viewMode.value = 'results'
}

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted'

const getStatusVariant = (status: string): BadgeVariant => {
  const variants: Record<string, BadgeVariant> = {
    pending: 'warning',
    running: 'primary',
    completed: 'success',
    failed: 'error'
  }
  return variants[status] || 'muted'
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: '⏳ 等待中',
    running: '🔄 训练中',
    completed: '✅ 完成',
    failed: '❌ 失败'
  }
  return labels[status] || status
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadTasks()
  loadJobs()
  if (route.query.type) {
    activeFilter.value = route.query.type as TaskType
  }
})
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: #18181b;
  line-height: 1.1;
  margin: 0;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 500;
  color: #18181b;
  margin: 0;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-bar {
  margin-bottom: 20px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.task-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.task-card:hover {
  border-color: var(--primary-500, #3b82f6);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #18181b;
}

.task-description {
  font-size: 14px;
  color: #45515e;
  margin-bottom: 12px;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.task-footer {
  border-top: 1px solid #f2f3f5;
  padding-top: 12px;
  font-size: 12px;
  color: #8e8e93;
}

.empty-state-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  color: #8e8e93;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
}

.table-wrapper {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #fafafa;
  font-weight: 600;
  font-size: 13px;
  color: #45515e;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid #f2f3f5;
  font-size: 14px;
  color: #222222;
}

.data-table tr:hover td {
  background: #fafafa;
}

.job-id {
  font-size: 12px;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.progress-bar {
  width: 100px;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.text-success {
  color: #52c41a;
}

.text-error {
  color: #ff4d4f;
}

.text-muted {
  color: #8e8e93;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.error-message {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  border-radius: 8px;
  padding: 12px 16px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.metric-item {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.metric-label {
  display: block;
  font-size: 12px;
  color: #8e8e93;
  margin-bottom: 4px;
}

.metric-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #18181b;
}
</style>
