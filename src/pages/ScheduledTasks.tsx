import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui';
import { scheduledTasksApi } from '../api/scheduledTasks';
import type { ScheduledTask, TaskExecutionHistory, AITask, AIModel, SchedulePreset, ScheduleType } from '../types/scheduledTask';
import { TaskStatusLabels, TaskStatusColors, ScheduleTypeLabels } from '../types/scheduledTask';
import TaskFormModal from './TaskFormModal';
import TaskExecutionModal from './TaskExecutionModal';

const ScheduledTasks: React.FC = () => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [history, setHistory] = useState<TaskExecutionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'history'>('tasks');

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
    // 每30秒刷新一次状态
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

  return (
    <div className="scheduled-tasks-page">
      <div className="page-header">
        <div>
          <h1>⏰ 定时任务</h1>
          <p className="page-subtitle">管理 AI 学习任务的定时调度</p>
        </div>
        <Button onClick={handleCreate}>+ 新建定时任务</Button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          任务列表 ({tasks.length})
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          执行历史
        </button>
      </div>

      {activeTab === 'tasks' ? (
        <div className="tasks-list">
          {loading ? (
            <div className="loading">加载中...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <p>暂无定时任务</p>
              <Button onClick={handleCreate}>创建第一个定时任务</Button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>任务名称</th>
                  <th>调度类型</th>
                  <th>AI 任务</th>
                  <th>下次执行</th>
                  <th>状态</th>
                  <th>执行次数</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div className="task-name">{task.name}</div>
                      <div className="task-desc">{task.description || '-'}</div>
                    </td>
                    <td>
                      <span className="schedule-type">
                        {ScheduleTypeLabels[task.schedule_type]}
                      </span>
                      {task.schedule_type === 'cron' && (
                        <div className="cron-expr">{task.cron_expression}</div>
                      )}
                      {task.schedule_type === 'interval' && (
                        <div className="interval-expr">每 {task.interval_seconds} 秒</div>
                      )}
                      {task.schedule_type === 'once' && task.execute_at && (
                        <div className="once-expr">{formatDate(task.execute_at)}</div>
                      )}
                    </td>
                    <td>
                      <div className="ai-task-id">{task.ai_task_id}</div>
                      <div className="ai-model-id">{task.ai_model_id}</div>
                    </td>
                    <td>{formatDate(task.next_run_at)}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: TaskStatusColors[task.status] }}
                      >
                        {TaskStatusLabels[task.status]}
                      </span>
                    </td>
                    <td>{task.run_count}</td>
                    <td>
                      <div className="action-buttons">
                        <Button variant="ghost" size="small" onClick={() => handleEdit(task)}>
                          编辑
                        </Button>
                        <Button variant="ghost" size="small" onClick={() => handleExecuteNow(task.id)}>
                          立即执行
                        </Button>
                        {task.enabled ? (
                          <Button variant="ghost" size="small" onClick={() => handlePause(task.id)}>
                            暂停
                          </Button>
                        ) : (
                          <Button variant="ghost" size="small" onClick={() => handleResume(task.id)}>
                            恢复
                          </Button>
                        )}
                        <Button variant="ghost" size="small" onClick={() => handleDelete(task.id)}>
                          删除
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="history-list">
          {history.length === 0 ? (
            <div className="empty-state">
              <p>暂无执行历史</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>任务名称</th>
                  <th>状态</th>
                  <th>开始时间</th>
                  <th>完成时间</th>
                  <th>结果</th>
                </tr>
              </thead>
              <tbody>
                {history.map((exec) => (
                  <tr key={exec.id}>
                    <td>{exec.scheduled_task_name}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: TaskStatusColors[exec.status] }}
                      >
                        {TaskStatusLabels[exec.status]}
                      </span>
                    </td>
                    <td>{formatDate(exec.started_at)}</td>
                    <td>{formatDate(exec.completed_at)}</td>
                    <td>
                      {exec.error && <span className="error-msg">{exec.error}</span>}
                      {exec.result && (
                        <span className="result-msg">
                          {exec.result.accuracy !== undefined && `准确率: ${(exec.result.accuracy * 100).toFixed(2)}%`}
                          {exec.result.test_accuracy !== undefined && `准确率: ${(exec.result.test_accuracy * 100).toFixed(2)}%`}
                          {exec.result.final_loss !== undefined && `损失: ${exec.result.final_loss.toFixed(4)}`}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
