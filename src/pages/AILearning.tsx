import React, { useState, useEffect } from 'react';
import { aiLearningApi } from '../api/aiLearning';
import type { TaskInfo, ModelInfo, TrainingJobResponse, TaskType } from '../types/aiLearning';
import { TaskTypeLabels, TaskTypeIcons } from '../types/aiLearning';
import { Button, Card, Badge } from '../components/ui';
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'primary' | 'success' | 'warning' | 'error'> = {
      pending: 'warning',
      running: 'primary',
      completed: 'success',
      failed: 'error',
    };
    const labels: Record<string, string> = {
      pending: '⏳ 等待中',
      running: '🔄 训练中',
      completed: '✅ 完成',
      failed: '❌ 失败',
    };
    return <Badge variant={variants[status] || 'primary'}>{labels[status] || status}</Badge>;
  };

  const renderTasksView = () => (
    <div className="page-content">
      <div className="page-header flex-between">
        <h1>🤖 AI-Learing</h1>
        <Button variant="secondary" onClick={() => setViewMode('training')}>
          📊 训练记录
        </Button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className="card-grid">
        {tasks.map((task) => (
          <Card key={task.id} style={{ cursor: 'pointer' }} onClick={() => handleTaskSelect(task)}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1 }}>
                <div className="flex-between" style={{ marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
                    {TaskTypeIcons[task.task_type]} {task.name}
                  </h3>
                </div>
                <p className="text-secondary" style={{ fontSize: '14px', marginBottom: '12px' }}>
                  {task.description}
                </p>
                <div className="flex gap-sm" style={{ flexWrap: 'wrap', marginBottom: '12px' }}>
                  <Badge variant="primary">{task.dataset_name}</Badge>
                  <Badge variant="muted">{task.supported_models.length} 个模型</Badge>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f2f3f5', paddingTop: '12px', marginTop: 'auto' }}>
                <div className="text-muted" style={{ fontSize: '12px' }}>
                  输入形状: [{task.input_shape.join(', ')}]
                  {task.num_classes && ` | 类别数: ${task.num_classes}`}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && !loading && (
        <Card>
          <div className="empty-state">
            <p>暂无任务</p>
          </div>
        </Card>
      )}
    </div>
  );

  const renderModelsView = () => (
    <div className="page-content">
      <div className="page-header flex-between">
        <div>
          <Button variant="ghost" onClick={() => setViewMode('tasks')} style={{ marginBottom: '8px', padding: '4px 0' }}>
            ← 返回任务列表
          </Button>
          <h1 style={{ margin: 0 }}>{selectedTask?.name}</h1>
          <p className="text-secondary" style={{ marginTop: '4px' }}>{selectedTask?.description}</p>
        </div>
      </div>

      <div className="card-grid">
        {models.map((model) => (
          <Card key={model.id} style={{ cursor: 'pointer' }} onClick={() => handleModelSelect(model)}>
            <div className="flex-between" style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{model.name}</h3>
              <Badge variant={model.framework === 'sklearn' ? 'success' : 'primary'}>
                {model.framework === 'sklearn' ? 'scikit-learn' : 'PyTorch'}
              </Badge>
            </div>
            <p className="text-secondary" style={{ fontSize: '14px', marginBottom: '12px' }}>
              {model.description}
            </p>
            <div className="flex gap-sm">
              <Badge variant="muted">{model.params.length} 个可配置参数</Badge>
            </div>
          </Card>
        ))}
      </div>

      {models.length === 0 && !loading && (
        <Card>
          <div className="empty-state">
            <p>暂无模型</p>
          </div>
        </Card>
      )}
    </div>
  );

  const renderConfigView = () => (
    <div className="page-content">
      <div className="page-header">
        <Button variant="ghost" onClick={() => setViewMode('models')} style={{ marginBottom: '8px', padding: '4px 0' }}>
          ← 返回模型列表
        </Button>
        <h1 style={{ margin: 0 }}>{selectedTask?.name} - {selectedModel?.name}</h1>
      </div>

      <ModelParamsConfig
        task={selectedTask!}
        model={selectedModel!}
        onTrainingComplete={handleTrainingComplete}
      />
    </div>
  );

  const renderTrainingView = () => (
    <div className="page-content">
      <div className="page-header flex-between">
        <h1>📊 训练记录</h1>
        <div className="flex gap-sm">
          <Button variant="secondary" onClick={handleCompare} disabled={jobs.length === 0}>
            模型对比
          </Button>
          <Button variant="primary" onClick={() => setViewMode('tasks')}>
            开始新训练
          </Button>
        </div>
      </div>

      <div className="card-grid">
        {jobs.map((job) => (
          <Card key={job.job_id}>
            <div className="flex-between" style={{ marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                  {job.task_name}
                </h3>
                <p className="text-secondary" style={{ fontSize: '14px' }}>
                  {job.model_name}
                </p>
              </div>
              {getStatusBadge(job.status)}
            </div>
            
            <div className="flex gap-sm" style={{ marginBottom: '12px', flexWrap: 'wrap' }}>
              <Badge variant="muted">
                创建: {new Date(job.created_at).toLocaleString()}
              </Badge>
              {job.training_time && (
                <Badge variant="muted">
                  耗时: {job.training_time.toFixed(1)}秒
                </Badge>
              )}
            </div>

            {job.error && (
              <div className="alert alert-error" style={{ fontSize: '13px' }}>
                {job.error}
              </div>
            )}

            {job.metrics && (
              <div style={{ borderTop: '1px solid #f2f3f5', paddingTop: '12px', marginTop: '12px' }}>
                <div className="text-muted" style={{ fontSize: '12px', marginBottom: '8px' }}>
                  最终指标:
                </div>
                <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                  {Object.entries(job.metrics.final_metrics || {}).map(([key, value]) => (
                    <Badge key={key} variant="primary">
                      {key}: {typeof value === 'number' ? value.toFixed(4) : value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {jobs.length === 0 && (
        <Card>
          <div className="empty-state">
            <p>暂无训练记录</p>
            <Button onClick={() => setViewMode('tasks')}>开始训练</Button>
          </div>
        </Card>
      )}
    </div>
  );

  const renderResultsView = () => (
    <div className="page-content">
      <div className="page-header">
        <Button variant="ghost" onClick={() => setViewMode('training')} style={{ marginBottom: '8px', padding: '4px 0' }}>
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
