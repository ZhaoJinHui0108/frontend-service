import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { aiLearningApi } from '../api/aiLearning';
import type { TaskInfo, ModelInfo, TrainingJobResponse, TaskType } from '../types/aiLearning';
import { TaskTypeLabels, TaskTypeIcons } from '../types/aiLearning';
import { Button, Card, Badge } from '../components/ui';
import ModelParamsConfig, { ModelParamsConfigRef } from './ModelParamsConfig';
import TrainingResults from './TrainingResults';

type ViewMode = 'tasks' | 'models' | 'config' | 'training' | 'results';

const AILearning: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('tasks');
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskInfo[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskInfo | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null);
  const [jobs, setJobs] = useState<TrainingJobResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<TaskType | 'all'>(
    (searchParams.get('type') as TaskType) || 'all'
  );
  const configRef = useRef<ModelParamsConfigRef>(null);
  
  // Lifted training job state to persist across view changes
  const [currentTrainingJob, setCurrentTrainingJob] = useState<TrainingJobResponse | null>(null);
  
  // Training records search/filter state
  const [jobSearch, setJobSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filteredJobs, setFilteredJobs] = useState<TrainingJobResponse[]>([]);
  
  // Update filtered jobs when jobs, search, or status changes
  useEffect(() => {
    let result = jobs;
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(job => job.status === statusFilter);
    }
    
    // Search by task name, model name, or job_id
    if (jobSearch.trim()) {
      const search = jobSearch.toLowerCase();
      result = result.filter(job =>
        job.task_name?.toLowerCase().includes(search) ||
        job.model_name?.toLowerCase().includes(search) ||
        job.job_id?.toLowerCase().includes(search)
      );
    }
    
    setFilteredJobs(result);
  }, [jobs, jobSearch, statusFilter]);

  useEffect(() => {
    loadTasks();
    loadJobs();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(t => t.task_type === activeFilter));
    }
  }, [tasks, activeFilter]);

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
    setCurrentTrainingJob(null);
    loadJobs();
    setViewMode('training');
  };
  
  const handleTrainingJobUpdate = (job: TrainingJobResponse | null) => {
    setCurrentTrainingJob(job);
  };

  const handleCompare = () => {
    setViewMode('results');
  };

  const handleFilterChange = (type: TaskType | 'all') => {
    setActiveFilter(type);
    if (type !== 'all') {
      setSearchParams({ type });
    } else {
      setSearchParams({});
    }
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

      {/* Task Type Filter */}
      <div className="filter-tabs" style={{ marginBottom: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button
          variant={activeFilter === 'all' ? 'primary' : 'secondary'}
          size="small"
          onClick={() => handleFilterChange('all')}
        >
          全部
        </Button>
        {(Object.keys(TaskTypeLabels) as TaskType[]).map(type => (
          <Button
            key={type}
            variant={activeFilter === type ? 'primary' : 'secondary'}
            size="small"
            onClick={() => handleFilterChange(type)}
          >
            {TaskTypeIcons[type]} {TaskTypeLabels[type]}
          </Button>
        ))}
      </div>

      <div className="card-grid">
        {filteredTasks.map((task) => (
          <Card
            key={task.id}
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '2px solid transparent',
            }}
            onClick={() => handleTaskSelect(task)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-500)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '';
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1 }}>
                <div className="flex-between" style={{ marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
                    {TaskTypeIcons[task.task_type]} {task.name}
                  </h3>
                  <Badge variant="muted">{TaskTypeLabels[task.task_type]}</Badge>
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

      {filteredTasks.length === 0 && !loading && (
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
          <Card
            key={model.id}
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '2px solid transparent',
            }}
            onClick={() => handleModelSelect(model)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-500)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '';
            }}
          >
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
      <div className="page-header flex-between">
        <div>
          <Button variant="ghost" onClick={() => setViewMode('models')} style={{ marginBottom: '8px', padding: '4px 0' }}>
            ← 返回模型列表
          </Button>
          <h1 style={{ margin: 0 }}>{selectedTask?.name} - {selectedModel?.name}</h1>
        </div>
        <Button variant="primary" onClick={() => configRef.current?.startTraining()}>
          🚀 开始训练
        </Button>
      </div>

      <ModelParamsConfig
        ref={configRef}
        task={selectedTask!}
        model={selectedModel!}
        onTrainingComplete={handleTrainingComplete}
        onTrainingJobUpdate={handleTrainingJobUpdate}
        initialTrainingJob={currentTrainingJob}
        hideActions={true}
        showStatusHeader={true}
      />
    </div>
  );

  const renderTrainingView = () => (
    <div className="page-content">
      <div className="page-header flex-between">
        <h1>📊 训练记录</h1>
        <div className="flex gap-sm">
          <Button variant="secondary" onClick={handleCompare} disabled={filteredJobs.length === 0}>
            模型对比
          </Button>
          <Button variant="primary" onClick={() => setViewMode('tasks')}>
            开始新训练
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="搜索任务名、模型名、Job ID..."
          value={jobSearch}
          onChange={(e) => setJobSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '8px 12px',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
          <option value="all">全部状态</option>
          <option value="pending">等待中</option>
          <option value="running">训练中</option>
          <option value="completed">已完成</option>
          <option value="failed">失败</option>
        </select>
        <span className="text-muted" style={{ fontSize: '13px' }}>
          共 {filteredJobs.length} 条记录
        </span>
      </div>

      {/* Table */}
      {filteredJobs.length > 0 ? (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>任务</th>
                <th>模型</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>训练耗时</th>
                <th>结果</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.job_id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{job.job_id}</td>
                  <td>{job.task_name || job.task_id}</td>
                  <td>{job.model_name || job.model_id}</td>
                  <td>{getStatusBadge(job.status)}</td>
                  <td>{new Date(job.created_at).toLocaleString('zh-CN')}</td>
                  <td>{job.training_time ? `${job.training_time.toFixed(1)}秒` : '-'}</td>
                  <td>
                    {job.error ? (
                      <span className="text-error" style={{ fontSize: '12px' }} title={job.error}>
                        ❌ {job.error.substring(0, 30)}...
                      </span>
                    ) : job.metrics?.final_metrics ? (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {Object.entries(job.metrics.final_metrics).slice(0, 2).map(([key, value]) => (
                          <Badge key={key} variant="primary" style={{ fontSize: '11px' }}>
                            {key}: {typeof value === 'number' ? value.toFixed(4) : String(value).substring(0, 10)}
                          </Badge>
                        ))}
                      </div>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card>
          <div className="empty-state">
            <p>{jobs.length === 0 ? '暂无训练记录' : '没有匹配的记录'}</p>
            <Button onClick={() => setViewMode('tasks')}>
              {jobs.length === 0 ? '开始训练' : '清除筛选'}
            </Button>
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
