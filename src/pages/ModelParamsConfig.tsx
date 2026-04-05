import React, { useState } from 'react';
import { aiLearningApi } from '../api/aiLearning';
import type { TaskInfo, ModelInfo, TrainingConfig } from '../types/aiLearning';
import { Button } from '../components/ui';

interface Props {
  task: TaskInfo;
  model: ModelInfo;
  onTrainingComplete: () => void;
}

const ModelParamsConfig: React.FC<Props> = ({ task, model, onTrainingComplete }) => {
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

      // 开始轮询训练状态
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

  const renderParamInput = (param: typeof model.params[0]) => {
    const value = modelParams[param.param_name];

    switch (param.param_type) {
      case 'int':
      case 'float':
        return (
          <div className="param-input">
            <input
              type="range"
              min={param.min_value}
              max={param.max_value}
              step={param.step || 1}
              value={value}
              onChange={(e) => handleParamChange(param.param_name, parseFloat(e.target.value))}
              disabled={trainingJob?.status === 'running'}
            />
            <input
              type="number"
              min={param.min_value}
              max={param.max_value}
              step={param.step || 1}
              value={value}
              onChange={(e) => handleParamChange(param.param_name, parseFloat(e.target.value))}
              disabled={trainingJob?.status === 'running'}
            />
          </div>
        );

      case 'bool':
        return (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleParamChange(param.param_name, e.target.checked)}
              disabled={trainingJob?.status === 'running'}
            />
            <span>{value ? '是' : '否'}</span>
          </label>
        );

      case 'choice':
        return (
          <select
            value={value}
            onChange={(e) => handleParamChange(param.param_name, e.target.value)}
            disabled={trainingJob?.status === 'running'}
          >
            {param.choices?.map((choice) => (
              <option key={choice} value={choice}>
                {choice}
              </option>
            ))}
          </select>
        );

      case 'string':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleParamChange(param.param_name, e.target.value)}
            disabled={trainingJob?.status === 'running'}
          />
        );

      case 'list':
        return (
          <input
            type="text"
            value={Array.isArray(value) ? value.join(', ') : value}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((v) => parseInt(v.trim(), 10)).filter((v) => !isNaN(v));
              handleParamChange(param.param_name, parsed);
            }}
            disabled={trainingJob?.status === 'running'}
            placeholder="用逗号分隔，例如: 32, 64"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleParamChange(param.param_name, e.target.value)}
            disabled={trainingJob?.status === 'running'}
          />
        );
    }
  };

  return (
    <div className="model-params-config">
      {/* 模型参数 */}
      <div className="config-section">
        <h2>模型参数配置</h2>
        <div className="params-grid">
          {model.params.map((param) => (
            <div key={param.param_name} className="param-item">
              <label>
                <span className="param-name">{param.param_name}</span>
                <span className="param-description">{param.description}</span>
              </label>
              {renderParamInput(param)}
            </div>
          ))}
        </div>
      </div>

      {/* 训练参数 */}
      <div className="config-section">
        <h2>训练配置</h2>
        <div className="params-grid">
          <div className="param-item">
            <label>
              <span className="param-name">epochs</span>
              <span className="param-description">训练轮数</span>
            </label>
            <input
              type="number"
              min={1}
              max={1000}
              value={trainingConfig.epochs}
              onChange={(e) => handleTrainingConfigChange('epochs', parseInt(e.target.value, 10))}
              disabled={trainingJob?.status === 'running'}
            />
          </div>

          <div className="param-item">
            <label>
              <span className="param-name">batch_size</span>
              <span className="param-description">批大小</span>
            </label>
            <input
              type="number"
              min={1}
              max={512}
              value={trainingConfig.batch_size}
              onChange={(e) => handleTrainingConfigChange('batch_size', parseInt(e.target.value, 10))}
              disabled={trainingJob?.status === 'running'}
            />
          </div>

          <div className="param-item">
            <label>
              <span className="param-name">learning_rate</span>
              <span className="param-description">学习率</span>
            </label>
            <input
              type="number"
              min={0.0001}
              max={1}
              step={0.001}
              value={trainingConfig.learning_rate}
              onChange={(e) => handleTrainingConfigChange('learning_rate', parseFloat(e.target.value))}
              disabled={trainingJob?.status === 'running'}
            />
          </div>

          <div className="param-item">
            <label>
              <span className="param-name">test_split</span>
              <span className="param-description">测试集比例</span>
            </label>
            <input
              type="number"
              min={0.1}
              max={0.5}
              step={0.05}
              value={trainingConfig.test_split}
              onChange={(e) => handleTrainingConfigChange('test_split', parseFloat(e.target.value))}
              disabled={trainingJob?.status === 'running'}
            />
          </div>

          <div className="param-item">
            <label>
              <span className="param-name">random_seed</span>
              <span className="param-description">随机种子</span>
            </label>
            <input
              type="number"
              value={trainingConfig.random_seed}
              onChange={(e) => handleTrainingConfigChange('random_seed', parseInt(e.target.value, 10))}
              disabled={trainingJob?.status === 'running'}
            />
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* 训练状态 */}
      {trainingJob && (
        <div className="training-status">
          <h3>训练状态</h3>
          <div className="status-info">
            <div className="status-badge-large">
              {trainingJob.status === 'pending' && '⏳ 等待中'}
              {trainingJob.status === 'running' && '🔄 训练中...'}
              {trainingJob.status === 'completed' && '✅ 训练完成'}
              {trainingJob.status === 'failed' && '❌ 训练失败'}
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${trainingJob.progress * 100}%` }}
              />
            </div>
            <span>{(trainingJob.progress * 100).toFixed(0)}%</span>
          </div>

          {/* 实时指标 */}
          {trainingJob.metrics && trainingJob.status === 'running' && (
            <div className="live-metrics">
              <h4>实时指标</h4>
              <div className="metrics-row">
                {trainingJob.metrics.val_accuracy?.length > 0 && (
                  <div className="metric">
                    <span className="metric-label">验证准确率</span>
                    <span className="metric-value">
                      {trainingJob.metrics.val_accuracy[trainingJob.metrics.val_accuracy.length - 1].toFixed(4)}
                    </span>
                  </div>
                )}
                {trainingJob.metrics.val_loss?.length > 0 && (
                  <div className="metric">
                    <span className="metric-label">验证损失</span>
                    <span className="metric-value">
                      {trainingJob.metrics.val_loss[trainingJob.metrics.val_loss.length - 1].toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 最终结果 */}
          {trainingJob.metrics?.final_metrics && trainingJob.status === 'completed' && (
            <div className="final-results">
              <h4>最终结果</h4>
              <div className="results-grid">
                {Object.entries(trainingJob.metrics.final_metrics).map(([key, value]) => (
                  <div key={key} className="result-item">
                    <span className="result-key">{key}</span>
                    <span className="result-value">
                      {typeof value === 'number' ? value.toFixed(4) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="config-actions">
        {!trainingJob || trainingJob.status === 'completed' || trainingJob.status === 'failed' ? (
          <Button
            onClick={startTraining}
            disabled={loading}
          >
            {loading ? '启动中...' : '🚀 开始训练'}
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={stopTraining}
          >
            停止训练
          </Button>
        )}
      </div>
    </div>
  );
};

export default ModelParamsConfig;
