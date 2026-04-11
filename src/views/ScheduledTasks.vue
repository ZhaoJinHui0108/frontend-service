<template>
  <div class="page-container">
    <div class="page-header">
      <h1>定时任务</h1>
      <div class="view-tabs">
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
    </div>

    <!-- Search and Filter Bar (Tasks Tab) -->
    <div v-if="activeTab === 'tasks'" class="filter-bar">
      <UiInput
        v-model="taskSearch"
        type="search"
        placeholder="搜索任务名称、AI任务、模型..."
        class="search-input"
      />
      <UiSelect
        v-model="statusFilter"
        :options="statusOptions"
        class="status-select"
      />
      <UiButton @click="handleCreate">创建任务</UiButton>
      <span class="result-count">共 {{ filteredTasks.length }} 个任务</span>
    </div>

    <!-- Tasks Tab Content -->
    <div v-if="activeTab === 'tasks'">
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
                <div style="font-weight: 500">{{ task.name }}</div>
                <div v-if="task.description" class="text-muted" style="font-size: 12px">
                  {{ task.description.substring(0, 30) }}{{ task.description.length > 30 ? '...' : '' }}
                </div>
              </td>
              <td>{{ task.ai_task_id }}</td>
              <td>{{ task.ai_model_id }}</td>
              <td>{{ getScheduleInfo(task) }}</td>
              <td>
                <UiBadge :variant="getStatusVariant(task.status)">
                  {{ task.status }}
                </UiBadge>
              </td>
              <td>{{ task.run_count }}</td>
              <td>{{ task.next_run_at ? formatDate(task.next_run_at) : '-' }}</td>
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
      <div v-else class="empty-state">
        <p>{{ tasks.length === 0 ? '暂无定时任务' : '没有匹配的记录' }}</p>
        <UiButton v-if="tasks.length === 0" @click="handleCreate">创建第一个定时任务</UiButton>
        <UiButton v-else @click="clearFilters">清除筛选</UiButton>
      </div>
    </div>

    <!-- History Tab Content -->
    <div v-if="activeTab === 'history'">
      <div v-if="history.length === 0" class="empty-state">
        <p>暂无执行历史</p>
      </div>
      <div v-else class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>任务名称</th>
              <th>状态</th>
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
                  {{ exec.status }}
                </UiBadge>
              </td>
              <td>{{ formatDate(exec.started_at) }}</td>
              <td>{{ exec.completed_at ? formatDate(exec.completed_at) : '-' }}</td>
              <td>
                <span v-if="exec.error" class="text-error">{{ exec.error }}</span>
                <span v-else-if="exec.result">{{ JSON.stringify(exec.result).substring(0, 50) }}...</span>
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
      @close="closeFormModal"
    >
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>任务名称</label>
          <UiInput v-model="formData.name" placeholder="请输入任务名称" />
        </div>
        <div class="form-group">
          <label>描述</label>
          <UiInput v-model="formData.description" placeholder="请输入描述" />
        </div>
        <div class="form-group">
          <label>AI任务ID</label>
          <UiInput v-model="formData.ai_task_id" placeholder="请输入AI任务ID" />
        </div>
        <div class="form-group">
          <label>模型ID</label>
          <UiInput v-model="formData.ai_model_id" placeholder="请输入模型ID" />
        </div>
        <div class="form-group">
          <label>调度类型</label>
          <UiSelect v-model="formData.schedule_type" :options="scheduleTypeOptions" />
        </div>
        <UiAlert v-if="submitError" type="error">{{ submitError }}</UiAlert>
        <div class="modal-footer">
          <UiButton variant="secondary" @click="closeFormModal">取消</UiButton>
          <UiButton type="submit" :loading="submitting">保存</UiButton>
        </div>
      </form>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { UiInput, UiSelect, UiButton, UiBadge, UiModal, UiAlert } from '@/components/ui'
import { useScheduledTasks, type ScheduledTask, type ScheduledTaskCreate } from '@/composables/useScheduledTasks'

const {
  tasks,
  history,
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
  params: {}
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
  { label: 'Cron', value: 'cron' },
  { label: 'Interval', value: 'interval' }
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
    params: {}
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
    params: task.params
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

const getScheduleInfo = (task: ScheduledTask): string => {
  if (task.schedule_type === 'cron') {
    return task.schedule_config?.expression || '-'
  }
  return task.schedule_config?.interval ? `${task.schedule_config.interval}s` : '-'
}

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted'

const getStatusVariant = (status: string): BadgeVariant => {
  const variants: Record<string, BadgeVariant> = {
    pending: 'muted',
    running: 'primary',
    completed: 'success',
    failed: 'error',
    paused: 'warning'
  }
  return variants[status] || 'muted'
}

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
