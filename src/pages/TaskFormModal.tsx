import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Card } from '../components/ui';
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
  const [activeSection, setActiveSection] = useState<'basic' | 'schedule' | 'ai' | 'params'>('basic');
  const [submitError, setSubmitError] = useState<string>('');

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
      if (data.models.length > 0 && !formData.ai_model_id) {
        setFormData(prev => ({ ...prev, ai_task_id: taskId, ai_model_id: data.models[0].id }));
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
    setSubmitError('');
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
      setSubmitError(err.message || '保存失败，请检查参数是否在有效范围内');
    } finally {
      setLoading(false);
    }
  };

  const ParamHelpTooltip = ({ text }: { text: string }) => {
    const [show, setShow] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    
    return (
      <span style={{ position: 'relative', marginLeft: '4px', display: 'inline-flex', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'var(--text-muted)',
            padding: '2px 6px',
            borderRadius: '50%',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            e.currentTarget.style.color = 'var(--primary-500)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          ?
        </button>
        {show && (
          <div
            ref={tooltipRef}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              transform: 'translateX(0)',
              backgroundColor: 'var(--text-heading)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              maxWidth: '300px',
              minWidth: '100px',
              zIndex: 100,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              marginBottom: '8px',
              lineHeight: 1.4,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            }}
          >
            {text}
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '12px',
              transform: 'translateX(0)',
              border: '6px solid transparent',
              borderTopColor: 'var(--text-heading)',
            }} />
          </div>
        )}
      </span>
    );
  };

  const renderParamInput = (param: AIModel['params'][0]) => {
    const value = modelParams[param.param_name];
    
    switch (param.param_type) {
      case 'int':
      case 'float':
        return (
          <div key={param.param_name} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-heading)' }}>
                {param.param_name}
              </label>
              <ParamHelpTooltip text={param.description} />
            </div>
            <input
              type="number"
              min={param.min_value}
              max={param.max_value}
              step="any"
              value={value ?? param.default}
              onChange={(e) => setModelParams(prev => ({ ...prev, [param.param_name]: parseFloat(e.target.value) }))}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
            />
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              范围: {param.min_value} ~ {param.max_value}
            </div>
          </div>
        );
      case 'bool':
        return (
          <div key={param.param_name} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id={`param-${param.param_name}`}
              checked={value ?? param.default}
              onChange={(e) => setModelParams(prev => ({ ...prev, [param.param_name]: e.target.checked }))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor={`param-${param.param_name}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              {param.param_name}
              <ParamHelpTooltip text={param.description} />
            </label>
          </div>
        );
      case 'choice':
        return (
          <div key={param.param_name} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-heading)' }}>
                {param.param_name}
              </label>
              <ParamHelpTooltip text={param.description} />
            </div>
            <select
              value={value ?? param.default}
              onChange={(e) => setModelParams(prev => ({ ...prev, [param.param_name]: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              {param.choices?.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        );
      default:
        return (
          <div key={param.param_name} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-heading)' }}>
                {param.param_name}
              </label>
              <ParamHelpTooltip text={param.description} />
            </div>
            <input
              type="text"
              value={value ?? param.default}
              onChange={(e) => setModelParams(prev => ({ ...prev, [param.param_name]: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
          </div>
        );
    }
  };

  const SectionNav = ({ active, setActive }: { active: string; setActive: (s: any) => void }) => (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
      {(['basic', 'schedule', 'ai', 'params'] as const).map(section => (
        <button
          key={section}
          type="button"
          onClick={() => setActive(section)}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: active === section ? 'var(--primary-500)' : 'transparent',
            color: active === section ? 'white' : 'var(--text-secondary)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '14px',
            transition: 'all 0.2s',
          }}
        >
          {section === 'basic' && '基本信息'}
          {section === 'schedule' && '调度配置'}
          {section === 'ai' && 'AI 任务'}
          {section === 'params' && '参数配置'}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-primary)',
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            {task ? '编辑定时任务' : '新建定时任务'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ maxHeight: 'calc(90vh - 140px)', overflow: 'auto' }}>
          <div style={{ padding: '24px' }}>
            {submitError && (
              <div style={{
                backgroundColor: 'var(--error-bg)',
                color: 'var(--error)',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                border: '1px solid var(--error)',
              }}>
                {submitError}
              </div>
            )}
            <SectionNav active={activeSection} setActive={setActiveSection} />

            {activeSection === 'basic' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '6px', color: 'var(--text-heading)' }}>
                    任务名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                    placeholder="例如：每日 MNIST 训练"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '6px', color: 'var(--text-heading)' }}>
                    任务描述
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical',
                    }}
                    placeholder="描述这个定时任务的用途..."
                  />
                </div>
              </div>
            )}

            {activeSection === 'schedule' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '6px', color: 'var(--text-heading)' }}>
                    调度类型
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(Object.entries(ScheduleTypeLabels) as [ScheduleType, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, schedule_type: key }))}
                        style={{
                          flex: 1,
                          padding: '12px',
                          border: formData.schedule_type === key ? '2px solid var(--primary-500)' : '1px solid var(--border-default)',
                          background: formData.schedule_type === key ? 'rgba(59, 130, 246, 0.05)' : 'white',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: formData.schedule_type === key ? 'var(--primary-500)' : 'var(--text-secondary)',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.schedule_type === 'cron' && (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '6px', color: 'var(--text-heading)' }}>
                        Cron 表达式
                      </label>
                      <input
                        type="text"
                        value={formData.cron_expression || ''}
                        onChange={(e) => handleCronExpressionChange(e.target.value)}
                        placeholder="0 * * * *"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid var(--border-default)',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '6px', color: 'var(--text-heading)' }}>
                        预设
                      </label>
                      <select
                        onChange={(e) => handleCronExpressionChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid var(--border-default)',
                          borderRadius: '8px',
                          fontSize: '14px',
                        }}
                      >
                        <option value="">选择预设...</option>
                        {presets.map(p => (
                          <option key={p.expression} value={p.expression}>
                            {p.name} - {p.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    {cronNextRuns.length > 0 && (
                      <Card style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>下次执行时间：</div>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {cronNextRuns.map((t, i) => (
                            <li key={i}>{new Date(t).toLocaleString('zh-CN')}</li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </>
                )}

                {formData.schedule_type === 'interval' && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '6px', color: 'var(--text-heading)' }}>
                      间隔（秒）
                    </label>
                    <input
                      type="number"
                      min={60}
                      value={formData.interval_seconds || 3600}
                      onChange={(e) => setFormData(prev => ({ ...prev, interval_seconds: parseInt(e.target.value) }))}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid var(--border-default)',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                )}

                {formData.schedule_type === 'once' && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '6px', color: 'var(--text-heading)' }}>
                      执行时间
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.execute_at?.slice(0, 16) || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, execute_at: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid var(--border-default)',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {activeSection === 'ai' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '6px', color: 'var(--text-heading)' }}>
                    选择 AI 学习任务 *
                  </label>
                  <select
                    value={formData.ai_task_id || ''}
                    onChange={(e) => handleTaskChange(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid var(--border-default)',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  >
                    <option value="">请选择任务...</option>
                    {aiTasks.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {selectedTask && (
                  <Card style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {selectedTask.description}
                    </div>
                  </Card>
                )}

                {models.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: 500, fontSize: '14px', marginBottom: '6px', color: 'var(--text-heading)' }}>
                      选择模型 *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                      {models.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleModelChange(m.id)}
                          style={{
                            padding: '12px',
                            border: formData.ai_model_id === m.id ? '2px solid var(--primary-500)' : '1px solid var(--border-default)',
                            background: formData.ai_model_id === m.id ? 'rgba(59, 130, 246, 0.05)' : 'white',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '14px',
                          }}
                        >
                          <div style={{ fontWeight: 500, marginBottom: '4px' }}>{m.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {m.framework === 'sklearn' ? 'scikit-learn' : 'PyTorch'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'params' && (
              <div>
                {models.length > 0 ? (
                  <>
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>模型参数</h4>
                      {models.find(m => m.id === formData.ai_model_id)?.params.map(renderParamInput)}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>训练参数</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 500, fontSize: '13px', marginBottom: '6px' }}>
                            Epochs
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={1000}
                            value={trainingConfig.epochs}
                            onChange={(e) => setTrainingConfig(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '14px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 500, fontSize: '13px', marginBottom: '6px' }}>
                            Batch Size
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={512}
                            value={trainingConfig.batch_size}
                            onChange={(e) => setTrainingConfig(prev => ({ ...prev, batch_size: parseInt(e.target.value) }))}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '14px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 500, fontSize: '13px', marginBottom: '6px' }}>
                            Learning Rate
                          </label>
                          <input
                            type="number"
                            min={0.0001}
                            max={1}
                            step={0.001}
                            value={trainingConfig.learning_rate}
                            onChange={(e) => setTrainingConfig(prev => ({ ...prev, learning_rate: parseFloat(e.target.value) }))}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '14px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 500, fontSize: '13px', marginBottom: '6px' }}>
                            Test Split
                          </label>
                          <input
                            type="number"
                            min={0.05}
                            max={0.5}
                            step={0.05}
                            value={trainingConfig.test_split}
                            onChange={(e) => setTrainingConfig(prev => ({ ...prev, test_split: parseFloat(e.target.value) }))}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '14px' }}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <Card>
                    <div className="empty-state">
                      <p>请先选择 AI 学习任务和模型</p>
                      <Button variant="secondary" onClick={() => setActiveSection('ai')}>
                        去选择
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            backgroundColor: 'var(--bg-primary)',
          }}>
            <Button variant="ghost" onClick={onClose}>
              取消
            </Button>
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
