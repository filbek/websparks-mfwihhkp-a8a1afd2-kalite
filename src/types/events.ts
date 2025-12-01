import { User } from './index';

export interface Event {
  id: string;
  event_type: 'hasta_guvenlik' | 'calisan_guvenlik' | 'acil_durum';
  event_code?: string;
  event_class?: string;
  event_category?: string;
  main_category?: string;
  sub_category?: string;
  department?: string;
  location?: string;
  event_date: string;
  event_time: string;
  event_details?: string;
  suggestions?: string;
  facility_id: number;
  reporter_id?: string;
  assigned_to?: string | null;
  assignee?: User;
  status: 'taslak' | 'atanmayi_bekleyen' | 'atanan' | 'cozum_bekleyen' | 'kapatma_onayinda' | 'kapatildi' | 'reddedildi' | 'iptal';
  score: number;
  severity?: number;
  probability?: number;
  manager_evaluation?: string;

  // Hasta Bilgileri
  patient_first_name?: string;
  patient_last_name?: string;
  patient_tc_no?: string;
  patient_birth_date?: string;
  patient_age?: number;
  patient_gender?: 'erkek' | 'kadin' | 'diger';
  admission_date?: string;
  admission_time?: string;
  discharge_date?: string;
  close_reasons?: string[];
  system_errors?: string;
  error_main_category?: string;
  error_sub_category?: string;
  related_diagnoses?: string;

  // Kalite Yönetimi
  quality_note?: string;
  quality_closure_note?: string;
  quality_closure_criteria?: 'atanmadi' | 'devam_ediyor' | 'tamamlandi';

  // Etkilenen Kişi Bilgileri
  affected_person_type?: 'hasta' | 'calisan' | 'ziyaretci' | 'diger';
  affected_first_name?: string;
  affected_last_name?: string;
  affected_tc_no?: string;
  affected_birth_date?: string;
  affected_gender?: 'erkek' | 'kadin' | 'diger';
  affected_contact_phone?: string;
  affected_contact_email?: string;

  // Ek Olay Detayları
  event_location_detail?: string;
  witnesses?: string;
  immediate_actions_taken?: string;
  risk_assessment?: string;
  contributing_factors?: string;

  // Çalışan Güvenliği için
  job_title?: string;
  damage_status?: string;
  impact_duration?: string;
  legal_action?: boolean;

  // Timestamps
  closed_at?: string;
  close_duration?: number;
  created_at: string;
  updated_at: string;
}

export interface DepartmentAssignment {
  id: string;
  event_id: string;
  assigned_department_id?: string;
  assigned_manager_id?: string;
  manager_name?: string;
  assignment_status: 'beklemede' | 'kabul_edildi' | 'reddedildi' | 'tamamlandi';
  assigned_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ErrorCategory {
  id: string;
  value: string;
  label: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ErrorSubCategory {
  id: string;
  main_category_value: string;
  value: string;
  label: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
