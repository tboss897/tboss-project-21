import React from 'react';

const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    neutral: 'badge-neutral',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    accent: 'badge-accent',
  };

  return (
    <span className={`${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
