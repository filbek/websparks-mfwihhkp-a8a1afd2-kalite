import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { SearchInput } from '../ui/SearchInput';
import { Badge } from '../ui/Badge';
import { useDofLocations, DofLocation } from '../../hooks/useDofLocations';

interface DepartmentManagementProps {
  onEdit: (department: DofLocation) => void;
  onDelete: (departmentId: string) => void;
  onToggleActive: (departmentId: string, isActive: boolean) => void;
}

export const DepartmentManagement: React.FC<DepartmentManagementProps> = ({
  onEdit,
  onDelete,
  onToggleActive
}) => {
  const { locations, loading } = useDofLocations(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.value.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterActive === 'all' ||
                         (filterActive === 'active' && location.is_active) ||
                         (filterActive === 'inactive' && !location.is_active);

    return matchesSearch && matchesFilter;
  });

  const handleDelete = (department: DofLocation) => {
    if (window.confirm(`"${department.label}" bölümünü silmek istediğinizden emin misiniz?`)) {
      onDelete(department.id);
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;

    const newLocations = [...filteredLocations];
    [newLocations[index - 1], newLocations[index]] = [newLocations[index], newLocations[index - 1]];

    const updates = newLocations.map((loc, idx) => ({
      ...loc,
      display_order: idx + 1
    }));

    // TODO: Implement bulk update
    console.log('Move up:', updates);
  };

  const moveDown = async (index: number) => {
    if (index === filteredLocations.length - 1) return;

    const newLocations = [...filteredLocations];
    [newLocations[index], newLocations[index + 1]] = [newLocations[index + 1], newLocations[index]];

    const updates = newLocations.map((loc, idx) => ({
      ...loc,
      display_order: idx + 1
    }));

    // TODO: Implement bulk update
    console.log('Move down:', updates);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <i className="bi bi-arrow-clockwise animate-spin text-4xl text-primary-600 mr-3"></i>
        <span className="text-lg text-secondary-600">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Bölüm ara..."
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterActive === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilterActive('all')}
            size="sm"
          >
            Tümü ({locations.length})
          </Button>
          <Button
            variant={filterActive === 'active' ? 'primary' : 'outline'}
            onClick={() => setFilterActive('active')}
            size="sm"
          >
            Aktif ({locations.filter(l => l.is_active).length})
          </Button>
          <Button
            variant={filterActive === 'inactive' ? 'primary' : 'outline'}
            onClick={() => setFilterActive('inactive')}
            size="sm"
          >
            Pasif ({locations.filter(l => !l.is_active).length})
          </Button>
        </div>
      </div>

      {filteredLocations.length === 0 ? (
        <div className="text-center py-12">
          <i className="bi bi-inbox text-4xl text-secondary-400 mb-3"></i>
          <p className="text-secondary-600">Bölüm bulunamadı</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Sıra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Bölüm Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Sistem Kodu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {filteredLocations.map((location, index) => (
                  <tr key={location.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-secondary-900">
                          {location.display_order}
                        </span>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="text-secondary-400 hover:text-secondary-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Yukarı taşı"
                          >
                            <i className="bi bi-chevron-up text-xs"></i>
                          </button>
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === filteredLocations.length - 1}
                            className="text-secondary-400 hover:text-secondary-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Aşağı taşı"
                          >
                            <i className="bi bi-chevron-down text-xs"></i>
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-secondary-900">
                        {location.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs bg-secondary-100 px-2 py-1 rounded text-secondary-700">
                        {location.value}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={location.is_active ? 'success' : 'secondary'}>
                        {location.is_active ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onToggleActive(location.id, !location.is_active)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            location.is_active
                              ? 'bg-warning-100 text-warning-700 hover:bg-warning-200'
                              : 'bg-success-100 text-success-700 hover:bg-success-200'
                          }`}
                          title={location.is_active ? 'Pasif yap' : 'Aktif yap'}
                        >
                          <i className={`bi ${location.is_active ? 'bi-eye-slash' : 'bi-eye'} mr-1`}></i>
                          {location.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                        </button>

                        <button
                          onClick={() => onEdit(location)}
                          className="text-primary-600 hover:text-primary-900 px-3 py-1 rounded hover:bg-primary-50 transition-colors"
                          title="Düzenle"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          onClick={() => handleDelete(location)}
                          className="text-danger-600 hover:text-danger-900 px-3 py-1 rounded hover:bg-danger-50 transition-colors"
                          title="Sil"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex">
          <i className="bi bi-info-circle text-primary-600 mr-3 mt-0.5"></i>
          <div className="text-sm text-primary-800">
            <p className="font-medium mb-1">Önemli Notlar:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Sadece aktif bölümler DÖF formlarında görünür</li>
              <li>Bölüm sıralaması DÖF formlarındaki dropdown sırasını belirler</li>
              <li>Sistem kodu değiştirilemez, yalnızca bölüm adı güncellenebilir</li>
              <li>Bölüm silindiğinde, o bölümle ilişkili DÖF kayıtları korunur</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
