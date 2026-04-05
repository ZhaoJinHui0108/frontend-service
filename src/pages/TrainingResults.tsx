import React, { useState, useEffect } from 'react';
import { aiLearningApi } from '../api/aiLearning';
import type { ModelComparisonResponse, TrainingJobResponse } from '../types/aiLearning';
import { Button } from '../components/ui';

const TrainingResults: React.FC = () => {
  const [taskId, setTaskId] = useState<string>('');
  const [comparisons, setComparisons] = useState<ModelComparisonResponse[]>([]);
  const [allJobs, setAllJobs] = useState<TrainingJobResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAllJobs();
  }, []);

  const loadAllJobs = async () => {
    try {
      const { data } = await aiLearningApi.listJobs(100);
      setAllJobs(data);

      // 获取所有有结果的任务
      const uniqueTaskIds = [...new Set(data.filter((j) => j.status === 'completed').map((j) => j.task_id))];
      setTaskId(uniqueTaskIds[0] || '');
    } catch (err: any) {
      setError(err.message || '加载失败');
    }
  };

  const loadComparison = async (tid: string) => {
    try {
      setLoading(true);
      const { data } = await aiLearningApi.compareModels(tid);
      setComparisons((prev) => {
        const filtered = prev.filter((c) => c.task_id !== tid);
        return [...filtered, data];
      });
    } catch (err: any) {
      console.error('加载对比失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      loadComparison(taskId);
    }
  }, [taskId]);

  const completedJobs = allJobs.filter((j) => j.status === 'completed');
  const uniqueTasks = [...new Set(completedJobs.map((j) => j.task_id))];

  // 绘制损失曲线
  const renderLossChart = (jobs: TrainingJobResponse[]) => {
    const completedJobs = jobs.filter((j) => j.metrics?.val_loss?.length);
    if (completedJobs.length === 0) return null;

    const maxLength = Math.max(...completedJobs.map((j) => j.metrics?.val_loss?.length || 0));
    const epochs = Array.from({ length: maxLength }, (_, i) => i + 1);

    const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];

    return (
      <div className="chart-container">
        <h3>📉 损失曲线对比</h3>
        <div className="chart">
          <svg viewBox="0 0 600 300" className="line-chart">
            {/* Y轴标签 */}
            <text x="10" y="20" className="axis-label">Loss</text>
            
            {/* X轴标签 */}
            <text x="580" y="290" className="axis-label">Epoch</text>

            {/* 网格线 */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1="50"
                y1={20 + ratio * 250}
                x2="580"
                y2={20 + ratio * 250}
                className="grid-line"
              />
            ))}

            {/* 数据线 */}
            {completedJobs.map((job, idx) => {
              const losses = job.metrics?.val_loss || [];
              if (losses.length < 2) return null;

              const maxLoss = Math.max(...losses);
              const minLoss = Math.min(...losses);
              const range = maxLoss - minLoss || 1;

              const points = losses.map((loss, i) => {
                const x = 50 + (i / (losses.length - 1)) * 530;
                const y = 270 - ((loss - minLoss) / range) * 250;
                return `${x},${y}`;
              }).join(' ');

              return (
                <g key={job.job_id}>
                  <polyline
                    points={points}
                    fill="none"
                    stroke={colors[idx % colors.length]}
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx={50 + (losses.length - 1) / (losses.length - 1) * 530}
                    cy={270 - ((losses[losses.length - 1] - minLoss) / range) * 250}
                    r="4"
                    fill={colors[idx % colors.length]}
                  />
                </g>
              );
            })}

            {/* 图例 */}
            <g transform="translate(50, 10)">
              {completedJobs.map((job, idx) => (
                <g key={job.job_id} transform={`translate(${idx * 120}, 0)`}>
                  <line x1="0" y1="5" x2="20" y2="5" stroke={colors[idx % colors.length]} strokeWidth="2" />
                  <text x="25" y="9" className="legend-text">
                    {job.model_id}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>
    );
  };

  // 绘制准确率曲线
  const renderAccuracyChart = (jobs: TrainingJobResponse[]) => {
    const completedJobs = jobs.filter((j) => j.metrics?.val_accuracy?.length);
    if (completedJobs.length === 0) return null;

    const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];

    return (
      <div className="chart-container">
        <h3>📈 准确率曲线对比</h3>
        <div className="chart">
          <svg viewBox="0 0 600 300" className="line-chart">
            {/* Y轴标签 */}
            <text x="10" y="20" className="axis-label">Accuracy</text>
            
            {/* X轴标签 */}
            <text x="580" y="290" className="axis-label">Epoch</text>

            {/* 网格线 */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1="50"
                y1={20 + ratio * 250}
                x2="580"
                y2={20 + ratio * 250}
                className="grid-line"
              />
            ))}

            {/* 数据线 */}
            {completedJobs.map((job, idx) => {
              const accuracies = job.metrics?.val_accuracy || [];
              if (accuracies.length < 2) return null;

              const points = accuracies.map((acc, i) => {
                const x = 50 + (i / (accuracies.length - 1)) * 530;
                const y = 270 - acc * 250;
                return `${x},${y}`;
              }).join(' ');

              return (
                <g key={job.job_id}>
                  <polyline
                    points={points}
                    fill="none"
                    stroke={colors[idx % colors.length]}
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}

            {/* 图例 */}
            <g transform="translate(50, 10)">
              {completedJobs.map((job, idx) => (
                <g key={job.job_id} transform={`translate(${idx * 120}, 0)`}>
                  <line x1="0" y1="5" x2="20" y2="5" stroke={colors[idx % colors.length]} strokeWidth="2" />
                  <text x="25" y="9" className="legend-text">
                    {job.model_id}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>
    );
  };

  // 渲染柱状图对比
  const renderBarChart = (jobs: TrainingJobResponse[], metricKey: string) => {
    const completedJobs = jobs.filter((j) => j.metrics?.final_metrics?.[metricKey] !== undefined);
    if (completedJobs.length === 0) return null;

    const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];
    const values = completedJobs.map((j) => j.metrics?.final_metrics?.[metricKey] as number);
    const maxVal = Math.max(...values);

    const barWidth = 500 / completedJobs.length;
    const scale = maxVal > 0 ? 250 / maxVal : 1;

    return (
      <div className="chart-container">
        <h3>📊 {metricKey} 对比</h3>
        <div className="chart">
          <svg viewBox="0 0 600 300" className="bar-chart">
            {/* 网格线 */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1="50"
                y1={50 + ratio * 200}
                x2="550"
                y2={50 + ratio * 200}
                className="grid-line"
              />
            ))}

            {/* 柱状图 */}
            {completedJobs.map((job, idx) => {
              const value = job.metrics?.final_metrics?.[metricKey] as number;
              const barHeight = value * scale;
              const x = 75 + idx * barWidth;
              const y = 250 - barHeight;

              return (
                <g key={job.job_id}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth - 20}
                    height={barHeight}
                    fill={colors[idx % colors.length]}
                    rx="4"
                  />
                  <text
                    x={x + (barWidth - 20) / 2}
                    y={y - 10}
                    className="bar-value"
                    textAnchor="middle"
                  >
                    {value.toFixed(4)}
                  </text>
                  <text
                    x={x + (barWidth - 20) / 2}
                    y="270"
                    className="bar-label"
                    textAnchor="middle"
                  >
                    {job.model_id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  const renderConfusionMatrix = (job: TrainingJobResponse) => {
    // 简化版混淆矩阵展示
    // 实际应该从后端获取更详细的数据
    return null;
  };

  return (
    <div className="training-results">
      {/* 任务选择 */}
      <div className="results-header">
        <label>
          选择任务:
          <select value={taskId} onChange={(e) => setTaskId(e.target.value)}>
            {uniqueTasks.map((tid) => (
              <option key={tid} value={tid}>
                {tid}
              </option>
            ))}
          </select>
        </label>
        <Button variant="secondary" onClick={() => loadComparison(taskId)} disabled={loading}>
          🔄 刷新
        </Button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* 任务结果列表 */}
      {taskId && (
        <div className="task-results">
          {(() => {
            const taskJobs = allJobs.filter(
              (j) => j.task_id === taskId && j.status === 'completed'
            );

            if (taskJobs.length === 0) {
              return (
                <div className="empty-state">
                  <p>该任务暂无训练记录</p>
                </div>
              );
            }

            // 获取该任务的指标键
            const metricKeys = new Set<string>();
            taskJobs.forEach((job) => {
              if (job.metrics?.final_metrics) {
                Object.keys(job.metrics.final_metrics).forEach((key) => {
                  if (typeof job.metrics?.final_metrics?.[key] === 'number') {
                    metricKeys.add(key);
                  }
                });
              }
            });

            return (
              <>
                {/* 模型对比表格 */}
                <div className="comparison-table">
                  <h3>📋 模型性能对比</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>模型</th>
                        <th>状态</th>
                        {[...metricKeys].map((key) => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {taskJobs.map((job) => (
                        <tr key={job.job_id}>
                          <td>{job.model_id}</td>
                          <td>
                            <span className="status-badge completed">✅ 完成</span>
                          </td>
                          {[...metricKeys].map((key) => (
                            <td key={key}>
                              {typeof job.metrics?.final_metrics?.[key] === 'number'
                                ? (job.metrics?.final_metrics?.[key] as number).toFixed(4)
                                : '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 图表 */}
                {renderLossChart(taskJobs)}
                {renderAccuracyChart(taskJobs)}
                {[...metricKeys].map((key) => renderBarChart(taskJobs, key))}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default TrainingResults;
