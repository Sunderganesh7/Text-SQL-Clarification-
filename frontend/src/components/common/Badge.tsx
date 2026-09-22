import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm border";
  
  const variantClasses = {
    default: "bg-surface-elevated text-text-secondary border-border",
    success: "bg-success-bg text-success border-success/30",
    warning: "bg-warning-bg text-warning border-warning/30",
    error: "bg-error-bg text-error border-error/30",
    info: "bg-info-bg text-info border-info/30"
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
