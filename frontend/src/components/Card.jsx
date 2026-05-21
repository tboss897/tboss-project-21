import React from 'react';

const Card = ({ children, className = '', title, actions, variant = 'default' }) => {
  const cardStyle = variant === 'glass' 
    ? 'glass-card' 
    : 'bg-white rounded-2xl shadow-card border border-surface-100 hover:shadow-card-hover transition-all duration-300 ease-out';
    
  return (
    <div className={`${cardStyle} overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="px-6 py-5 border-b border-surface-100 flex justify-between items-center bg-surface-50/50 backdrop-blur-sm">
          {title && <h3 className="text-base font-bold text-surface-900 tracking-tight">{title}</h3>}
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      <div className="px-6 py-6">{children}</div>
    </div>
  );
};

export default Card;
