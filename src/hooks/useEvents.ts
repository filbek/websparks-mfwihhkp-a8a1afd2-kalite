import { useState, useEffect } from 'react';
import { Event } from '../types/events';

// Mock events data
const mockEvents: Event[] = [
  {
    id: '1',
    event_type: 'hasta_guvenlik',
    privacy_request: false,
    department: 'acil_servis',
    patient_type: 'hasta',
    affected_person_name: 'Ahmet Yılmaz',
    birth_date: '1980-05-15',
    admission_date: '2024-01-15',
    entry_date: '2024-01-15T10:30:00Z',
    reporter_name: 'Dr. Mehmet Kaya',
    event_date: '2024-01-15',
    event_time: '14:30',
    repeat_count: 1,
    score: 3,
    event_class: 'hasta_guvenlik',
    main_category: 'hasta_dusme',
    sub_category: 'yatak_dusme',
    location: 'hasta_odasi',
    event_category: 'hafif_zarar',
    event_details: 'Hasta yataktan düşerek hafif yaralandı. Yatak korkulukları kontrol edilmeli.',
    suggestions: 'Yatak korkuluklarının düzenli kontrolü yapılmalı.',
    is_medication_error: false,
    quality_note: 'Hasta güvenlik protokolleri gözden geçirilmeli.',
    manager_evaluation: 'Önleyici tedbirler alınacak.',
    ministry_integration: false,
    facility_id: 1,
    reporter_id: 'user-1',
    assigned_to: 'user-2',
    status: 'atanan',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T15:20:00Z',
    facility: { id: 1, name: 'Silivri Şubesi' },
    reporter: { id: 'user-1', display_name: 'Dr. Mehmet Kaya' },
    assignee: { id: 'user-2', display_name: 'Ayşe Demir' }
  },
  {
    id: '2',
    event_type: 'calisan_guvenlik',
    privacy_request: false,
    department: 'laboratuvar',
    affected_person_name: 'Fatma Özkan',
    entry_date: '2024-01-16T09:15:00Z',
    reporter_name: 'Fatma Özkan',
    event_date: '2024-01-16',
    event_time: '09:00',
    repeat_count: 1,
    score: 5,
    event_class: 'calisan_guvenlik',
    main_category: 'is_kazasi',
    sub_category: 'kesici_alet',
    location: 'laboratuvar',
    event_category: 'orta_zarar',
    event_details: 'Laboratuvar teknisyeni cam kırığı ile yaralandı.',
    suggestions: 'Koruyucu eldiven kullanımı zorunlu hale getirilmeli.',
    is_medication_error: false,
    quality_note: 'İş güvenliği eğitimi verilmeli.',
    manager_evaluation: 'Koruyucu ekipman kontrolü yapılacak.',
    ministry_integration: true,
    job_title: 'tekniker',
    damage_status: 'orta',
    impact_duration: 'kisa',
    legal_action: false,
    facility_id: 2,
    reporter_id: 'user-3',
    status: 'inceleme',
    created_at: '2024-01-16T09:15:00Z',
    updated_at: '2024-01-16T11:30:00Z',
    facility: { id: 2, name: 'Avcılar Şubesi' },
    reporter: { id: 'user-3', display_name: 'Fatma Özkan' }
  },
  {
    id: '3',
    event_type: 'acil_durum',
    privacy_request: false,
    department: 'ameliyathane',
    affected_person_name: 'Sistem Geneli',
    entry_date: '2024-01-17T16:45:00Z',
    reporter_name: 'Güvenlik Amiri',
    event_date: '2024-01-17',
    event_time: '16:30',
    event_class: 'acil_durum',
    main_category: 'yangin',
    sub_category: 'elektrik_yangin',
    location: 'ameliyathane',
    event_category: 'ramak_kala',
    event_details: 'Ameliyathane elektrik panosunda kısa devre. Yangın söndürme sistemi devreye girdi.',
    suggestions: 'Elektrik sistemleri periyodik kontrolden geçirilmeli.',
    is_medication_error: false,
    quality_note: 'Acil durum protokolleri başarıyla uygulandı.',
    manager_evaluation: 'Elektrik altyapısı yenilenecek.',
    ministry_integration: true,
    event_code: 'ACL-2024-001',
    facility_id: 3,
    reporter_id: 'user-4',
    assigned_to: 'user-5',
    status: 'kapatildi',
    closed_at: '2024-01-18T10:00:00Z',
    close_duration: 1050,
    created_at: '2024-01-17T16:45:00Z',
    updated_at: '2024-01-18T10:00:00Z',
    facility: { id: 3, name: 'Ereğli Şubesi' },
    reporter: { id: 'user-4', display_name: 'Güvenlik Amiri' },
    assignee: { id: 'user-5', display_name: 'Teknik Müdür' }
  }
];

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => window.setTimeout(resolve, 1000));
      setEvents(mockEvents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Partial<Event>) => {
    try {
      await new Promise(resolve => window.setTimeout(resolve, 500));
      
      const newEvent: Event = {
        id: Date.now().toString(),
        event_type: eventData.event_type || 'hasta_guvenlik',
        privacy_request: eventData.privacy_request || false,
        department: eventData.department || '',
        patient_type: eventData.patient_type,
        affected_person_name: eventData.affected_person_name || '',
        birth_date: eventData.birth_date,
        admission_date: eventData.admission_date,
        entry_date: new Date().toISOString(),
        reporter_name: eventData.reporter_name || 'Mevcut Kullanıcı',
        event_date: eventData.event_date || new Date().toISOString().split('T')[0],
        event_time: eventData.event_time || new Date().toTimeString().slice(0, 5),
        repeat_count: eventData.repeat_count || 1,
        score: eventData.score || 0,
        event_class: eventData.event_class || '',
        main_category: eventData.main_category || '',
        sub_category: eventData.sub_category || '',
        location: eventData.location || '',
        event_category: eventData.event_category || '',
        event_details: eventData.event_details || '',
        suggestions: eventData.suggestions || '',
        is_medication_error: eventData.is_medication_error || false,
        medication_name: eventData.medication_name,
        quality_note: eventData.quality_note || '',
        manager_evaluation: eventData.manager_evaluation || '',
        ministry_integration: eventData.ministry_integration || false,
        job_title: eventData.job_title,
        damage_status: eventData.damage_status,
        impact_duration: eventData.impact_duration,
        legal_action: eventData.legal_action,
        event_code: eventData.event_code,
        facility_id: eventData.facility_id || 1,
        reporter_id: eventData.reporter_id || 'current-user-id',
        assigned_to: eventData.assigned_to,
        status: eventData.status || 'taslak',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        facility: mockEvents[0].facility,
        reporter: mockEvents[0].reporter
      };

      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Olay oluşturulamadı');
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      await new Promise(resolve => window.setTimeout(resolve, 500));
      
      setEvents(prev => prev.map(event => 
        event.id === id 
          ? { ...event, ...updates, updated_at: new Date().toISOString() }
          : event
      ));
      
      const updatedEvent = events.find(event => event.id === id);
      return updatedEvent;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Olay güncellenemedi');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await new Promise(resolve => window.setTimeout(resolve, 500));
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Olay silinemedi');
    }
  };

  const generateEventCode = (eventType: string): string => {
    const prefix = eventType === 'acil_durum' ? 'ACL' : 
                   eventType === 'hasta_guvenlik' ? 'HG' : 'CG';
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}-${randomNum}`;
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    generateEventCode
  };
};
