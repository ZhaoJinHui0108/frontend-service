import React from 'react';

export interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  onClose?: () => void;
}

export function Alert({ variant = 'info', children, onClose }: AlertProps) {
  return (
    <div className={`alert alert-${variant}`}>
      <span>{children}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose} type="button">
          ×
        </button>
      )}
    </div>
  );
}
