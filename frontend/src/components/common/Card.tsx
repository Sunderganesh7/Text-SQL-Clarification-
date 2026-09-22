import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-surface border border-border rounded-xl shadow-sm overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
};
