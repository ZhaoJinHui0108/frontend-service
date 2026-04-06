import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { aiLearningApi } from '../api/aiLearning';
import type { TaskInfo, ModelInfo, TrainingConfig } from '../types/aiLearning';
import { Button, Card } from '../components/ui';

interface Props {
  task: TaskInfo;
  model: ModelInfo;
  onTrainingComplete: () => void;
  hideActions?: boolean;
  onStartTraining?: () => void;
}

export interface ModelParamsConfigRef {
  startTraining: () => void;
}

const ModelParamsConfig = forwardRef<ModelParamsConfigRef, Props>(({ task, model, onTrainingComplete, hideActions, onStartTraining }, _ref) => {
  const [modelParams, setModelParams] = useState<Record<string, any>>(() => {
    const defaults: Record<string, any> = {};
    model.params.forEach((param) => {
      defaults[param.param_name] = param.default;
    });
    return defaults;
  });

  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    epochs: 10,
    batch_size: 32,
    learning_rate: 0.001,
    test_split: 0.2,
    random_seed: 42,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trainingJob, setTrainingJob] = useState<any>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  const handleParamChange = (paramName: string, value: any) => {
    setModelParams((prev) => ({ ...prev, [paramName]: value }));
  };

  const handleTrainingConfigChange = (key: keyof TrainingConfig, value: any) => {
    setTrainingConfig((prev) => ({ ...prev, [key]: value }));
  };

  const startTraining = async () => {
    try {
      setLoading(true);
      setError('');

      const { data } = await aiLearningApi.createTrainingJob({
        task_id: task.id,
        model_id: model.id,
        model_params: modelParams,
        training_config: trainingConfig,
      });

      setTrainingJob(data);

      const interval = setInterval(async () => {
        try {
          const { data: jobData } = await aiLearningApi.getJob(data.job_id);
          setTrainingJob(jobData);

          if (jobData.status === 'completed' || jobData.status === 'failed') {
            clearInterval(interval);
            setPollInterval(null);
            if (jobData.status === 'completed') {
              setTimeout(onTrainingComplete, 1500);
            }
          }
        } catch (err) {
          console.error('轮询失败:', err);
        }
      }, 2000);

      setPollInterval(interval);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || '启动训练失败');
    } finally {
      setLoading(false);
    }
  };

  const stopTraining = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
  };

  // Expose startTraining for parent component
  useImperativeHandle(_ref, () => ({
    startTraining,
  }), [startTraining]);

  // Call onStartTraining callback when button is clicked (for external triggering)
  const handleStartTrainingClick = () => {
    if (onStartTraining) {
      onStartTraining();
    }
    startTraining();
  };

  // Tooltip with auto-close after 3 seconds
  const ParamTooltip = ({ text }: { text: string }) => {
    const [show, setShow] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleShow = () => {
      setShow(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setShow(false);
      }, 3000);
    };

    useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, []);

    return (
      <span style={{ position: 'relative', marginLeft: '6px', display: 'inline-flex', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleShow}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
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
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              backgroundColor: 'var(--text-heading)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              maxWidth: '280px',
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
              border: '6px solid transparent',
              borderTopColor: 'var(--text-heading)',
            }} />
          </div>
        )}
      </span>
    );
  };

  const renderParamInput = (param: typeof model.params[0]) => {
    const value = modelParams[param.param_name];

    switch (param.param_type) {
      case 'int':
      case 'float':
        return (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="range"
                min={param.min_value}
                max={param.max_value}
                step={param.step || 1}
                value={value}
                onChange={(e) => handleParamChange(param.param_name, parseFloat(e.target.value))}
                disabled={trainingJob?.status === 'running'}
                style={{ flex: 1, cursor: 'pointer' }}
              />
              <input
                type="number"
                min={param.min_value}
                max={param.max_value}
                step={param.step || 1}
                value={value}
                onChange={(e) => handleParamChange(param.param_name, parseFloat(e.target.value))}
                disabled={trainingJob?.status === 'running'}
                style={{
                  width: '80px',
                  padding: '6px 8px',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>
        );

      case 'bool':
        return (
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id={`param-${param.param_name}`}
              checked={value}
              onChange={(e) => handleParamChange(param.param_name, e.target.checked)}
              disabled={trainingJob?.status === 'running'}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor={`param-${param.param_name}`} style={{ cursor: 'pointer', fontSize: '14px' }}>
              {value ? '是' : '否'}
            </label>
          </div>
        );

      case 'choice':
        return (
          <div style={{ marginBottom: '12px' }}>
            <select
              value={value}
              onChange={(e) => handleParamChange(param.param_name, e.target.value)}
              disabled={trainingJob?.status === 'running'}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              {param.choices?.map((choice) => (
                <option key={choice} value={choice}>
                  {choice}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return (
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              value={value}
              onChange={(e) => handleParamChange(param.param_name, e.target.value)}
              disabled={trainingJob?.status === 'running'}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>
        );
    }
  };

  const trainingParams = [
    { key: 'epochs' as const, label: 'Epochs', description: '训练轮数', min: 1, max: 1000, step: 1 },
    { key: 'batch_size' as const, label: 'Batch Size', description: '批大小', min: 1, max: 512, step: 1 },
    { key: 'learning_rate' as const, label: 'Learning Rate', description: '学习率', min: 0.0001, max: 1, step: 0.001 },
    { key: 'test_split' as const, label: 'Test Split', description: '测试集比例', min: 0.05, max: 0.5, step: 0.05 },
    { key: 'random_seed' as const, label: 'Random Seed', description: '随机种子', min: 0, max: 999999, step: 1 },
  ];

  return (
    <div>
      {/* 模型参数 */}
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>
            模型参数
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {model.params.map((param) => (
              <div key={param.param_name} style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontWeight: 500, fontSize: '14px' }}>
                    {param.param_name}
                  </label>
                  <ParamTooltip text={param.description} />
                </div>
                {renderParamInput(param)}
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  范围: {param.min_value} ~ {param.max_value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 训练参数 */}
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>
            训练参数
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {trainingParams.map((param) => (
              <div key={param.key} style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontWeight: 500, fontSize: '14px' }}>
                    {param.label}
                  </label>
                  <ParamTooltip text={param.description} />
                </div>
                <input
                  type="number"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={trainingConfig[param.key]}
                  onChange={(e) => handleTrainingConfigChange(param.key, parseFloat(e.target.value))}
                  disabled={trainingJob?.status === 'running'}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--border-default)',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 错误提示 */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* 训练状态 */}
      {trainingJob && (
        <Card style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>
              训练状态
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <span style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 500,
                backgroundColor: trainingJob.status === 'running' ? 'rgba(59, 130, 246, 0.1)' :
                               trainingJob.status === 'completed' ? 'var(--success-bg)' : 'var(--error-bg)',
                color: trainingJob.status === 'running' ? 'var(--primary-500)' :
                       trainingJob.status === 'completed' ? 'var(--success)' : 'var(--error)',
              }}>
                {trainingJob.status === 'pending' && '⏳ 等待中'}
                {trainingJob.status === 'running' && '🔄 训练中...'}
                {trainingJob.status === 'completed' && '✅ 训练完成'}
                {trainingJob.status === 'failed' && '❌ 训练失败'}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                进度: {(trainingJob.progress * 100).toFixed(0)}%
              </span>
            </div>

            <div style={{
              height: '8px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '16px',
            }}>
              <div style={{
                height: '100%',
                width: `${trainingJob.progress * 100}%`,
                backgroundColor: trainingJob.status === 'completed' ? 'var(--success)' : 'var(--primary-500)',
                transition: 'width 0.3s ease',
              }} />
            </div>

            {/* 实时指标 */}
            {trainingJob.metrics && trainingJob.status === 'running' && (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {trainingJob.metrics.val_accuracy?.length > 0 && (
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>验证准确率</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--primary-500)' }}>
                      {trainingJob.metrics.val_accuracy[trainingJob.metrics.val_accuracy.length - 1].toFixed(4)}
                    </div>
                  </div>
                )}
                {trainingJob.metrics.val_loss?.length > 0 && (
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>验证损失</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--primary-500)' }}>
                      {trainingJob.metrics.val_loss[trainingJob.metrics.val_loss.length - 1].toFixed(4)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 最终结果 */}
            {trainingJob.metrics?.final_metrics && trainingJob.status === 'completed' && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>最终结果</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {Object.entries(trainingJob.metrics.final_metrics).map(([key, value]) => (
                    <span
                      key={key}
                      style={{
                        backgroundColor: 'var(--success-bg)',
                        color: 'var(--success)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '13px',
                      }}
                    >
                      {key}: {typeof value === 'number' ? value.toFixed(4) : String(value)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 操作按钮 */}
      {!hideActions && (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {!trainingJob || trainingJob.status === 'completed' || trainingJob.status === 'failed' ? (
            <Button
              onClick={handleStartTrainingClick}
              disabled={loading}
              style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 500 }}
            >
              {loading ? '启动中...' : '🚀 开始训练'}
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={stopTraining}
              style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 500 }}
            >
              停止训练
            </Button>
          )}
        </div>
      )}
    </div>
  );
});

export default ModelParamsConfig;
