import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PatientSafetyForm } from '../components/events/PatientSafetyForm';
import { EmployeeSafetyForm } from '../components/events/EmployeeSafetyForm';
import { EmergencyCodeForm } from '../components/events/EmergencyCodeForm';
import { EventList } from '../components/events/EventList';
import { CentralTracking } from '../components/events/CentralTracking';
import { AssignmentModal } from '../components/events/AssignmentModal';
import { RejectModal } from '../components/events/RejectModal';
import { AttachmentsPanel } from '../components/events/AttachmentsPanel';
import { EventDetailModal } from '../components/events/EventDetailModal';
import { useEvents } from '../hooks/useEvents';
import { Event } from '../types/events';

type EventFormType = 'patient-safety' | 'employee-safety' | 'emergency-code' | null;
type EventView = 'create' | 'list' | 'central-tracking';

export const EventReporting: React.FC = () => {
  const { events, createEvent, updateEvent, generateEventCode } = useEvents();
  const [currentView, setCurrentView] = useState<EventView>('create');
  const [currentForm, setCurrentForm] = useState<EventFormType>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Modal states
  const [assignmentModal, setAssignmentModal] = useState<{ isOpen: boolean; event: Event | null }>({
    isOpen: false,
    event: null
  });
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; event: Event | null }>({
    isOpen: false,
    event: null
  });
  const [attachmentsPanel, setAttachmentsPanel] = useState<{ isOpen: boolean; event: Event | null }>({
    isOpen: false,
    event: null
  });
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; event: Event | null }>({
    isOpen: false,
    event: null
  });
  const [editEvent, setEditEvent] = useState<Event | null>(null);

  // Mock user role - this should come from auth context
  const userRole = 'merkez_kalite'; // 'personel' | 'sube_kalite' | 'merkez_kalite' | 'admin'

  // Helper function to generate event code for display
  const generateEventCodeDisplay = (eventType: string, createdAt: string, id: string): string => {
    const prefix = eventType === 'acil_durum' ? 'ACL' :
      eventType === 'hasta_guvenlik' ? 'HG' : 'CG';
    const year = new Date(createdAt).getFullYear();
    return `${prefix}-${year}-${id.padStart(3, '0')}`;
  };

  const handleCreateEvent = async (data: Partial<Event>) => {
    setFormLoading(true);
    try {
      const newEvent = await createEvent(data);
      setCurrentForm(null);
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleAssignEvent = async (eventId: string, assigneeId: string, notes: string) => {
    try {
      await updateEvent(eventId, {
        assigned_to: assigneeId,
        status: 'atanan',
        manager_evaluation: notes
      });
      setAssignmentModal({ isOpen: false, event: null });
      alert('Olay başarıyla atandı ve ilgili kişiye bildirim gönderildi.');
    } catch (error) {
      console.error('Error assigning event:', error);
      alert('Olay atanamadı. Lütfen tekrar deneyin.');
    }
  };

  const handleRejectEvent = async (eventId: string, reason: string) => {
    try {
      await updateEvent(eventId, {
        status: 'reddedildi',
        manager_evaluation: reason
      });
      setRejectModal({ isOpen: false, event: null });
      alert('Olay reddedildi ve bildiren kişiye bildirim gönderildi.');
    } catch (error) {
      console.error('Error rejecting event:', error);
      alert('Olay reddedilemedi. Lütfen tekrar deneyin.');
    }
  };

  const handlePrintReport = (event: Event) => {
    try {
      const printContent = `
        OLAY BİLDİRİM RAPORU
        ========================

        Kod: ${generateEventCodeDisplay(event.event_type, event.created_at, event.id)}
        Sınıf: ${event.event_class}
        Tarih: ${new Date(event.event_date).toLocaleDateString('tr-TR')} ${event.event_time}
        Yer: ${event.location}
        Durum: ${event.status}

        OLAY DETAYLARI:
        ${event.event_details || 'Belirtilmemiş'}

        ÖNERİLER:
        ${event.suggestions || 'Belirtilmemiş'}

        Rapor Tarihi: ${new Date().toLocaleString('tr-TR')}
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Olay Raporu - ${event.id}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                pre { white-space: pre-wrap; }
              </style>
            </head>
            <body>
              <pre>${printContent}</pre>
              <script>
                window.onload = function() { window.print(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Error printing report:', error);
      alert('Rapor yazdırılamadı. Lütfen tekrar deneyin.');
    }
  };

  const handleViewAttachments = (event: Event) => {
    setAttachmentsPanel({ isOpen: true, event });
  };

  const handleDeleteEvent = async (event: Event) => {
    if (window.confirm('Bu olay kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await updateEvent(event.id, { status: 'iptal' });
        alert('Olay başarıyla iptal edildi.');
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Olay iptal edilemedi. Lütfen tekrar deneyin.');
      }
    }
  };

  const handleViewDetails = (event: Event) => {
    setDetailsModal({ isOpen: true, event });
  };

  const handleEditEvent = (event: Event) => {
    setEditEvent(event);
    // Determine which form to open based on event type
    if (event.event_type === 'acil_durum') {
      setCurrentForm('emergency-code');
    } else if (event.event_type === 'calisan_guvenlik') {
      setCurrentForm('employee-safety');
    } else {
      setCurrentForm('patient-safety');
    }
  };

  const handleUpdateEvent = async (data: Partial<Event>) => {
    if (!editEvent) return;

    setFormLoading(true);
    try {
      await updateEvent(editEvent.id, data);
      setEditEvent(null);
      setCurrentForm(null);
      alert('Olay başarıyla güncellendi.');
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Olay güncellenemedi. Lütfen tekrar deneyin.');
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    try {
      const exportData = events.map(event => ({
        'Kod': generateEventCodeDisplay(event.event_type, event.created_at, event.id),
        'Sınıf': event.event_class,
        'Ana Kategori': event.main_category,
        'Alt Kategori': event.sub_category,
        'Tarih': new Date(event.event_date).toLocaleDateString('tr-TR'),
        'Saat': event.event_time,
        'Yer': event.location,
        'Puan': event.score,
        'Durum': event.status,
        'Şube': event.facility_id,
        'Detaylar': event.event_details,
        'Oluşturma Tarihi': new Date(event.created_at).toLocaleDateString('tr-TR')
      }));

      if (format === 'csv') {
        const headers = Object.keys(exportData[0] || {});
        const csvContent = [
          headers.join(','),
          ...exportData.map(row =>
            headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
          )
        ].join('\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `olaylar_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      } else {
        console.log('XLSX export requires xlsx library');
        alert('Excel export özelliği şu anda geliştirme aşamasındadır.');
      }
    } catch (error) {
      console.error('Error exporting events:', error);
      alert('Dışa aktarım başarısız. Lütfen tekrar deneyin.');
    }
  };

  const getModalTitle = () => {
    const prefix = editEvent ? 'Düzenle: ' : '';
    switch (currentForm) {
      case 'patient-safety': return prefix + 'Hasta Güvenliği Olay Bildirimi';
      case 'employee-safety': return prefix + 'Çalışan Güvenliği Olay Bildirimi';
      case 'emergency-code': return prefix + 'Acil Durum Kodları';
      default: return '';
    }
  };

  const renderCurrentForm = () => {
    const isEditMode = editEvent !== null;
    const handleSubmit = isEditMode ? handleUpdateEvent : handleCreateEvent;
    const handleCancel = () => {
      setCurrentForm(null);
      setEditEvent(null);
    };

    switch (currentForm) {
      case 'patient-safety':
        return (
          <PatientSafetyForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={formLoading}
            initialData={editEvent || undefined}
          />
        );
      case 'employee-safety':
        return (
          <EmployeeSafetyForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={formLoading}
            initialData={editEvent || undefined}
          />
        );
      case 'emergency-code':
        return (
          <EmergencyCodeForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onGenerateCode={generateEventCode}
            loading={formLoading}
            initialData={editEvent || undefined}
          />
        );
      default:
        return null;
    }
  };

  const stats = React.useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthEvents = events.filter(event => {
      const eventDate = new Date(event.created_at);
      return eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear;
    });

    return {
      total: thisMonthEvents.length,
      patientSafety: thisMonthEvents.filter(e => e.event_type === 'hasta_guvenlik').length,
      employeeSafety: thisMonthEvents.filter(e => e.event_type === 'calisan_guvenlik').length,
      emergency: thisMonthEvents.filter(e => e.event_type === 'acil_durum').length
    };
  }, [events]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'create':
        return (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Olay Bildirimi</h1>
                  <p className="text-primary-100">Hasta güvenliği, çalışan güvenliği ve acil durum olaylarını bildirin</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-primary-100">Bugün</p>
                  <p className="text-lg font-semibold">{new Date().toLocaleDateString('tr-TR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
            </div>

            {/* Event Type Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Patient Safety */}
              <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setCurrentForm('patient-safety')}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-danger-100 dark:bg-danger-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-danger-200 dark:group-hover:bg-danger-900/50 transition-colors">
                    <i className="bi bi-shield-exclamation text-2xl text-danger-600 dark:text-danger-400"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">Hasta Güvenliği</h3>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-4">Hasta güvenliği ile ilgili olayları bildirin</p>
                  <div className="space-y-2 text-sm text-secondary-500 dark:text-secondary-400">
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600 dark:text-success-400"></i>
                      <span>Hasta düşmeleri</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600 dark:text-success-400"></i>
                      <span>İlaç hataları</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600 dark:text-success-400"></i>
                      <span>Enfeksiyon kontrol</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-danger-600 hover:bg-danger-700 text-white">
                    <i className="bi bi-plus-lg mr-2"></i>
                    Bildirim Oluştur
                  </Button>
                </div>
              </div>

              {/* Employee Safety */}
              <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setCurrentForm('employee-safety')}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-warning-100 dark:bg-warning-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-warning-200 dark:group-hover:bg-warning-900/50 transition-colors">
                    <i className="bi bi-person-exclamation text-2xl text-warning-600 dark:text-warning-400"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">Çalışan Güvenliği</h3>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-4">Çalışan güvenliği ile ilgili olayları bildirin</p>
                  <div className="space-y-2 text-sm text-secondary-500 dark:text-secondary-400">
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600 dark:text-success-400"></i>
                      <span>İş kazaları</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600 dark:text-success-400"></i>
                      <span>Şiddet olayları</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600 dark:text-success-400"></i>
                      <span>Maruziyetler</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-warning-600 hover:bg-warning-700 text-white">
                    <i className="bi bi-plus-lg mr-2"></i>
                    Bildirim Oluştur
                  </Button>
                </div>
              </div>

              {/* Emergency Codes */}
              <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setCurrentForm('emergency-code')}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-100 dark:bg-accent-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-200 dark:group-hover:bg-accent-900/50 transition-colors">
                    <i className="bi bi-exclamation-triangle-fill text-2xl text-accent-600 dark:text-accent-400"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">Acil Durum Kodları</h3>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-4">Acil durum olaylarını kaydedin</p>
                  <div className="space-y-2 text-sm text-secondary-500 dark:text-secondary-400">
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600 dark:text-success-400"></i>
                      <span>Yangın</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600 dark:text-success-400"></i>
                      <span>Doğal afetler</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600 dark:text-success-400"></i>
                      <span>Güvenlik olayları</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-accent-600 hover:bg-accent-700 text-white">
                    <i className="bi bi-plus-lg mr-2"></i>
                    Kod Oluştur
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">Bu Ay Bildirilen</p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-white">{stats.total}</p>
                  </div>
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <i className="bi bi-clipboard-plus text-primary-600 dark:text-primary-400"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">Hasta Güvenliği</p>
                    <p className="text-2xl font-bold text-danger-600 dark:text-danger-400">{stats.patientSafety}</p>
                  </div>
                  <div className="w-10 h-10 bg-danger-100 dark:bg-danger-900/30 rounded-lg flex items-center justify-center">
                    <i className="bi bi-shield-exclamation text-danger-600 dark:text-danger-400"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">Çalışan Güvenliği</p>
                    <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">{stats.employeeSafety}</p>
                  </div>
                  <div className="w-10 h-10 bg-warning-100 dark:bg-warning-900/30 rounded-lg flex items-center justify-center">
                    <i className="bi bi-person-exclamation text-warning-600 dark:text-warning-400"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">Acil Durum</p>
                    <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">{stats.emergency}</p>
                  </div>
                  <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center">
                    <i className="bi bi-exclamation-triangle-fill text-accent-600 dark:text-accent-400"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Son Bildirilen Olaylar</h3>
                <Button variant="outline" size="sm" onClick={() => setCurrentView('list')}>
                  <i className="bi bi-eye mr-2"></i>
                  Tümünü Görüntüle
                </Button>
              </div>

              <div className="space-y-4">
                {events.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-start space-x-4 p-4 bg-secondary-50 dark:bg-secondary-700/50 rounded-lg transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${event.event_type === 'hasta_guvenlik' ? 'bg-danger-100 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400' :
                      event.event_type === 'calisan_guvenlik' ? 'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400' :
                        'bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400'
                      }`}>
                      <i className={`bi ${event.event_type === 'hasta_guvenlik' ? 'bi-shield-exclamation' :
                        event.event_type === 'calisan_guvenlik' ? 'bi-person-exclamation' :
                          'bi-exclamation-triangle-fill'
                        }`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-secondary-900 dark:text-white mb-1">
                            {event.event_details.substring(0, 50)}...
                          </h4>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-secondary-500 dark:text-secondary-400">
                            <span>{event.facility?.name}</span>
                            <span>•</span>
                            <span>{new Date(event.created_at).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${event.status === 'atanmayi_bekleyen' ? 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400' :
                            event.status === 'atanan' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' :
                              event.status === 'kapatildi' ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400' :
                                'bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300'
                            }`}>
                            {event.status.replace('_', ' ').charAt(0).toUpperCase() + event.status.replace('_', ' ').slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <EventList
            events={events}
            loading={false}
            onAssign={(event) => setAssignmentModal({ isOpen: true, event })}
            onReject={(event) => setRejectModal({ isOpen: true, event })}
            onPrintReport={handlePrintReport}
            onViewAttachments={handleViewAttachments}
            onDelete={handleDeleteEvent}
            onViewDetails={handleViewDetails}
            onEdit={handleEditEvent}
            onExport={handleExport}
          />
        );

      case 'central-tracking':
        return (
          <CentralTracking
            events={events}
            loading={false}
            onExport={handleExport}
          />
        );

      default:
        return null;
    }
  };

  const getViewButtons = () => {
    const buttons = [
      { id: 'create' as EventView, label: 'Olay Bildirimi', icon: 'bi-plus-circle', roles: ['personel', 'sube_kalite', 'merkez_kalite'] },
      { id: 'list' as EventView, label: 'Olay Listeleme', icon: 'bi-list-ul', roles: ['sube_kalite', 'merkez_kalite'] },
      { id: 'central-tracking' as EventView, label: 'Merkez Takip', icon: 'bi-globe', roles: ['merkez_kalite'] }
    ];

    return buttons
      .filter(button => button.roles.includes(userRole))
      .map(button => (
        <Button
          key={button.id}
          variant={currentView === button.id ? 'primary' : 'outline'}
          onClick={() => setCurrentView(button.id)}
          className="flex items-center"
        >
          <i className={`bi ${button.icon} mr-2`}></i>
          {button.label}
        </Button>
      ));
  };

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Olay Yönetimi</h1>
            <p className="text-secondary-600 dark:text-secondary-400">Hasta güvenliği, çalışan güvenliği ve acil durum olay yönetim sistemi</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {getViewButtons()}
          </div>
        </div>
      </div>

      {/* Current View */}
      {renderCurrentView()}

      {/* Form Modal */}
      <Modal
        isOpen={currentForm !== null}
        onClose={() => {
          setCurrentForm(null);
          setEditEvent(null);
        }}
        title={getModalTitle()}
        size="xl"
      >
        {renderCurrentForm()}
      </Modal>

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={assignmentModal.isOpen}
        onClose={() => setAssignmentModal({ isOpen: false, event: null })}
        event={assignmentModal.event}
        onAssign={handleAssignEvent}
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, event: null })}
        event={rejectModal.event}
        onReject={handleRejectEvent}
      />

      {/* Attachments Panel */}
      <AttachmentsPanel
        isOpen={attachmentsPanel.isOpen}
        onClose={() => setAttachmentsPanel({ isOpen: false, event: null })}
        event={attachmentsPanel.event}
      />

      {/* Event Details Modal */}
      <EventDetailModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, event: null })}
        event={detailsModal.event}
      />
    </div>
  );
};
