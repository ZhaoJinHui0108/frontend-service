import React, { useState, useEffect } from 'react';
import { Button, Card, Badge } from '../components/ui';
import { scheduledTasksApi } from '../api/scheduledTasks';
import type { ScheduledTask, TaskExecutionHistory, ScheduleType } from '../types/scheduledTask';
import { TaskStatusLabels, TaskStatusColors, ScheduleTypeLabels } from '../types/scheduledTask';
import TaskFormModal from './TaskFormModal';
import TaskExecutionModal from './TaskExecutionModal';

const ScheduledTasks: React.FC = () => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<ScheduledTask[]>([]);
  const [history, setHistory] = useState<TaskExecutionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'history'>('tasks');
  const [taskSearch, setTaskSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Update filtered tasks when tasks, search, or status changes
  useEffect(() => {
    let result = tasks;
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }
    
    // Search by task name or AI task ID
    if (taskSearch.trim()) {
      const search = taskSearch.toLowerCase();
      result = result.filter(task =>
        task.name?.toLowerCase().includes(search) ||
        task.ai_task_id?.toLowerCase().includes(search) ||
        task.ai_model_id?.toLowerCase().includes(search)
      );
    }
    
    setFilteredTasks(result);
  }, [tasks, taskSearch, statusFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data } = await scheduledTasksApi.listTasks({ limit: 100 });
      setTasks(data);
    } catch (err) {
      console.error('加载任务失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const { data } = await scheduledTasksApi.getHistory({ limit: 50 });
      setHistory(data);
    } catch (err) {
      console.error('加载历史失败:', err);
    }
  };

  useEffect(() => {
    loadTasks();
    loadHistory();
    const interval = setInterval(() => {
      if (activeTab === 'tasks') loadTasks();
      if (activeTab === 'history') loadHistory();
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleCreate = () => {
    setEditingTask(null);
    setShowFormModal(true);
  };

  const handleEdit = (task: ScheduledTask) => {
    setEditingTask(task);
    setShowFormModal(true);
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm('确定要删除这个定时任务吗？')) return;
    try {
      await scheduledTasksApi.deleteTask(taskId);
      loadTasks();
    } catch (err) {
      console.error('删除失败:', err);
    }
  };

  const handleExecuteNow = async (taskId: number) => {
    try {
      await scheduledTasksApi.executeNow(taskId);
      setShowExecutionModal(true);
      loadHistory();
    } catch (err) {
      console.error('执行失败:', err);
    }
  };

  const handlePause = async (taskId: number) => {
    try {
      await scheduledTasksApi.pauseTask(taskId);
      loadTasks();
    } catch (err) {
      console.error('暂停失败:', err);
    }
  };

  const handleResume = async (taskId: number) => {
    try {
      await scheduledTasksApi.resumeTask(taskId);
      loadTasks();
    } catch (err) {
      console.error('恢复失败:', err);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getScheduleInfo = (task: ScheduledTask) => {
    switch (task.schedule_type) {
      case 'cron':
        return (
          <Badge variant="muted">
            ⏰ {task.cron_expression}
          </Badge>
        );
      case 'interval':
        return (
          <Badge variant="muted">
            🔄 每 {task.interval_seconds} 秒
          </Badge>
        );
      case 'once':
        return (
          <Badge variant="muted">
            📅 {formatDate(task.execute_at)}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, 'primary' | 'success' | 'warning' | 'error'> = {
      pending: 'warning',
      running: 'primary',
      completed: 'success',
      failed: 'error',
      cancelled: 'secondary',
    };
    return (
      <Badge variant={statusMap[status] || 'primary'}>
        {TaskStatusLabels[status as keyof typeof TaskStatusLabels] || status}
      </Badge>
    );
  };

  return (
    <div className="page-content">
      <div className="page-header flex-between">
        <div>
          <h1 style={{ margin: 0 }}>⏰ 定时任务</h1>
          <p className="text-secondary" style={{ marginTop: '4px', marginBottom: 0 }}>管理 AI 学习任务的定时调度</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + 新建定时任务
        </Button>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: activeTab === 'tasks' ? 'var(--primary-500)' : 'transparent',
            color: activeTab === 'tasks' ? 'white' : 'var(--text-secondary)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
        >
          任务列表 ({tasks.length})
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: activeTab === 'history' ? 'var(--primary-500)' : 'transparent',
            color: activeTab === 'history' ? 'white' : 'var(--text-secondary)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
            marginLeft: '8px',
            transition: 'all 0.2s',
          }}
        >
          执行历史
        </button>
      </div>

      {activeTab === 'tasks' ? (
        <>
          {/* Search and Filter Bar */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="搜索任务名称、AI任务、模型..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
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
              <option value="running">执行中</option>
              <option value="completed">已完成</option>
              <option value="failed">失败</option>
              <option value="paused">已暂停</option>
            </select>
            <span className="text-muted" style={{ fontSize: '13px' }}>
              共 {filteredTasks.length} 个任务
            </span>
          </div>

          {/* Table */}
          {filteredTasks.length > 0 ? (
            <div className="table-wrapper">
              <table>
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
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{task.name}</div>
                        {task.description && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {task.description.substring(0, 30)}{task.description.length > 30 ? '...' : ''}
                          </div>
                        )}
                      </td>
                      <td>{task.ai_task_id}</td>
                      <td>{task.ai_model_id}</td>
                      <td>{getScheduleInfo(task)}</td>
                      <td>{getStatusBadge(task.status)}</td>
                      <td>{task.run_count}</td>
                      <td>{task.next_run_at ? formatDate(task.next_run_at) : '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <Button variant="secondary" size="small" onClick={() => handleEdit(task)}>
                            编辑
                          </Button>
                          <Button variant="secondary" size="small" onClick={() => handleExecuteNow(task.id)}>
                            执行
                          </Button>
                          {task.enabled ? (
                            <Button variant="secondary" size="small" onClick={() => handlePause(task.id)}>
                              暂停
                            </Button>
                          ) : (
                            <Button variant="secondary" size="small" onClick={() => handleResume(task.id)}>
                              恢复
                            </Button>
                          )}
                          <Button variant="danger" size="small" onClick={() => handleDelete(task.id)}>
                            删除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Card>
              <div className="empty-state">
                <p>{tasks.length === 0 ? '暂无定时任务' : '没有匹配的记录'}</p>
                {tasks.length === 0 ? (
                  <Button onClick={handleCreate}>创建第一个定时任务</Button>
                ) : (
                  <Button onClick={() => { setTaskSearch(''); setStatusFilter('all'); }}>清除筛选</Button>
                )}
              </div>
            </Card>
          )}
        </>
      ) : (
        <div className="card-grid">
          {history.length === 0 ? (
            <Card>
              <div className="empty-state">
                <p>暂无执行历史</p>
              </div>
            </Card>
          ) : (
            history.map((exec) => (
              <Card key={exec.id}>
                <div className="flex-between" style={{ marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                    {exec.scheduled_task_name}
                  </h3>
                  {getStatusBadge(exec.status)}
                </div>

                <div className="flex gap-sm" style={{ marginBottom: '12px', flexWrap: 'wrap' }}>
                  <Badge variant="muted">
                    开始: {formatDate(exec.started_at)}
                  </Badge>
                  {exec.completed_at && (
                    <Badge variant="muted">
                      完成: {formatDate(exec.completed_at)}
                    </Badge>
                  )}
                </div>

                {exec.error && (
                  <div className="alert alert-error" style={{ fontSize: '13px', marginBottom: '12px' }}>
                    ❌ {exec.error}
                  </div>
                )}

                {exec.result && (
                  <div style={{ fontSize: '13px', color: 'var(--success)' }}>
                    ✅ 
                    {exec.result.accuracy !== undefined && ` 准确率: ${(exec.result.accuracy * 100).toFixed(2)}%`}
                    {exec.result.test_accuracy !== undefined && ` 准确率: ${(exec.result.test_accuracy * 100).toFixed(2)}%`}
                    {exec.result.final_loss !== undefined && ` 损失: ${exec.result.final_loss.toFixed(4)}`}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {showFormModal && (
        <TaskFormModal
          task={editingTask}
          onClose={() => setShowFormModal(false)}
          onSuccess={() => {
            setShowFormModal(false);
            loadTasks();
          }}
        />
      )}

      {showExecutionModal && (
        <TaskExecutionModal onClose={() => setShowExecutionModal(false)} />
      )}
    </div>
  );
};

export default ScheduledTasks;
