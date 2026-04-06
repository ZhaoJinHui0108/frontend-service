// Scheduled Task Types

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type ScheduleType = 'once' | 'cron' | 'interval';

export interface ScheduledTask {
  id: number;
  name: string;
  description?: string;
  schedule_type: ScheduleType;
  execute_at?: string;
  cron_expression?: string;
  interval_seconds?: number;
  ai_task_id: string;
  ai_model_id: string;
  ai_model_params: Record<string, any>;
  ai_training_config: Record<string, any>;
  enabled: boolean;
  status: TaskStatus;
  last_run_at?: string;
  next_run_at?: string;
  run_count: number;
  created_at: string;
  updated_at: string;
}

export interface ScheduledTaskCreate {
  name: string;
  description?: string;
  schedule_type: ScheduleType;
  execute_at?: string;
  cron_expression?: string;
  interval_seconds?: number;
  ai_task_id: string;
  ai_model_id: string;
  ai_model_params: Record<string, any>;
  ai_training_config: Record<string, any>;
  enabled?: boolean;
}

export interface ScheduledTaskUpdate {
  name?: string;
  description?: string;
  schedule_type?: ScheduleType;
  execute_at?: string;
  cron_expression?: string;
  interval_seconds?: number;
  ai_task_id?: string;
  ai_model_id?: string;
  ai_model_params?: Record<string, any>;
  ai_training_config?: Record<string, any>;
  enabled?: boolean;
}

export interface TaskExecutionHistory {
  id: number;
  task_id: number;
  scheduled_task_name: string;
  status: TaskStatus;
  started_at: string;
  completed_at?: string;
  ai_job_id?: string;
  ai_job_status?: string;
  result?: Record<string, any>;
  error?: string;
}

export interface AITask {
  id: string;
  name: string;
  description: string;
  task_type: string;
  supported_models: string[];
}

export interface AIModel {
  id: string;
  name: string;
  framework: string;
  description: string;
  params: ModelParam[];
}

export interface ModelParam {
  param_name: string;
  param_type: 'int' | 'float' | 'string' | 'bool' | 'choice' | 'list';
  default: any;
  min_value?: number;
  max_value?: number;
  step?: number;
  choices?: any[];
  description: string;
}

export interface SchedulePreset {
  name: string;
  expression: string;
  description: string;
}

export const ScheduleTypeLabels: Record<ScheduleType, string> = {
  once: '执行一次',
  cron: 'Cron 表达式',
  interval: '间隔执行',
};

export const TaskStatusLabels: Record<TaskStatus, string> = {
  pending: '等待中',
  running: '执行中',
  completed: '已完成',
  failed: '失败',
  cancelled: '已取消',
};

export const TaskStatusColors: Record<TaskStatus, string> = {
  pending: '#f59e0b',
  running: '#3b82f6',
  completed: '#22c55e',
  failed: '#ef4444',
  cancelled: '#6b7280',
};
