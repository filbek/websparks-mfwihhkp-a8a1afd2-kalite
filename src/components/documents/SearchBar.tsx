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
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i className="bi bi-search text-secondary-400"></i>
      </div>
      <Input
        type="text"
        value={search}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  );
};