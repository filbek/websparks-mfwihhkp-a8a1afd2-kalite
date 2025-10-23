import React from 'react';
import { Select } from '../ui/Select';
import { DocumentCategory } from '../../types/documents';

interface CategoryFilterProps {
  categories: DocumentCategory[];
  selectedCategory?: string;
  onCategoryChange: (categoryId: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCategoryChange(e.target.value);
  };

  const options = [
    { value: '', label: 'Tüm Kategoriler' },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name
    }))
  ];

  return (
    <Select
      label="Kategori"
      value={selectedCategory || ''}
      onChange={handleChange}
      options={options}
      className="w-full"
    />
  );
};