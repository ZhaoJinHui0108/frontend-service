import React from 'react';
import { Button } from '../components/ui';

interface Props {
  onClose: () => void;
}

const TaskExecutionModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✅ 任务已启动</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>定时任务已添加到执行队列，请到"执行历史"查看执行结果。</p>
          <p>AI 学习任务的训练是异步执行的，完成后会在历史记录中显示结果。</p>
        </div>
        <div className="modal-footer">
          <Button onClick={onClose}>确定</Button>
        </div>
      </div>
    </div>
  );
};

export default TaskExecutionModal;
