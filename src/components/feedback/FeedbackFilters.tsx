import React from 'react';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { FeedbackCategory, FeedbackFilters as FeedbackFiltersType } from '../../types/feedback';

interface FeedbackFiltersProps {
  categories: FeedbackCategory[];
  filters: FeedbackFiltersType;
  onFiltersChange: (filters: FeedbackFiltersType) => void;
  onReset: () => void;
}

export const FeedbackFiltersComponent: React.FC<FeedbackFiltersProps> = ({
  categories,
  filters,
  onFiltersChange,
  onReset
}) => {
  const handleFilterChange = (name: string, value: any) => {
    onFiltersChange({
      ...filters,
      [name]: value
    });
  };

  const handleDateChange = (name: string, value: string) => {
    onFiltersChange({
      ...filters,
      [name]: value
    });
  };

  const categoryOptions = [
    { value: '', label: 'Tüm Kategoriler' },
    ...categories.map(category => ({
      value: category.id,
      label: category.name
    }))
  ];

  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'yeni', label: 'Yeni' },
    { value: 'inceleniyor', label: 'İnceleniyor' },
    { value: 'beklemede', label: 'Beklemede' },
    { value: 'cozuldu', label: 'Çözüldü' },
    { value: 'kapatildi', label: 'Kapatıldı' }
  ];

  const priorityOptions = [
    { value: '', label: 'Tüm Öncelikler' },
    { value: 'kritik', label: 'Kritik' },
    { value: 'yüksek', label: 'Yüksek' },
    { value: 'orta', label: 'Orta' },
    { value: 'düşük', label: 'Düşük' }
  ];

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== undefined && value !== null
  );

  return (
    <div className="bg-white rounded-xl border border-secondary-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-secondary-900">Filtreler</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Filtreleri Temizle
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Input
            label="Arama"
            placeholder="Başlık veya içerikte ara..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div>
          <Select
            label="Kategori"
            value={filters.category_id || ''}
            onChange={(e) => handleFilterChange('category_id', e.target.value)}
            options={categoryOptions}
          />
        </div>

        <div>
          <Select
            label="Durum"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={statusOptions}
          />
        </div>

        <div>
          <Select
            label="Öncelik"
            value={filters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            options={priorityOptions}
          />
        </div>

        <div>
          <label htmlFor="date_from" className="block text-sm font-medium text-secondary-700 mb-2">
            Başlangıç Tarihi
          </label>
          <input
            type="date"
            id="date_from"
            value={filters.date_from || ''}
            onChange={(e) => handleDateChange('date_from', e.target.value)}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="date_to" className="block text-sm font-medium text-secondary-700 mb-2">
            Bitiş Tarihi
          </label>
          <input
            type="date"
            id="date_to"
            value={filters.date_to || ''}
            onChange={(e) => handleDateChange('date_to', e.target.value)}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-secondary-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-secondary-500">Aktif filtreler:</span>
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary-100 text-secondary-800">
                Arama: {filters.search}
              </span>
            )}
            {filters.category_id && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary-100 text-secondary-800">
                Kategori: {categories.find(c => c.id === filters.category_id)?.name}
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary-100 text-secondary-800">
                Durum: {statusOptions.find(o => o.value === filters.status)?.label}
              </span>
            )}
            {filters.priority && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary-100 text-secondary-800">
                Öncelik: {priorityOptions.find(o => o.value === filters.priority)?.label}
              </span>
            )}
            {filters.date_from && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary-100 text-secondary-800">
                Başlangıç: {filters.date_from}
              </span>
            )}
            {filters.date_to && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary-100 text-secondary-800">
                Bitiş: {filters.date_to}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};