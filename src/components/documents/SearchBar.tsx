import React, { useState } from 'react';
import { Input } from '../ui/Input';

interface SearchBarProps {
  onSearch: (search: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Dokümanlarda ara..." 
}) => {
  const [search, setSearch] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearch(value);
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-secondary-700">
        Arama
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className="bi bi-search text-secondary-400"></i>
        </div>
        <input
          type="text"
          value={search}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
        />
      </div>
    </div>
  );
};
