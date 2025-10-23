import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SearchInput } from '../ui/SearchInput';
import { FilterDropdown } from '../ui/FilterDropdown';
import { DOF } from '../../types';
import { formatDate, getStatusColor } from '../../lib/utils';

interface MyDOFsProps {
  dofs: DOF[];
  loading: boolean;
  onView: (dof: DOF) => void;
  onEdit: (dof: DOF) => void;
  onClose: (dof: DOF) => void;
  onExportExcel: () => void;
}

export const MyDOFs: React.FC<MyDOFsProps> = ({
  dofs,
  loading,
  onView,
  onEdit,
  onClose,
  onExportExcel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'yeni', label: 'Yeni' },
    { value: 'atanmayi_bekleyen', label: 'Atanmayı Bekleyen' },
    { value: 'atanan', label: 'Atanan' },
    { value: 'cozum_bekliyor', label: 'Çözüm Bekliyor' },
    { value: 'kapatma_onayinda', label: 'Kapatma Onayında' },
    { value: 'kapatildi', label: 'Kapatıldı' },
    { value: 'iptal', label: 'İptal' },
    { value: 'reddedilen', label: 'Reddedilen' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'Tüm Öncelikler' },
    { value: 'düşük', label: 'Düşük' },
    { value: 'orta', label: 'Orta' },
    { value: 'yüksek', label: 'Yüksek' },
    { value: 'kritik', label: 'Kritik' }
  ];

  const filteredDOFs = dofs.filter(dof => {
    const matchesSearch = dof.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dof.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dof.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || dof.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'yeni': return 'bi-plus-circle';
      case 'atanmayi_bekleyen': return 'bi-clock';
      case 'atanan': return 'bi-person-check';
      case 'cozum_bekliyor': return 'bi-hourglass-split';
      case 'kapatma_onayinda': return 'bi-check-circle';
      case 'kapatildi': return 'bi-check-circle-fill';
      case 'iptal': return 'bi-x-circle';
      case 'reddedilen': return 'bi-x-circle-fill';
      default: return 'bi-circle';
    }
  };

  const canEdit = (dof: DOF) => {
    return ['yeni', 'reddedilen'].includes(dof.status);
  };

  const canClose = (dof: DOF) => {
    return ['cozum_bekliyor', 'kapatma_onayinda'].includes(dof.status);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-secondary-200 rounded mb-3"></div>
              <div className="h-3 bg-secondary-200 rounded mb-2"></div>
              <div className="h-3 bg-secondary-200 rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="h-6 w-20 bg-secondary-200 rounded"></div>
                <div className="h-8 w-24 bg-secondary-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Takibimdeki DÖF'ler</h1>
            <p className="text-primary-100">Açtığınız DÖF'leri takip edin ve yönetin</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-2xl font-bold">{filteredDOFs.length}</p>
              <p className="text-sm text-primary-100">Toplam DÖF</p>
            </div>
            <Button
              onClick={onExportExcel}
              className="bg-white text-primary-600 hover:bg-primary-50"
            >
              <i className="bi bi-file-earmark-excel mr-2"></i>
              Excel'e Aktar
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-success-500 to-success-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-success-100 text-sm">Kapatılan</p>
                <p className="text-2xl font-bold">{dofs.filter(d => d.status === 'kapatildi').length}</p>
              </div>
              <i className="bi bi-check-circle-fill text-2xl text-success-200"></i>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-warning-500 to-warning-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warning-100 text-sm">Çözüm Bekleyen</p>
                <p className="text-2xl font-bold">{dofs.filter(d => d.status === 'cozum_bekliyor').length}</p>
              </div>
              <i className="bi bi-hourglass-split text-2xl text-warning-200"></i>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Atanan</p>
                <p className="text-2xl font-bold">{dofs.filter(d => d.status === 'atanan').length}</p>
              </div>
              <i className="bi bi-person-check text-2xl text-primary-200"></i>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-danger-500 to-danger-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-danger-100 text-sm">Yeni/Bekleyen</p>
                <p className="text-2xl font-bold">{dofs.filter(d => ['yeni', 'atanmayi_bekleyen'].includes(d.status)).length}</p>
              </div>
              <i className="bi bi-clock text-2xl text-danger-200"></i>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="DÖF ara..."
                value={searchTerm}
                onSearch={setSearchTerm}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <FilterDropdown
                label="Durum"
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                icon="bi-circle-fill"
              />
              
              <FilterDropdown
                label="Öncelik"
                options={priorityOptions}
                value={priorityFilter}
                onChange={setPriorityFilter}
                icon="bi-flag"
              />

              {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }}
                >
                  <i className="bi bi-x-circle mr-1"></i>
                  Temizle
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DOF List */}
      <div className="space-y-4">
        {filteredDOFs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-clipboard-x text-4xl text-secondary-400"></i>
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">DÖF bulunamadı</h3>
              <p className="text-secondary-600">Arama kriterlerinize uygun DÖF kaydı bulunamadı.</p>
            </CardContent>
          </Card>
        ) : (
          filteredDOFs.map((dof) => (
            <Card key={dof.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-secondary-900">{dof.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dof.status)}`}>
                        <i className={`bi ${getStatusIcon(dof.status)} mr-1`}></i>
                        {dof.status.replace('_', ' ').charAt(0).toUpperCase() + dof.status.replace('_', ' ').slice(1)}
                      </span>
                    </div>
                    <p className="text-secondary-600 mb-3 line-clamp-2">{dof.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-secondary-500">
                      <span className="flex items-center">
                        <i className="bi bi-calendar mr-1"></i>
                        {formatDate(dof.created_at)}
                      </span>
                      <span className="flex items-center">
                        <i className="bi bi-building mr-1"></i>
                        {dof.facility?.name}
                      </span>
                      {dof.assignee && (
                        <span className="flex items-center">
                          <i className="bi bi-person mr-1"></i>
                          {dof.assignee.display_name}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(dof)}
                    >
                      <i className="bi bi-eye mr-1"></i>
                      Görüntüle
                    </Button>
                    
                    {canEdit(dof) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(dof)}
                      >
                        <i className="bi bi-pencil mr-1"></i>
                        Düzenle
                      </Button>
                    )}
                    
                    {canClose(dof) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onClose(dof)}
                        className="text-success-600 hover:text-success-700 hover:bg-success-50"
                      >
                        <i className="bi bi-check-circle mr-1"></i>
                        Kapat
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
