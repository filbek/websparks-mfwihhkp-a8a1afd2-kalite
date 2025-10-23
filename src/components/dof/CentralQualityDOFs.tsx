import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SearchInput } from '../ui/SearchInput';
import { FilterDropdown } from '../ui/FilterDropdown';
import { DOF } from '../../types';
import { formatDate, getStatusColor } from '../../lib/utils';

interface CentralQualityDOFsProps {
  dofs: DOF[];
  loading: boolean;
  onView: (dof: DOF) => void;
  onAssign: (dof: DOF) => void;
  onClose: (dof: DOF) => void;
  onExportExcel: (facilityId?: number) => void;
}

export const CentralQualityDOFs: React.FC<CentralQualityDOFsProps> = ({
  dofs,
  loading,
  onView,
  onAssign,
  onClose,
  onExportExcel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'atanmayi_bekleyen', label: 'Atanmayı Bekleyen' },
    { value: 'atanan', label: 'Atanan' },
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

  const facilityOptions = [
    { value: 'all', label: 'Tüm Şubeler' },
    { value: '1', label: 'Silivri Şubesi' },
    { value: '2', label: 'Avcılar Şubesi' },
    { value: '3', label: 'Ereğli Şubesi' }
  ];

  const filteredDOFs = dofs.filter(dof => {
    const matchesSearch = dof.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dof.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dof.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || dof.priority === priorityFilter;
    const matchesFacility = facilityFilter === 'all' || dof.facility_id.toString() === facilityFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesFacility;
  });

  // Group DOFs by facility for stats
  const dofsByFacility = dofs.reduce((acc, dof) => {
    const facilityId = dof.facility_id;
    if (!acc[facilityId]) {
      acc[facilityId] = [];
    }
    acc[facilityId].push(dof);
    return acc;
  }, {} as Record<number, DOF[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-600 to-accent-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Merkez Kalite - DÖF İzleme</h1>
            <p className="text-accent-100">Tüm şubelerin DÖF'lerini merkezi olarak izleyin ve yönetin</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-2xl font-bold">{filteredDOFs.length}</p>
              <p className="text-sm text-accent-100">Toplam DÖF</p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => onExportExcel()}
                className="bg-white text-accent-600 hover:bg-accent-50"
              >
                <i className="bi bi-file-earmark-excel mr-2"></i>
                Tümünü Aktar
              </Button>
              <Button
                onClick={() => onExportExcel(parseInt(facilityFilter))}
                disabled={facilityFilter === 'all'}
                className="bg-white text-accent-600 hover:bg-accent-50"
              >
                <i className="bi bi-building mr-2"></i>
                Şube Aktar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Facility Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(dofsByFacility).map(([facilityId, facilityDOFs]) => {
          const facilityName = facilityOptions.find(f => f.value === facilityId)?.label || `Şube ${facilityId}`;
          return (
            <Card key={facilityId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <i className="bi bi-building mr-2 text-primary-600"></i>
                  {facilityName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-warning-50 rounded-lg">
                    <p className="text-2xl font-bold text-warning-600">
                      {facilityDOFs.filter(d => d.status === 'atanmayi_bekleyen').length}
                    </p>
                    <p className="text-warning-700">Atanmayı Bekleyen</p>
                  </div>
                  <div className="text-center p-3 bg-primary-50 rounded-lg">
                    <p className="text-2xl font-bold text-primary-600">
                      {facilityDOFs.filter(d => d.status === 'atanan').length}
                    </p>
                    <p className="text-primary-700">Atanan</p>
                  </div>
                  <div className="text-center p-3 bg-accent-50 rounded-lg">
                    <p className="text-2xl font-bold text-accent-600">
                      {facilityDOFs.filter(d => d.status === 'kapatma_onayinda').length}
                    </p>
                    <p className="text-accent-700">Kapatma Onayında</p>
                  </div>
                  <div className="text-center p-3 bg-success-50 rounded-lg">
                    <p className="text-2xl font-bold text-success-600">
                      {facilityDOFs.filter(d => d.status === 'kapatildi').length}
                    </p>
                    <p className="text-success-700">Kapatıldı</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-secondary-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-600">Toplam DÖF</span>
                    <span className="text-lg font-bold text-secondary-900">{facilityDOFs.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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

              <FilterDropdown
                label="Şube"
                options={facilityOptions}
                value={facilityFilter}
                onChange={setFacilityFilter}
                icon="bi-building"
              />

              {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || facilityFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                    setFacilityFilter('all');
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

      {/* DOF Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="bi bi-table mr-2 text-accent-600"></i>
            Tüm Şubeler DÖF Listesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">DÖF No</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">Şube</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">Başlık</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">Durum</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">Öncelik</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">Rapor Eden</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">Tarih</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredDOFs.map((dof, index) => (
                  <tr key={dof.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="py-3 px-4 text-sm font-mono text-secondary-600">
                      DOF-{String(index + 1).padStart(4, '0')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="info">
                        {facilityOptions.find(f => f.value === dof.facility_id.toString())?.label || `Şube ${dof.facility_id}`}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-secondary-900 line-clamp-1">{dof.title}</p>
                        <p className="text-sm text-secondary-600 line-clamp-1">{dof.description}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dof.status)}`}>
                        {dof.status.replace('_', ' ').charAt(0).toUpperCase() + dof.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={
                        dof.priority === 'kritik' ? 'danger' :
                        dof.priority === 'yüksek' ? 'warning' :
                        dof.priority === 'orta' ? 'info' : 'default'
                      }>
                        {dof.priority.charAt(0).toUpperCase() + dof.priority.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-700">
                      {dof.reporter?.display_name || 'Bilinmeyen'}
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-600">
                      {formatDate(dof.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onView(dof)}
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        
                        {['atanmayi_bekleyen', 'reddedilen'].includes(dof.status) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onAssign(dof)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <i className="bi bi-person-plus"></i>
                          </Button>
                        )}
                        
                        {dof.status === 'kapatma_onayinda' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onClose(dof)}
                            className="text-success-600 hover:text-success-700"
                          >
                            <i className="bi bi-check-circle"></i>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDOFs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-clipboard-x text-4xl text-secondary-400"></i>
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">DÖF bulunamadı</h3>
              <p className="text-secondary-600">Arama kriterlerinize uygun DÖF kaydı bulunamadı.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
