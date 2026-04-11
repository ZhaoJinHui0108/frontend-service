<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header flex-between">
      <h1>⏰ 定时任务</h1>
      <UiButton @click="handleCreate">+ 创建任务</UiButton>
    </div>

    <!-- Error Alert -->
    <UiAlert v-if="error" type="error" style="margin-bottom: 16px">
      {{ error }}
    </UiAlert>

    <!-- Tabs -->
    <div class="tabs" style="margin-bottom: 24px;">
      <button
        :class="['tab-btn', { active: activeTab === 'tasks' }]"
        @click="activeTab = 'tasks'"
      >
        任务列表
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'history' }]"
        @click="activeTab = 'history'"
      >
        执行历史
      </button>
    </div>

    <!-- Tasks Tab -->
    <div v-if="activeTab === 'tasks'">
      <!-- Search and Filter -->
      <div class="filter-bar" style="margin-bottom: 20px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <UiInput
          v-model="taskSearch"
          type="search"
          placeholder="搜索任务名称、AI任务、模型..."
          style="flex: 1; min-width: 200px;"
        />
        <UiSelect
          v-model="statusFilter"
          :options="statusOptions"
          style="min-width: 120px;"
        />
        <span class="text-muted" style="font-size: 13px;">
          共 {{ filteredTasks.length }} 个任务
        </span>
      </div>

      <!-- Tasks Table -->
      <div v-if="filteredTasks.length > 0" class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>任务名称</th>
              <th>AI任务</th>
              <th>模型</th>
              <th>调度</th>
              <th>状态</th>
              <th>执行次数</th>
              <th>下次执行</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in filteredTasks" :key="task.id">
              <td>
                <div style="font-weight: 500;">{{ task.name }}</div>
                <div v-if="task.description" class="text-muted" style="font-size: 12px;">
                  {{ task.description.substring(0, 30) }}{{ task.description.length > 30 ? '...' : '' }}
                </div>
              </td>
              <td>{{ task.ai_task_id }}</td>
              <td>{{ task.ai_model_id }}</td>
              <td>
                <div class="schedule-info">
                  <UiBadge variant="muted">{{ getScheduleTypeLabel(task.schedule_type) }}</UiBadge>
                  <span class="text-muted" style="font-size: 12px;">
                    {{ getScheduleDetail(task) }}
                  </span>
                </div>
              </td>
              <td>
                <div class="status-cell">
                  <UiBadge :variant="getStatusVariant(task.status)">
                    {{ getStatusLabel(task.status) }}
                  </UiBadge>
                  <span v-if="!task.enabled" class="text-muted" style="font-size: 11px;">(已暂停)</span>
                </div>
              </td>
              <td>{{ task.run_count }}</td>
              <td>
                <span v-if="task.next_run_at" class="text-muted" style="font-size: 12px;">
                  {{ formatDate(task.next_run_at) }}
                </span>
                <span v-else>-</span>
              </td>
              <td>
                <div class="action-buttons">
                  <UiButton variant="secondary" size="small" @click="handleEdit(task)">编辑</UiButton>
                  <UiButton variant="secondary" size="small" @click="handleExecuteNow(task.id)">执行</UiButton>
                  <UiButton
                    v-if="task.enabled"
                    variant="secondary"
                    size="small"
                    @click="handlePause(task.id)"
                  >
                    暂停
                  </UiButton>
                  <UiButton
                    v-else
                    variant="secondary"
                    size="small"
                    @click="handleResume(task.id)"
                  >
                    恢复
                  </UiButton>
                  <UiButton variant="danger" size="small" @click="handleDelete(task.id)">删除</UiButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state-card">
        <p>{{ tasks.length === 0 ? '暂无定时任务' : '没有匹配的记录' }}</p>
        <UiButton v-if="tasks.length === 0" @click="handleCreate">创建第一个定时任务</UiButton>
        <UiButton v-else @click="clearFilters">清除筛选</UiButton>
      </div>
    </div>

    <!-- History Tab -->
    <div v-if="activeTab === 'history'">
      <div v-if="history.length === 0" class="empty-state-card">
        <p>暂无执行历史</p>
      </div>
      <div v-else class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>任务名称</th>
              <th>状态</th>
              <th>AI任务ID</th>
              <th>开始时间</th>
              <th>结束时间</th>
              <th>结果</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="exec in history" :key="exec.id">
              <td>{{ exec.scheduled_task_name }}</td>
              <td>
                <UiBadge :variant="getStatusVariant(exec.status)">
                  {{ getStatusLabel(exec.status) }}
                </UiBadge>
              </td>
              <td>
                <code v-if="exec.ai_job_id" class="job-id">{{ exec.ai_job_id.substring(0, 12) }}...</code>
                <span v-else>-</span>
              </td>
              <td>{{ formatDate(exec.started_at) }}</td>
              <td>{{ exec.completed_at ? formatDate(exec.completed_at) : '-' }}</td>
              <td>
                <span v-if="exec.error" class="text-error">{{ exec.error.substring(0, 50) }}...</span>
                <span v-else-if="exec.result" class="text-success">✅ 成功</span>
                <span v-else>-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Task Form Modal -->
    <UiModal
      :show="showFormModal"
      title="定时任务"
      size="large"
      @close="closeFormModal"
    >
      <form @submit.prevent="handleSubmit" class="task-form">
        <div class="form-row">
          <div class="form-group">
            <label>任务名称 *</label>
            <UiInput v-model="formData.name" placeholder="请输入任务名称" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>描述</label>
            <UiInput v-model="formData.description" placeholder="请输入描述" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>AI任务ID *</label>
            <UiInput v-model="formData.ai_task_id" placeholder="请输入AI任务ID" />
          </div>
          <div class="form-group">
            <label>模型ID *</label>
            <UiInput v-model="formData.ai_model_id" placeholder="请输入模型ID" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>调度类型 *</label>
            <UiSelect v-model="formData.schedule_type" :options="scheduleTypeOptions" />
          </div>
        </div>

        <div v-if="formData.schedule_type === 'cron'" class="form-row">
          <div class="form-group">
            <label>Cron 表达式</label>
            <UiInput v-model="formData.cron_expression" placeholder="例如: 0 8 * * *" />
          </div>
        </div>

        <div v-if="formData.schedule_type === 'interval'" class="form-row">
          <div class="form-group">
            <label>间隔时间（秒）</label>
            <UiInput v-model.number="formData.interval_seconds" type="number" placeholder="例如: 3600" />
          </div>
        </div>

        <div v-if="formData.schedule_type === 'once'" class="form-row">
          <div class="form-group">
            <label>执行时间</label>
            <UiInput v-model="formData.execute_at" type="datetime-local" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.enabled" />
              <span>创建后立即启用</span>
            </label>
          </div>
        </div>

        <UiAlert v-if="submitError" type="error">{{ submitError }}</UiAlert>
      </form>

      <template #footer>
        <UiButton variant="secondary" @click="closeFormModal">取消</UiButton>
        <UiButton :loading="submitting" @click="handleSubmit">保存</UiButton>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { UiInput, UiSelect, UiButton, UiBadge, UiModal, UiAlert } from '@/components/ui'
import { useScheduledTasks, type ScheduledTask, type ScheduledTaskCreate, type ScheduleType, ScheduleTypeLabels, TaskStatusLabels } from '@/composables/useScheduledTasks'

const {
  tasks,
  history,
  error,
  loadTasks,
  loadHistory,
  createTask,
  updateTask,
  deleteTask,
  executeNow,
  pauseTask,
  resumeTask
} = useScheduledTasks()

const activeTab = ref<'tasks' | 'history'>('tasks')
const taskSearch = ref('')
const statusFilter = ref('all')
const filteredTasks = ref<ScheduledTask[]>([])
const showFormModal = ref(false)
const editingTask = ref<ScheduledTask | null>(null)
const submitting = ref(false)
const submitError = ref('')

const formData = ref<Partial<ScheduledTaskCreate>>({
  name: '',
  description: '',
  ai_task_id: '',
  ai_model_id: '',
  schedule_type: 'cron',
  cron_expression: '',
  interval_seconds: undefined,
  execute_at: '',
  ai_model_params: {},
  ai_training_config: {},
  enabled: true
})

const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '等待中', value: 'pending' },
  { label: '执行中', value: 'running' },
  { label: '已完成', value: 'completed' },
  { label: '失败', value: 'failed' },
  { label: '已暂停', value: 'paused' }
]

const scheduleTypeOptions = [
  { label: 'Cron 表达式', value: 'once' },
  { label: '间隔执行', value: 'interval' },
  { label: '执行一次', value: 'once' }
]

watch([tasks, taskSearch, statusFilter], () => {
  let result = tasks.value
  
  if (statusFilter.value !== 'all') {
    result = result.filter(task => task.status === statusFilter.value)
  }
  
  if (taskSearch.value.trim()) {
    const search = taskSearch.value.toLowerCase()
    result = result.filter(task =>
      task.name?.toLowerCase().includes(search) ||
      task.ai_task_id?.toLowerCase().includes(search) ||
      task.ai_model_id?.toLowerCase().includes(search)
    )
  }
  
  filteredTasks.value = result
}, { immediate: true })

watch(activeTab, (tab) => {
  if (tab === 'tasks') loadTasks()
  if (tab === 'history') loadHistory()
})

const handleCreate = () => {
  editingTask.value = null
  formData.value = {
    name: '',
    description: '',
    ai_task_id: '',
    ai_model_id: '',
    schedule_type: 'cron',
    cron_expression: '',
    interval_seconds: undefined,
    execute_at: '',
    ai_model_params: {},
    ai_training_config: {},
    enabled: true
  }
  showFormModal.value = true
}

const handleEdit = (task: ScheduledTask) => {
  editingTask.value = task
  formData.value = {
    name: task.name,
    description: task.description,
    ai_task_id: task.ai_task_id,
    ai_model_id: task.ai_model_id,
    schedule_type: task.schedule_type,
    cron_expression: task.cron_expression,
    interval_seconds: task.interval_seconds,
    execute_at: task.execute_at,
    ai_model_params: task.ai_model_params,
    ai_training_config: task.ai_training_config,
    enabled: task.enabled
  }
  showFormModal.value = true
}

const handleSubmit = async () => {
  if (!formData.value.name || !formData.value.ai_task_id || !formData.value.ai_model_id) {
    submitError.value = '请填写所有必填字段'
    return
  }
  
  submitting.value = true
  submitError.value = ''
  
  try {
    if (editingTask.value) {
      await updateTask(editingTask.value.id, formData.value)
    } else {
      await createTask(formData.value as ScheduledTaskCreate)
    }
    closeFormModal()
    loadTasks()
  } catch (err: any) {
    submitError.value = err.message || '保存失败'
  } finally {
    submitting.value = false
  }
}

const closeFormModal = () => {
  showFormModal.value = false
  editingTask.value = null
  submitError.value = ''
}

const handleDelete = async (id: number) => {
  if (!confirm('确定要删除这个定时任务吗？')) return
  await deleteTask(id)
}

const handleExecuteNow = async (id: number) => {
  await executeNow(id)
  loadHistory()
}

const handlePause = async (id: number) => {
  await pauseTask(id)
}

const handleResume = async (id: number) => {
  await resumeTask(id)
}

const clearFilters = () => {
  taskSearch.value = ''
  statusFilter.value = 'all'
}

const getScheduleTypeLabel = (type: ScheduleType): string => ScheduleTypeLabels[type] || type

const getScheduleDetail = (task: ScheduledTask): string => {
  if (task.schedule_type === 'cron' && task.cron_expression) {
    return task.cron_expression
  }
  if (task.schedule_type === 'interval' && task.interval_seconds) {
    return `${task.interval_seconds}秒`
  }
  if (task.schedule_type === 'once' && task.execute_at) {
    return formatDate(task.execute_at)
  }
  return '-'
}

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted'

const getStatusVariant = (status: string): BadgeVariant => {
  const variants: Record<string, BadgeVariant> = {
    pending: 'warning',
    running: 'primary',
    completed: 'success',
    failed: 'error',
    cancelled: 'muted',
    paused: 'muted'
  }
  return variants[status] || 'muted'
}

const getStatusLabel = (status: string): string => TaskStatusLabels[status as keyof typeof TaskStatusLabels] || status

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadTasks()
  loadHistory()
  const interval = setInterval(() => {
    if (activeTab.value === 'tasks') loadTasks()
    if (activeTab.value === 'history') loadHistory()
  }, 30000)
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

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tab-btn {
  background: rgba(0, 0, 0, 0.05);
  color: #18181b;
  border: none;
  border-radius: 9999px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #18181b;
  color: #ffffff;
}

.filter-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
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

.empty-state-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  color: #8e8e93;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
}

.text-muted {
  color: #8e8e93;
}

.text-success {
  color: #52c41a;
}

.text-error {
  color: #ff4d4f;
}

.action-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.schedule-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.job-id {
  font-size: 11px;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #45515e;
}

.checkbox-group {
  flex-direction: row !important;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
}
</style>
