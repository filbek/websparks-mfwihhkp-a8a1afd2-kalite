import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors"
      >
        {icon && <i className={`bi ${icon} text-secondary-600`}></i>}
        <span className="text-sm font-medium text-secondary-700">
          {selectedOption?.label || label}
        </span>
        <i className={`bi bi-chevron-down text-secondary-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-secondary-200 rounded-lg shadow-lg z-10">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm hover:bg-secondary-50 transition-colors',
                  value === option.value ? 'bg-primary-50 text-primary-700' : 'text-secondary-700'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
