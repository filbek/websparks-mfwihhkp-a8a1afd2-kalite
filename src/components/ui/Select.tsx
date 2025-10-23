import React from 'react';
import { cn } from '../../lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  error, 
  options, 
  className, 
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white text-secondary-700',
          error && 'border-danger-500 focus:ring-danger-500',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-secondary-700">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
};
