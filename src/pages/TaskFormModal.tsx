import React, { useState, useEffect } from 'react';
import { Button, Input } from '../components/ui';
import { scheduledTasksApi } from '../api/scheduledTasks';
import type { ScheduledTask, ScheduledTaskCreate, ScheduledTaskUpdate, AITask, AIModel, SchedulePreset, ScheduleType } from '../types/scheduledTask';
import { ScheduleTypeLabels } from '../types/scheduledTask';

interface Props {
  task?: ScheduledTask | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TaskFormModal: React.FC<Props> = ({ task, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [aiTasks, setAiTasks] = useState<AITask[]>([]);
  const [selectedTask, setSelectedTask] = useState<AITask | null>(null);
  const [models, setModels] = useState<AIModel[]>([]);
  const [presets, setPresets] = useState<SchedulePreset[]>([]);
  const [cronNextRuns, setCronNextRuns] = useState<string[]>([]);

  const [formData, setFormData] = useState<Partial<ScheduledTaskCreate>>({
    name: '',
    description: '',
    schedule_type: 'cron',
    execute_at: '',
    cron_expression: '0 * * * *',
    interval_seconds: 3600,
    ai_task_id: '',
    ai_model_id: '',
    ai_model_params: {},
    ai_training_config: {},
    enabled: true,
  });

  const [modelParams, setModelParams] = useState<Record<string, any>>({});
  const [trainingConfig, setTrainingConfig] = useState({
    epochs: 10,
    batch_size: 32,
    learning_rate: 0.001,
    test_split: 0.2,
    random_seed: 42,
  });

  useEffect(() => {
    loadAITasks();
    loadPresets();
    if (task) {
      setFormData({
        name: task.name,
        description: task.description,
        schedule_type: task.schedule_type,
        execute_at: task.execute_at,
        cron_expression: task.cron_expression,
        interval_seconds: task.interval_seconds,
        ai_task_id: task.ai_task_id,
        ai_model_id: task.ai_model_id,
        ai_model_params: task.ai_model_params,
        ai_training_config: task.ai_training_config,
        enabled: task.enabled,
      });
      setModelParams(task.ai_model_params || {});
      setTrainingConfig(task.ai_training_config || {});
      // 加载任务和模型
      const t = aiTasks.find(t => t.id === task.ai_task_id);
      if (t) {
        setSelectedTask(t);
        loadModels(t.id);
      }
    }
  }, [task]);

  const loadAITasks = async () => {
    try {
      const { data } = await scheduledTasksApi.getAITasks();
      setAiTasks(data.tasks);
    } catch (err) {
      console.error('加载 AI 任务失败:', err);
    }
  };

  const loadPresets = async () => {
    try {
      const { data } = await scheduledTasksApi.getPresets();
      setPresets(data.presets);
    } catch (err) {
      console.error('加载预设失败:', err);
    }
  };

  const loadModels = async (taskId: string) => {
    try {
      const { data } = await scheduledTasksApi.getAITaskModels(taskId);
      setModels(data.models);
      // 自动选择第一个模型
      if (data.models.length > 0 && !formData.ai_model_id) {
        setFormData(prev => ({ ...prev, ai_task_id: taskId, ai_model_id: data.models[0].id }));
        // 设置默认模型参数
        const defaultParams: Record<string, any> = {};
        data.models[0].params.forEach(p => {
          defaultParams[p.param_name] = p.default;
        });
        setModelParams(defaultParams);
      }
    } catch (err) {
      console.error('加载模型失败:', err);
    }
  };

  const loadCronPreview = async (expression: string) => {
    try {
      const { data } = await scheduledTasksApi.getCronNextRuns(expression, 3);
      setCronNextRuns(data.next_runs);
    } catch (err) {
      setCronNextRuns([]);
    }
  };

  const handleTaskChange = (taskId: string) => {
    const t = aiTasks.find(t => t.id === taskId);
    setSelectedTask(t || null);
    setFormData(prev => ({ ...prev, ai_task_id: taskId, ai_model_id: '' }));
    setModels([]);
    setModelParams({});
    if (taskId) {
      loadModels(taskId);
    }
  };

  const handleModelChange = (modelId: string) => {
    const m = models.find(m => m.id === modelId);
    setFormData(prev => ({ ...prev, ai_model_id: modelId }));
    if (m) {
      const defaultParams: Record<string, any> = {};
      m.params.forEach(p => {
        defaultParams[p.param_name] = p.default;
      });
      setModelParams(defaultParams);
    }
  };

  const handleCronExpressionChange = (expr: string) => {
    setFormData(prev => ({ ...prev, cron_expression: expr }));
    if (expr) {
      loadCronPreview(expr);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ai_task_id || !formData.ai_model_id) {
      alert('请填写完整信息');
      return;
    }

    setLoading(true);
    try {
      const payload: ScheduledTaskCreate | ScheduledTaskUpdate = {
        ...formData,
        ai_model_params: modelParams,
        ai_training_config: trainingConfig,
      } as ScheduledTaskCreate;

      if (task) {
        await scheduledTasksApi.updateTask(task.id, payload as ScheduledTaskUpdate);
      } else {
        await scheduledTasksApi.createTask(payload);
      }
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.detail || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const renderParamInput = (param: AIModel['params'][0]) => {
    const value = modelParams[param.param_name];
    
    switch (param.param_type) {
      case 'int':
      case 'float':
        return (
          <div key={param.param_name} className="param-item">
            <label>{param.param_name}</label>
            <input
              type="number"
              min={param.min_value}
              max={param.max_value}
              step={param.step || 1}
              value={value}
              onChange={(e) => setModelParams(prev => ({ ...prev, [param.param_name]: parseFloat(e.target.value) }))}
            />
            <span className="param-desc">{param.description}</span>
          </div>
        );
      case 'bool':
        return (
          <div key={param.param_name} className="param-item">
            <label>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setModelParams(prev => ({ ...prev, [param.param_name]: e.target.checked }))}
              />
              {param.param_name}
            </label>
            <span className="param-desc">{param.description}</span>
          </div>
        );
      case 'choice':
        return (
          <div key={param.param_name} className="param-item">
            <label>{param.param_name}</label>
            <select
              value={value}
              onChange={(e) => setModelParams(prev => ({ ...prev, [param.param_name]: e.target.value }))}
            >
              {param.choices?.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="param-desc">{param.description}</span>
          </div>
        );
      default:
        return (
          <div key={param.param_name} className="param-item">
            <label>{param.param_name}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setModelParams(prev => ({ ...prev, [param.param_name]: e.target.value }))}
            />
            <span className="param-desc">{param.description}</span>
          </div>
        );
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? '编辑定时任务' : '新建定时任务'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* 基本信息 */}
            <div className="form-section">
              <h3>基本信息</h3>
              <div className="form-row">
                <Input
                  label="任务名称"
                  value={formData.name || ''}
                  onChange={(v) => setFormData(prev => ({ ...prev, name: v }))}
                  required
                />
              </div>
              <div className="form-row">
                <Input
                  label="任务描述"
                  value={formData.description || ''}
                  onChange={(v) => setFormData(prev => ({ ...prev, description: v }))}
                />
              </div>
            </div>

            {/* 调度配置 */}
            <div className="form-section">
              <h3>调度配置</h3>
              <div className="form-row">
                <label>调度类型</label>
                <select
                  value={formData.schedule_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, schedule_type: e.target.value as ScheduleType }))}
                >
                  {Object.entries(ScheduleTypeLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {formData.schedule_type === 'once' && (
                <div className="form-row">
                  <label>执行时间</label>
                  <input
                    type="datetime-local"
                    value={formData.execute_at?.slice(0, 16) || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, execute_at: e.target.value }))}
                  />
                </div>
              )}

              {formData.schedule_type === 'cron' && (
                <>
                  <div className="form-row">
                    <label>Cron 表达式</label>
                    <input
                      type="text"
                      value={formData.cron_expression || ''}
                      onChange={(e) => handleCronExpressionChange(e.target.value)}
                      placeholder="0 * * * *"
                    />
                  </div>
                  <div className="form-row">
                    <label>预设</label>
                    <select onChange={(e) => handleCronExpressionChange(e.target.value)}>
                      <option value="">选择预设...</option>
                      {presets.map(p => (
                        <option key={p.expression} value={p.expression}>
                          {p.name} - {p.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  {cronNextRuns.length > 0 && (
                    <div className="cron-preview">
                      <label>下次执行时间：</label>
                      <ul>
                        {cronNextRuns.map((t, i) => (
                          <li key={i}>{new Date(t).toLocaleString('zh-CN')}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {formData.schedule_type === 'interval' && (
                <div className="form-row">
                  <label>间隔（秒）</label>
                  <input
                    type="number"
                    min={60}
                    value={formData.interval_seconds || 3600}
                    onChange={(e) => setFormData(prev => ({ ...prev, interval_seconds: parseInt(e.target.value) }))}
                  />
                </div>
              )}
            </div>

            {/* AI 任务选择 */}
            <div className="form-section">
              <h3>AI 学习任务</h3>
              <div className="form-row">
                <label>选择任务</label>
                <select
                  value={formData.ai_task_id || ''}
                  onChange={(e) => handleTaskChange(e.target.value)}
                >
                  <option value="">请选择任务...</option>
                  {aiTasks.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {models.length > 0 && (
                <div className="form-row">
                  <label>选择模型</label>
                  <select
                    value={formData.ai_model_id || ''}
                    onChange={(e) => handleModelChange(e.target.value)}
                  >
                    <option value="">请选择模型...</option>
                    {models.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.framework})</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedTask && models.length > 0 && (
                <div className="selected-task-info">
                  <p>任务描述：{selectedTask.description}</p>
                </div>
              )}
            </div>

            {/* 模型参数 */}
            {models.length > 0 && (
              <div className="form-section">
                <h3>模型参数配置</h3>
                {models.find(m => m.id === formData.ai_model_id)?.params.map(renderParamInput)}
              </div>
            )}

            {/* 训练配置 */}
            <div className="form-section">
              <h3>训练配置</h3>
              <div className="form-row-group">
                <div className="form-row">
                  <label>Epochs</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={trainingConfig.epochs}
                    onChange={(e) => setTrainingConfig(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="form-row">
                  <label>Batch Size</label>
                  <input
                    type="number"
                    min={1}
                    max={512}
                    value={trainingConfig.batch_size}
                    onChange={(e) => setTrainingConfig(prev => ({ ...prev, batch_size: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="form-row">
                  <label>Learning Rate</label>
                  <input
                    type="number"
                    min={0.0001}
                    max={1}
                    step={0.001}
                    value={trainingConfig.learning_rate}
                    onChange={(e) => setTrainingConfig(prev => ({ ...prev, learning_rate: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="ghost" onClick={onClose}>取消</Button>
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
