import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { SearchInput } from '../ui/SearchInput';
import { Badge } from '../ui/Badge';
import { useDofSorumluBolumler, DofSorumluBolum } from '../../hooks/useDofSorumluBolumler';

interface ResponsibleDepartmentManagementProps {
  onEdit: (department: DofSorumluBolum) => void;
  onDelete: (departmentId: string) => void;
  onToggleActive: (departmentId: string, isActive: boolean) => void;
}

export const ResponsibleDepartmentManagement: React.FC<ResponsibleDepartmentManagementProps> = ({
  onEdit,
  onDelete,
  onToggleActive
}) => {
  const { sorumluBolumler, loading } = useDofSorumluBolumler(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredBolumler = sorumluBolumler.filter(bolum => {
    const matchesSearch = bolum.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bolum.value.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterActive === 'all' ||
      (filterActive === 'active' && bolum.is_active) ||
      (filterActive === 'inactive' && !bolum.is_active);

    return matchesSearch && matchesFilter;
  });

  const handleDelete = (department: DofSorumluBolum) => {
    if (window.confirm(`"${department.label}" müdürlüğünü silmek istediğinizden emin misiniz?`)) {
      onDelete(department.id);
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;

    const newBolumler = [...filteredBolumler];
    [newBolumler[index - 1], newBolumler[index]] = [newBolumler[index], newBolumler[index - 1]];

    const updates = newBolumler.map((bolum, idx) => ({
      ...bolum,
      display_order: idx + 1
    }));

    console.log('Move up:', updates);
  };

  const moveDown = async (index: number) => {
    if (index === filteredBolumler.length - 1) return;

    const newBolumler = [...filteredBolumler];
    [newBolumler[index], newBolumler[index + 1]] = [newBolumler[index + 1], newBolumler[index]];

    const updates = newBolumler.map((bolum, idx) => ({
      ...bolum,
      display_order: idx + 1
    }));

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
            placeholder="Müdürlük ara..."
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterActive === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilterActive('all')}
            size="sm"
          >
            Tümü ({sorumluBolumler.length})
          </Button>
          <Button
            variant={filterActive === 'active' ? 'primary' : 'outline'}
            onClick={() => setFilterActive('active')}
            size="sm"
          >
            Aktif ({sorumluBolumler.filter(b => b.is_active).length})
          </Button>
          <Button
            variant={filterActive === 'inactive' ? 'primary' : 'outline'}
            onClick={() => setFilterActive('inactive')}
            size="sm"
          >
            Pasif ({sorumluBolumler.filter(b => !b.is_active).length})
          </Button>
        </div>
      </div>

      {filteredBolumler.length === 0 ? (
        <div className="text-center py-12">
          <i className="bi bi-inbox text-4xl text-secondary-400 mb-3"></i>
          <p className="text-secondary-600">Müdürlük bulunamadı</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
              <thead className="bg-secondary-50 dark:bg-secondary-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                    Sıra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                    Müdürlük Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                    Sistem Kodu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-secondary-900 divide-y divide-secondary-200 dark:divide-secondary-800">
                {filteredBolumler.map((bolum, index) => (
                  <tr key={bolum.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-secondary-900 dark:text-white">
                          {bolum.display_order}
                        </span>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Yukarı taşı"
                          >
                            <i className="bi bi-chevron-up text-xs"></i>
                          </button>
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === filteredBolumler.length - 1}
                            className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Aşağı taşı"
                          >
                            <i className="bi bi-chevron-down text-xs"></i>
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-secondary-900 dark:text-white">
                        {bolum.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs bg-secondary-100 dark:bg-secondary-800 px-2 py-1 rounded text-secondary-700 dark:text-secondary-300">
                        {bolum.value}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={bolum.is_active ? 'success' : 'secondary'}>
                        {bolum.is_active ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onToggleActive(bolum.id, !bolum.is_active)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${bolum.is_active
                              ? 'bg-warning-100 text-warning-700 hover:bg-warning-200'
                              : 'bg-success-100 text-success-700 hover:bg-success-200'
                            }`}
                          title={bolum.is_active ? 'Pasif yap' : 'Aktif yap'}
                        >
                          <i className={`bi ${bolum.is_active ? 'bi-eye-slash' : 'bi-eye'} mr-1`}></i>
                          {bolum.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                        </button>

                        <button
                          onClick={() => onEdit(bolum)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 px-3 py-1 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          title="Düzenle"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          onClick={() => handleDelete(bolum)}
                          className="text-danger-600 hover:text-danger-900 dark:text-danger-400 dark:hover:text-danger-300 px-3 py-1 rounded hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
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

      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 transition-colors">
        <div className="flex">
          <i className="bi bi-info-circle text-primary-600 dark:text-primary-400 mr-3 mt-0.5"></i>
          <div className="text-sm text-primary-800 dark:text-primary-200">
            <p className="font-medium mb-1">Önemli Notlar:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Sadece aktif müdürlükler DÖF formlarında "Sorumlu Bölüm" alanında görünür</li>
              <li>Müdürlük sıralaması DÖF formlarındaki dropdown sırasını belirler</li>
              <li>Sistem kodu değiştirilemez, yalnızca müdürlük adı güncellenebilir</li>
              <li>Müdürlük silindiğinde, o müdürlükle ilişkili DÖF kayıtları korunur</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
