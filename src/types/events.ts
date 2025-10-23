export interface Event {
  id: string;
  event_type: 'hasta_guvenlik' | 'calisan_guvenlik' | 'acil_durum';
  privacy_request: boolean;
  department: string;
  patient_type?: 'hasta' | 'ziyaretci' | 'refakatci';
  affected_person_name: string;
  birth_date?: string;
  admission_date?: string;
  entry_date: string;
  reporter_name: string;
  event_date: string;
  event_time: string;
  repeat_count?: number;
  score?: number;
  event_class: string;
  main_category: string;
  sub_category: string;
  location: string;
  event_category: string;
  event_details: string;
  suggestions: string;
  is_medication_error: boolean;
  medication_name?: string;
  quality_note: string;
  manager_evaluation: string;
  ministry_integration: boolean;
  close_duration?: number;
  closed_at?: string;
  
  // Çalışan güvenliği özel alanları
  job_title?: string;
  damage_status?: string;
  impact_duration?: string;
  legal_action?: boolean;
  
  // Acil durum özel alanları
  event_code?: string;
  
  // Sistem alanları
  facility_id: number;
  reporter_id: string;
  assigned_to?: string;
  status: 'taslak' | 'atanmayi_bekleyen' | 'atanan' | 'inceleme' | 'kapatildi' | 'reddedildi' | 'iptal';
  created_at: string;
  updated_at: string;
  facility?: {
    id: number;
    name: string;
  };
  reporter?: {
    id: string;
    display_name: string;
  };
  assignee?: {
    id: string;
    display_name: string;
  };
}

export interface EventClassification {
  id: string;
  class_name: string;
  main_categories: EventMainCategory[];
}

export interface EventMainCategory {
  id: string;
  name: string;
  sub_categories: EventSubCategory[];
}

export interface EventSubCategory {
  id: string;
  name: string;
}

export interface EventLocation {
  id: string;
  name: string;
}

export interface EventType {
  id: string;
  name: string;
}
