import React from 'react';
import { cn } from '../../lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ 
  label, 
  error, 
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
      <textarea
        className={cn(
          'w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-vertical',
          error && 'border-danger-500 focus:ring-danger-500',
          className
        )}
        rows={4}
        {...props}
      />
      {error && (
        <p className="text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
};
