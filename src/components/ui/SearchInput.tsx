import React from 'react';
import { cn } from '../../lib/utils';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  className,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
    props.onChange?.(e);
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i className="bi bi-search text-secondary-400"></i>
      </div>
      <input
        type="text"
        className={cn(
          'w-full pl-10 pr-4 py-2 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
          className
        )}
        placeholder="Ara..."
        onChange={handleChange}
        {...props}
      />
    </div>
  );
};
