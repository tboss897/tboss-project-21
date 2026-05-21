import React from 'react';

const Input = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-surface-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 bg-white border rounded-xl text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
          error 
            ? 'border-danger-400 focus:border-danger-500 focus:ring-danger-500/20' 
            : 'border-surface-200 focus:border-accent-500 focus:ring-accent-500/20'
        }`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-danger-600 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;
