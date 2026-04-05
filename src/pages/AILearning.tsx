import React, { useState, useEffect } from 'react';
import { aiLearningApi } from '../api/aiLearning';
import type { TaskInfo, ModelInfo, TrainingJobResponse, TaskType } from '../types/aiLearning';
import { TaskTypeLabels, TaskTypeIcons } from '../types/aiLearning';
import { Button } from '../components/ui';
import ModelParamsConfig from './ModelParamsConfig';
import TrainingResults from './TrainingResults';

type ViewMode = 'tasks' | 'models' | 'config' | 'training' | 'results';

const AILearning: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('tasks');
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskInfo | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null);
  const [jobs, setJobs] = useState<TrainingJobResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 按任务类型分组
  const tasksByType = tasks.reduce((acc, task) => {
    if (!acc[task.task_type]) {
      acc[task.task_type] = [];
    }
    acc[task.task_type].push(task);
    return acc;
  }, {} as Record<TaskType, TaskInfo[]>);

  useEffect(() => {
    loadTasks();
    loadJobs();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data } = await aiLearningApi.listTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || '加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const { data } = await aiLearningApi.listJobs();
      setJobs(data);
    } catch (err: any) {
      console.error('加载任务记录失败:', err);
    }
  };

  const loadModels = async (taskId: string) => {
    try {
      setLoading(true);
      const { data } = await aiLearningApi.listModels(taskId);
      setModels(data);
    } catch (err: any) {
      setError(err.message || '加载模型失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelect = (task: TaskInfo) => {
    setSelectedTask(task);
    setSelectedModel(null);
    loadModels(task.id);
    setViewMode('models');
  };

  const handleModelSelect = (model: ModelInfo) => {
    setSelectedModel(model);
    setViewMode('config');
  };

  const handleTrainingComplete = () => {
    loadJobs();
    setViewMode('training');
  };

  const handleCompare = () => {
    setViewMode('results');
  };

  const renderTasksView = () => (
    <div className="ai-learning-tasks">
      <div className="page-header">
        <h1>🤖 AI 学习模块</h1>
        <p className="page-subtitle">选择一个任务类型开始学习</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className="task-groups">
        {Object.entries(tasksByType).map(([type, taskList]) => (
          <div key={type} className="task-group">
            <h2 className="task-group-title">
              {TaskTypeIcons[type as TaskType]} {TaskTypeLabels[type as TaskType]}
            </h2>
            <div className="task-cards">
              {taskList.map((task) => (
                <div
                  key={task.id}
                  className="task-card"
                  onClick={() => handleTaskSelect(task)}
                >
                  <h3>{task.name}</h3>
                  <p>{task.description}</p>
                  <div className="task-meta">
                    <span className="dataset-tag">{task.dataset_name}</span>
                    <span className="models-count">
                      {task.supported_models.length} 个模型
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModelsView = () => (
    <div className="ai-learning-models">
      <div className="page-header">
        <Button variant="ghost" onClick={() => setViewMode('tasks')}>
          ← 返回任务列表
        </Button>
        <h1>{selectedTask?.name}</h1>
        <p className="page-subtitle">{selectedTask?.description}</p>
      </div>

      <div className="model-cards">
        {models.map((model) => (
          <div
            key={model.id}
            className="model-card"
            onClick={() => handleModelSelect(model)}
          >
            <div className="model-header">
              <h3>{model.name}</h3>
              <span className={`framework-tag ${model.framework}`}>
                {model.framework === 'sklearn' ? 'scikit-learn' : 'PyTorch'}
              </span>
            </div>
            <p>{model.description}</p>
            <div className="model-params-count">
              {model.params.length} 个可配置参数
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConfigView = () => (
    <div className="ai-learning-config">
      <div className="page-header">
        <Button variant="ghost" onClick={() => setViewMode('models')}>
          ← 返回模型列表
        </Button>
        <h1>{selectedTask?.name} - {selectedModel?.name}</h1>
      </div>

      <ModelParamsConfig
        task={selectedTask!}
        model={selectedModel!}
        onTrainingComplete={handleTrainingComplete}
      />
    </div>
  );

  const renderTrainingView = () => (
    <div className="ai-learning-training">
      <div className="page-header">
        <Button variant="ghost" onClick={() => setViewMode('tasks')}>
          ← 返回任务列表
        </Button>
        <Button variant="secondary" onClick={handleCompare}>
          📊 模型对比
        </Button>
        <h1>训练记录</h1>
      </div>

      <div className="jobs-list">
        {jobs.length === 0 ? (
          <div className="empty-state">
            <p>暂无训练记录</p>
            <Button onClick={() => setViewMode('tasks')}>开始训练</Button>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.job_id} className="job-card">
              <div className="job-info">
                <h3>{job.task_id} - {job.model_id}</h3>
                <div className="job-meta">
                  <span className={`status-badge ${job.status}`}>
                    {job.status === 'pending' && '⏳ 等待中'}
                    {job.status === 'running' && '🔄 训练中'}
                    {job.status === 'completed' && '✅ 完成'}
                    {job.status === 'failed' && '❌ 失败'}
                  </span>
                  <span>进度: {(job.progress * 100).toFixed(0)}%</span>
                  <span>创建时间: {new Date(job.created_at).toLocaleString()}</span>
                </div>
              </div>
              {job.metrics && (
                <div className="job-metrics">
                  <h4>最终指标:</h4>
                  <div className="metrics-grid">
                    {Object.entries(job.metrics.final_metrics).map(([key, value]) => (
                      <div key={key} className="metric-item">
                        <span className="metric-key">{key}</span>
                        <span className="metric-value">
                          {typeof value === 'number' ? value.toFixed(4) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderResultsView = () => (
    <div className="ai-learning-results">
      <div className="page-header">
        <Button variant="ghost" onClick={() => setViewMode('training')}>
          ← 返回训练记录
        </Button>
        <h1>📊 模型对比</h1>
      </div>

      <TrainingResults />
    </div>
  );

  return (
    <div className="ai-learning-page">
      {viewMode === 'tasks' && renderTasksView()}
      {viewMode === 'models' && renderModelsView()}
      {viewMode === 'config' && renderConfigView()}
      {viewMode === 'training' && renderTrainingView()}
      {viewMode === 'results' && renderResultsView()}
    </div>
  );
};

export default AILearning;
