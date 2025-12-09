import { useState, useEffect } from 'react';
import { Event } from '../types/events';
import { supabase } from '../lib/supabase';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*, facilities(name)')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setEvents(data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Partial<Event>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      const newEvent: any = {
        event_type: eventData.event_type || 'hasta_guvenlik',
        privacy_request: eventData.privacy_request || false,
        repeat_count: eventData.repeat_count || 1,
        score: eventData.score || 0,
        is_medication_error: eventData.is_medication_error || false,
        ministry_integration: eventData.ministry_integration || false,
        facility_id: eventData.facility_id || 1,
        reporter_id: user.id,
        status: eventData.status || 'taslak'
      };

      // Add optional fields only if they have values
      if (eventData.patient_type) newEvent.patient_type = eventData.patient_type;
      if (eventData.event_date) newEvent.event_date = eventData.event_date;
      if (eventData.event_time) newEvent.event_time = eventData.event_time;
      if (eventData.event_class) newEvent.event_class = eventData.event_class;
      if (eventData.main_category) newEvent.main_category = eventData.main_category;
      if (eventData.sub_category) newEvent.sub_category = eventData.sub_category;
      if (eventData.location) newEvent.location = eventData.location;
      if (eventData.event_category) newEvent.event_category = eventData.event_category;
      if (eventData.event_details) newEvent.event_details = eventData.event_details;
      if (eventData.working_department) newEvent.working_department = eventData.working_department;
      if (eventData.patient_number) newEvent.patient_number = eventData.patient_number;
      if (eventData.gender) newEvent.gender = eventData.gender;
      if (eventData.affected_person_name) newEvent.affected_person_name = eventData.affected_person_name;
      if (eventData.birth_date) newEvent.birth_date = eventData.birth_date;
      if (eventData.admission_date) newEvent.admission_date = eventData.admission_date;
      if (eventData.reporter_name) newEvent.reporter_name = eventData.reporter_name;
      if (eventData.responsible_profession) newEvent.responsible_profession = eventData.responsible_profession;
      if (eventData.suggestions) newEvent.suggestions = eventData.suggestions;
      if (eventData.medication_name) newEvent.medication_name = eventData.medication_name;
      if (eventData.quality_note) newEvent.quality_note = eventData.quality_note;
      if (eventData.manager_evaluation) newEvent.manager_evaluation = eventData.manager_evaluation;
      if (eventData.hss_code) newEvent.hss_code = eventData.hss_code;

      // Employee safety specific fields
      if (eventData.job_title) newEvent.job_title = eventData.job_title;
      if (eventData.damage_status) newEvent.damage_status = eventData.damage_status;
      if (eventData.impact_duration) newEvent.impact_duration = eventData.impact_duration;
      if (eventData.legal_action_status) newEvent.legal_action_status = eventData.legal_action_status;
      if (eventData.facility_location) newEvent.facility_location = eventData.facility_location;
      if (eventData.facility_sub_location) newEvent.facility_sub_location = eventData.facility_sub_location;
      if (eventData.event_class_detail) newEvent.event_class_detail = eventData.event_class_detail;
      if (eventData.primary_cause_detail) newEvent.primary_cause_detail = eventData.primary_cause_detail;
      if (eventData.unwanted_event_reported !== undefined) newEvent.unwanted_event_reported = eventData.unwanted_event_reported;
      if (eventData.work_accident_reported !== undefined) newEvent.work_accident_reported = eventData.work_accident_reported;
      if (eventData.white_code_initiated !== undefined) newEvent.white_code_initiated = eventData.white_code_initiated;

      const { data, error: insertError } = await supabase
        .from('events')
        .insert(newEvent)
        .select()
        .single();

      if (insertError) throw insertError;

      // Refresh events list
      await fetchEvents();

      return data as Event;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Olay oluşturulamadı';
      console.error('Error creating event:', err);
      throw new Error(errorMessage);
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('events')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Refresh events list
      await fetchEvents();

      return data as Event;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Olay güncellenemedi';
      console.error('Error updating event:', err);
      throw new Error(errorMessage);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Refresh events list
      await fetchEvents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Olay silinemedi';
      console.error('Error deleting event:', err);
      throw new Error(errorMessage);
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
