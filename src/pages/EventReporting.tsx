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

  // Mock user role - this should come from auth context
  const userRole = 'merkez_kalite'; // 'personel' | 'sube_kalite' | 'merkez_kalite' | 'admin'

  const handleCreateEvent = async (data: Partial<Event>) => {
    setFormLoading(true);
    try {
      await createEvent(data);
      setCurrentForm(null);
    } catch (error) {
      console.error('Error creating event:', error);
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
      console.log('Event assigned successfully');
    } catch (error) {
      console.error('Error assigning event:', error);
    }
  };

  const handleRejectEvent = async (eventId: string, reason: string) => {
    try {
      await updateEvent(eventId, {
        status: 'reddedildi',
        manager_evaluation: reason
      });
      console.log('Event rejected successfully');
    } catch (error) {
      console.error('Error rejecting event:', error);
    }
  };

  const handlePrintReport = (event: Event) => {
    // Generate PDF report
    console.log('Printing report for event:', event.id);
    // In a real app, this would generate and download a PDF
  };

  const handleViewAttachments = (event: Event) => {
    setAttachmentsPanel({ isOpen: true, event });
  };

  const handleDeleteEvent = async (event: Event) => {
    if (window.confirm('Bu olay kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await updateEvent(event.id, { status: 'iptal' });
        console.log('Event deleted successfully');
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleViewDetails = (event: Event) => {
    console.log('Viewing details for event:', event.id);
    // In a real app, this would open a detailed view modal
  };

  const handleExport = (format: 'csv' | 'xlsx', facilityId?: number, dateFrom?: string, dateTo?: string) => {
    console.log('Exporting events:', { format, facilityId, dateFrom, dateTo });
    // In a real app, this would generate and download the export file
  };

  const getModalTitle = () => {
    switch (currentForm) {
      case 'patient-safety': return 'Hasta Güvenliği Olay Bildirimi';
      case 'employee-safety': return 'Çalışan Güvenliği Olay Bildirimi';
      case 'emergency-code': return 'Acil Durum Kodları';
      default: return '';
    }
  };

  const renderCurrentForm = () => {
    switch (currentForm) {
      case 'patient-safety':
        return (
          <PatientSafetyForm
            onSubmit={handleCreateEvent}
            onCancel={() => setCurrentForm(null)}
            loading={formLoading}
          />
        );
      case 'employee-safety':
        return (
          <EmployeeSafetyForm
            onSubmit={handleCreateEvent}
            onCancel={() => setCurrentForm(null)}
            loading={formLoading}
          />
        );
      case 'emergency-code':
        return (
          <EmergencyCodeForm
            onSubmit={handleCreateEvent}
            onCancel={() => setCurrentForm(null)}
            onGenerateCode={generateEventCode}
            loading={formLoading}
          />
        );
      default:
        return null;
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'create':
        return (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
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
              <div className="bg-white rounded-xl border border-secondary-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                   onClick={() => setCurrentForm('patient-safety')}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-danger-200 transition-colors">
                    <i className="bi bi-shield-exclamation text-2xl text-danger-600"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">Hasta Güvenliği</h3>
                  <p className="text-secondary-600 mb-4">Hasta güvenliği ile ilgili olayları bildirin</p>
                  <div className="space-y-2 text-sm text-secondary-500">
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600"></i>
                      <span>Hasta düşmeleri</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600"></i>
                      <span>İlaç hataları</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600"></i>
                      <span>Enfeksiyon kontrol</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-danger-600 hover:bg-danger-700">
                    <i className="bi bi-plus-lg mr-2"></i>
                    Bildirim Oluştur
                  </Button>
                </div>
              </div>

              {/* Employee Safety */}
              <div className="bg-white rounded-xl border border-secondary-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                   onClick={() => setCurrentForm('employee-safety')}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-warning-200 transition-colors">
                    <i className="bi bi-person-exclamation text-2xl text-warning-600"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">Çalışan Güvenliği</h3>
                  <p className="text-secondary-600 mb-4">Çalışan güvenliği ile ilgili olayları bildirin</p>
                  <div className="space-y-2 text-sm text-secondary-500">
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600"></i>
                      <span>İş kazaları</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600"></i>
                      <span>Şiddet olayları</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600"></i>
                      <span>Maruziyetler</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-warning-600 hover:bg-warning-700">
                    <i className="bi bi-plus-lg mr-2"></i>
                    Bildirim Oluştur
                  </Button>
                </div>
              </div>

              {/* Emergency Codes */}
              <div className="bg-white rounded-xl border border-secondary-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                   onClick={() => setCurrentForm('emergency-code')}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-200 transition-colors">
                    <i className="bi bi-exclamation-triangle-fill text-2xl text-accent-600"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">Acil Durum Kodları</h3>
                  <p className="text-secondary-600 mb-4">Acil durum olaylarını kaydedin</p>
                  <div className="space-y-2 text-sm text-secondary-500">
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600"></i>
                      <span>Yangın</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600"></i>
                      <span>Doğal afetler</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className="bi bi-check-circle mr-2 text-success-600"></i>
                      <span>Güvenlik olayları</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-accent-600 hover:bg-accent-700">
                    <i className="bi bi-plus-lg mr-2"></i>
                    Kod Oluştur
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-secondary-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary-600">Bu Ay Bildirilen</p>
                    <p className="text-2xl font-bold text-secondary-900">24</p>
                  </div>
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <i className="bi bi-clipboard-plus text-primary-600"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-secondary-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary-600">Hasta Güvenliği</p>
                    <p className="text-2xl font-bold text-danger-600">12</p>
                  </div>
                  <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
                    <i className="bi bi-shield-exclamation text-danger-600"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-secondary-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary-600">Çalışan Güvenliği</p>
                    <p className="text-2xl font-bold text-warning-600">8</p>
                  </div>
                  <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                    <i className="bi bi-person-exclamation text-warning-600"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-secondary-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary-600">Acil Durum</p>
                    <p className="text-2xl font-bold text-accent-600">4</p>
                  </div>
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                    <i className="bi bi-exclamation-triangle-fill text-accent-600"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white rounded-xl border border-secondary-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900">Son Bildirilen Olaylar</h3>
                <Button variant="outline" size="sm" onClick={() => setCurrentView('list')}>
                  <i className="bi bi-eye mr-2"></i>
                  Tümünü Görüntüle
                </Button>
              </div>

              <div className="space-y-4">
                {events.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-start space-x-4 p-4 bg-secondary-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      event.event_type === 'hasta_guvenlik' ? 'bg-danger-100 text-danger-600' :
                      event.event_type === 'calisan_guvenlik' ? 'bg-warning-100 text-warning-600' :
                      'bg-accent-100 text-accent-600'
                    }`}>
                      <i className={`bi ${
                        event.event_type === 'hasta_guvenlik' ? 'bi-shield-exclamation' :
                        event.event_type === 'calisan_guvenlik' ? 'bi-person-exclamation' :
                        'bi-exclamation-triangle-fill'
                      }`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-secondary-900 mb-1">
                            {event.event_details.substring(0, 50)}...
                          </h4>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-secondary-500">
                            <span>{event.facility?.name}</span>
                            <span>•</span>
                            <span>{new Date(event.created_at).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            event.status === 'atanmayi_bekleyen' ? 'bg-warning-100 text-warning-700' :
                            event.status === 'atanan' ? 'bg-primary-100 text-primary-700' :
                            event.status === 'kapatildi' ? 'bg-success-100 text-success-700' :
                            'bg-secondary-100 text-secondary-700'
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
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">Olay Yönetimi</h1>
            <p className="text-secondary-600">Hasta güvenliği, çalışan güvenliği ve acil durum olay yönetim sistemi</p>
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
        onClose={() => setCurrentForm(null)}
        title=""
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
    </div>
  );
};
