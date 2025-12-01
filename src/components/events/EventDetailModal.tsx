import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Event, DepartmentAssignment } from '../../types/events';
import { supabase } from '../../lib/supabase';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  event
}) => {
  const [departmentAssignments, setDepartmentAssignments] = useState<DepartmentAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event?.id) {
      loadDepartmentAssignments();
    }
  }, [event?.id]);

  const loadDepartmentAssignments = async () => {
    if (!event?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('department_assignments')
        .select('*')
        .eq('event_id', event.id)
        .order('assigned_date', { ascending: false });

      if (error) throw error;
      setDepartmentAssignments(data || []);
    } catch (error) {
      console.error('Error loading department assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  const generateEventCode = () => {
    const prefix = event.event_type === 'acil_durum' ? 'ACL' :
                   event.event_type === 'hasta_guvenlik' ? 'HG' : 'CG';
    const year = new Date(event.created_at).getFullYear();
    return `${prefix}-${year}-${event.id.substring(0, 5)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'kapatildi':
      case 'tamamlandi':
      case 'kabul_edildi':
        return 'bg-success-100 text-success-700';
      case 'reddedildi':
      case 'iptal':
        return 'bg-danger-100 text-danger-700';
      case 'beklemede':
      case 'atanmayi_bekleyen':
        return 'bg-warning-100 text-warning-700';
      default:
        return 'bg-primary-100 text-primary-700';
    }
  };

  const getQualityCriteriaColor = (criteria?: string) => {
    switch (criteria) {
      case 'tamamlandi':
        return 'bg-success-100 text-success-700 border border-success-300';
      case 'devam_ediyor':
        return 'bg-warning-100 text-warning-700 border border-warning-300';
      case 'atanmadi':
      default:
        return 'bg-danger-100 text-danger-700 border border-danger-300';
    }
  };

  const getQualityCriteriaLabel = (criteria?: string) => {
    switch (criteria) {
      case 'tamamlandi':
        return 'Tamamlandı';
      case 'devam_ediyor':
        return 'Devam Ediyor';
      case 'atanmadi':
      default:
        return 'Atanmadı';
    }
  };

  const getAffectedPersonType = (type?: string) => {
    switch (type) {
      case 'hasta':
        return 'Hasta';
      case 'calisan':
        return 'Çalışan';
      case 'ziyaretci':
        return 'Ziyaretçi';
      case 'diger':
        return 'Diğer';
      default:
        return 'Hasta';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Olay Ayrıntıları"
      size="xl"
    >
      <div className="space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Header - Olay Kodu ve Durum */}
        <div className="flex items-start justify-between pb-4 border-b border-secondary-200">
          <div>
            <h3 className="text-xl font-semibold text-secondary-900">
              {generateEventCode()}
            </h3>
            <p className="text-sm text-secondary-600 mt-1">
              Oluşturma: {new Date(event.created_at).toLocaleString('tr-TR')}
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(event.status)}`}>
            {event.status.replace(/_/g, ' ').split(' ').map(word =>
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </span>
        </div>

        {/* Olayın Belirlendiği Bölüm */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-900">
            Olayın Belirlendiği Bölüm:
          </label>
          <div className="bg-secondary-50 p-3 rounded-lg">
            <p className="text-sm text-danger-600 font-medium">
              {event.department || event.location || event.event_location_detail || 'Belirtilmemiş'}
            </p>
          </div>
        </div>

        {/* Olay No */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-900">
            Olay No:
          </label>
          <div className="bg-secondary-50 p-3 rounded-lg">
            <p className="text-sm text-danger-600 font-medium">
              {generateEventCode()}
            </p>
          </div>
        </div>

        {/* Olaydan Etkilenen */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-900">
            Olaydan Etkilenen:
          </label>
          {(event.affected_first_name || event.affected_last_name || event.patient_first_name || event.patient_last_name) ? (
            <div className="border border-secondary-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary-100 border-b border-secondary-200">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-secondary-700 text-xs border-r border-secondary-200">#</th>
                      <th className="text-left py-2 px-3 font-semibold text-secondary-700 text-xs border-r border-secondary-200">Adı Soyadı</th>
                      <th className="text-left py-2 px-3 font-semibold text-secondary-700 text-xs border-r border-secondary-200">Yatış Tarihi</th>
                      <th className="text-left py-2 px-3 font-semibold text-secondary-700 text-xs border-r border-secondary-200">Cinsiyet</th>
                      <th className="text-left py-2 px-3 font-semibold text-secondary-700 text-xs border-r border-secondary-200">Doğum Tarihi</th>
                      <th className="text-left py-2 px-3 font-semibold text-secondary-700 text-xs border-r border-secondary-200">Yakın Sebepler</th>
                      <th className="text-left py-2 px-3 font-semibold text-secondary-700 text-xs border-r border-secondary-200">Sistem Hataları</th>
                      <th className="text-left py-2 px-3 font-semibold text-secondary-700 text-xs border-r border-secondary-200">Hata Ana Başlık</th>
                      <th className="text-left py-2 px-3 font-semibold text-secondary-700 text-xs border-r border-secondary-200">Hata Alt Başlık</th>
                      <th className="text-left py-2 px-3 font-semibold text-secondary-700 text-xs border-r border-secondary-200">Olay İle İlgili Hastalık Tanıları</th>
                      <th className="text-left py-2 px-3 font-semibold text-secondary-700 text-xs border-r border-secondary-200">Olay Tarihi</th>
                      <th className="text-left py-2 px-3 font-semibold text-secondary-700 text-xs">Olay Saati</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-secondary-100">
                      <td className="py-3 px-3 text-secondary-900 border-r border-secondary-200">1</td>
                      <td className="py-3 px-3 text-secondary-900 border-r border-secondary-200">
                        {event.affected_first_name && event.affected_last_name
                          ? `${event.affected_first_name} ${event.affected_last_name}`
                          : event.patient_first_name && event.patient_last_name
                          ? `${event.patient_first_name} ${event.patient_last_name}`
                          : '-'}
                      </td>
                      <td className="py-3 px-3 text-secondary-900 whitespace-nowrap border-r border-secondary-200">
                        {event.admission_date
                          ? `${new Date(event.admission_date).toLocaleDateString('tr-TR')} ${event.admission_time || ''}`
                          : '-'}
                      </td>
                      <td className="py-3 px-3 text-secondary-900 border-r border-secondary-200">
                        {(event.affected_gender || event.patient_gender)
                          ? (event.affected_gender || event.patient_gender)!.charAt(0).toUpperCase() + (event.affected_gender || event.patient_gender)!.slice(1)
                          : '-'}
                      </td>
                      <td className="py-3 px-3 text-secondary-900 whitespace-nowrap border-r border-secondary-200">
                        {(event.affected_birth_date || event.patient_birth_date)
                          ? `${new Date(event.affected_birth_date || event.patient_birth_date!).toLocaleDateString('tr-TR')}${event.patient_age ? ` (${event.patient_age} yaş)` : ''}`
                          : '-'}
                      </td>
                      <td className="py-3 px-3 text-secondary-900 border-r border-secondary-200">
                        {event.close_reasons && event.close_reasons.length > 0
                          ? event.close_reasons.join(', ')
                          : '-'}
                      </td>
                      <td className="py-3 px-3 text-secondary-900 border-r border-secondary-200">
                        {event.system_errors || '-'}
                      </td>
                      <td className="py-3 px-3 text-secondary-900 border-r border-secondary-200">
                        {event.error_main_category || '-'}
                      </td>
                      <td className="py-3 px-3 text-secondary-900 border-r border-secondary-200">
                        {event.error_sub_category || '-'}
                      </td>
                      <td className="py-3 px-3 text-secondary-900 border-r border-secondary-200">
                        {event.related_diagnoses || '-'}
                      </td>
                      <td className="py-3 px-3 text-secondary-900 whitespace-nowrap border-r border-secondary-200">
                        {new Date(event.event_date).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-3 text-secondary-900">
                        {event.event_time || '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-secondary-50 p-3 rounded-lg">
              <p className="text-sm text-secondary-600">Belirtilmemiş</p>
            </div>
          )}
        </div>

        {/* Olay Ayrıntıları */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-900">
            Olay Ayrıntıları:
          </label>
          <div className="bg-secondary-50 p-4 rounded-lg min-h-[100px] border border-secondary-200">
            <p className="text-sm text-secondary-900 whitespace-pre-wrap">
              {event.event_details || 'Belirtilmemiş'}
            </p>
          </div>
        </div>

        {/* Kalite Notu */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-900">
            Kalite Notu:
          </label>
          <div className="bg-secondary-50 p-4 rounded-lg min-h-[80px] border border-secondary-200">
            <p className="text-sm text-secondary-900 whitespace-pre-wrap">
              {event.quality_note || ''}
            </p>
          </div>
        </div>

        {/* Olayın Atandığı Müdürler */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-900">
            Olayın Atandığı Müdürler:
          </label>
          {departmentAssignments.length > 0 ? (
            <div className="border border-secondary-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary-100 border-b border-secondary-200">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-secondary-700 text-xs border-r border-secondary-200">Müdür Adı</th>
                      <th className="text-left py-2 px-3 font-semibold text-secondary-700 text-xs border-r border-secondary-200">Durum</th>
                      <th className="text-left py-2 px-3 font-semibold text-secondary-700 text-xs border-r border-secondary-200">Atandığı Tarih</th>
                      <th className="text-left py-2 px-3 font-semibold text-secondary-700 text-xs border-r border-secondary-200">Hata Ana Başlık</th>
                      <th className="text-left py-2 px-3 font-semibold text-secondary-700 text-xs">Hata Alt Başlık</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentAssignments.map((assignment) => (
                      <tr key={assignment.id} className="border-b border-secondary-100">
                        <td className="py-3 px-3 text-secondary-900 border-r border-secondary-200">
                          {assignment.manager_name || 'Yeni Olay'}
                        </td>
                        <td className="py-3 px-3 border-r border-secondary-200">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(assignment.assignment_status)}`}>
                            {assignment.assignment_status.charAt(0).toUpperCase() + assignment.assignment_status.slice(1).replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-secondary-900 border-r border-secondary-200">
                          {new Date(assignment.assigned_date).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-3 px-3 text-secondary-900 border-r border-secondary-200">
                          {event.error_main_category || '-'}
                        </td>
                        <td className="py-3 px-3 text-secondary-900">
                          {event.error_sub_category || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-secondary-50 p-3 rounded-lg">
              <p className="text-sm text-secondary-600">Henüz atama yapılmamış</p>
            </div>
          )}
        </div>

        {/* Kalite Kapatma Notu */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-900">
            Kalite Kapatma Notu:
          </label>
          <div className="bg-secondary-50 p-4 rounded-lg min-h-[80px] border border-secondary-200">
            <p className="text-sm text-secondary-900 whitespace-pre-wrap">
              {event.quality_closure_note || ''}
            </p>
          </div>
        </div>

        {/* Kalite Kapatma Kriteri */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-900">
            Kalite Kapatma Kriteri:
          </label>
          <div>
            <span className={`inline-flex px-4 py-2 rounded-lg text-sm font-semibold ${getQualityCriteriaColor(event.quality_closure_criteria)}`}>
              {getQualityCriteriaLabel(event.quality_closure_criteria)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-secondary-200 sticky bottom-0 bg-white">
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
          <Button onClick={() => window.print()}>
            <i className="bi bi-printer mr-2"></i>
            Yazdır
          </Button>
        </div>
      </div>
    </Modal>
  );
};
