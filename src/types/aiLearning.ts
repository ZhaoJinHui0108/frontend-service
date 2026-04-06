// AI Learning Types

export type TaskType =
  | 'classification'
  | 'regression'
  | 'clustering'
  | 'object_detection'
  | 'semantic_segmentation'
  | 'sequence_generation'
  | 'question_answering'
  | 'recommendation';

export interface TaskInfo {
  id: string;
  name: string;
  description: string;
  task_type: TaskType;
  dataset_name: string;
  input_shape: number[];
  num_classes?: number;
  supported_models: string[];
}

export interface ModelParamConfig {
  param_name: string;
  param_type: 'int' | 'float' | 'string' | 'bool' | 'choice' | 'list';
  default: any;
  min_value?: number;
  max_value?: number;
  step?: number;
  choices?: any[];
  description: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  task_type: TaskType;
  framework: 'sklearn' | 'pytorch';
  description: string;
  params: ModelParamConfig[];
}

export interface TrainingConfig {
  epochs: number;
  batch_size: number;
  learning_rate: number;
  test_split: number;
  random_seed: number;
}

export interface TrainingJobCreate {
  task_id: string;
  model_id: string;
  model_params: Record<string, any>;
  training_config: TrainingConfig;
}

export interface TrainingMetrics {
  train_loss: number[];
  val_loss: number[];
  train_accuracy: number[];
  val_accuracy: number[];
  final_metrics: Record<string, number | string>;
}

export interface TrainingJobResponse {
  job_id: string;
  task_id: string;
  task_name: string;
  model_id: string;
  model_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  model_params: Record<string, any>;
  training_config: TrainingConfig;
  metrics?: TrainingMetrics;
  training_time?: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
}

export interface ModelComparisonItem {
  model_id: string;
  model_name: string;
  job_id: string;
  status: string;
  metrics?: Record<string, number | string>;
}

export interface ModelComparisonResponse {
  task_id: string;
  task_name: string;
  results: ModelComparisonItem[];
}

// 任务类型中文映射
export const TaskTypeLabels: Record<TaskType, string> = {
  classification: '分类',
  regression: '回归',
  clustering: '聚类',
  object_detection: '目标检测',
  semantic_segmentation: '语义分割',
  sequence_generation: '序列生成',
  question_answering: '问答系统',
  recommendation: '推荐系统',
};

// 任务类型图标
export const TaskTypeIcons: Record<TaskType, string> = {
  classification: '🏷️',
  regression: '📈',
  clustering: '🎯',
  object_detection: '🔍',
  semantic_segmentation: '🖼️',
  sequence_generation: '📝',
  question_answering: '❓',
  recommendation: '⭐',
};
