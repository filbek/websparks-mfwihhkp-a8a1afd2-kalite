import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SearchInput } from '../ui/SearchInput';
import { FilterDropdown } from '../ui/FilterDropdown';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Event } from '../../types/events';
import { formatDate, getStatusColor } from '../../lib/utils';
import { eventClassifications, eventTypes } from '../../data/eventData';

interface EventListProps {
  events: Event[];
  loading: boolean;
  onAssign: (event: Event) => void;
  onReject: (event: Event) => void;
  onPrintReport: (event: Event) => void;
  onViewAttachments: (event: Event) => void;
  onDelete: (event: Event) => void;
  onViewDetails: (event: Event) => void;
  onExport: (format: 'csv' | 'xlsx') => void;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  loading,
  onAssign,
  onReject,
  onPrintReport,
  onViewAttachments,
  onDelete,
  onViewDetails,
  onExport
}) => {
  const [filters, setFilters] = useState({
    facility: 'all',
    dateFrom: '',
    dateTo: '',
    eventClass: 'all',
    mainCategory: 'all',
    subCategory: 'all',
    eventType: 'all',
    status: [] as string[]
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Event | 'code';
    direction: 'asc' | 'desc';
  } | null>(null);

  const facilityOptions = [
    { value: 'all', label: 'Tüm Şubeler' },
    { value: '1', label: 'Silivri (SIL)' },
    { value: '2', label: 'Avcılar (AVC)' },
    { value: '3', label: 'Ereğli (ERG)' }
  ];

  const eventClassOptions = [
    { value: 'all', label: 'Tüm Sınıflar' },
    ...eventClassifications.map(c => ({ value: c.id, label: c.class_name }))
  ];

  const statusOptions = [
    { value: 'taslak', label: 'Taslak' },
    { value: 'atanmayi_bekleyen', label: 'Atanmayı Bekleyen' },
    { value: 'atanan', label: 'Atanan' },
    { value: 'cozum_bekleyen', label: 'Çözüm Bekleyen' },
    { value: 'kapatma_onayinda', label: 'Kapatma Onayında' },
    { value: 'kapatildi', label: 'Kapatıldı' },
    { value: 'reddedildi', label: 'Reddedildi' },
    { value: 'iptal', label: 'İptal' }
  ];

  const eventTypeOptions = [
    { value: 'all', label: 'Tüm Tipler' },
    ...eventTypes.map(t => ({ value: t.id, label: t.name }))
  ];

  // Get filtered main categories based on selected class
  const selectedClass = eventClassifications.find(c => c.id === filters.eventClass);
  const mainCategoryOptions = [
    { value: 'all', label: 'Tüm Ana Başlıklar' },
    ...(selectedClass?.main_categories.map(m => ({ value: m.id, label: m.name })) || [])
  ];

  // Get filtered sub categories based on selected main category
  const selectedMainCategory = selectedClass?.main_categories.find(m => m.id === filters.mainCategory);
  const subCategoryOptions = [
    { value: 'all', label: 'Tüm Alt Başlıklar' },
    ...(selectedMainCategory?.sub_categories.map(s => ({ value: s.id, label: s.name })) || [])
  ];

  const filteredEvents = events.filter(event => {
    const matchesFacility = filters.facility === 'all' || event.facility_id.toString() === filters.facility;
    const matchesDateFrom = !filters.dateFrom || new Date(event.event_date) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(event.event_date) <= new Date(filters.dateTo);
    const matchesClass = filters.eventClass === 'all' || event.event_class === filters.eventClass;
    const matchesMainCategory = filters.mainCategory === 'all' || event.main_category === filters.mainCategory;
    const matchesSubCategory = filters.subCategory === 'all' || event.sub_category === filters.subCategory;
    const matchesType = filters.eventType === 'all' || event.event_category === filters.eventType;
    const matchesStatus = filters.status.length === 0 || filters.status.includes(event.status);

    return matchesFacility && matchesDateFrom && matchesDateTo && matchesClass && 
           matchesMainCategory && matchesSubCategory && matchesType && matchesStatus;
  });

  const sortedEvents = React.useMemo(() => {
    if (!sortConfig) return filteredEvents;

    return [...filteredEvents].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === 'code') {
        aValue = `${a.event_type.toUpperCase()}-${new Date(a.created_at).getFullYear()}-${a.id}`;
        bValue = `${b.event_type.toUpperCase()}-${new Date(b.created_at).getFullYear()}-${b.id}`;
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredEvents, sortConfig]);

  const handleSort = (key: keyof Event | 'code') => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleStatusToggle = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const clearFilters = () => {
    setFilters({
      facility: 'all',
      dateFrom: '',
      dateTo: '',
      eventClass: 'all',
      mainCategory: 'all',
      subCategory: 'all',
      eventType: 'all',
      status: []
    });
  };

  const generateEventCode = (event: Event) => {
    const prefix = event.event_type === 'acil_durum' ? 'ACL' : 
                   event.event_type === 'hasta_guvenlik' ? 'HG' : 'CG';
    const year = new Date(event.created_at).getFullYear();
    return `${prefix}-${year}-${event.id.padStart(3, '0')}`;
  };

  const getActionButtons = (event: Event) => {
    const buttons = [];

    // Müdüre Ata ve Bildir
    if (['taslak', 'atanmayi_bekleyen', 'reddedildi'].includes(event.status)) {
      buttons.push(
        <Button
          key="assign"
          size="sm"
          variant="ghost"
          onClick={() => onAssign(event)}
          className="text-primary-600 hover:text-primary-700"
          title="Müdüre Ata ve Bildir"
        >
          <i className="bi bi-person-plus"></i>
        </Button>
      );
    }

    // Reddet
    if (['atanmayi_bekleyen', 'atanan'].includes(event.status)) {
      buttons.push(
        <Button
          key="reject"
          size="sm"
          variant="ghost"
          onClick={() => onReject(event)}
          className="text-danger-600 hover:text-danger-700"
          title="Reddet"
        >
          <i className="bi bi-x-circle"></i>
        </Button>
      );
    }

    // Tutanak Yazdır
    buttons.push(
      <Button
        key="print"
        size="sm"
        variant="ghost"
        onClick={() => onPrintReport(event)}
        className="text-secondary-600 hover:text-secondary-700"
        title="Tutanak Yazdır"
      >
        <i className="bi bi-printer"></i>
      </Button>
    );

    // Ekleri Göster
    buttons.push(
      <Button
        key="attachments"
        size="sm"
        variant="ghost"
        onClick={() => onViewAttachments(event)}
        className="text-secondary-600 hover:text-secondary-700"
        title="Ekleri Göster"
      >
        <i className="bi bi-paperclip"></i>
      </Button>
    );

    // Sil/Pasif Et
    if (event.status !== 'iptal') {
      buttons.push(
        <Button
          key="delete"
          size="sm"
          variant="ghost"
          onClick={() => onDelete(event)}
          className="text-danger-600 hover:text-danger-700"
          title="Sil/Pasif Et"
        >
          <i className="bi bi-trash"></i>
        </Button>
      );
    }

    // Bilgi
    buttons.push(
      <Button
        key="info"
        size="sm"
        variant="ghost"
        onClick={() => onViewDetails(event)}
        className="text-info-600 hover:text-info-700"
        title="Detayları Görüntüle"
      >
        <i className="bi bi-info-circle"></i>
      </Button>
    );

    return buttons;
  };

  const hasActiveFilters = filters.facility !== 'all' || filters.dateFrom || filters.dateTo || 
                          filters.eventClass !== 'all' || filters.mainCategory !== 'all' || 
                          filters.subCategory !== 'all' || filters.eventType !== 'all' || 
                          filters.status.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Olay Listeleme & Süreç</h1>
            <p className="text-primary-100">Olayları filtreleyin, listeleyin ve işlem yapın</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{filteredEvents.length}</p>
            <p className="text-sm text-primary-100">Toplam Olay</p>
          </div>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <Card className="sticky top-20 z-40 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span>Filtreler</span>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onExport('csv')}
              >
                <i className="bi bi-file-earmark-text mr-2"></i>
                CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onExport('xlsx')}
              >
                <i className="bi bi-file-earmark-excel mr-2"></i>
                XLSX
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Şube"
              value={filters.facility}
              onChange={(e) => setFilters({ ...filters, facility: e.target.value })}
              options={facilityOptions}
            />

            <Input
              label="Başlangıç Tarihi"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />

            <Input
              label="Bitiş Tarihi"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />

            <Select
              label="Sınıf"
              value={filters.eventClass}
              onChange={(e) => setFilters({ 
                ...filters, 
                eventClass: e.target.value,
                mainCategory: 'all',
                subCategory: 'all'
              })}
              options={eventClassOptions}
            />
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Ana Başlık"
              value={filters.mainCategory}
              onChange={(e) => setFilters({ 
                ...filters, 
                mainCategory: e.target.value,
                subCategory: 'all'
              })}
              options={mainCategoryOptions}
              disabled={filters.eventClass === 'all'}
            />

            <Select
              label="Alt Başlık"
              value={filters.subCategory}
              onChange={(e) => setFilters({ ...filters, subCategory: e.target.value })}
              options={subCategoryOptions}
              disabled={filters.mainCategory === 'all'}
            />

            <Select
              label="Tip"
              value={filters.eventType}
              onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
              options={eventTypeOptions}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Durum (Çoklu Seçim)
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(status => (
                <button
                  key={status.value}
                  onClick={() => handleStatusToggle(status.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.status.includes(status.value)
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-secondary-200">
            <div className="flex space-x-3">
              <Button>
                <i className="bi bi-funnel mr-2"></i>
                Uygula
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  <i className="bi bi-x-circle mr-2"></i>
                  Temizle
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters Breadcrumb */}
      {hasActiveFilters && (
        <div className="bg-secondary-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-medium text-secondary-700">Aktif Filtreler:</span>
            {filters.facility !== 'all' && (
              <Badge variant="info">
                Şube: {facilityOptions.find(f => f.value === filters.facility)?.label}
              </Badge>
            )}
            {filters.dateFrom && (
              <Badge variant="info">
                Başlangıç: {new Date(filters.dateFrom).toLocaleDateString('tr-TR')}
              </Badge>
            )}
            {filters.dateTo && (
              <Badge variant="info">
                Bitiş: {new Date(filters.dateTo).toLocaleDateString('tr-TR')}
              </Badge>
            )}
            {filters.eventClass !== 'all' && (
              <Badge variant="info">
                Sınıf: {eventClassOptions.find(c => c.value === filters.eventClass)?.label}
              </Badge>
            )}
            {filters.status.length > 0 && (
              <Badge variant="info">
                Durum: {filters.status.length} seçili
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Events Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th 
                    className="text-left py-3 px-4 font-medium text-secondary-700 cursor-pointer hover:bg-secondary-100"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center">
                      Kod
                      {sortConfig?.key === 'code' && (
                        <i className={`bi bi-chevron-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></i>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-secondary-700 cursor-pointer hover:bg-secondary-100"
                    onClick={() => handleSort('event_class')}
                  >
                    <div className="flex items-center">
                      Sınıf
                      {sortConfig?.key === 'event_class' && (
                        <i className={`bi bi-chevron-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></i>
                      )}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">Ana/Alt Başlık</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">Yer</th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-secondary-700 cursor-pointer hover:bg-secondary-100"
                    onClick={() => handleSort('event_date')}
                  >
                    <div className="flex items-center">
                      Tarih/Saat
                      {sortConfig?.key === 'event_date' && (
                        <i className={`bi bi-chevron-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></i>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-secondary-700 cursor-pointer hover:bg-secondary-100"
                    onClick={() => handleSort('score')}
                  >
                    <div className="flex items-center">
                      Puan
                      {sortConfig?.key === 'score' && (
                        <i className={`bi bi-chevron-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1`}></i>
                      )}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">Durum</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">Atanan</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">Şube</th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {sortedEvents.map((event, index) => (
                  <tr 
                    key={event.id} 
                    className={`border-b border-secondary-100 hover:bg-secondary-50 ${
                      event.status === 'kapatildi' ? 'bg-success-50' :
                      event.status === 'reddedildi' ? 'bg-danger-50' :
                      event.status === 'iptal' ? 'bg-secondary-100' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-sm font-mono text-secondary-600">
                      {generateEventCode(event)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={
                        event.event_class === 'hasta_guvenlik' ? 'danger' :
                        event.event_class === 'calisan_guvenlik' ? 'warning' : 'info'
                      }>
                        {eventClassifications.find(c => c.id === event.event_class)?.class_name}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-700">
                      <div>
                        <p className="font-medium">
                          {selectedClass?.main_categories.find(m => m.id === event.main_category)?.name}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {selectedClass?.main_categories
                            .find(m => m.id === event.main_category)?.sub_categories
                            .find(s => s.id === event.sub_category)?.name}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-700">
                      {event.location?.replace('_', ' ').charAt(0).toUpperCase() + event.location?.replace('_', ' ').slice(1)}
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-700">
                      <div>
                        <p>{new Date(event.event_date).toLocaleDateString('tr-TR')}</p>
                        <p className="text-xs text-secondary-500">{event.event_time}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-secondary-900 mr-2">{event.score}</span>
                        <div className="w-16 h-2 bg-secondary-200 rounded-full">
                          <div 
                            className={`h-full rounded-full ${
                              event.score >= 6 ? 'bg-danger-500' :
                              event.score >= 4 ? 'bg-warning-500' :
                              event.score >= 2 ? 'bg-primary-500' : 'bg-success-500'
                            }`}
                            style={{ width: `${(event.score / 7) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status.replace('_', ' ').charAt(0).toUpperCase() + event.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-700">
                      {event.assignee?.display_name || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="info">
                        {facilityOptions.find(f => f.value === event.facility_id.toString())?.label?.split(' ')[0]}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        {getActionButtons(event)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {sortedEvents.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bi bi-clipboard-x text-4xl text-secondary-400"></i>
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">Olay bulunamadı</h3>
              <p className="text-secondary-600 mb-4">
                {hasActiveFilters 
                  ? 'Arama kriterlerinize uygun olay bulunamadı. Filtreleri genişletmeyi deneyin.'
                  : 'Henüz hiç olay kaydı bulunmamaktadır.'
                }
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  <i className="bi bi-funnel mr-2"></i>
                  Filtreleri Temizle
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
