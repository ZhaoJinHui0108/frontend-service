import React from 'react';

export interface CardProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  noPadding?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ title, children, actions, noPadding = false, className = '', style, onClick }: CardProps) {
  return (
    <div 
      className={`card ${className}`} 
      style={style}
      onClick={onClick}
    >
      {(title || actions) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className={`card-content ${noPadding ? 'no-padding' : ''}`}>
        {children}
      </div>
    </div>
  );
}
