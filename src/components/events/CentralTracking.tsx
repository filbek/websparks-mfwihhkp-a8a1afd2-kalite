import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Event } from '../../types/events';
import { Facility } from '../../types';
import { formatDate } from '../../lib/utils';
import { eventClassifications } from '../../data/eventData';

interface CentralTrackingProps {
  events: Event[];
  loading: boolean;
  facilities: Facility[];
  onExport: (format: 'csv' | 'xlsx') => void;
}

export const CentralTracking: React.FC<CentralTrackingProps> = ({
  events,
  loading,
  facilities,
  onExport
}) => {
  const [filters, setFilters] = useState({
    facility: '',
    dateFrom: '',
    dateTo: ''
  });

  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const facilityOptions = [
    { value: '', label: 'Şube Seçiniz *' },
    ...facilities.map(f => ({ value: f.id.toString(), label: f.name }))
  ];

  const pageSizeOptions = [
    { value: '10', label: '10' },
    { value: '25', label: '25' },
    { value: '50', label: '50' }
  ];

  const canList = filters.facility && filters.dateFrom && filters.dateTo;

  const filteredEvents = events.filter(event => {
    if (!canList) return false;

    const matchesFacility = event.facility_id.toString() === filters.facility;
    const matchesDateFrom = new Date(event.event_date) >= new Date(filters.dateFrom);
    const matchesDateTo = new Date(event.event_date) <= new Date(filters.dateTo);

    return matchesFacility && matchesDateFrom && matchesDateTo;
  });

  const totalPages = Math.ceil(filteredEvents.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + pageSize);

  const handleList = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      facility: '',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    if (!canList) return;
    onExport(format);
  };

  const generateEventCode = (event: Event) => {
    const prefix = event.event_type === 'acil_durum' ? 'ACL' :
      event.event_type === 'hasta_guvenlik' ? 'HG' : 'CG';
    const year = new Date(event.created_at).getFullYear();
    return `${prefix}-${year}-${event.id.padStart(3, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taslak': return 'bg-secondary-100 text-secondary-700';
      case 'atanmayi_bekleyen': return 'bg-warning-100 text-warning-700';
      case 'atanan': return 'bg-primary-100 text-primary-700';
      case 'cozum_bekleyen': return 'bg-accent-100 text-accent-700';
      case 'kapatma_onayinda': return 'bg-success-100 text-success-700';
      case 'kapatildi': return 'bg-success-200 text-success-800';
      case 'reddedildi': return 'bg-danger-100 text-danger-700';
      case 'iptal': return 'bg-secondary-200 text-secondary-800';
      default: return 'bg-secondary-100 text-secondary-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-600 to-accent-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Merkez Takip (Merkez Olay Bildirimleri)</h1>
            <p className="text-accent-100">Tüm şubelerin olay bildirimlerini merkezi olarak takip edin</p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <i className="bi bi-globe text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Şube *"
              value={filters.facility}
              onChange={(e) => setFilters({ ...filters, facility: e.target.value })}
              options={facilityOptions}
            />

            <Input
              label="Giriş Tarihi Başlangıç *"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />

            <Input
              label="Giriş Tarihi Bitiş *"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-secondary-200">
            <div className="flex space-x-3">
              <Button
                onClick={handleList}
                disabled={!canList}
              >
                <i className="bi bi-list mr-2"></i>
                Listele
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                <i className="bi bi-x-circle mr-2"></i>
                Temizle
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('csv')}
                disabled={!canList}
              >
                <i className="bi bi-file-earmark-text mr-2"></i>
                CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('xlsx')}
                disabled={!canList}
              >
                <i className="bi bi-file-earmark-excel mr-2"></i>
                XLSX
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {canList && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span>Sonuçlar</span>
                <Badge variant="info">
                  Toplam: {filteredEvents.length} kayıt
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                {/* Page Size Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-secondary-600">Sayfa başına:</span>
                  <Select
                    value={pageSize.toString()}
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    options={pageSizeOptions}
                    className="w-20"
                  />
                </div>

                {/* View Mode Toggle */}
                <div className="flex rounded-lg border border-secondary-300">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 text-sm rounded-l-lg transition-colors ${viewMode === 'table'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-secondary-600 hover:bg-secondary-50'
                      }`}
                  >
                    <i className="bi bi-table mr-1"></i>
                    Tablo
                  </button>
                  <button
                    onClick={() => setViewMode('card')}
                    className={`px-3 py-1 text-sm rounded-r-lg transition-colors ${viewMode === 'card'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-secondary-600 hover:bg-secondary-50'
                      }`}
                  >
                    <i className="bi bi-grid mr-1"></i>
                    Kart
                  </button>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary-50 border-b border-secondary-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-secondary-700">Şube</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-700">Kod</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-700">Sınıf</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-700">Ana/Alt Başlık</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-700">Yer</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-700">Tarih/Saat</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-700">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEvents.map((event) => (
                      <tr key={event.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                        <td className="py-3 px-4">
                          <Badge variant="info">
                            {facilityOptions.find(f => f.value === event.facility_id.toString())?.label?.split(' ')[0]}
                          </Badge>
                        </td>
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
                              {eventClassifications
                                .find(c => c.id === event.event_class)?.main_categories
                                .find(m => m.id === event.main_category)?.name}
                            </p>
                            <p className="text-xs text-secondary-500">
                              {eventClassifications
                                .find(c => c.id === event.event_class)?.main_categories
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status.replace('_', ' ').charAt(0).toUpperCase() + event.status.replace('_', ' ').slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedEvents.map((event) => (
                  <div key={event.id} className="bg-white border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="info">
                          {facilityOptions.find(f => f.value === event.facility_id.toString())?.label?.split(' ')[0]}
                        </Badge>
                        <span className="text-sm font-mono text-secondary-600">
                          {generateEventCode(event)}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status.replace('_', ' ').charAt(0).toUpperCase() + event.status.replace('_', ' ').slice(1)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <Badge variant={
                          event.event_class === 'hasta_guvenlik' ? 'danger' :
                            event.event_class === 'calisan_guvenlik' ? 'warning' : 'info'
                        }>
                          {eventClassifications.find(c => c.id === event.event_class)?.class_name}
                        </Badge>
                      </div>

                      <div>
                        <p className="font-medium text-sm text-secondary-900">
                          {eventClassifications
                            .find(c => c.id === event.event_class)?.main_categories
                            .find(m => m.id === event.main_category)?.name}
                        </p>
                        <p className="text-xs text-secondary-600">
                          {eventClassifications
                            .find(c => c.id === event.event_class)?.main_categories
                            .find(m => m.id === event.main_category)?.sub_categories
                            .find(s => s.id === event.sub_category)?.name}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-secondary-500">
                        <span>
                          {event.location?.replace('_', ' ').charAt(0).toUpperCase() + event.location?.replace('_', ' ').slice(1)}
                        </span>
                        <span>
                          {new Date(event.event_date).toLocaleDateString('tr-TR')} {event.event_time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-secondary-200">
                <div className="text-sm text-secondary-600">
                  {startIndex + 1}-{Math.min(startIndex + pageSize, filteredEvents.length)} / {filteredEvents.length} kayıt gösteriliyor
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 text-sm rounded transition-colors ${currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'text-secondary-600 hover:bg-secondary-100'
                            }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </Button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="bi bi-clipboard-x text-4xl text-secondary-400"></i>
                </div>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">Olay bulunamadı</h3>
                <p className="text-secondary-600">
                  Seçilen kriterlere uygun olay kaydı bulunamadı.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!canList && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="bi bi-info-circle text-4xl text-accent-600"></i>
            </div>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Filtreleri Doldurun</h3>
            <p className="text-secondary-600 mb-4">
              Olay listesini görüntülemek için şube ve tarih aralığı seçimi yapmanız gerekmektedir.
            </p>
            <div className="text-sm text-secondary-500">
              <p>• Şube seçimi zorunludur</p>
              <p>• Başlangıç ve bitiş tarihi zorunludur</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
