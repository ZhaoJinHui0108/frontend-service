import React from 'react';

export interface BadgeProps {
  variant?: 'primary' | 'success' | 'error' | 'warning' | 'muted';
  children: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

export function Badge({
  variant = 'primary',
  children,
  closable = false,
  onClose,
  className = '',
}: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
      {closable && onClose && (
        <button className="badge-close" onClick={onClose} type="button">
          ×
        </button>
      )}
    </span>
  );
}
